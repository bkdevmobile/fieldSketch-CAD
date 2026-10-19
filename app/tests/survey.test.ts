import { closeOutline, commitMeasurement, editLastSide, measurementLength, metrics } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';
import { convertLengthInput, headingFromTurn, previousHeading, turnFromHeading } from '../src/domain/survey';

test('ręczna długość daje tę samą geometrię w m i cm bez fikcyjnych kroków', () => {
  const start = newProject('Długość ręczna', 'relative');
  const meters = commitMeasurement(start, { source: 'manual', value: 4.5, unit: 'm' }, 0, 'relative', 's1', null);
  const centimeters = commitMeasurement(start, { source: 'manual', value: 450, unit: 'cm' }, 0, 'relative', 's1', null);
  expect(meters.points[1]!.x).toBeCloseTo(4.5);
  expect(centimeters.points[1]!.x).toBeCloseTo(4.5);
  expect(meters.observations[0]).toMatchObject({ lengthSource: 'manual', stepCount: null, stepLengthCm: null, lengthM: 4.5 });
});

test('korekta zachowuje przechwycony kierunek i surowy odczyt', () => {
  const capture = { headingRad: 1, stdDevDeg: 0.5, accuracy: 3, sampleCount: 50,
    horizontalProjection: 1, stable: true, sessionId: 's1', timestampUtc: '2026-10-19T10:00:00Z' };
  const p = commitMeasurement(newProject('Korekta', 'relative'), { source: 'manual', value: 3, unit: 'm' },
    Math.PI / 2, 'relative', 's1', capture, false, 1.5);
  expect(p.points[1]!.y).toBeCloseTo(3);
  expect(p.observations[0]).toMatchObject({ capturedTheta: 1.5, theta: Math.PI / 2, capture });
});

test('skręty poprawnie przechodzą przez granicę ±180°', () => {
  const previous = 170 * Math.PI / 180;
  const next = headingFromTurn(previous, '30', 'left');
  expect(next * 180 / Math.PI).toBeCloseTo(-160);
  expect(turnFromHeading(previous, next)).toEqual({ turn: '30', turnSide: 'left' });
  expect(headingFromTurn(0, '90', 'right')).toBeCloseTo(-Math.PI / 2);
  expect(headingFromTurn(0, '0', 'left')).toBe(0);
  for (const input of ['', '-1', '181', 'NaN', 'Infinity', '1e2']) expect(() => headingFromTurn(0, input, 'left')).toThrow();
});

test('zmiana jednostki zachowuje rzeczywistą długość i nie przepuszcza błędnej wartości', () => {
  expect(convertLengthInput('4,50', 'm', 'cm')).toBe('450');
  expect(convertLengthInput('450', 'cm', 'm')).toBe('4,5');
  expect(convertLengthInput('', 'm', 'cm')).toBe('');
  expect(() => convertLengthInput('abc', 'm', 'cm')).toThrow();
  for (const value of [0, -1, Infinity, NaN, Number.MAX_VALUE]) {
    expect(() => measurementLength({ source: 'manual', value, unit: 'm' })).toThrow();
  }
});

test('ręczny pomiar powrotny zachowuje niezależny błąd zamknięcia', () => {
  let p = newProject('Obrys', 'manual');
  for (const theta of [0, Math.PI / 2, Math.PI]) p = commitMeasurement(p, { source: 'manual', value: 3, unit: 'm' }, theta, 'manual', 's1', null);
  expect(previousHeading(p)).toBeCloseTo(Math.PI);
  p = commitMeasurement(p, { source: 'manual', value: 2.5, unit: 'm' }, -Math.PI / 2, 'manual', 's1', null, true);
  expect(p.points).toHaveLength(4);
  expect(metrics(p).closure!.norm).toBeCloseTo(0.5);
});

test('korekta końca ostatniego boku zachowuje źródło, wcześniejsze punkty i identyfikator końca', () => {
  let p = newProject('Korekta', 'relative');
  p = commitMeasurement(p, { source: 'steps', steps: 4, stepLengthCm: 75 }, 0, 'relative', 's1', null);
  p = commitMeasurement(p, { source: 'manual', value: 3, unit: 'm' }, Math.PI / 2, 'relative', 's1', null);
  const source = JSON.stringify(p.observations), endId = p.points.at(-1)!.id;
  const corrected = editLastSide(closeOutline(p), { source: 'manual', value: 4, unit: 'm' }, Math.PI / 2);
  expect(corrected.points.slice(0, -1)).toEqual(p.points.slice(0, -1));
  expect(corrected.points.at(-1)!.id).toBe(endId);
  expect(corrected.points.at(-1)!.x).toBeCloseTo(3);
  expect(corrected.points.at(-1)!.y).toBeCloseTo(4);
  expect(JSON.stringify(corrected.observations.slice(0, -1))).toBe(source);
  expect(corrected.observations.at(-1)).toMatchObject({ supersedesId: p.observations.at(-1)!.id, capturedTheta: Math.PI / 2 });
  expect(corrected.activeObservationIds).not.toContain(p.observations.at(-1)!.id);
  expect(metrics(corrected).area).toBeCloseTo(6);
  expect(p.points.at(-1)!.y).toBeCloseTo(3);
});

test('nie koryguje geometrii z aktywnym pomiarem zamknięcia', () => {
  let p = newProject('Powrót', 'manual');
  for (const theta of [0, Math.PI / 2]) p = commitMeasurement(p, { source: 'manual', value: 3, unit: 'm' }, theta, 'manual', 's', null);
  p = commitMeasurement(p, { source: 'manual', value: 4, unit: 'm' }, -Math.PI * .75, 'manual', 's', null, true);
  expect(() => editLastSide(p, { source: 'manual', value: 5, unit: 'm' }, 0)).toThrow();
});

test('zachowuje surowe wykryte kroki, korektę ich liczby i indywidualny przelicznik', () => {
  const p = commitMeasurement(newProject('Krokomierz', 'relative'),
    { source: 'steps', steps: 2.5, stepLengthCm: 80, measurementId: 'walk-1', detectedSteps: 3 }, 0, 'relative', 's1', null);
  expect(p.observations[0]).toMatchObject({ stepMeasurementId: 'walk-1', detectedSteps: 3, stepCount: 2.5, stepLengthCm: 80, lengthM: 2 });
});
