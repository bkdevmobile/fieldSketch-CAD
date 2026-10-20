import { beginCanvasGesture, constrainCanvas, fitCanvas, moveCanvasGesture, nextZoom, scaleCanvas, snapZoom } from '../src/domain/sketchViewport';
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
  expect(enlarged.zoom).toBe(8);
  const oneFinger = beginCanvasGesture(enlarged, [{ x: 100, y: 0 }]);
  expect(moveCanvasGesture(oneFinger, [{ x: 100, y: 0 }], { x: 0, y: 0 })).toEqual(enlarged);
  expect(moveCanvasGesture(pinch, [{ x: 0, y: 0 }, { x: 0, y: 0 }], { x: 0, y: 0 }).zoom).toBe(0.5);
});

test('mały szkic pozostaje w całości wewnątrz marginesów mimo dalekiego przesunięcia', () => {
  const points = [{ x: -50, y: -25 }, { x: 50, y: 25 }];
  for (const direction of [-1, 1]) {
    const value = constrainCanvas({ zoom: 1, pan: { x: direction * 10000, y: direction * 10000 } }, points, 300, 200);
    for (const p of points) {
      expect(150 + p.x + value.pan.x).toBeGreaterThanOrEqual(24);
      expect(150 + p.x + value.pan.x).toBeLessThanOrEqual(276);
      expect(100 + p.y + value.pan.y).toBeGreaterThanOrEqual(24);
      expect(100 + p.y + value.pan.y).toBeLessThanOrEqual(176);
    }
  }
});

test('powiększony szkic nie daje się odsunąć poza viewport, także dla pojedynczego punktu', () => {
  expect(constrainCanvas({ zoom: 8, pan: { x: 9999, y: -9999 } }, [{ x: -100, y: 0 }, { x: 100, y: 0 }], 300, 200))
    .toEqual({ zoom: 8, pan: { x: 800, y: -76 } });
  expect(constrainCanvas({ zoom: 1, pan: { x: 9999, y: -9999 } }, [{ x: 0, y: 0 }], 300, 200).pan)
    .toEqual({ x: 126, y: -76 });
});

test('krawędź dopasowanego szkicu może dojść do połowy podglądu w obu osiach', () => {
  const points = [{ x: -125, y: -75 }, { x: 125, y: -75 }, { x: 125, y: 75 }, { x: -125, y: 75 }];
  for (const sign of [-1, 1]) {
    const value = constrainCanvas({ zoom: 1, pan: { x: sign * 10000, y: sign * 10000 } }, points, 300, 200);
    expect(value.pan).toEqual({ x: sign * 125, y: sign * 75 });
    expect(150 + (-sign * 125) + value.pan.x).toBe(150);
    expect(100 + (-sign * 75) + value.pan.y).toBe(100);
  }
});

test('zoom używa najbliższych poziomów, granic i zachowuje punkt pod palcami', () => {
  expect(snapZoom(1.7)).toBe(1.5);
  expect(snapZoom(1.9)).toBe(2);
  expect(nextZoom(1, 1)).toBe(1.5);
  expect(nextZoom(1, -1)).toBe(0.75);
  expect(nextZoom(8, 1)).toBe(8);
  expect(nextZoom(0.5, -1)).toBe(0.5);
  expect(scaleCanvas({ zoom: 1, pan: { x: 10, y: 20 } }, 2, { x: 30, y: 40 }))
    .toEqual({ zoom: 2, pan: { x: -10, y: 0 } });
});

test('ukośny odcinek nie znika mimo nakładania się granic rysunku i ekranu', () => {
  const value = constrainCanvas({ zoom: 8, pan: { x: 9999, y: -9999 } }, [{ x: -100, y: -100 }, { x: 100, y: 100 }], 300, 200);
  // This diagonal has equal x/y offsets, so its screen line is y=x+offset.
  const offset = 100 + value.pan.y - 150 - value.pan.x;
  expect(offset).toBeGreaterThanOrEqual(24 - 276);
  expect(offset).toBeLessThanOrEqual(176 - 24);
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
