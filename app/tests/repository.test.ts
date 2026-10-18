import initSqlJs, { Database as SqlDb } from 'sql.js';
import { Database, ProjectRepository } from '../src/infrastructure/repository';
import { newProject } from '../src/domain/model';
import { commitSide, undoLast } from '../src/domain/geometry';
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
