import { useTheme } from './ui';
import { t } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, Text, TextInput, View } from 'react-native';
import { Footprints, Minus, Play, Plus, Square, type LucideIcon } from 'lucide-react-native';

export function StepControls({ value, onChange, onEndEditing, walking, busy, canStart, onToggle }: {
  value: string; onChange(value: string): void; onEndEditing(): void;
  walking: boolean; busy: boolean; canStart: boolean; onToggle(): void;
}) {
  const { colors, s } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; listener.remove(); };
  }, []);
  useEffect(() => {
    opacity.setValue(1);
    if (!walking || reducedMotion) return;
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.25, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => { pulse.stop(); opacity.setValue(1); };
  }, [walking, reducedMotion, opacity]);
  const count = value.trim() ? Number(value.replace(',', '.')) : 0;
  const valid = Number.isFinite(count) && count >= 0;
  const adjust = (delta: number) => {
    if (!valid) return;
    onChange(String(Math.max(0, count + delta)).replace('.', ',')); onEndEditing();
  };
  const control = (label: string, accessibilityLabel: string, disabled: boolean, onPress: () => void, Icon: LucideIcon, primary = false) =>
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }}
      disabled={disabled} onPress={onPress} style={({ pressed }) => ({
        minHeight: primary ? 44 : 36, minWidth: primary ? undefined : 36, flex: primary ? 1 : undefined, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', gap: 4,
        backgroundColor: primary ? colors.primary : colors.mint, opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      })}>
      <Icon size={primary ? 14 : 20} strokeWidth={1.8} color={primary ? colors.onGreen : colors.green} accessible={false} />
      {primary && <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onGreen }}>{label}</Text>}
    </Pressable>;
  return <View style={{ gap: 7 }}>
    <Text style={s.label}>{t("Liczba kroków")}</Text>
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
      {control('−', t("Odejmij jeden krok"), walking || busy || !valid || count === 0, () => adjust(-1), Minus)}
      <TextInput accessibilityLabel={t("Liczba kroków")} value={value} onChangeText={onChange}
        editable={!walking && !busy} accessibilityState={{ disabled: walking || busy }}
        keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.muted} onEndEditing={onEndEditing}
        style={[s.input, { flex: 1, minWidth: 0, paddingHorizontal: 6, paddingVertical: 8, textAlign: 'center', fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] }]} />
      {control('+', t("Dodaj jeden krok"), walking || busy || !valid, () => adjust(1), Plus)}
    </View>
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
      {control(walking ? t("Stop") : t("Start"), walking ? t("Zatrzymaj krokomierz") : t("Uruchom krokomierz"), busy || (!walking && !canStart), onToggle, walking ? Square : Play, true)}
      <Animated.View accessibilityRole="image" accessibilityLabel={walking ? t('Krokomierz aktywny') : t('Krokomierz zatrzymany')}
        style={{ opacity, width: 30, alignItems: 'center', justifyContent: 'center' }}>
        <Footprints size={24} color={walking ? colors.green : colors.muted} />
      </Animated.View>
    </View>
  </View>;
}
