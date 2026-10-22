import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useStore } from '../infrastructure/store';
import { useDialogs } from './overlays';
import { t } from '../i18n';

export function ErrorReportingConsentPrompt() {
  const { errorReportRequest, answerErrorReportRequest } = useStore();
  const dialogs = useDialogs();
  const shown = useRef<number | null>(null);
  useEffect(() => {
    if (!errorReportRequest || shown.current === errorReportRequest.id) return;
    const id = errorReportRequest.id;
    shown.current = id;
    const ask = () => dialogs.alert(t('Pomóc naprawić błąd?'),
      t('Czy włączyć wysyłanie tego i przyszłych raportów błędów do Sentry? Raport zawiera typ błędu, pozycję w kodzie oraz wersję aplikacji i Androida. Bez treści szkiców, zdjęć i nagrań sesji. Zgodę możesz wycofać w ustawieniach. Odmowa nie ogranicza funkcji aplikacji.'), [
        { text: t('Włącz i wyślij'), onPress: () => { void answerErrorReportRequest(id, true); } },
        { text: t('Polityka prywatności'), onPress: () => {
          void Linking.openURL('https://outlinego-27ab5.web.app/privacy.html').catch(() => {}).finally(ask);
        } },
        { text: t('Nie wysyłaj'), style: 'cancel', onPress: () => { void answerErrorReportRequest(id, false); } },
      ]);
    ask();
  }, [errorReportRequest, dialogs, answerErrorReportRequest]);
  return null;
}
