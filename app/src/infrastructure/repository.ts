import type { Project } from '../domain/model';

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
    if (version > 1) throw new Error('Baza pochodzi z nowszej wersji aplikacji. Dane pozostawiono bez zmian.');
    if (version === 0) await this.db.withTransactionAsync(async () => {
      await this.db.execAsync(`
        CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, updated_at TEXT NOT NULL, body TEXT NOT NULL);
        CREATE TABLE observations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, body TEXT NOT NULL);
        CREATE TABLE operations (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL);
        PRAGMA user_version=1;
      `);
    });
  }
  async list(): Promise<Project[]> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM projects ORDER BY updated_at DESC');
    return rows.map(row => this.decode(row.body));
  }
  private decode(body: string): Project {
    const p: Project = JSON.parse(body);
    if (p.schemaVersion !== 1 || !Array.isArray(p.points) || !p.points.length || !Array.isArray(p.observations))
      throw new Error('Nieobsługiwana lub uszkodzona wersja projektu. Dane pozostawiono bez zmian.');
    return p;
  }
  async load(id: string): Promise<Project | null> {
    const rows = await this.db.getAllAsync<{ body: string }>('SELECT body FROM projects WHERE id=?', id);
    return rows[0] ? this.decode(rows[0].body) : null;
  }
  async save(project: Project, kind: string) {
    const serialized = JSON.stringify(project);
    await this.db.withTransactionAsync(async () => {
      const previous = await this.db.getAllAsync<{ body: string }>('SELECT body FROM observations WHERE project_id=?', project.id);
      const old = new Map(previous.map(x => { const o = JSON.parse(x.body); return [o.id, x.body]; }));
      for (const observation of project.observations) {
        const body = JSON.stringify(observation);
        if (old.has(observation.id) && old.get(observation.id) !== body) throw new Error('Nie można nadpisać obserwacji źródłowej.');
        await this.db.runAsync('INSERT OR IGNORE INTO observations (id,project_id,body) VALUES (?,?,?)', observation.id, project.id, body);
      }
      await this.db.runAsync(`INSERT INTO projects (id,name,updated_at,body) VALUES (?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at,body=excluded.body`,
      project.id, project.name, project.updatedAt, serialized);
      await this.db.runAsync('INSERT INTO operations (project_id,revision,kind,body) VALUES (?,?,?,?)',
        project.id, project.geometryRevision, kind, serialized);
    });
  }
  async remove(id: string) {
    await this.db.withTransactionAsync(async () => {
      for (const table of ['observations', 'operations']) await this.db.runAsync(`DELETE FROM ${table} WHERE project_id=?`, id);
      await this.db.runAsync('DELETE FROM projects WHERE id=?', id);
    });
  }
}
