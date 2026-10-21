import { LanguageState, orientation } from './native';
import { isLanguage, LanguagePreference, setLanguage } from '../i18n';

export async function readLanguageState(): Promise<LanguageState> {
  try { return await orientation().getLanguageState(); }
  catch { return { systemLocales: [Intl.DateTimeFormat().resolvedOptions().locale], appLanguage: '', supportsAppLanguage: false }; }
}
export function preferenceFromState(saved: LanguagePreference, state: LanguageState): LanguagePreference {
  if (!state.supportsAppLanguage) return saved;
  const base = state.appLanguage.toLowerCase().split(/[-_,]/)[0];
  return isLanguage(base) ? base : 'system';
}
export async function applyLanguagePreference(preference: LanguagePreference) {
  const state = await readLanguageState();
  setLanguage(preference, state.systemLocales);
  if (state.supportsAppLanguage) await orientation().setApplicationLanguage(preference === 'system' ? '' : preference);
}
