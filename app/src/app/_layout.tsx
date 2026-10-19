import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '../infrastructure/store';
import { colors } from '../components/ui';
import { DialogProvider } from '../components/overlays';
export default function Layout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><StoreProvider><DialogProvider><StatusBar style="dark" />
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerTitleStyle: { fontSize: 16, fontWeight: '600' }, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'FieldSketch CAD' }} />
      <Stack.Screen name="new-project" options={{ title: 'Nowy projekt' }} />
      <Stack.Screen name="project" options={{ title: 'Pomiar terenowy' }} />
      <Stack.Screen name="outline" options={{ title: 'Obrys 2D' }} />
      <Stack.Screen name="logs" options={{ title: 'Logi pomiarowe' }} />
      <Stack.Screen name="settings" options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="diagnostics" options={{ title: 'Diagnostyka' }} />
      <Stack.Screen name="edit-side" options={{ title: 'Korekta boku' }} />
      <Stack.Screen name="export" options={{ title: 'Eksport PNG' }} />
    </Stack>
  </DialogProvider></StoreProvider></GestureHandlerRootView>;
}
