import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { DEFAULT_SETTINGS, Project, SurveyMode, UserSettings } from '../domain/model';
import { ProjectRepository } from './repository';
import { Capabilities, LiveSample, orientation } from './native';
import type { Plan } from '../domain/access';

interface Store {
  projects: Project[]; repo: ProjectRepository | null; error: string; busy: boolean; ready: boolean;
  capabilities: Capabilities | null; live: LiveSample | null; sessionId: string | null; sessionProject: string | null;
  settings: UserSettings; plan: Plan;
  updateSettings(settings: UserSettings): Promise<void>;
  rememberUi(patch: Pick<UserSettings, 'sketchCorner' | 'lengthInput'>): Promise<void>;
  refresh(): Promise<void>;
  run(task: () => Promise<void>): Promise<void>;
  start(project: Project, mode: SurveyMode): Promise<string>;
  stop(): Promise<void>;
  log(type: string, data: object): Promise<void>;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Billing will supply this read-only entitlement. No local purchase toggle.
  const plan: Plan = 'free';
  const [repo, setRepo] = useState<ProjectRepository | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const settingsRef = useRef(settings), settingsWrites = useRef<Promise<void>>(Promise.resolve());
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const lock = useRef(false);
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
        if (mounted) { settingsRef.current = preferences; setSettings(preferences); setRepo(repository); setProjects(saved); }
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
    });
    return () => { mounted = false; sample?.remove(); status?.remove(); sub.remove(); };
  }, []);
  const refresh = async () => { if (repo) setProjects(await repo.list()); };
  const run = async (task: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await task(); } catch (e) { setError(message(e)); }
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
      if (!repo) throw new Error('Baza nie jest jeszcze gotowa.');
      const next = { ...settingsRef.current, ...patch };
      await repo.saveSettings(next); settingsRef.current = next; setSettings(next);
    });
    settingsWrites.current = write; return write;
  };
  const rememberUi = async (patch: Pick<UserSettings, 'sketchCorner' | 'lengthInput'>) => {
    try { await saveSettingsPatch(patch); } catch (e) { setError(message(e)); }
  };
  const updateSettings = async (next: UserSettings) => {
    if (!repo) throw new Error('Baza nie jest jeszcze gotowa.');
    if (next.directionMode !== settings.directionMode && sessionId) await stop();
    await saveSettingsPatch(next);
  };
  return <Context.Provider value={{ projects, repo, error, busy, ready, capabilities, live, sessionId, sessionProject, settings, plan, updateSettings, rememberUi, refresh, run, start, stop, log }}>{children}</Context.Provider>;
}
export const message = (e: unknown) => e instanceof Error ? e.message : String(e);
export function useStore() { const store = useContext(Context); if (!store) throw new Error('Missing provider'); return store; }
