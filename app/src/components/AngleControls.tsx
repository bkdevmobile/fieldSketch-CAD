import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, s } from './ui';

export function AngleControls({ value, side, onChange, onSideChange, onEndEditing, disabled = false,
  label = 'Kąt skrętu od poprzedniego boku (°)' }: {
  value: string; side: 'left' | 'right'; onChange(value: string): void;
  onSideChange(side: 'left' | 'right'): void; onEndEditing(): void; disabled?: boolean; label?: string;
}) {
  const direction = (target: 'left' | 'right', text: string) => <Pressable accessibilityRole="button"
    accessibilityLabel={target === 'left' ? 'W lewo' : 'W prawo'} accessibilityState={{ selected: side === target, disabled }}
    disabled={disabled} onPress={() => onSideChange(target)} style={({ pressed }) => ({
      width: 52, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: side === target ? colors.green : colors.mint, opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
    })}><Text style={[s.buttonText, { color: side === target ? colors.white : colors.green }]}>{text}</Text></Pressable>;
  return <View style={{ gap: 7 }}>
    <Text style={s.label}>{label}</Text>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'stretch' }}>
      {direction('left', 'L')}
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} onEndEditing={onEndEditing}
        editable={!disabled} accessibilityState={{ disabled }} keyboardType="decimal-pad"
        style={[s.input, { flex: 1, minWidth: 0, paddingVertical: 8, textAlign: 'center', fontSize: 24, fontWeight: '600', fontVariant: ['tabular-nums'] }]} />
      {direction('right', 'P')}
    </View>
  </View>;
}
