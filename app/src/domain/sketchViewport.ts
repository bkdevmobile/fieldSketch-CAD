export interface CanvasTouch { x: number; y: number }
export interface CanvasTransform { zoom: number; pan: CanvasTouch }
export interface CanvasGesture { transform: CanvasTransform; focal: CanvasTouch; span: number; count: number }
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
  const zoom = Math.max(0.1, Math.min(20, start.transform.zoom * (start.span > 0 ? current.span / start.span : 1)));
  const ratio = zoom / start.transform.zoom;
  return { zoom, pan: {
    x: current.focal.x - center.x - (start.focal.x - center.x - start.transform.pan.x) * ratio,
    y: current.focal.y - center.y - (start.focal.y - center.y - start.transform.pan.y) * ratio,
  } };
}
