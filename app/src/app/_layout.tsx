import { getLanguage, t } from '../i18n';
import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider, useStore } from '../infrastructure/store';
import { colors } from '../components/ui';
import { DialogProvider } from '../components/overlays';
import { BrandMark } from '../components/Brand';
import { Startup } from '../components/Startup';
export default function Layout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><StoreProvider><DialogProvider><StatusBar style="dark" />
    <Startup><Navigation /></Startup>
  </DialogProvider></StoreProvider></GestureHandlerRootView>;
}
function Navigation() {
  useStore(); // Refresh translated navigation titles after a language change.
  const language = getLanguage();
  // Keep native header options stable while busy state and sensor samples update.
  return useMemo(() => <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerTitleStyle: { fontSize: 16, fontWeight: '600' }, headerShadowVisible: false,
      headerRight: () => <BrandMark size={25} /> }}>
      <Stack.Screen name="index" options={{ title: 'outlineGo' }} />
      <Stack.Screen name="new-project" options={{ title: t("Nowy szkic") }} />
      <Stack.Screen name="project" options={{ title: t("Pomiar terenowy") }} />
      <Stack.Screen name="outline" options={{ title: t("Obrys 2D") }} />
      <Stack.Screen name="logs" options={{ title: t("Logi pomiarowe") }} />
      <Stack.Screen name="settings" options={{ title: t('Ustawienia') }} />
      <Stack.Screen name="diagnostics" options={{ title: t("Diagnostyka") }} />
      <Stack.Screen name="edit-side" options={{ title: t("Korekta boku") }} />
      <Stack.Screen name="export" options={{ title: t("Eksport PNG") }} />
      <Stack.Screen name="plus" options={{ title: 'outlineGo Plus' }} />
    </Stack>, [language]);
}
