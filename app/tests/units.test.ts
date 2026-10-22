import { fromMetres, toMetres, areaUnit, displayArea } from '../src/domain/units';
import { commitMeasurement, measurementLength } from '../src/domain/geometry';
import { convertLengthInput } from '../src/domain/survey';
import { newProject } from '../src/domain/model';
import { defaultProjectName } from '../src/domain/projectName';
import { setLanguage } from '../src/i18n';

test('imperial measurements preserve physical geometry in metres', () => {
  const feet = measurementLength({ source: 'manual', value: 10, unit: 'ft' });
  const inches = measurementLength({ source: 'manual', value: 120, unit: 'in' });
  expect(feet.lengthM).toBeCloseTo(3.048, 12);
  expect(inches.lengthM).toBeCloseTo(feet.lengthM, 12);
  const p = commitMeasurement(newProject('Imperial', 'manual'), { source: 'manual', value: 10, unit: 'ft' }, Math.PI / 2, 'manual', 's', null);
  expect(p.points[1]!.y).toBeCloseTo(3.048, 12);
  expect(p.observations[0]!.lengthCm).toBeCloseTo(304.8, 10);
  expect(convertLengthInput('10', 'ft', 'in')).toBe('120');
  expect(convertLengthInput('120', 'in', 'ft')).toBe('10');
  expect(convertLengthInput('3,048', 'm', 'ft')).toBe('10');
  expect(convertLengthInput('', 'ft', 'cm')).toBe('');
});

test('step estimates round in the selected display unit and area uses square feet', () => {
  const feet = measurementLength({ source: 'steps', steps: 4, stepLengthCm: 76.2, unit: 'ft' });
  const inches = measurementLength({ source: 'steps', steps: 4, stepLengthCm: 76.2, unit: 'in' });
  expect(fromMetres(feet.lengthM, 'ft')).toBeCloseTo(10, 10);
  expect(fromMetres(inches.lengthM, 'in')).toBeCloseTo(120, 10);
  expect(toMetres(12, 'in')).toBeCloseTo(toMetres(1, 'ft'), 12);
  expect(displayArea(0.09290304, 'ft')).toBeCloseTo(1, 12);
  expect(areaUnit('in')).toBe('ft²');
  expect(areaUnit('cm')).toBe('m²');
});

test('default project name is editable, localized and avoids existing numbered names', () => {
  setLanguage('pl');
  expect(defaultProjectName([])).toBe('Mój pomiar');
  expect(defaultProjectName([' MÓJ POMIAR ', 'Mój pomiar 2'])).toBe('Mój pomiar 3');
  expect(defaultProjectName(['Mój pomiar', 'Mój pomiar 3'])).toBe('Mój pomiar 2');
  expect(defaultProjectName(['Ogród'])).toBe('Mój pomiar');
  setLanguage('en');
  expect(defaultProjectName(['My survey'])).toBe('My survey 2');
});
