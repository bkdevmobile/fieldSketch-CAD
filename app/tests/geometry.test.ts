import { newProject } from '../src/domain/model';
import { circularStats, closeOutline, commitSide, metrics, parsePositive, stepsToLength, undoLast } from '../src/domain/geometry';

describe('Długość kroków', () => {
  test.each([[1, 75], [10, 750], [2.5, 187.5]])('%s kroków daje %s cm', (steps, expected) => {
    expect(stepsToLength(steps).lengthCm).toBe(expected);
    expect(stepsToLength(steps).lengthM).toBe(expected / 100);
  });
  test('polski przecinek i niepełny krok', () => expect(parsePositive(' 2,5 ')).toBe(2.5));
  test.each(['0', '-1', '', 'NaN', 'Infinity', '1,2,3', '12m', '1e309'])('odrzuca %s', input => expect(() => parsePositive(input)).toThrow());
  test.each([NaN, Infinity, -1, 0, Number.MAX_VALUE])('nie dopuszcza niepoprawnego iloczynu %s', input => expect(() => stepsToLength(input)).toThrow());
});
test('kierunki 359 i 1 stopień mają średnią 0, a nie 180', () => {
  const stats = circularStats([359, 1].map(a => a * Math.PI / 180));
  expect(stats.mean).toBeCloseTo(0, 8);
  expect(stats.stdDev * 180 / Math.PI).toBeCloseTo(1, 2);
  expect(circularStats([0, Math.PI]).stdDev).toBe(Infinity);
});
function square() {
  let p = newProject('Kwadrat', 'manual');
  for (const theta of [0, Math.PI / 2, Math.PI]) p = commitSide(p, 4, theta, 'manual', 'test', null);
  return p;
}
test('kwadrat 3 m ma pole 9 m² i obwód 12 m', () => {
  const p = closeOutline(square()); const m = metrics(p);
  expect(m.area).toBeCloseTo(9); expect(m.perimeter).toBeCloseTo(12);
  expect(m.closure).toBeNull();
});
test('niezależny pomiar domknięcia zachowuje błąd zamiast dociągać wierzchołek', () => {
  const p = commitSide(square(), 3, -Math.PI / 2, 'manual', 'test', null, true);
  expect(p.points).toHaveLength(4); expect(metrics(p).closure!.norm).toBeCloseTo(0.75);
  expect(metrics(p).area).toBeCloseTo(9);
});
test('cofnięcie zachowuje obserwacje i przelicznik historyczny', () => {
  const original = square(); const encoded = JSON.stringify(original.observations);
  const next = undoLast(original);
  expect(next.points).toHaveLength(3);
  expect(JSON.stringify(next.observations)).toBe(encoded);
  expect(next.observations[0]!.stepLengthCm).toBe(75);
  const closed = commitSide(original, 4, -Math.PI / 2, 'manual', 'test', null, true);
  expect(undoLast(closed).points).toHaveLength(4);
  expect(undoLast(closed).closureObservationId).toBeNull();
});
test('otwarty lub samoprzecinający obrys nie ma prezentowanego pola', () => {
  expect(metrics(square()).area).toBeNull();
  const p = newProject('Kokarda', 'manual');
  p.points = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 2, y: 2 }, { id: 'c', x: 0, y: 2 }, { id: 'd', x: 2, y: 0 }];
  p.closed = true;
  expect(metrics(p).intersects).toBe(true); expect(metrics(p).area).toBeNull();
});
