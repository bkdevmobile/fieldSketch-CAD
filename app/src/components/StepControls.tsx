import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, s } from './ui';
import { Minus, Play, Plus, Square, type LucideIcon } from 'lucide-react-native';

export function StepControls({ value, onChange, onEndEditing, walking, busy, canStart, onToggle }: {
  value: string; onChange(value: string): void; onEndEditing(): void;
  walking: boolean; busy: boolean; canStart: boolean; onToggle(): void;
}) {
  const count = value.trim() ? Number(value.replace(',', '.')) : 0;
  const valid = Number.isFinite(count) && count >= 0;
  const adjust = (delta: number) => {
    if (!valid) return;
    onChange(String(Math.max(0, count + delta)).replace('.', ',')); onEndEditing();
  };
  const control = (label: string, accessibilityLabel: string, disabled: boolean, onPress: () => void, Icon: LucideIcon, primary = false) =>
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }}
      disabled={disabled} onPress={onPress} style={({ pressed }) => ({
        minHeight: 52, width: primary ? 76 : 44, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', gap: 4,
        backgroundColor: primary ? colors.green : colors.mint, opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      })}>
      <Icon size={primary ? 14 : 20} strokeWidth={1.8} color={primary ? colors.onGreen : colors.green} accessible={false} />
      {primary && <Text style={{ fontSize: 14, fontWeight: '600', color: colors.onGreen }}>{label}</Text>}
    </Pressable>;
  return <View style={{ gap: 7 }}>
    <Text style={s.label}>Liczba kroków</Text>
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'stretch' }}>
      {control('−', 'Odejmij jeden krok', walking || busy || !valid || count === 0, () => adjust(-1), Minus)}
      <TextInput accessibilityLabel="Liczba kroków" value={value} onChangeText={onChange}
        editable={!walking && !busy} accessibilityState={{ disabled: walking || busy }}
        keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.muted} onEndEditing={onEndEditing}
        style={[s.input, { flex: 1, minWidth: 0, paddingHorizontal: 6, paddingVertical: 8, textAlign: 'center', fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] }]} />
      {control('+', 'Dodaj jeden krok', walking || busy || !valid, () => adjust(1), Plus)}
      {control(walking ? 'Stop' : 'Start', walking ? 'Zatrzymaj krokomierz' : 'Uruchom krokomierz', busy || (!walking && !canStart), onToggle, walking ? Square : Play, true)}
    </View>
  </View>;
}
