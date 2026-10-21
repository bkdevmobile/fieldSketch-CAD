import { boxesOverlap, DrawingLabel, LabelPoint, placeLabels, segmentHitsBox } from '../src/domain/labelLayout';
const points = [{ x: -800, y: -600 }, { x: 160, y: -600 }, { x: 160, y: 140 }, { x: -800, y: 140 }];
const segments: [LabelPoint, LabelPoint][] = points.map((p, i) => [p, points[(i + 1) % points.length]!]);
const labels: DrawingLabel[] = points.map((p, i) => ({ text: 'P' + (i + 1), anchor: p, fontSize: 13, kind: 'point' }));
segments.forEach(([a, b], i) => labels.push({ text: (i + 1) + ' m', anchor: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, fontSize: 11, kind: 'length' }));
test('zoomed corners and side midpoints outside the viewport keep their descriptions offscreen', () => {
  const placed = placeLabels(labels, segments, points);
  for (const index of [0, 1, 3, 4, 6, 7]) {
    const label = placed[index]!;
    expect(label.box.x + label.box.width < 0 || label.box.y + label.box.height < 0).toBe(true);
    const center = { x: label.box.x + label.box.width / 2, y: label.box.y + label.box.height / 2 };
    expect(Math.hypot(center.x - label.anchor.x, center.y - label.anchor.y)).toBeLessThan(70);
  }
  for (let i = 0; i < placed.length; i++) {
    expect(segments.some(([a, b]) => segmentHitsBox(a, b, placed[i]!.box))).toBe(false);
    expect(placed.slice(0, i).some(l => boxesOverlap(l.box, placed[i]!.box))).toBe(false);
  }
});
test.each([{ x: -1000, y: -600 }, { x: 450, y: 900 }, { x: -25, y: 16 }])('panning translates labels with the sketch instead of rearranging them', pan => {
  const before = placeLabels(labels, segments, points), move = (p: LabelPoint) => ({ x: p.x + pan.x, y: p.y + pan.y });
  const after = placeLabels(labels.map(l => ({ ...l, anchor: move(l.anchor) })), segments.map(([a, b]) => [move(a), move(b)]), points.map(move));
  after.forEach((l, i) => {
    expect(l.box.x).toBeCloseTo(before[i]!.box.x + pan.x);
    expect(l.box.y).toBeCloseTo(before[i]!.box.y + pan.y);
    expect(l.box.width).toBe(before[i]!.box.width); expect(l.box.height).toBe(before[i]!.box.height);
  });
});
test('text crossing the viewport edge is not relocated to fit inside it', () => {
  const anchor = { x: 0, y: 150 };
  const placed = placeLabels([{ text: 'P123', anchor, fontSize: 13, kind: 'point' }], [], [anchor]);
  expect(placed[0]!.box.x).toBeLessThan(0);
  expect(placed[0]!.box.x + placed[0]!.box.width).toBeGreaterThan(0);
});
