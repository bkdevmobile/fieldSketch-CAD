import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Check, ShieldCheck } from 'lucide-react-native';
import { Button, Page, useTheme } from './ui';
import { BrandMark } from './Brand';
import { SectionTitle } from './presentation';
import { useStore } from '../infrastructure/store';
import { hasCurrentLegalAcceptance, LEGAL_URLS } from '../domain/legal';
import { t } from '../i18n';

export function LegalNoticeGate({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  return hasCurrentLegalAcceptance(settings.legalAcceptance) ? <>{children}</> : <LegalNotice />;
}

function LegalNotice() {
  const store = useStore();
  const { colors, s } = useTheme();
  const [confirmed, setConfirmed] = useState(false);
  const open = (url: string) => { void store.run(async () => { await Linking.openURL(url); }); };
  return <Page title={t('Zanim zaczniesz')} subtitle={t('Informacje o pomiarach i warunki korzystania')} footer={
    <Button label={t('Kontynuuj')} disabled={!confirmed || store.busy || !store.repo}
      onPress={() => { void store.run(() => store.acceptLegalNotice(confirmed)); }} />
  }>
    <BrandMark size={48} />
    <View style={s.card}>
      <SectionTitle title={t('Pomiary orientacyjne')} icon={ShieldCheck} />
      <Text style={s.text}>{t('outlineGo służy do orientacyjnych, nieprofesjonalnych pomiarów. Czujniki telefonu, pomiar krokami i ręcznie wpisane dane mogą powodować błędy.')}</Text>
      <Text style={s.text}>{t('Ważne wymiary zweryfikuj odpowiednim sprzętem. Aplikacja nie zastępuje pomiarów geodezyjnych ani profesjonalnych pomiarów budowlanych. Nie opieraj na niej decyzji dotyczących bezpieczeństwa lub granic nieruchomości.')}</Text>
      <Text style={s.muted}>{t('Szkice są zapisane na telefonie. Usunięcie aplikacji lub jej danych może spowodować ich utratę. Eksport PNG i DXF nie umożliwia odtworzenia edytowalnych szkiców.')}</Text>
    </View>
    <View style={s.card}>
      <Button secondary label={t('Regulamin')} onPress={() => open(LEGAL_URLS.terms)} />
      <Button secondary label={t('Polityka prywatności')} onPress={() => open(LEGAL_URLS.privacy)} />
      <Button quiet label={t('Ograniczenia pomiarów')} onPress={() => open(LEGAL_URLS.measurement)} />
    </View>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={t('Akceptuję regulamin i rozumiem ograniczenia pomiarów.')}
      accessibilityState={{ checked: confirmed, disabled: store.busy }} disabled={store.busy}
      onPress={() => setConfirmed(value => !value)}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, minHeight: 52, paddingVertical: 12 }}>
      <View style={{ width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: colors.green,
        backgroundColor: confirmed ? colors.primary : colors.white, alignItems: 'center', justifyContent: 'center' }}>
        {confirmed && <Check size={20} color={colors.onGreen} accessible={false} />}
      </View>
      <Text style={[s.text, { flex: 1 }]}>{t('Akceptuję regulamin i rozumiem ograniczenia pomiarów.')}</Text>
    </Pressable>
    <Text style={s.muted}>{t('To potwierdzenie nie jest zgodą na diagnostykę i nie ogranicza Twoich ustawowych praw konsumenta.')}</Text>
  </Page>;
}
