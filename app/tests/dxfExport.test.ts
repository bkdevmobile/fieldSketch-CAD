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
  expect(result.lengths).toEqual(['3 m', '~ 4 m']);
});

test('zamknięty trójkąt 3/4/5 ma flagę zamknięcia i wyliczony bok bez duplikatu P1', () => {
  const result = read(dxfExport(closeOutline(triangle())));
  expect(result.all(result.polyline, 70)).toEqual(['1']);
  expect(result.all(result.polyline, 90)).toEqual(['3']);
  expect(result.lengths).toEqual(['3 m', '~ 4 m', '5 m (auto)']);
});

test('centymetry przeliczają geometrię, opisy i deklarację jednostki razem', () => {
  for (const [unit, code, side] of [['m', '6', 3], ['cm', '5', 300]] as const) {
    const result = read(dxfExport(triangle(), unit));
    const unitsIndex = result.groups.findIndex(g => g.code === 9 && g.value === '$INSUNITS');
    expect(result.groups[unitsIndex + 1]).toEqual({ code: 70, value: code });
    expect(result.xy[1]).toEqual([side, 0]);
    expect(result.lengths[0]).toBe(`${side} ${unit}`);
  }
});

test('imperial DXF coordinates, labels and insertion units agree', () => {
  const project = commitMeasurement(newProject('Imperial', 'manual'), { source: 'manual', value: 10, unit: 'ft' }, 0, 'manual', 's', null);
  const before = JSON.stringify(project);
  for (const [unit, code, length] of [['ft', '2', 10], ['in', '1', 120]] as const) {
    const result = read(dxfExport(project, unit));
    const index = result.groups.findIndex(g => g.code === 9 && g.value === '$INSUNITS');
    expect(result.groups[index + 1]).toEqual({ code: 70, value: code });
    expect(result.xy[1]![0]).toBeCloseTo(length, 10);
    expect(result.lengths[0]).toBe(`${length} ${unit}`);
    const measurement = result.groups.findIndex(g => g.code === 9 && g.value === '$MEASUREMENT');
    expect(result.groups[measurement + 1]!.value).toBe('0');
  }
  expect(JSON.stringify(project)).toBe(before);
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
  expect(result.lengths).toEqual(Array(4).fill('3 m'));
  expect(result.labels).toEqual(['P1', 'P2', 'P3', 'P4']);
});

test('rzeczywista szczelina nie jest dociągana ani pomijana', () => {
  const project = triangle();
  project.points.push({ id: 'near-start', x: 0.1, y: 0 }); project.closed = true;
  const result = read(dxfExport(project));
  expect(result.xy).toHaveLength(4);
  expect(result.xy.at(-1)).toEqual([0.1, 0]);
  expect(result.lengths.at(-1)).toBe('0.1 m (auto)');
});

test('poprawiony bok używa aktualnej geometrii, a eksport nie modyfikuje historii', () => {
  const project = editLastSide(triangle(), { source: 'manual', value: 2, unit: 'm' }, -Math.PI / 2);
  const before = JSON.stringify(project);
  expect(read(dxfExport(project)).lengths).toEqual(['3 m', '2 m']);
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

function viewport(result: ReturnType<typeof read>) {
  const start = result.groups.findIndex(g => g.code === 0 && g.value === 'VPORT');
  const end = result.groups.findIndex((g, i) => i > start && g.code === 0);
  const record = result.groups.slice(start, end);
  const number = (code: number) => Number(result.all(record, code)[0]);
  const headerPoint = (name: string) => {
    const index = result.groups.findIndex(g => g.code === 9 && g.value === name);
    expect(index).toBeGreaterThan(-1);
    return [Number(result.groups[index + 1]!.value), Number(result.groups[index + 2]!.value)];
  };
  expect(result.all(record, 2)).toEqual(['*ACTIVE']);
  expect(result.all(record, 100)).toContain('AcDbViewportTableRecord');
  return { x: number(12), y: number(22), height: number(40), ratio: number(41),
    min: headerPoint('$EXTMIN'), max: headerPoint('$EXTMAX') };
}

test.each(['m', 'cm'] as const)('początkowy widok %s obejmuje geometrię i wszystkie opisy z marginesem', unit => {
  const project = closeOutline(triangle());
  project.note = 'W'.repeat(100) + '\nNotatka poniżej szkicu';
  project.points = project.points.map(p => ({ ...p, x: p.x - 75, y: p.y + 120 }));
  const before = JSON.stringify(project);
  const result = read(dxfExport(project, unit)), view = viewport(result);
  const left = view.x - view.height * view.ratio / 2, right = view.x + view.height * view.ratio / 2;
  const bottom = view.y - view.height / 2, top = view.y + view.height / 2;
  expect(view.height).toBeGreaterThan(0);
  expect(left).toBeLessThan(view.min[0]!); expect(right).toBeGreaterThan(view.max[0]!);
  expect(bottom).toBeLessThan(view.min[1]!); expect(top).toBeGreaterThan(view.max[1]!);
  for (const [x, y] of result.xy) {
    expect(x).toBeGreaterThan(left); expect(x).toBeLessThan(right);
    expect(y).toBeGreaterThan(bottom); expect(y).toBeLessThan(top);
  }
  for (const text of result.texts) {
    const x = Number(result.all(text, 10)[0]), y = Number(result.all(text, 20)[0]);
    const height = Number(result.all(text, 40)[0]);
    const value = result.all(text, 1)[0]!.replace(/\\U\+[0-9A-F]{4}/g, 'x');
    expect(x).toBeGreaterThan(left); expect(x + value.length * height).toBeLessThan(right);
    expect(y - height * 0.3).toBeGreaterThan(bottom); expect(y + height * 1.3).toBeLessThan(top);
  }
  expect(JSON.stringify(project)).toBe(before);
});

test('zmiana jednostek skaluje środek i wysokość widoku bez zmiany proporcji', () => {
  const project = closeOutline(triangle());
  // Keep the longest text identical: numeric labels naturally grow in cm.
  project.note = 'W'.repeat(100);
  const meters = viewport(read(dxfExport(project, 'm'))), cm = viewport(read(dxfExport(project, 'cm')));
  expect(cm.x).toBeCloseTo(meters.x * 100);
  expect(cm.y).toBeCloseTo(meters.y * 100);
  expect(cm.height).toBeCloseTo(meters.height * 100);
  expect(cm.ratio).toBe(meters.ratio);
});

test.each([0, Math.PI / 2])('widok jednobokowego szkicu ma skończoną skalę dla kierunku %s', heading => {
  const project = commitMeasurement(newProject('Bok', 'manual'), { source: 'manual', value: 0.001, unit: 'm' }, heading, 'manual', 's', null);
  const view = viewport(read(dxfExport(project)));
  expect(Number.isFinite(view.x) && Number.isFinite(view.y) && Number.isFinite(view.height)).toBe(true);
  expect(view.height).toBeGreaterThan(0);
});
