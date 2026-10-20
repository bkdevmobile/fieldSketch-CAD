import { assertProjectSave, canAddPoint, canCreateProject } from '../src/domain/access';
import { closeOutline, commitSide, editLastSide, undoLast } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';

function sketch(count: number) {
  let project = newProject('Test', 'manual');
  while (project.points.length < count) project = commitSide(project, 1, project.points.length % 2, 'manual', 's', null);
  return project;
}

test('P1 liczy się do limitu, ósmy punkt dostępny, dziewiąty wymaga Plus', () => {
  const seven = sketch(7), eight = commitSide(seven, 1, 0, 'manual', 's', null);
  expect(canAddPoint(seven, 'free')).toBe(true);
  expect(canAddPoint(eight, 'free')).toBe(false);
  expect(() => assertProjectSave(eight, seven, 3, 'free')).not.toThrow();
  const nine = commitSide(eight, 1, 0, 'manual', 's', null);
  expect(() => assertProjectSave(nine, eight, 3, 'free')).toThrow('8 punktów');
  expect(() => assertProjectSave(nine, eight, 3, 'plus')).not.toThrow();
});

test('przy limicie i po utracie Plus korekta, cofnięcie i zamknięcie pozostają dostępne', () => {
  for (const count of [8, 12]) {
    const project = sketch(count);
    for (const next of [project, closeOutline(project), undoLast(project), editLastSide(project, { source: 'manual', value: 5, unit: 'm' }, 0)])
      expect(() => assertProjectSave(next, project, 10, 'free')).not.toThrow();
    expect(canAddPoint(project, 'free')).toBe(false);
    expect(canAddPoint(project, 'plus')).toBe(true);
  }
});

test('limit trzech obejmuje rozpoczęte szkice i blokuje tworzenie także przy większym archiwum', () => {
  expect(canCreateProject(2, 'free')).toBe(true);
  for (const count of [3, 10]) {
    expect(canCreateProject(count, 'free')).toBe(false);
    expect(() => assertProjectSave(newProject('Nowy', 'manual'), null, count, 'free')).toThrow('3 szkice');
    expect(canCreateProject(count, 'plus')).toBe(true);
  }
});
