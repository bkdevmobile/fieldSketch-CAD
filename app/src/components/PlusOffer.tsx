import { t } from '../i18n';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { Dialog, useDialogs } from './overlays';
import { Button, colors, s } from './ui';
import { PLUS_PRICE_PLN, PlusReason } from '../domain/access';

export function PlusDetails() {
  return <View style={{ gap: 16 }}>
    <Crown size={32} color={colors.green} accessible={false} />
    <Text style={s.h2}>{t("Więcej miejsca na Twoje szkice")}</Text>
    <Text style={s.text}>{t("Dowolna liczba szkiców i punktów, PNG bez znaku wodnego oraz eksport DXF do programów CAD.")}</Text>
    <Text style={s.measureValue}>{t(PLUS_PRICE_PLN)}</Text>
    <Text style={s.muted}>{t("Jednorazowo · bez abonamentu")}</Text>
    <View style={s.warning}><Text accessibilityRole="alert" style={s.warningText}>{t("Zakup Plus nie jest jeszcze dostępny w tej wersji aplikacji.")}</Text></View>
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
