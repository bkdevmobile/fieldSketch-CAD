import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '../infrastructure/store';
import { colors } from '../components/ui';
import { DialogProvider } from '../components/overlays';
import { BrandMark } from '../components/Brand';
import { Startup } from '../components/Startup';
export default function Layout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><StoreProvider><DialogProvider><StatusBar style="dark" />
    <Startup><Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerTitleStyle: { fontSize: 16, fontWeight: '600' }, headerShadowVisible: false,
      headerRight: () => <BrandMark size={25} /> }}>
      <Stack.Screen name="index" options={{ title: 'outlineGo' }} />
      <Stack.Screen name="new-project" options={{ title: 'Nowy szkic' }} />
      <Stack.Screen name="project" options={{ title: 'Pomiar terenowy' }} />
      <Stack.Screen name="outline" options={{ title: 'Obrys 2D' }} />
      <Stack.Screen name="logs" options={{ title: 'Logi pomiarowe' }} />
      <Stack.Screen name="settings" options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="diagnostics" options={{ title: 'Diagnostyka' }} />
      <Stack.Screen name="edit-side" options={{ title: 'Korekta boku' }} />
      <Stack.Screen name="export" options={{ title: 'Eksport PNG' }} />
    </Stack></Startup>
  </DialogProvider></StoreProvider></GestureHandlerRootView>;
}
