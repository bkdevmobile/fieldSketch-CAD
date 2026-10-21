import { messages } from './messages';
export const LANGUAGES = ['pl', 'en', 'de', 'es', 'fr'] as const;
export type Language = typeof LANGUAGES[number];
export type LanguagePreference = Language | 'system';
export const LANGUAGE_NAMES: Record<Language, string> = { pl: 'Polski', en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français' };
const dictionary = new Map<string, readonly string[]>(messages.map(row => [row[0], row]));
let language: Language = 'en';
export const getLanguage = () => language;
export const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language);
export const isLanguagePreference = (value: unknown): value is LanguagePreference => value === 'system' || isLanguage(value);
export function resolveLanguage(preference: LanguagePreference, locales: readonly string[]): Language {
  if (preference !== 'system') return preference;
  for (const locale of locales) {
    const base = locale.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(base)) return base;
  }
  return 'en';
}
export function setLanguage(preference: LanguagePreference, locales: readonly string[] = []) {
  language = resolveLanguage(preference, locales); return language;
}
export function t(key: string, values: readonly unknown[] = []): string {
  const row = dictionary.get(key);
  const translated = language === 'pl' ? key : row?.[LANGUAGES.indexOf(language)] || row?.[1] || key;
  return translated.replace(/\{(\d+)\}/g, (placeholder, index) => {
    if (Number(index) >= values.length) return placeholder;
    return String(values[Number(index)] ?? '');
  });
}
export function translateError(detail: string): string {
  if (dictionary.has(detail)) return t(detail);
  const key = [...dictionary.keys()].filter(key => key.length > 20 && !/\{\d+\}/.test(key))
    .sort((a, b) => b.length - a.length).find(key => detail.includes(key));
  return key ? t(key) : detail;
}
export const formatNumber = (value: number, digits = 1) => value.toLocaleString(language, { maximumFractionDigits: digits });
export const formatDate = (value: string, time = false) => time ? new Date(value).toLocaleString(language) : new Date(value).toLocaleDateString(language);
