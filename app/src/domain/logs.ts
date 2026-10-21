import { t } from '../i18n';
export const COPY_BYTES = 128 * 1024;
export function utf8Length(text: string): number {
  let count = 0;
  for (const c of text) { const n = c.codePointAt(0)!; count += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4; }
  return count;
}
export function splitLog(text: string, maxBytes = COPY_BYTES): string[] {
  const result: string[] = []; let current = '';
  for (const line of text.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    if (utf8Length(line) > maxBytes) throw new Error(t("Rekord przekracza limit kopiowania. Użyj eksportu pliku."));
    if (current && utf8Length(current) + utf8Length(line) > maxBytes) { result.push(current); current = ''; }
    current += line;
  }
  if (current || !result.length) result.push(current);
  return result;
}
export function csvRecord(record: Record<string, unknown>): string {
  const values = [record.sequence, record.timestampUtc, record.monotonicNs, record.type,
    record.sessionId, record.projectId, JSON.stringify(record.data ?? null)];
  return values.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\r\n';
}
export const CSV_HEADER = 'sequence,timestampUtc,monotonicNs,type,sessionId,projectId,dataJson\r\n';
