import { directionReady } from '../src/domain/directionReadiness';

const sample = { sessionId: 'current', ready: true, horizontalProjection: 0.8, accuracy: 3, stdDevDeg: 0.5 };
test('zapis kierunku wymaga gotowego odczytu w bieżącej sesji', () => {
  expect(directionReady(sample, 'current')).toBe(true);
  expect(directionReady(null, 'current')).toBe(false);
  expect(directionReady(sample, null)).toBe(false);
  expect(directionReady(sample, 'previous')).toBe(false);
  expect(directionReady({ ...sample, ready: false }, 'current')).toBe(false);
});
test.each([
  { horizontalProjection: 0.19 }, { horizontalProjection: NaN },
  { accuracy: 1 }, { stdDevDeg: 3.01 }, { stdDevDeg: Infinity }, { stdDevDeg: NaN },
])('ruch, pionowe celowanie i słaba jakość blokują zapis: %p', change => {
  expect(directionReady({ ...sample, ...change }, 'current')).toBe(false);
});
test('wartości graniczne odpowiadają natywnemu oknu przechwycenia', () => {
  expect(directionReady({ ...sample, horizontalProjection: 0.2, accuracy: 2, stdDevDeg: 3 }, 'current')).toBe(true);
});
