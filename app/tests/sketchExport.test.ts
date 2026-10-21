import { closeOutline, commitMeasurement } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';
import { sketchExport, wrapExportText } from '../src/domain/sketchExport';
import { FREE_WATERMARK } from '../src/domain/access';

test('eksport zawiera wymiary wszystkich boków i rozróżnia wyliczone zamknięcie', () => {
  let project = newProject('Trójkąt', 'manual');
  project = commitMeasurement(project, { source: 'manual', value: 3, unit: 'm' }, 0, 'manual', 's', null);
  project = commitMeasurement(project, { source: 'steps', steps: 5, stepLengthCm: 80 }, Math.PI / 2, 'manual', 's', null);
  const exported = sketchExport(closeOutline(project));
  expect(exported.edges.map(edge => edge.lengthM)).toEqual([3, 4, 5]);
  expect(exported.edges.map(edge => edge.source)).toEqual(['ręczny', 'kroki', 'wyliczony']);
  expect(exported.estimated).toBe(true);
  expect(exported.metrics.area).toBe(6);
  expect(exported.points.every(p => { const transform = exported.drawingTransform; const x = p.x * transform.scale + transform.x, y = p.y * transform.scale + transform.y;
    return x >= 64 && x <= 1016 && y >= exported.drawingTop && y <= exported.drawingTop + exported.drawingHeight; })).toBe(true);
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

test('Free ma dodatkowy pasek pod rysunkiem; Plus zachowuje identyczne dane bez znaku wodnego', () => {
  const project = commitMeasurement(newProject('PNG', 'manual'), { source: 'steps', steps: 4, stepLengthCm: 75 }, 0, 'manual', 's', null);
  const free = sketchExport(project, 'free'), plus = sketchExport(project, 'plus');
  expect(free.watermark).toBe(FREE_WATERMARK);
  expect(free.height).toBe(free.contentHeight + 64);
  expect(plus.watermark).toBeNull();
  expect(plus.height).toBe(free.contentHeight);
  expect(free.points).toEqual(plus.points); expect(free.edges).toEqual(plus.edges);
  expect(free.estimated).toBe(true); expect(plus.estimated).toBe(true);
});

function rectangle(width: number, height: number) {
  let p = newProject('Prostokąt', 'manual');
  for (const [value, theta] of [[width, 0], [height, Math.PI / 2], [width, Math.PI]])
    p = commitMeasurement(p, { source: 'manual', value: value!, unit: 'm' }, theta!, 'manual', 's', null);
  return closeOutline(p);
}
test('square fills the export width and occupies most of the image instead of a fixed 500 px slot', () => {
  const drawing = sketchExport(rectangle(4, 4));
  expect(drawing.drawingHeight).toBeGreaterThan(800);
  expect(drawing.drawingHeight / drawing.height).toBeGreaterThan(0.5);
  expect(drawing.drawingBounds.width * drawing.drawingTransform.scale).toBeCloseTo(952);
  expect(drawing.separatorY - drawing.drawingTop - drawing.drawingHeight).toBe(24);
});
test('flat sketches produce a compact image while tall sketches get a taller drawing region', () => {
  const horizontal = commitMeasurement(newProject('Pozioma', 'manual'), { source: 'manual', value: 10, unit: 'm' }, 0, 'manual', 's', null);
  const vertical = commitMeasurement(newProject('Pionowa', 'manual'), { source: 'manual', value: 10, unit: 'm' }, Math.PI / 2, 'manual', 's', null);
  const flat = sketchExport(horizontal), tall = sketchExport(vertical);
  expect(flat.height).toBeLessThan(850); expect(tall.drawingHeight).toBeGreaterThan(1100);
  expect(tall.height).toBeGreaterThan(flat.height);
  expect(flat.drawingBounds.width * flat.drawingTransform.scale).toBeCloseTo(952);
});
test('all point labels fit inside the drawing without clipping or changing proportions', () => {
  for (const project of [rectangle(4, 4), rectangle(1, 12), rectangle(12, 1)]) {
    const d = sketchExport(project), transform = d.drawingTransform;
    for (const label of d.labels) {
      expect(label.box.x * transform.scale + transform.x).toBeGreaterThanOrEqual(64);
      expect((label.box.x + label.box.width) * transform.scale + transform.x).toBeLessThanOrEqual(1016);
      expect(label.box.y * transform.scale + transform.y).toBeGreaterThanOrEqual(d.drawingTop);
      expect((label.box.y + label.box.height) * transform.scale + transform.y).toBeLessThanOrEqual(d.drawingTop + d.drawingHeight);
    }
    const a = d.points[0]!, b = d.points[1]!, c = d.points[2]!;
    expect(Math.hypot(b.x - a.x, b.y - a.y) / Math.hypot(c.x - b.x, c.y - b.y))
      .toBeCloseTo(project.observations[0]!.lengthM / project.observations[1]!.lengthM);
  }
});
test('notes and translated footers flow immediately after the table and extend the image', () => {
  const p = rectangle(4, 3), plain = sketchExport(p), withNote = sketchExport({ ...p, note: 'Długi tekst pomiaru. '.repeat(100) });
  expect(withNote.drawingHeight).toBe(plain.drawingHeight);
  expect(withNote.points).toEqual(plain.points);
  expect(withNote.noteTitleY).toBeGreaterThan(withNote.tableY);
  expect(withNote.noteLines.every(line => Array.from(line).length <= 72)).toBe(true);
  expect(withNote.footerY).toBeGreaterThan(withNote.noteY + (withNote.noteLines.length - 1) * 30);
  expect(withNote.contentHeight - withNote.footerY - (withNote.footerLines.length - 1) * 32).toBe(48);
  expect(wrapExportText('A'.repeat(150)).map(line => line.length)).toEqual([72, 72, 6]);
});
