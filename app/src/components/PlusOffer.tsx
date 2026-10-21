import { t } from '../i18n';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { Dialog, useDialogs } from './overlays';
import { Button, colors, s } from './ui';
import { PlusReason } from '../domain/access';
import { canPurchase } from '../domain/billing';
import { useStore } from '../infrastructure/store';

export function PlusDetails() {
  const store = useStore();
  const { state, purchase, refresh } = store.billing;
  const messages: Record<string, string> = {
    loading: t('Ładowanie oferty…'), syncing: t('Sprawdzanie zakupów…'),
    purchasing: t('Dokończ zakup w Google Play.'), pending: t('Płatność oczekuje na zakończenie. Plus odblokuje się po jej potwierdzeniu.'),
    cancelled: t('Zakup anulowany. Twoje szkice pozostały bez zmian.'),
    error: t('Zakup nie powiódł się. Spróbuj ponownie.'),
    unavailable: t('Oferta jest chwilowo niedostępna. Sprawdź połączenie z Google Play i spróbuj ponownie.'),
    unconfigured: t('Zakup Plus nie jest jeszcze dostępny w tej wersji aplikacji.'),
    noPurchases: t('Nie znaleziono zakupu Plus na tym koncie Google Play.'),
    restored: t('Przywrócono zakup Plus.'),
    verificationFailed: t('Nie udało się potwierdzić autentyczności zakupu. Spróbuj przywrócić zakup.'),
    acknowledgementPending: t('Plus jest aktywny. Potwierdzenie zakupu zostanie ponowione po połączeniu z Google Play.'),
  };
  const buy = () => store.run(async () => {
    if (store.sessionId) await store.stop();
    await purchase();
  });
  return <View style={{ gap: 16 }}>
    <Crown size={32} color={colors.green} accessible={false} />
    <Text style={s.h2}>{t("Więcej miejsca na Twoje szkice")}</Text>
    <Text style={s.text}>{t("Dowolna liczba szkiców i punktów, PNG bez znaku wodnego oraz eksport DXF do programów CAD.")}</Text>
    <Text style={s.measureValue}>{state.plan === 'plus' ? t('Plus jest aktywny') : state.price ?? t('Cena niedostępna')}</Text>
    <Text style={s.muted}>{t("Jednorazowo · bez abonamentu")}</Text>
    {!!messages[state.status] && <Text accessibilityRole="alert" style={s.muted}>{messages[state.status]}</Text>}
    {state.plan !== 'plus' && <Button label={state.price ? t('Kup Plus · {0}', [state.price]) : t('Kup Plus')} onPress={buy} disabled={store.busy || !canPurchase(state)} />}
    <Button label={t('Przywróć zakup')} secondary onPress={() => { void refresh(true); }} disabled={!state.ready || state.processing || !state.configured} />
    {!state.price && state.plan !== 'plus' && <Button label={t('Spróbuj ponownie')} secondary onPress={() => { void refresh(); }} disabled={!state.ready || state.processing} />}
    <Text style={s.muted}>{t('Przywracanie wymaga tego samego konta Google Play i nie przenosi szkiców między telefonami.')}</Text>
    <Text style={s.muted}>{t("Twoje zapisane szkice pozostają dostępne. Zakup Plus pozwoli kontynuować rozpoczęty szkic.")}</Text>
  </View>;
}

export function usePlusOffer() {
  const [reason, setReason] = useState<PlusReason | null>(null);
  const dialogs = useDialogs();
  const show = (value: PlusReason = 'general') => setReason(value);
  const projectLimit = (onProjects: () => void) => dialogs.alert(t("Masz już 3 szkice"), t("Free pozwala przechowywać do 3 szkiców. Usunięcie jednego zwalnia miejsce."), [
    { text: t("Odblokuj Plus"), onPress: () => show('projects') },
    { text: t("Przejdź do szkiców"), onPress: onProjects },
    { text: t("Anuluj"), style: 'cancel' },
  ]);
  const explanation = reason === 'points' ? t("Osiągnięto limit 8 punktów. Możesz zamknąć obrys, zostawić go otwartym lub poprawić pomiary.")
    : reason === 'dxf' ? t("Eksport DXF jest dostępny w Plus. W Free możesz udostępnić PNG ze znakiem wodnym.")
    : reason === 'watermark' ? t("Plus pozwala eksportować PNG bez znaku wodnego.") : '';
  const offer = <Dialog visible={reason !== null} title="outlineGo Plus" onClose={() => setReason(null)}
    footer={<Button label={t("Wróć do szkicu")} secondary onPress={() => setReason(null)} />}>
    {!!explanation && <Text style={s.text}>{explanation}</Text>}<PlusDetails />
  </Dialog>;
  return { show, projectLimit, offer };
}
