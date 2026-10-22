import { useTheme } from '../components/ui';
import { getLanguage, t } from '../i18n';
import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider, useStore } from '../infrastructure/store';
import { DialogProvider } from '../components/overlays';
import { BrandMark } from '../components/Brand';
import { Startup } from '../components/Startup';
import { ThemeProvider } from '../components/theme';
import { ErrorReportingConsentPrompt } from '../components/ErrorReportingPrompt';
import { LegalNoticeGate } from '../components/LegalNotice';
export default function Layout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><StoreProvider><ThemedApplication /></StoreProvider></GestureHandlerRootView>;
}
function ThemedApplication() {
  const { settings } = useStore();
  return <ThemeProvider preference={settings.theme ?? 'system'}><DialogProvider><Application /></DialogProvider></ThemeProvider>;
}
function Application() {
  const { dark } = useTheme();
  return <><StatusBar style={dark ? 'light' : 'dark'} /><Startup><LegalNoticeGate><Navigation /><ErrorReportingConsentPrompt /></LegalNoticeGate></Startup></>;
}
function Navigation() {
  const { colors } = useTheme();
  useStore(); // Refresh translated navigation titles after a language change.
  const language = getLanguage();
  // Keep native header options stable while busy state and sensor samples update.
  return useMemo(() => <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerTitleStyle: { fontSize: 16, fontWeight: '600' }, headerShadowVisible: false,
      headerRight: () => <BrandMark size={25} /> }}>
      <Stack.Screen name="index" options={{ title: 'outlineGo' }} />
      <Stack.Screen name="new-project" options={{ title: t("Nowy szkic") }} />
      <Stack.Screen name="project" options={{ title: t("Pomiar terenowy") }} />
      <Stack.Screen name="outline" options={{ title: t("Obrys 2D") }} />
      <Stack.Screen name="settings" options={{ title: t('Ustawienia') }} />
      <Stack.Screen name="edit-side" options={{ title: t("Korekta boku") }} />
      <Stack.Screen name="dimensions" options={{ title: t("Wymiary i punkty") }} />
      <Stack.Screen name="export" options={{ title: t("Eksport PNG") }} />
      <Stack.Screen name="plus" options={{ title: 'outlineGo Plus' }} />
    </Stack>, [language, colors]);
}
