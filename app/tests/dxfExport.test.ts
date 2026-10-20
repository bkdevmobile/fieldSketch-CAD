import { closeOutline, commitMeasurement, editLastSide } from '../src/domain/geometry';
import { dxfExport } from '../src/domain/dxfExport';
import { newProject } from '../src/domain/model';

// Read the public DXF group stream, independently of the exporter's helpers.
function read(data: string) {
  const lines = data.trimEnd().split(/\r?\n/);
  expect(lines.length % 2).toBe(0);
  const groups: { code: number; value: string }[] = [];
  for (let i = 0; i < lines.length; i += 2) groups.push({ code: Number(lines[i]), value: lines[i + 1]! });
  const start = groups.findIndex((g, i) => g.code === 2 && g.value === 'ENTITIES' && groups[i - 1]?.value === 'SECTION');
  const entities: typeof groups[] = [];
  for (const group of groups.slice(start + 1)) {
    if (group.code === 0 && group.value === 'ENDSEC') break;
    if (group.code === 0) entities.push([]);
    entities.at(-1)!.push(group);
  }
  const all = (entity: typeof groups, code: number) => entity.filter(g => g.code === code).map(g => g.value);
  const polyline = entities.find(e => e[0]?.value === 'LWPOLYLINE')!;
  const texts = entities.filter(e => e[0]?.value === 'TEXT');
  return { groups, entities, polyline, texts, all,
    xy: all(polyline, 10).map((x, i) => [Number(x), Number(all(polyline, 20)[i])]),
    lengths: texts.filter(e => all(e, 8)[0] === 'LENGTHS').map(e => all(e, 1)[0]),
    labels: texts.filter(e => all(e, 8)[0] === 'POINT_LABELS').map(e => all(e, 1)[0]),
  };
}
function triangle() {
  let project = commitMeasurement(newProject('Trójkąt', 'manual'), { source: 'manual', value: 3, unit: 'm' }, 0, 'manual', 's', null);
  return commitMeasurement(project, { source: 'steps', steps: 5, stepLengthCm: 80 }, Math.PI / 2, 'manual', 's', null);
}

test('otwarta polilinia ma lokalne XY, etykiety i nie dodaje zamknięcia', () => {
  const result = read(dxfExport(triangle()));
  expect(result.all(result.polyline, 70)).toEqual(['0']);
  expect(result.xy).toHaveLength(3);
  expect(result.xy[0]).toEqual([0, 0]);
  expect(result.xy[1]).toEqual([3, 0]);
  expect(result.xy[2]![0]).toBeCloseTo(3);
  expect(result.xy[2]![1]).toBeCloseTo(4);
  expect(result.labels).toEqual(['P1', 'P2', 'P3']);
  expect(result.lengths).toEqual(['3.00 m', '~ 4.00 m']);
});

test('zamknięty trójkąt 3/4/5 ma flagę zamknięcia i wyliczony bok bez duplikatu P1', () => {
  const result = read(dxfExport(closeOutline(triangle())));
  expect(result.all(result.polyline, 70)).toEqual(['1']);
  expect(result.all(result.polyline, 90)).toEqual(['3']);
  expect(result.lengths).toEqual(['3.00 m', '~ 4.00 m', '5.00 m (auto)']);
});

test('centymetry przeliczają geometrię, opisy i deklarację jednostki razem', () => {
  for (const [unit, code, side] of [['m', '6', 3], ['cm', '5', 300]] as const) {
    const result = read(dxfExport(triangle(), unit));
    const unitsIndex = result.groups.findIndex(g => g.code === 9 && g.value === '$INSUNITS');
    expect(result.groups[unitsIndex + 1]).toEqual({ code: 70, value: code });
    expect(result.xy[1]).toEqual([side, 0]);
    expect(result.lengths[0]).toBe(`${side.toFixed(2)} ${unit}`);
  }
});

test('eksport nie odwraca osi Y ani nie przenosi początku do ramki obrazu', () => {
  const project = triangle();
  project.points = project.points.map(p => ({ ...p, x: p.x + 12, y: -p.y - 7 }));
  const result = read(dxfExport(project));
  expect(result.xy[0]).toEqual([12, -7]);
  expect(result.xy[2]![1]).toBeCloseTo(-11);
});

test('zmierzony pełny powrót nie tworzy piątego narożnika i zerowego boku', () => {
  let project = newProject('Kwadrat', 'manual');
  for (const theta of [0, -Math.PI / 2, Math.PI, Math.PI / 2])
    project = commitMeasurement(project, { source: 'manual', value: 3, unit: 'm' }, theta, 'manual', 's', null);
  const result = read(dxfExport(closeOutline(project)));
  expect(result.xy).toHaveLength(4);
  expect(result.lengths).toEqual(Array(4).fill('3.00 m'));
  expect(result.labels).toEqual(['P1', 'P2', 'P3', 'P4']);
});

test('rzeczywista szczelina nie jest dociągana ani pomijana', () => {
  const project = triangle();
  project.points.push({ id: 'near-start', x: 0.1, y: 0 }); project.closed = true;
  const result = read(dxfExport(project));
  expect(result.xy).toHaveLength(4);
  expect(result.xy.at(-1)).toEqual([0.1, 0]);
  expect(result.lengths.at(-1)).toBe('0.10 m (auto)');
});

test('poprawiony bok używa aktualnej geometrii, a eksport nie modyfikuje historii', () => {
  const project = editLastSide(triangle(), { source: 'manual', value: 2, unit: 'm' }, -Math.PI / 2);
  const before = JSON.stringify(project);
  expect(read(dxfExport(project)).lengths).toEqual(['3.00 m', '2.00 m']);
  expect(JSON.stringify(project)).toBe(before);
});

test('polskie nazwy są kodowane, nowe linie nie wstrzykują encji, uchwyty są unikalne', () => {
  const project = triangle(); project.name = 'Łąka\n0\nLINE\\test';
  const data = dxfExport(project), result = read(data);
  expect(data).toContain('\\U+0141\\U+0105ka 0 LINE\\U+005Ctest');
  expect(result.entities.some(e => e[0]?.value === 'LINE')).toBe(false);
  const handles = result.groups.filter(g => g.code === 5).map(g => g.value);
  expect(new Set(handles).size).toBe(handles.length);
  expect(data.endsWith('0\r\nEOF\r\n')).toBe(true);
});

test('brak boku, NaN i przepełnienie współrzędnych są odrzucane', () => {
  expect(() => dxfExport(newProject('Punkt', 'manual'))).toThrow('dwóch punktów');
  const project = triangle(); project.points[1]!.x = NaN;
  expect(() => dxfExport(project)).toThrow('współrzędne');
  project.points[1]!.x = Number.MAX_VALUE;
  expect(() => dxfExport(project, 'cm')).toThrow('współrzędne');
});
