import { t } from '../i18n';
export function captureErrorText(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  if (/zbyt pionowe|pochylenie telefonu/i.test(detail))
    return t("Nie udało się odczytać kierunku. Skieruj kamerę na kolejny punkt, trzymaj telefon nieruchomo przez około 2 sekundy i spróbuj ponownie.");
  if (/Celuj nieruchomo|Próbki są nieaktualne/i.test(detail))
    return t("Poczekaj na zielony status, trzymając telefon nieruchomo, i ponów odczyt kierunku.");
  if (/Brak aktywnego sensora/i.test(detail))
    return t("Rozpocznij ponownie pomiar i poczekaj na gotowość odczytu kierunku.");
  return t("Nie udało się odczytać kierunku. Spróbuj ponownie; jeśli problem się powtarza, zatrzymaj i rozpocznij pomiar ponownie.");
}
