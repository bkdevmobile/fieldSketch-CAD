import { CSV_HEADER, csvRecord, splitLog, utf8Length } from '../src/domain/logs';
test('części zachowują wszystkie rekordy, polskie znaki i kolejność', () => {
  const text = Array.from({ length: 1000 }, (_, sequence) => JSON.stringify({ sequence, notes: 'Zażółć gęślą jaźń 🚶' }) + '\n').join('');
  const parts = splitLog(text, 1024);
  expect(parts.length).toBeGreaterThan(1); expect(parts.join('')).toBe(text);
  for (const part of parts) {
    expect(utf8Length(part)).toBeLessThanOrEqual(1024);
    for (const line of part.trim().split('\n')) expect(() => JSON.parse(line)).not.toThrow();
  }
});
test('nie obcina zbyt długiego rekordu', () => expect(() => splitLog('123456\n', 4)).toThrow());
test('pełny mały log pozostaje jedną częścią', () => expect(splitLog('{"sequence":1}\n')).toEqual(['{"sequence":1}\n']));
test('CSV zachowuje liczby, treść i cudzysłowy', () => {
  const line = csvRecord({ sequence: 5, type: 'test_context', data: { notes: 'a,"b"\nę' } });
  expect(CSV_HEADER).toContain('dataJson'); expect(line).toContain('"5"'); expect(line).toContain('""notes""');
  expect(line.endsWith('\r\n')).toBe(true);
});
