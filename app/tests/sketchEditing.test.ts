import { newProject } from '../src/domain/model';
import { activeSides, closeOutline, commitMeasurement, correctClosingLength, correctSides, distance, measurementPrefix, metrics } from '../src/domain/geometry';
import { boxesOverlap, placeLabels, segmentHitsBox, DrawingLabel, LabelPoint } from '../src/domain/labelLayout';
import { sketchExport } from '../src/domain/sketchExport';
import { dxfExport } from '../src/domain/dxfExport';
function outline() {
  let p = newProject('Próba', 'manual');
  for (const theta of [0, Math.PI / 2, Math.PI]) p = commitMeasurement(p, { source: 'manual', value: 3, unit: 'm' }, theta, 'manual', 's', null);
  return p;
}
test('earlier side correction preserves turns, vertex IDs and immutable source measurements', () => {
  const p = outline(), before = JSON.stringify(p), sides = activeSides(p);
  const next = correctSides(p, [{ observationId: sides[0]!.id, measurement: { source: 'manual', value: 5, unit: 'm' }, theta: Math.PI / 2 }]);
  expect(next.points.map(p => p.id)).toEqual(p.points.map(p => p.id));
  expect(next.points[1]!.x).toBeCloseTo(0); expect(next.points[1]!.y).toBeCloseTo(5);
  expect(next.points[2]!.x).toBeCloseTo(-3); expect(next.points[2]!.y).toBeCloseTo(5);
  expect(next.points[3]!.x).toBeCloseTo(-3); expect(next.points[3]!.y).toBeCloseTo(2);
  expect(next.observations.slice(0, sides.length)).toEqual(p.observations);
  expect(JSON.stringify(p)).toBe(before);
  expect(next.geometryRevision).toBe(p.geometryRevision + 1);
});
test('bulk corrections retain closed status and recalculate area and perimeter', () => {
  const p = closeOutline(outline()), sides = activeSides(p);
  const next = correctSides(p, [sides[0]!, sides[2]!].map(o => ({ observationId: o.id, measurement: { source: 'manual' as const, value: 5, unit: 'm' as const }, theta: o.theta })));
  expect(next.closed).toBe(true); expect(metrics(next).area).toBeCloseTo(15); expect(metrics(next).perimeter).toBeCloseTo(16);
});
test('independent closure is rebased without losing its original measurement', () => {
  const p = commitMeasurement(outline(), { source: 'manual', value: 2, unit: 'm' }, -Math.PI / 2, 'manual', 's', null, true);
  const original = p.observations.at(-1)!;
  const next = correctSides(p, [{ observationId: activeSides(p)[0]!.id, measurement: { source: 'manual', value: 5, unit: 'm' }, theta: 0 }]);
  const closure = next.observations.find(o => o.id === next.closureObservationId)!;
  expect(closure.lengthM).toBe(2); expect(closure.predictedEnd.x).toBeCloseTo(2); expect(closure.predictedEnd.y).toBeCloseTo(1);
  expect(closure.supersedesId).toBe(original.id); expect(next.observations).toContain(original);
});
test('closing side length correction preserves adjacent length and rejects impossible triangles', () => {
  const p = closeOutline(outline()), source = JSON.stringify(p);
  const next = correctClosingLength(p, 4);
  expect(distance(next.points[0]!, next.points.at(-1)!)).toBeCloseTo(4);
  expect(distance(next.points.at(-2)!, next.points.at(-1)!)).toBeCloseTo(3);
  expect(next.points.slice(0, -1)).toEqual(p.points.slice(0, -1));
  expect(() => correctClosingLength(p, 20)).toThrow(); expect(JSON.stringify(p)).toBe(source);
});
test('remeasurement prefix never removes original data and can replace the first or middle side', () => {
  const p = closeOutline(outline());
  const prefix = measurementPrefix(p, 1);
  expect(prefix.points).toEqual(p.points.slice(0, 2)); expect(prefix.closed).toBe(false);
  expect(prefix.observations).toEqual(p.observations);
  const next = correctSides(p, [{ observationId: activeSides(p)[1]!.id, measurement: { source: 'steps', steps: 8, stepLengthCm: 75, measurementId: 'new', detectedSteps: 8 }, theta: Math.PI / 2, mode: 'relative', capture: null, referenceFrameId: 'new-session' }]);
  expect(next.points).toHaveLength(p.points.length); expect(activeSides(next)[1]).toMatchObject({ stepCount: 8, stepMeasurementId: 'new', lengthM: 6, mode: 'relative' });
  expect(next.points.at(-1)!.y).toBeCloseTo(6); expect(p.closed).toBe(true);
});
test.each([NaN, Infinity, 0, -1])('invalid length %s leaves original unchanged', value => {
  const p = outline(), before = JSON.stringify(p);
  expect(() => correctSides(p, [{ observationId: activeSides(p)[0]!.id, measurement: { source: 'manual', value, unit: 'm' }, theta: 0 }])).toThrow();
  expect(JSON.stringify(p)).toBe(before);
});
test.each([
  [{ x: 50, y: 50 }, { x: 50, y: 350 }, { x: 350, y: 350 }, { x: 350, y: 50 }],
  [{ x: 50, y: 50 }, { x: 350, y: 350 }, { x: 355, y: 345 }, { x: 55, y: 45 }],
  [{ x: 100, y: 100 }, { x: 110, y: 105 }, { x: 105, y: 110 }, { x: 102, y: 108 }],
])('labels avoid all outline segments and each other, including narrow and crowded geometry', (...vertices: LabelPoint[]) => {
  const segments: [LabelPoint, LabelPoint][] = vertices.map((p, i) => [p, vertices[(i + 1) % vertices.length]!]);
  const labels: DrawingLabel[] = vertices.map((p, i) => ({ text: 'P' + (i + 1), anchor: p, fontSize: 14, kind: 'point' }));
  segments.forEach(([a, b]) => labels.push({ text: '123.45 cm', anchor: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, fontSize: 14, kind: 'length' }));
  const placed = placeLabels(labels, segments, vertices);
  expect(placed).toHaveLength(labels.length);
  for (let i = 0; i < placed.length; i++) {
    expect(segments.some(([a, b]) => segmentHitsBox(a, b, placed[i]!.box))).toBe(false);
    expect(placed.slice(0, i).some(l => boxesOverlap(l.box, placed[i]!.box))).toBe(false);
  }
});
test('notes expand PNG and appear in DXF without changing geometry', () => {
  const p = closeOutline(outline()), note = 'Teren północny\n' + 'Długa notatka z pomiaru. '.repeat(30);
  const plain = sketchExport(p), withNote = sketchExport({ ...p, note });
  expect(withNote.height).toBeGreaterThan(plain.height); expect(withNote.points).toEqual(plain.points);
  expect(withNote.noteLines.join('')).toContain('Teren północny');
  expect(dxfExport({ ...p, note })).toContain('Teren p');
});
