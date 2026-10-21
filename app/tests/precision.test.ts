import { decimalInput, decimalText, roundDecimal, roundedInput } from '../src/domain/precision';
import { commitMeasurement, correctSides, editLastSide, measurementLength, parsePositive } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';
import { convertLengthInput, headingFromTurn, turnFromHeading } from '../src/domain/survey';
import { dxfExport } from '../src/domain/dxfExport';

test.each([[1.005, 2, 1.01], [1.2345, 3, 1.235], [9.9999, 3, 10], [-1.2345, 3, -1.235], [0.0005, 3, 0.001]])('rounds %s to %s decimal places without binary multiplication artefacts', (value, digits, expected) => {
  expect(roundDecimal(value, digits)).toBe(expected);
});
test('manual input accepts comma, dot and incomplete edits while limiting fractional digits', () => {
  expect(decimalInput('12,345', 2)).toBe('12,34'); expect(decimalInput('12.3456', 3)).toBe('12.345');
  for (const text of ['', '0,', '.5', '123']) expect(decimalInput(text, 3)).toBe(text);
  for (const text of ['1e3', '-2', '1,2.3', 'NaN']) expect(decimalInput(text, 3)).toBeNull();
  expect(() => parsePositive('2,1234', 3)).toThrow(); expect(parsePositive('2,123', 3)).toBe(2.123);
  expect(decimalText(2.5, 3)).toBe('2.5'); expect(roundedInput('1,23456', 3)).toBe('1,235');
});
test.each([[88.49, '88'], [88.5, '89'], [179.9, '180'], [-43.6, '44'], [0.2, '0']])('camera turn %s is an integer %s', (degrees, expected) => {
  const result = turnFromHeading(0, Number(degrees) * Math.PI / 180, 1);
  expect(result.turn).toBe(expected);
});
test('manual angles retain two decimals and do not accept a third fractional digit', () => {
  expect(headingFromTurn(0, '12,34', 'left') * 180 / Math.PI).toBeCloseTo(12.34);
  expect(() => headingFromTurn(0, '12.345', 'left')).toThrow();
  expect(turnFromHeading(0, 12.3456 * Math.PI / 180).turn).toBe('12.35');
});
test('integer camera turn is used for geometry while the full raw capture remains in history', () => {
  const heading = 88.654321 * Math.PI / 180;
  const capture = { headingRad: Math.PI / 2 - heading, stdDevDeg: 0.25, accuracy: 3, sampleCount: 50,
    horizontalProjection: 1, stable: true, sessionId: 's', timestampUtc: '2026-10-21T12:00:00Z' };
  const turn = turnFromHeading(0, heading, 1);
  const theta = headingFromTurn(0, turn.turn, turn.turnSide);
  const p = commitMeasurement(newProject('Test', 'relative'), { source: 'manual', value: 3, unit: 'm' }, theta, 'relative', 's', capture, false, heading);
  expect(p.observations[0]!.theta * 180 / Math.PI).toBeCloseTo(89);
  expect(p.observations[0]!.capturedTheta).toBe(heading); expect(p.observations[0]!.capture).toEqual(capture);
});
test('step calculations round in the selected unit and retain raw steps and calibration', () => {
  const input = { source: 'steps' as const, steps: 1.23456, stepLengthCm: 75.123, measurementId: 'walk', detectedSteps: 2 };
  const meters = measurementLength({ ...input, unit: 'm' });
  const cm = measurementLength({ ...input, unit: 'cm' });
  expect(meters.lengthM).toBe(0.927); expect(cm.lengthCm).toBeCloseTo(92.744);
  const p = commitMeasurement(newProject('Test', 'manual'), { ...input, unit: 'm' }, 0, 'manual', 's', null);
  expect(p.points[1]!.x).toBe(0.927);
  expect(p.observations[0]).toMatchObject({ stepCount: 1.23456, stepLengthCm: 75.123, detectedSteps: 2, lengthM: 0.927 });
});
test('unit conversion rounds to at most three decimals and rejects a result rounded to zero', () => {
  expect(convertLengthInput('123,456', 'cm', 'm')).toBe('1,235');
  expect(convertLengthInput('1,235', 'm', 'cm')).toBe('123,5');
  expect(() => convertLengthInput('0,001', 'cm', 'm')).toThrow();
  expect(() => measurementLength({ source: 'steps', steps: 0.0001, stepLengthCm: 75, unit: 'm' })).toThrow();
});
test('legacy lengths and source calibration do not change when only an angle is corrected', () => {
  const p = commitMeasurement(newProject('Legacy', 'manual'), { source: 'steps', steps: 1.23456789, stepLengthCm: 75.123456 }, 0, 'manual', 's', null);
  const o = p.observations[0]!;
  const measurement = { source: 'steps' as const, steps: o.stepCount!, stepLengthCm: Number(o.stepLengthCm!.toFixed(3)), unit: 'm' as const };
  const next = editLastSide(p, measurement, Math.PI / 2, true);
  expect(next.observations.at(-1)).toMatchObject({ lengthM: o.lengthM, lengthCm: o.lengthCm, stepLengthCm: o.stepLengthCm, stepCount: o.stepCount });
  const bulk = correctSides(p, [{ observationId: o.id, measurement, theta: Math.PI / 2, preserveLength: true }]);
  expect(bulk.observations.at(-1)!.lengthM).toBe(o.lengthM);
  expect(bulk.observations.at(-1)!.stepLengthCm).toBe(o.stepLengthCm);
  expect(p.observations[0]).toBe(o);
});
test('DXF descriptions use at most three decimals without rounding vertex coordinates', () => {
  const p = commitMeasurement(newProject('Legacy', 'manual'), { source: 'manual', value: 1.23456789, unit: 'm' }, 0, 'manual', 's', null);
  const text = dxfExport(p);
  expect(text).toContain('1.235 m'); expect(text).toContain('\r\n1.23456789\r\n');
  expect(dxfExport(p, 'cm')).toContain('123.457 cm');
});
