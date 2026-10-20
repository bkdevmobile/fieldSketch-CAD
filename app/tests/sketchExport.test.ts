import { closeOutline, commitMeasurement } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';
import { sketchExport } from '../src/domain/sketchExport';

test('eksport zawiera wymiary wszystkich boków i rozróżnia wyliczone zamknięcie', () => {
  let project = newProject('Trójkąt', 'manual');
  project = commitMeasurement(project, { source: 'manual', value: 3, unit: 'm' }, 0, 'manual', 's', null);
  project = commitMeasurement(project, { source: 'steps', steps: 5, stepLengthCm: 80 }, Math.PI / 2, 'manual', 's', null);
  const exported = sketchExport(closeOutline(project));
  expect(exported.edges.map(edge => edge.lengthM)).toEqual([3, 4, 5]);
  expect(exported.edges.map(edge => edge.source)).toEqual(['ręczny', 'kroki', 'wyliczony']);
  expect(exported.estimated).toBe(true);
  expect(exported.metrics.area).toBe(6);
  expect(exported.points.every(p => p.x >= 64 && p.x <= 1016 && p.y >= 210 && p.y <= 710)).toBe(true);
});

test('otwarta pozioma i pionowa trasa ma skończone współrzędne bez fałszywego pola', () => {
  for (const angle of [0, Math.PI / 2]) {
    const project = commitMeasurement(newProject('Linia', 'manual'), { source: 'manual', value: 100, unit: 'm' }, angle, 'manual', 's', null);
    const exported = sketchExport(project);
    expect(exported.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    expect(exported.edges).toHaveLength(1);
    expect(exported.estimated).toBe(false);
    expect(exported.metrics.area).toBeNull();
  }
});

test('zmierzony pełny obwód ma cztery boki bez dodatkowego zerowego zamknięcia w PNG', () => {
  let project = newProject('Powrót do P1', 'manual');
  for (const theta of [0, -Math.PI / 2, Math.PI, Math.PI / 2]) {
    project = commitMeasurement(project, { source: 'manual', value: 3, unit: 'm' }, theta, 'manual', 's', null);
  }
  const result = sketchExport(closeOutline(project));
  expect(result.points).toHaveLength(4);
  expect(result.edges).toHaveLength(4);
  expect(result.measuredReturn).toBe(true);
  expect(result.edges.at(-1)).toMatchObject({ from: 4, to: 1, source: 'ręczny' });
  expect(result.metrics.area).toBeCloseTo(9);
});
