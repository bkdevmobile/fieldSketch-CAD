import initSqlJs, { Database as SqlDb } from 'sql.js';
import { Database, ProjectRepository } from '../src/infrastructure/repository';
import { DEFAULT_SETTINGS, newProject } from '../src/domain/model';
import { commitSide, editLastSide, undoLast } from '../src/domain/geometry';
import type { SurveyDraft } from '../src/domain/survey';
class SqlAdapter implements Database {
  constructor(readonly raw: SqlDb) {}
  async execAsync(sql: string) { this.raw.exec(sql); }
  async runAsync(sql: string, ...params: any[]) { this.raw.run(sql, params); }
  async getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]> {
    const stmt = this.raw.prepare(sql); const rows: T[] = [];
    try { stmt.bind(params); while (stmt.step()) rows.push(stmt.getAsObject() as T); } finally { stmt.free(); }
    return rows;
  }
  async withTransactionAsync(action: () => Promise<void>) {
    this.raw.exec('BEGIN');
    try { await action(); this.raw.exec('COMMIT'); } catch (e) { this.raw.exec('ROLLBACK'); throw e; }
  }
}
test('projekt przetrwa zamknięcie i odtworzenie bazy SQLite', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  const repo = new ProjectRepository(db); await repo.initialize();
  const p = commitSide(newProject('Próba ąę', 'manual'), 2.5, 0, 'manual', 's1', null);
  await repo.save(p, 'side_added');
  const bytes = db.raw.export(); db.raw.close();
  const reopened = new SqlAdapter(new SQL.Database(bytes)); const next = new ProjectRepository(reopened);
  await next.initialize(); expect(await next.load(p.id)).toEqual(p);
  const undone = undoLast(p); await next.save(undone, 'undo');
  expect((await next.load(p.id))!.observations).toEqual(p.observations);
  await next.remove(p.id); expect(await next.list()).toEqual([]); reopened.raw.close();
});
test('niezmienność obserwacji i wycofanie błędnej transakcji', async () => {
  const SQL = await initSqlJs(); const adapter = new SqlAdapter(new SQL.Database());
  const repo = new ProjectRepository(adapter); await repo.initialize();
  const p = commitSide(newProject('Test', 'manual'), 10, 0, 'manual', 's1', null); await repo.save(p, 'add');
  const corrupted = JSON.parse(JSON.stringify(p)); corrupted.observations[0].stepCount = 99;
  await expect(repo.save(corrupted, 'invalid')).rejects.toThrow('obserwacji');
  expect(await repo.load(p.id)).toEqual(p);
  const run = adapter.runAsync.bind(adapter);
  adapter.runAsync = async (sql, ...params) => { if (sql.startsWith('INSERT INTO operations')) throw new Error('disk full'); return run(sql, ...params); };
  await expect(repo.save(undoLast(p), 'undo')).rejects.toThrow('disk full');
  expect(await repo.load(p.id)).toEqual(p); adapter.raw.close();
});
test('nowszy schemat nie jest kasowany', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  db.raw.exec('PRAGMA user_version=99');
  await expect(new ProjectRepository(db).initialize()).rejects.toThrow('nowszej');
  expect((await db.getAllAsync<{ user_version: number }>('PRAGMA user_version'))[0]!.user_version).toBe(99);
  db.raw.close();
});

test('migracja starej bazy zachowuje projekt, a etap roboczy przetrwa restart', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  await db.execAsync(`CREATE TABLE projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, updated_at TEXT NOT NULL, body TEXT NOT NULL);
    CREATE TABLE observations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, body TEXT NOT NULL);
    CREATE TABLE operations (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, revision INTEGER NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL);
    PRAGMA user_version=1;`);
  const p = newProject('Stary projekt', 'relative');
  await db.runAsync('INSERT INTO projects VALUES (?,?,?,?)', p.id, p.name, p.updatedAt, JSON.stringify(p));
  const repo = new ProjectRepository(db); await repo.initialize();
  expect(await repo.load(p.id)).toEqual(p);
  const draft: SurveyDraft = { revision: 0, step: 'length', length: '4,50', unit: 'm', steps: '', lengthSource: 'manual', turn: '90', turnSide: 'left' };
  await repo.saveDraft(p.id, draft);
  const reopened = new SqlAdapter(new SQL.Database(db.raw.export()));
  const next = new ProjectRepository(reopened); await next.initialize();
  expect(await next.loadDraft(p.id)).toEqual(draft);
  await next.save(commitSide(p, 4, 0, 'relative', 's1', null), 'side_added');
  expect(await next.loadDraft(p.id)).toBeNull();
  await next.saveDraft(p.id, draft);
  expect(await next.loadDraft(p.id)).toBeNull(); // delayed write from the previous geometry revision
  await next.saveDraft(p.id, { ...draft, revision: 1 }); await next.remove(p.id);
  expect(await next.loadDraft(p.id)).toBeNull();
  db.raw.close(); reopened.raw.close();
});

test('ustawienia i korekta przetrwają restart bez zmiany źródłowych kroków', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  const repo = new ProjectRepository(db); await repo.initialize();
  expect(await repo.settings()).toEqual(DEFAULT_SETTINGS);
  const original = commitSide(newProject('Historia', 'manual'), 4, 0, 'manual', 's1', null);
  await repo.save(original, 'side_added');
  await repo.saveSettings({ unit: 'cm', stepLengthCm: 82, angleSnap: 10, directionMode: 'manual' });
  const corrected = editLastSide(original, { source: 'manual', value: 320, unit: 'cm' }, 0);
  await repo.save(corrected, 'side_corrected');
  const reopened = new SqlAdapter(new SQL.Database(db.raw.export())), next = new ProjectRepository(reopened);
  await next.initialize();
  expect(await next.settings()).toEqual({ ...DEFAULT_SETTINGS, unit: 'cm', stepLengthCm: 82, angleSnap: 10, directionMode: 'manual' });
  expect((await next.load(original.id))!.observations[0]).toEqual(original.observations[0]);
  expect((await next.load(original.id))!.observations.at(-1)!.lengthM).toBe(3.2);
  await expect(next.saveSettings({ unit: 'm', stepLengthCm: 0, angleSnap: 90, directionMode: 'relative' })).rejects.toThrow();
  db.raw.close(); reopened.raw.close();
});

test('stare ustawienia zachowują jednostkę i krok, otrzymując domyślne przyciąganie 90°', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  const repo = new ProjectRepository(db); await repo.initialize();
  await db.runAsync('INSERT INTO user_settings (id,body) VALUES (1,?)', JSON.stringify({ unit: 'cm', stepLengthCm: 80 }));
  expect(await repo.settings()).toEqual({ ...DEFAULT_SETTINGS, unit: 'cm', stepLengthCm: 80 });
  db.raw.close();
});

test('pozycja miniatury i ostatnia metoda długości przetrwają odtworzenie bazy', async () => {
  const SQL = await initSqlJs(); const db = new SqlAdapter(new SQL.Database());
  const repo = new ProjectRepository(db); await repo.initialize();
  expect(await repo.settings()).toMatchObject({ sketchCorner: 'bottom-right', lengthInput: 'steps' });
  await repo.saveSettings({ ...DEFAULT_SETTINGS, sketchCorner: 'bottom-left', lengthInput: 'manual' });
  const reopened = new SqlAdapter(new SQL.Database(db.raw.export()));
  const next = new ProjectRepository(reopened); await next.initialize();
  expect(await next.settings()).toMatchObject({ sketchCorner: 'bottom-left', lengthInput: 'manual' });
  db.raw.close(); reopened.raw.close();
});
