export interface CanvasTouch { x: number; y: number }
export interface CanvasTransform { zoom: number; pan: CanvasTouch }
export interface CanvasGesture { transform: CanvasTransform; focal: CanvasTouch; span: number; count: number }
export const zoomLevels = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8] as const;
export const clampZoom = (zoom: number) => Math.max(zoomLevels[0], Math.min(zoomLevels.at(-1)!, zoom));
export function snapZoom(zoom: number) {
  return zoomLevels.reduce<number>((best, level) => Math.abs(Math.log(zoom / level)) < Math.abs(Math.log(zoom / best)) ? level : best, 1);
}
export function nextZoom(zoom: number, direction: number) {
  return direction > 0 ? zoomLevels.find(level => level > zoom + 1e-6) ?? zoomLevels.at(-1)!
    : [...zoomLevels].reverse().find(level => level < zoom - 1e-6) ?? zoomLevels[0];
}
export function scaleCanvas(transform: CanvasTransform, zoom: number, focal: CanvasTouch): CanvasTransform {
  const target = clampZoom(zoom), ratio = target / transform.zoom;
  return { zoom: target, pan: { x: focal.x - (focal.x - transform.pan.x) * ratio,
    y: focal.y - (focal.y - transform.pan.y) * ratio } };
}
// Points are pixel offsets from the fitted viewport center at zoom 1.
export function constrainCanvas(transform: CanvasTransform, points: CanvasTouch[], width: number, height: number): CanvasTransform {
  const zoom = clampZoom(transform.zoom);
  const limit = (values: number[], size: number, pan: number) => {
    const margin = Math.min(24, size / 4);
    const min = size / 2 + Math.min(...values) * zoom, max = size / 2 + Math.max(...values) * zoom;
    const a = margin - min, b = size - margin - max;
    // Allow the outer edge to reach the viewport midpoint, while preserving
    // existing movement room for small drawings and flat/single-point axes.
    const low = Math.min(a, b, size / 2 - max);
    const high = Math.max(a, b, size / 2 - min);
    return Math.max(low, Math.min(high, pan));
  };
  const pan = { x: limit(points.map(p => p.x), width, transform.pan.x),
    y: limit(points.map(p => p.y), height, transform.pan.y) };
  const screen = points.map(p => ({ x: width / 2 + p.x * zoom + pan.x, y: height / 2 + p.y * zoom + pan.y }));
  const margin = Math.min(24, width / 4, height / 4);
  // A diagonal can miss the viewport even while its bounding box overlaps it.
  let visible = false, closest = screen[0]!, closestDistance = Infinity;
  for (let i = 0; i < screen.length; i++) {
    const a = screen[i]!, b = screen[i + 1] ?? a;
    const dx = b.x - a.x, dy = b.y - a.y;
    let low = 0, high = 1;
    for (const [position, delta, size] of [[a.x, dx, width], [a.y, dy, height]]) {
      if (Math.abs(delta!) < 1e-9) {
        if (position! < margin || position! > size! - margin) high = -1;
      } else {
        const t1 = (margin - position!) / delta!, t2 = (size! - margin - position!) / delta!;
        low = Math.max(low, Math.min(t1, t2)); high = Math.min(high, Math.max(t1, t2));
      }
    }
    visible ||= low <= high;
    const length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, ((width / 2 - a.x) * dx + (height / 2 - a.y) * dy) / length2)) : 0;
    const point = { x: a.x + dx * t, y: a.y + dy * t };
    const distance = Math.hypot(point.x - width / 2, point.y - height / 2);
    if (distance < closestDistance) { closest = point; closestDistance = distance; }
  }
  if (!visible) {
    pan.x += Math.max(margin, Math.min(width - margin, closest.x)) - closest.x;
    pan.y += Math.max(margin, Math.min(height - margin, closest.y)) - closest.y;
  }
  return { zoom, pan };
}
export function fitCanvas(points: CanvasTouch[], width: number, height: number, thumbnail: boolean) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
    scale: Math.min(Math.max(30, width - (thumbnail ? 64 : 100)) / Math.max(maxX - minX, 0.01),
      (height - 48) / Math.max(maxY - minY, 0.01)) };
}
function touchGeometry(touches: CanvasTouch[]) {
  const a = touches[0]!, b = touches[1];
  return { count: Math.min(2, touches.length), focal: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
    span: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0 };
}
export function beginCanvasGesture(transform: CanvasTransform, touches: CanvasTouch[]): CanvasGesture {
  return { transform, ...touchGeometry(touches) };
}
export function moveCanvasGesture(start: CanvasGesture, touches: CanvasTouch[], center: CanvasTouch): CanvasTransform {
  const current = touchGeometry(touches);
  const zoom = clampZoom(start.transform.zoom * (start.span > 0 ? current.span / start.span : 1));
  const ratio = zoom / start.transform.zoom;
  return { zoom, pan: {
    x: current.focal.x - center.x - (start.focal.x - center.x - start.transform.pan.x) * ratio,
    y: current.focal.y - center.y - (start.focal.y - center.y - start.transform.pan.y) * ratio,
  } };
}
