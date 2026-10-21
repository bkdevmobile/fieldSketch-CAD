export interface LabelPoint { x: number; y: number }
export interface LabelBox extends LabelPoint { width: number; height: number }
export interface DrawingLabel { text: string; anchor: LabelPoint; fontSize: number; kind: 'point' | 'length' }
export interface PlacedLabel extends DrawingLabel { box: LabelBox }
export function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export function segmentHitsBox(a: LabelPoint, b: LabelPoint, box: LabelBox): boolean {
  let low = 0, high = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const [p, q] of [[-dx, a.x - box.x], [dx, box.x + box.width - a.x], [-dy, a.y - box.y], [dy, box.y + box.height - a.y]]) {
    if (Math.abs(p!) < 1e-12) { if (q! < 0) return false; continue; }
    const r = q! / p!;
    if (p! < 0) low = Math.max(low, r); else high = Math.min(high, r);
    if (low > high) return false;
  }
  return true;
}
export function placeLabels(labels: DrawingLabel[], segments: [LabelPoint, LabelPoint][], vertices: LabelPoint[], bounds?: LabelBox): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  for (const label of labels) {
    const width = Array.from(label.text).length * label.fontSize * 0.68 + 10, height = label.fontSize * 1.35 + 8;
    const free = (box: LabelBox) => !segments.some(([a, b]) => segmentHitsBox(a, b, box))
      && !vertices.some(p => boxesOverlap(box, { x: p.x - 8, y: p.y - 8, width: 16, height: 16 }))
      && !placed.some(p => boxesOverlap(box, p.box));
    let result: LabelBox | undefined;
    for (let ring = 1; ring <= 100 && !result; ring++) {
      const radius = ring * (label.fontSize + 8);
      for (let direction = 0; direction < 16; direction++) {
        const angle = -Math.PI / 2 + direction * Math.PI / 8;
        const box = { x: label.anchor.x + Math.cos(angle) * radius - width / 2,
          y: label.anchor.y + Math.sin(angle) * radius - height / 2, width, height };
        if (bounds && (box.x < bounds.x || box.y < bounds.y || box.x + width > bounds.x + bounds.width || box.y + height > bounds.y + bounds.height)) continue;
        if (free(box)) { result = box; break; }
      }
    }
    if (!result) {
      const x = Math.max(...vertices.map(p => p.x), 0) + 24;
      let y = label.anchor.y;
      while (!free({ x, y, width, height })) y += height + 4;
      result = { x, y, width, height };
    }
    placed.push({ ...label, box: result });
  }
  return placed;
}
