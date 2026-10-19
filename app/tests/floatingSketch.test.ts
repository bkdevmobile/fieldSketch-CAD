import { clampSketch, cornerPosition, nearestCorner } from '../src/domain/floatingSketch';

const area = { width: 390, height: 600 }, thumbnail = { width: 154, height: 148 };
test('dragging to any quarter snaps the whole thumbnail into its nearest corner', () => {
  for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const) {
    const position = cornerPosition(corner, area, thumbnail);
    expect(nearestCorner(position, area, thumbnail)).toBe(corner);
    expect(position.x).toBeGreaterThanOrEqual(12);
    expect(position.x + thumbnail.width).toBeLessThanOrEqual(area.width - 12);
    expect(position.y + thumbnail.height).toBeLessThanOrEqual(area.height - 12);
  }
});
test('keyboard resize keeps the selected corner within the reduced viewport', () => {
  const keyboardArea = { width: 320, height: 220 };
  const position = cornerPosition('bottom-right', keyboardArea, { width: 128, height: 118 });
  expect(position).toEqual({ x: 180, y: 90 });
  expect(clampSketch({ x: 800, y: -100 }, keyboardArea, thumbnail)).toEqual({ x: 166, y: 0 });
});
test('a viewport smaller than the thumbnail never produces negative coordinates', () => {
  const small = { width: 100, height: 90 };
  expect(cornerPosition('bottom-right', small, thumbnail)).toEqual({ x: 0, y: 0 });
  expect(clampSketch({ x: 40, y: 60 }, small, thumbnail)).toEqual({ x: 0, y: 0 });
});
