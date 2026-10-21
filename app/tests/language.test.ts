jest.mock('../src/infrastructure/native', () => ({ orientation: jest.fn() }));
import { orientation } from '../src/infrastructure/native';
import { applyLanguagePreference, preferenceFromState, readLanguageState } from '../src/infrastructure/language';
import { getLanguage } from '../src/i18n';

const state = { systemLocales: ['es-MX'], appLanguage: '', supportsAppLanguage: true };
const getLanguageState = jest.fn(), setApplicationLanguage = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  getLanguageState.mockResolvedValue(state);
  setApplicationLanguage.mockResolvedValue(undefined);
  jest.mocked(orientation).mockReturnValue({ getLanguageState, setApplicationLanguage } as any);
});
test('Android app language overrides the saved preference, including a reset to system', () => {
  expect(preferenceFromState('de', state)).toBe('system');
  expect(preferenceFromState('pl', { ...state, appLanguage: 'fr-CA' })).toBe('fr');
  expect(preferenceFromState('fr', { ...state, supportsAppLanguage: false })).toBe('fr');
});
test('saving explicit and system choices synchronizes Android and the JS dictionary', async () => {
  await applyLanguagePreference('de');
  expect(getLanguage()).toBe('de'); expect(setApplicationLanguage).toHaveBeenLastCalledWith('de');
  await applyLanguagePreference('system');
  expect(getLanguage()).toBe('es'); expect(setApplicationLanguage).toHaveBeenLastCalledWith('');
});
test('older Android uses saved choice without invoking the Android 13 API', async () => {
  getLanguageState.mockResolvedValue({ ...state, supportsAppLanguage: false });
  await applyLanguagePreference('fr');
  expect(getLanguage()).toBe('fr'); expect(setApplicationLanguage).not.toHaveBeenCalled();
});
test('a missing native method has a locale fallback for development builds', async () => {
  getLanguageState.mockRejectedValue(new Error('missing native module'));
  const result = await readLanguageState();
  expect(result.supportsAppLanguage).toBe(false); expect(result.systemLocales).toHaveLength(1);
});
