import { useTheme } from './ui';
import { t } from '../i18n';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useStore } from '../infrastructure/store';
import { BrandLogo } from './Brand';

// Keep the native branded launch screen until React has laid out its first frame.
void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 180, fade: true });

export function Startup({ children }: { children: React.ReactNode }) {
  const { colors, s } = useTheme();
  const { ready } = useStore();
  return <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={() => { void SplashScreen.hideAsync().catch(() => {}); }}>
    {ready ? children : <View accessibilityLabel={t("Uruchamianie outlineGo")} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 }}>
      <BrandLogo size={104} stacked /><Text style={s.muted}>{t("Pomiary w terenie")}</Text><ActivityIndicator color={colors.green} />
    </View>}
  </View>;
}
