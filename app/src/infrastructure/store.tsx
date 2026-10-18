import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Project, SurveyMode } from '../domain/model';
import { ProjectRepository } from './repository';
import { Capabilities, LiveSample, orientation } from './native';

interface Store {
  projects: Project[]; repo: ProjectRepository | null; error: string; busy: boolean;
  capabilities: Capabilities | null; live: LiveSample | null; sessionId: string | null; sessionProject: string | null;
  refresh(): Promise<void>;
  run(task: () => Promise<void>): Promise<void>;
  start(project: Project, mode: SurveyMode): Promise<string>;
  stop(): Promise<void>;
  log(type: string, data: object): Promise<void>;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [repo, setRepo] = useState<ProjectRepository | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [live, setLive] = useState<LiveSample | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionProject, setSessionProject] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = await SQLite.openDatabaseAsync('fieldsketch.db');
        await db.execAsync('PRAGMA journal_mode=WAL');
        const repository = new ProjectRepository(db);
        await repository.initialize();
        const saved = await repository.list();
        if (mounted) { setRepo(repository); setProjects(saved); }
        const cap = await orientation().getCapabilities();
        if (mounted) setCapabilities(cap);
      } catch (e) { if (mounted) setError(message(e)); }
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
  return <Context.Provider value={{ projects, repo, error, busy, capabilities, live, sessionId, sessionProject, refresh, run, start, stop, log }}>{children}</Context.Provider>;
}
export const message = (e: unknown) => e instanceof Error ? e.message : String(e);
export function useStore() { const store = useContext(Context); if (!store) throw new Error('Missing provider'); return store; }
