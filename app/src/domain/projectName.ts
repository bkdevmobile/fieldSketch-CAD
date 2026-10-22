import { t } from '../i18n';

export function defaultProjectName(names: readonly string[]): string {
  const used = new Set(names.map(name => name.trim().toLocaleLowerCase()));
  const base = t('Mój pomiar');
  let name = base, suffix = 2;
  while (used.has(name.toLocaleLowerCase())) name = `${base} ${suffix++}`;
  return name;
}
