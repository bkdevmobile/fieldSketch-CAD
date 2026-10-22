import { useTheme } from './ui';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import mark from '../../assets/brand/mark.json';
import { lightColors } from './theme';

// Shared geometry for UI and PNG export, matching the generated launcher assets.
export function BrandGraphic({ color = lightColors.green }: { color?: string }) {
  return <G><Path d={mark.path} fill="none" stroke={color} strokeWidth={mark.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    {mark.rings.map((point, index) => <Circle key={index} cx={point.cx} cy={point.cy} r={mark.ringRadius} fill="none" stroke={color} strokeWidth={mark.ringStrokeWidth} />)}
    <Circle cx={mark.endpoint.cx} cy={mark.endpoint.cy} r={mark.endpoint.r} fill={color} />
  </G>;
}
export function BrandMark({ size = 32, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  return <Svg width={size} height={size} viewBox={mark.viewBox} accessible={false}><BrandGraphic color={color ?? colors.green} /></Svg>;
}
export function BrandLogo({ size = 32, stacked = false }: { size?: number; stacked?: boolean }) {
  const { colors } = useTheme();
  return <View accessible accessibilityLabel="outlineGo" style={{ flexDirection: stacked ? 'column' : 'row', alignItems: 'center', gap: stacked ? 18 : 10, flexShrink: 1 }}>
    <BrandMark size={size} /><Text accessible={false} maxFontSizeMultiplier={1.5} style={{ color: colors.ink, fontSize: stacked ? 34 : 23, fontWeight: '700', letterSpacing: -0.8 }}>outlineGo</Text>
  </View>;
}
