import { useTheme } from './ui';
import { t } from '../i18n';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ANGLE_DECIMALS, decimalInput } from '../domain/precision';

export function AngleControls({ value, side, onChange, onSideChange, onEndEditing, disabled = false, compact = false,
  label = t("Kąt skrętu od poprzedniego boku (°)") }: {
  value: string; side: 'left' | 'right'; onChange(value: string): void; compact?: boolean;
  onSideChange(side: 'left' | 'right'): void; onEndEditing(): void; disabled?: boolean; label?: string;
}) {
  const { colors, s } = useTheme();
  const direction = (target: 'left' | 'right', text: string) => <Pressable accessibilityRole="button"
    accessibilityLabel={target === 'left' ? t("W lewo") : t("W prawo")} accessibilityState={{ selected: side === target, disabled }}
    disabled={disabled} onPress={() => onSideChange(target)} style={({ pressed }) => ({
      width: compact ? 36 : 52, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: side === target ? colors.primary : colors.mint, opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
    })}><Text style={[s.buttonText, { color: side === target ? colors.white : colors.green }]}>{text}</Text></Pressable>;
  return <View style={{ gap: 7 }}>
    <Text style={s.label}>{label}</Text>
    <View style={{ flexDirection: 'row', gap: compact ? 4 : 8, alignItems: 'stretch' }}>
      {direction('left', t('L'))}
      <TextInput accessibilityLabel={label} value={value} onChangeText={text => {
        const next = decimalInput(text, ANGLE_DECIMALS); if (next !== null) onChange(next);
      }} onEndEditing={onEndEditing}
        editable={!disabled} accessibilityState={{ disabled }} keyboardType="decimal-pad"
        style={[s.input, { flex: 1, minWidth: 0, paddingHorizontal: compact ? 2 : 14, paddingVertical: 8, textAlign: 'center', fontSize: compact ? 20 : 24, fontWeight: '600', fontVariant: ['tabular-nums'] }]} />
      {direction('right', t('P'))}
    </View>
  </View>;
}
