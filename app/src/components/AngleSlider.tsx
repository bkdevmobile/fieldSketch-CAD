import { t } from '../i18n';
import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';
import { colors, fmt, s } from './ui';

export function AngleSlider({ value, onChange, onComplete, disabled = false }: {
  value: number; onChange(value: number): void; onComplete(): void; disabled?: boolean;
}) {
  const [width, setWidth] = useState(1);
  const current = useRef({ value, width, onChange, onComplete, disabled });
  current.current = { value, width, onChange, onComplete, disabled };
  const startX = useRef(0);
  const responder = useMemo(() => {
    const update = (x: number) => {
      const c = current.current;
      c.onChange(Math.round(Math.max(-15, Math.min(15, ((x - 14) / Math.max(1, c.width - 28)) * 30 - 15)) / 5) * 5);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !current.current.disabled,
      onMoveShouldSetPanResponder: () => !current.current.disabled,
      onPanResponderGrant: event => { startX.current = event.nativeEvent.locationX; update(startX.current); },
      onPanResponderMove: (_, gesture) => update(startX.current + gesture.dx),
      onPanResponderRelease: () => current.current.onComplete(),
      onPanResponderTerminate: () => current.current.onComplete(),
    });
  }, []);
  return <View style={{ gap: 5, opacity: disabled ? 0.45 : 1 }}>
    <Text style={s.label}>{t("Korekta odczytu:")}{' '}{value > 0 ? '+' : ''}{fmt(value)}{t("° · skok 5°")}</Text>
    <View {...responder.panHandlers} onLayout={event => setWidth(event.nativeEvent.layout.width)}
      accessible accessibilityRole="adjustable" accessibilityLabel={t("Korekta kąta od minus 15 do plus 15 stopni, co 5 stopni")}
      accessibilityState={{ disabled }} accessibilityValue={{ min: -15, max: 15, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => {
        if (disabled) return;
        onChange(Math.max(-15, Math.min(15, Math.round(value / 5) * 5 + (event.nativeEvent.actionName === 'increment' ? 5 : -5))));
        onComplete();
      }} style={{ height: 48, justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ marginHorizontal: 14, height: 4, backgroundColor: colors.line, borderRadius: 2 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 14 + (width - 28) * (value + 15) / 30 - 12,
        width: 24, height: 24, borderRadius: 12, backgroundColor: colors.green }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={s.muted}>−15°</Text><Text style={s.muted}>+15°</Text></View>
  </View>;
}
