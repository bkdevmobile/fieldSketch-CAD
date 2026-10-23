import { t } from '../i18n';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { DEFAULT_SETTINGS, Project, SurveyMode, UserSettings } from '../domain/model';
import { ProjectRepository } from './repository';
import { Capabilities, LiveSample, orientation } from './native';
import type { Plan } from '../domain/access';
import { useBilling } from './billing';
import { getLanguage, setLanguage } from '../i18n';
import { applyLanguagePreference, preferenceFromState, readLanguageState } from './language';
import { errorReportingAvailable, reportUnexpectedError, setErrorReportingConsent } from './errorReporting';
import { ErrorReportingPrompt, type ErrorReportRequest } from './errorReportingPrompt';
import { createLegalAcceptance } from '../domain/legal';

interface Store {
  projects: Project[]; repo: ProjectRepository | null; error: string; busy: boolean; ready: boolean;
  capabilities: Capabilities | null; live: LiveSample | null; sessionId: string | null; sessionProject: string | null;
  settings: UserSettings; plan: Plan; billing: ReturnType<typeof useBilling>;
  updateSettings(settings: UserSettings): Promise<void>;
  acceptLegalNotice(confirmed: boolean): Promise<void>;
  errorReportRequest: ErrorReportRequest | null;
  answerErrorReportRequest(id: number, allow: boolean): Promise<void>;
  rememberUi(patch: Pick<UserSettings, 'sketchCorner' | 'lengthInput' | 'sketchDocked'>): Promise<void>;
  refresh(): Promise<void>;
  updateProjectNote(projectId: string, note: string): Promise<void>;
  run(task: () => Promise<void>, onError?: (error: unknown) => void): Promise<void>;
  start(project: Project, mode: SurveyMode): Promise<string>;
  stop(): Promise<void>;
  log(type: string, data: object): Promise<void>;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const billing = useBilling();
  const plan = billing.state.plan;
  const [repo, setRepo] = useState<ProjectRepository | null>(null);
  const repositoryRef = useRef<ProjectRepository | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const settingsRef = useRef(settings), settingsWrites = useRef<Promise<void>>(Promise.resolve());
  const [errorReportRequest, setErrorReportRequest] = useState<ErrorReportRequest | null>(null);
  const reportingPrompt = useRef<ErrorReportingPrompt | null>(null);
  if (!reportingPrompt.current) reportingPrompt.current = new ErrorReportingPrompt({
    state: () => ({ available: errorReportingAvailable, ready: !!repositoryRef.current,
      enabled: settingsRef.current.errorReporting === true, asked: settingsRef.current.errorReportingAsked === true }),
    save: decision => saveSettingsPatch(decision), send: reportUnexpectedError, publish: setErrorReportRequest,
  });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const lock = useRef(false);
  const noteWrites = useRef<Promise<void>>(Promise.resolve());
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [live, setLive] = useState<LiveSample | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionProject, setSessionProject] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Keep this provider's connection independent of stale native wrappers
        // left by a previous React runtime/activity. The database file is unchanged.
        const db = await SQLite.openDatabaseAsync('fieldsketch.db', { useNewConnection: true });
        await db.execAsync('PRAGMA journal_mode=WAL');
        const repository = new ProjectRepository(db);
        await repository.initialize();
        const saved = await repository.list();
        const preferences = await repository.settings();
        const languageState = await readLanguageState();
        preferences.language = preferenceFromState(preferences.language ?? 'system', languageState);
        setLanguage(preferences.language, languageState.systemLocales);
        if (mounted) { repositoryRef.current = repository; settingsRef.current = preferences; setSettings(preferences); setRepo(repository); setProjects(saved); setErrorReportingConsent(preferences.errorReporting === true); }
        const cap = await orientation().getCapabilities();
        if (mounted) setCapabilities(cap);
      } catch (e) { if (mounted) setError(message(e)); }
      finally { if (mounted) setReady(true); }
    })();
    let sample: { remove(): void } | undefined, status: { remove(): void } | undefined;
    try {
      sample = orientation().addListener('orientationSample', setLive);
      status = orientation().addListener('sensorStatusChanged', s => {
        if (s.status === 'error' || s.status === 'stopped') { setSessionId(null); setSessionProject(null); setLive(null); }
        if (s.message) setError(s.message);
      });
    } catch (e) { setError(message(e)); }
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') { setSessionId(null); setSessionProject(null); setLive(null); }
      else void readLanguageState().then(native => {
        if (!mounted) return;
        const previous = getLanguage();
        const language = preferenceFromState(settingsRef.current.language ?? 'system', native);
        setLanguage(language, native.systemLocales);
        if (previous !== getLanguage() || language !== settingsRef.current.language) {
          const next = { ...settingsRef.current, language }; settingsRef.current = next; setSettings(next);
        }
      });
    });
    return () => { mounted = false; sample?.remove(); status?.remove(); sub.remove(); };
  }, []);
  const refresh = async () => { if (repo) setProjects(await repo.list()); };
  const updateProjectNote = (projectId: string, note: string) => {
    const write = noteWrites.current.then(async () => {
      const repository = repositoryRef.current;
      if (!repository) throw new Error(t("Baza nie jest jeszcze gotowa."));
      await repository.updateMetadata(projectId, { note });
      setProjects(await repository.list());
    }).catch(e => {
      setError(message(e));
      reportingPrompt.current!.handle(e);
    });
    noteWrites.current = write;
    return write;
  };
  const run = async (task: () => Promise<void>, onError?: (error: unknown) => void) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await task(); } catch (e) { setError(message(e)); onError?.(e); reportingPrompt.current!.handle(e); }
    finally { lock.current = false; setBusy(false); }
  };
  const start = async (project: Project, mode: SurveyMode) => {
    const result = await orientation().startSession(JSON.stringify({ projectId: project.id, projectName: project.name, mode }));
    setSessionId(result.sessionId); setSessionProject(project.id); setLive(null); return result.sessionId;
  };
  const stop = async () => { await orientation().stopSession(); setSessionId(null); setSessionProject(null); setLive(null); };
  const log = async (type: string, data: object) => { await orientation().appendEvent(type, JSON.stringify(data)); };
  const saveSettingsPatch = (patch: Partial<UserSettings>) => {
    const write = settingsWrites.current.catch(() => {}).then(async () => {
      const repository = repositoryRef.current;
      if (!repository) throw new Error(t("Baza nie jest jeszcze gotowa."));
      const next = { ...settingsRef.current, ...patch };
      if (patch.errorReporting === true || (patch.errorReporting === false && settingsRef.current.errorReporting === true)) next.errorReportingAsked = true;
      await repository.saveSettings(next); settingsRef.current = next; setSettings(next);
      setErrorReportingConsent(next.errorReporting === true);
    });
    settingsWrites.current = write; return write;
  };
  const rememberUi = async (patch: Pick<UserSettings, 'sketchCorner' | 'lengthInput' | 'sketchDocked'>) => {
    try { await saveSettingsPatch(patch); } catch (e) { setError(message(e)); }
  };
  const updateSettings = async (next: UserSettings) => {
    if (!repo) throw new Error(t("Baza nie jest jeszcze gotowa."));
    if (next.directionMode !== settings.directionMode && sessionId) await stop();
    await saveSettingsPatch(next);
    await applyLanguagePreference(next.language ?? settingsRef.current.language ?? 'system');
    // Also re-render consumers when the effective system language changed.
    setSettings(value => ({ ...value }));
  };
  const answerErrorReportRequest = async (requestId: number, allow: boolean) => {
    try { await reportingPrompt.current!.answer(requestId, allow); }
    catch (e) { setError(message(e)); }
  };
  const acceptLegalNotice = async (confirmed: boolean) => { await saveSettingsPatch({ legalAcceptance: createLegalAcceptance(confirmed) }); };
  return <Context.Provider value={{ projects, repo, error, busy, ready: ready && billing.state.ready, capabilities, live, sessionId, sessionProject, settings, plan, billing, updateSettings, acceptLegalNotice, errorReportRequest, answerErrorReportRequest, rememberUi, refresh, updateProjectNote, run, start, stop, log }}>{children}</Context.Provider>;
}
export const message = (e: unknown) => e instanceof Error ? e.message : String(e);
export function useStore() { const store = useContext(Context); if (!store) throw new Error('Missing provider'); return store; }
