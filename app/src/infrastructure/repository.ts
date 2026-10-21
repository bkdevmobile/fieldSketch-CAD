import { t } from '../i18n';
import { DEFAULT_SETTINGS, Project, UserSettings } from '../domain/model';
import type { SurveyDraft } from '../domain/survey';
import { assertProjectSave, Plan } from '../domain/access';
import { isLanguagePreference } from '../i18n';

export interface Database {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: any[]): Promise<unknown>;
  getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]>;
  withTransactionAsync(action: () => Promise<void>): Promise<void>;
}
export class ProjectRepository {
  constructor(private db: Database) {}
  async initialize() {
    const rows = await this.db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
    const version = rows[0]?.user_version ?? 0;
    if (version > 3) throw new Error(t("Baza pochodzi z nowszej wersji aplikacji. Dane pozostawiono bez zmian."));
    if (version === 0) await this.db.withTransactionAsync(async () => {
      await this.db.execAsync(`
        CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, updated_at TEXT NOT NULL, body TEXT NOT NULL);
        CREATE TABLE observations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, body TEXT NOT NULL);
        CREATE TABLE operations (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL);
        PRAGMA user_version=1;
      `);
    });
    if (version < 2) await this.db.withTransactionAsync(async () => {
      await this.db.execAsync('CREATE TABLE survey_drafts (project_id TEXT PRIMARY KEY, body TEXT NOT NULL); PRAGMA user_version=2;');
    });
    if (version < 3) await this.db.withTransactionAsync(async () => {
      await this.db.execAsync('CREATE TABLE user_settings (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL); PRAGMA user_version=3;');
    });
  }
  async settings(): Promise<UserSettings> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM user_settings WHERE id=1');
    return rows[0] ? { ...DEFAULT_SETTINGS, ...JSON.parse(rows[0].body) } : { ...DEFAULT_SETTINGS };
  }
  async saveSettings(settings: UserSettings) {
    if (settings.language !== undefined && !isLanguagePreference(settings.language)) throw new Error(t("Nieobsługiwany język."));
    if (settings.sketchCorner !== undefined && !['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(settings.sketchCorner)) throw new Error(t("Nieprawidłowe położenie miniatury."));
    if (settings.lengthInput !== undefined && !['manual', 'steps'].includes(settings.lengthInput)) throw new Error(t("Nieprawidłowa metoda podawania długości."));
    if (!Number.isFinite(settings.stepLengthCm) || settings.stepLengthCm <= 0 || !['m', 'cm'].includes(settings.unit) || ![0, 5, 10, 90].includes(settings.angleSnap) || !['relative', 'manual', 'magnetic'].includes(settings.directionMode))
      throw new Error(t("Podaj dodatnią długość kroku i poprawną jednostkę."));
    await this.db.runAsync('INSERT INTO user_settings (id,body) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body', JSON.stringify(settings));
  }
  async list(): Promise<Project[]> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM projects ORDER BY updated_at DESC');
    return rows.map(row => this.decode(row.body));
  }
  private decode(body: string): Project {
    const p: Project = JSON.parse(body);
    if (p.schemaVersion !== 1 || !Array.isArray(p.points) || !p.points.length || !Array.isArray(p.observations))
      throw new Error(t("Nieobsługiwana lub uszkodzona wersja szkicu. Dane pozostawiono bez zmian."));
    return p;
  }
  async load(id: string): Promise<Project | null> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM projects WHERE id=?', id);
    return rows[0] ? this.decode(rows[0].body) : null;
  }
  async save(project: Project, kind: string, plan: Plan = 'free') {
    const serialized = JSON.stringify(project);
    await this.db.withTransactionAsync(async () => {
      const saved = await this.load(project.id);
      const count = saved ? 0 : (await this.db.getAllAsync<{ count: number }>('SELECT COUNT(*) AS count FROM projects'))[0]!.count;
      assertProjectSave(project, saved, count, plan);
      const previous = await this.db.getAllAsync<{ body: string }>('SELECT body FROM observations WHERE project_id=?', project.id);
      const old = new Map(previous.map(x => { const o = JSON.parse(x.body); return [o.id, x.body]; }));
      for (const observation of project.observations) {
        const body = JSON.stringify(observation);
        if (old.has(observation.id) && old.get(observation.id) !== body) throw new Error(t("Nie można nadpisać obserwacji źródłowej."));
        await this.db.runAsync('INSERT OR IGNORE INTO observations (id,project_id,body) VALUES (?,?,?)', observation.id, project.id, body);
      }
      await this.db.runAsync(`INSERT INTO projects (id,name,updated_at,body) VALUES (?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at,body=excluded.body`,
      project.id, project.name, project.updatedAt, serialized);
      await this.db.runAsync('INSERT INTO operations (project_id,revision,kind,body) VALUES (?,?,?,?)',
        project.id, project.geometryRevision, kind, serialized);
      await this.db.runAsync('DELETE FROM survey_drafts WHERE project_id=?', project.id);
    });
  }
  async loadDraft(projectId: string): Promise<SurveyDraft | null> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM survey_drafts WHERE project_id=?', projectId);
    return rows[0] ? JSON.parse(rows[0].body) : null;
  }
  async saveDraft(projectId: string, draft: SurveyDraft) {
    await this.db.runAsync(`INSERT INTO survey_drafts (project_id,body)
      SELECT id,? FROM projects WHERE id=? AND json_extract(body, '$.geometryRevision')=?
      ON CONFLICT(project_id) DO UPDATE SET body=excluded.body`, JSON.stringify(draft), projectId, draft.revision);
  }
  async removeDraft(projectId: string) {
    await this.db.runAsync('DELETE FROM survey_drafts WHERE project_id=?', projectId);
  }
  async remove(id: string) {
    await this.db.withTransactionAsync(async () => {
      for (const table of ['observations', 'operations', 'survey_drafts']) await this.db.runAsync(`DELETE FROM ${table} WHERE project_id=?`, id);
      await this.db.runAsync('DELETE FROM projects WHERE id=?', id);
    });
  }
}
