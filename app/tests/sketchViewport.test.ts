import { beginCanvasGesture, fitCanvas, moveCanvasGesture } from '../src/domain/sketchViewport';
import { captureErrorText } from '../src/domain/captureError';

test('przesunięcie szkicu działa pionowo i poziomo przy zachowanej skali', () => {
  const start = beginCanvasGesture({ zoom: 2, pan: { x: 10, y: -5 } }, [{ x: 100, y: 80 }]);
  expect(moveCanvasGesture(start, [{ x: 70, y: 140 }], { x: 150, y: 150 }))
    .toEqual({ zoom: 2, pan: { x: -20, y: 55 } });
});

test('pinch zachowuje punkt pod środkiem palców także przy przesuwaniu środka', () => {
  const start = beginCanvasGesture({ zoom: 1, pan: { x: 0, y: 0 } }, [{ x: 100, y: 80 }, { x: 200, y: 80 }]);
  const next = moveCanvasGesture(start, [{ x: 70, y: 100 }, { x: 270, y: 100 }], { x: 200, y: 200 });
  expect(next).toEqual({ zoom: 2, pan: { x: 70, y: 140 } });
  // Original world offset (-50, -120) stays under new focal point (170, 100).
  expect(200 - 50 * next.zoom + next.pan.x).toBe(170);
  expect(200 - 120 * next.zoom + next.pan.y).toBe(100);
});

test('zmiana z dwóch palców na jeden zachowuje transformację i ograniczenia skali', () => {
  const initial = { zoom: 10, pan: { x: 22, y: 33 } };
  const pinch = beginCanvasGesture(initial, [{ x: 0, y: 0 }, { x: 10, y: 0 }]);
  const enlarged = moveCanvasGesture(pinch, [{ x: 0, y: 0 }, { x: 100, y: 0 }], { x: 0, y: 0 });
  expect(enlarged.zoom).toBe(20);
  const oneFinger = beginCanvasGesture(enlarged, [{ x: 100, y: 0 }]);
  expect(moveCanvasGesture(oneFinger, [{ x: 100, y: 0 }], { x: 0, y: 0 })).toEqual(enlarged);
  expect(moveCanvasGesture(pinch, [{ x: 0, y: 0 }, { x: 0, y: 0 }], { x: 0, y: 0 }).zoom).toBe(0.1);
});

test('odrzucony odczyt pokazuje instrukcję bez technicznego opakowania Expo', () => {
  const text = captureErrorText(new Error('Call to function FieldSketchOrientation.captureDirection has been rejected. Zmień pochylenie telefonu. Celowanie jest zbyt pionowe.'));
  expect(text).toContain('nieruchomo');
  expect(text).not.toMatch(/FieldSketch|rejected|function/);
  expect(captureErrorText(new Error('Próbki są nieaktualne'))).toContain('zielony status');
});

test('pierwszy wektor mieści się w miniaturze również przy klawiaturze', () => {
  for (const height of [74, 104]) for (const theta of [0, Math.PI / 2, -Math.PI / 4]) {
    const points = [{ x: 0, y: 0 }, { x: Math.cos(theta) * 0.9, y: Math.sin(theta) * 0.9 }];
    const bounds = fitCanvas(points, 108, height, true);
    for (const p of points) {
      expect(54 + (p.x - bounds.cx) * bounds.scale).toBeGreaterThanOrEqual(24);
      expect(54 + (p.x - bounds.cx) * bounds.scale).toBeLessThanOrEqual(84);
      expect(height / 2 - (p.y - bounds.cy) * bounds.scale).toBeGreaterThanOrEqual(24);
      expect(height / 2 - (p.y - bounds.cy) * bounds.scale).toBeLessThanOrEqual(height - 24);
    }
  }
});
