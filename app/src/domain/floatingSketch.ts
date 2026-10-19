export type SketchCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export interface Size { width: number; height: number }
export interface Position { x: number; y: number }
export const sketchCorners: SketchCorner[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
export function cornerPosition(corner: SketchCorner, area: Size, thumbnail: Size, margin = 12): Position {
  const lowX = Math.min(margin, Math.max(0, (area.width - thumbnail.width) / 2));
  const lowY = Math.min(margin, Math.max(0, (area.height - thumbnail.height) / 2));
  return { x: corner.endsWith('right') ? Math.max(lowX, area.width - thumbnail.width - margin) : lowX,
    y: corner.startsWith('bottom') ? Math.max(lowY, area.height - thumbnail.height - margin) : lowY };
}
export function clampSketch(position: Position, area: Size, thumbnail: Size): Position {
  return { x: Math.max(0, Math.min(position.x, Math.max(0, area.width - thumbnail.width))),
    y: Math.max(0, Math.min(position.y, Math.max(0, area.height - thumbnail.height))) };
}
export function nearestCorner(position: Position, area: Size, thumbnail: Size): SketchCorner {
  const horizontal = position.x + thumbnail.width / 2 < area.width / 2 ? 'left' : 'right';
  const vertical = position.y + thumbnail.height / 2 < area.height / 2 ? 'top' : 'bottom';
  return `${vertical}-${horizontal}`;
}
