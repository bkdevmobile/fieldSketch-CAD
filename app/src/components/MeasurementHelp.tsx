import { t } from '../i18n';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors, s } from './ui';

export function MeasurementHelp({ manual = false }: { manual?: boolean }) {
  return <View style={{ gap: 14 }}>
    {!manual && <Svg width="100%" height={145} viewBox="0 0 300 145" accessible accessibilityLabel={t("Obróć telefon, aby skierować tylną kamerę na następny narożnik. Celownik pozostaje pośrodku ekranu.")}>
      <Path d="M45 40L244 15L244 124Z" fill={colors.mint} />
      <Line x1={85} y1={75} x2={245} y2={75} stroke={colors.green} strokeWidth={2} strokeDasharray="5 5" />
      <Rect x={44} y={23} width={70} height={108} rx={13} fill={colors.white} stroke={colors.ink} strokeWidth={3} />
      <Circle cx={79} cy={36} r={3} fill={colors.ink} />
      <Line x1={64} y1={76} x2={94} y2={76} stroke={colors.green} strokeWidth={2} />
      <Line x1={79} y1={61} x2={79} y2={91} stroke={colors.green} strokeWidth={2} />
      <Path d="M126 41Q159 76 126 110M124 96L126 110L140 108" fill="none" stroke={colors.green} strokeWidth={3} strokeLinecap="round" />
      <Path d="M223 109V47L245 30L267 47V109" fill={colors.white} stroke={colors.green} strokeWidth={2} />
      <Circle cx={245} cy={75} r={6} fill={colors.green} />
    </Svg>}
    <Text style={s.text}>{t("1. Stań w pierwszym narożniku i zapisz punkt P1.")}</Text>
    <Text style={s.text}>{manual ? t("2. Ustaw kierunek boku. Pierwszy bok wyznacza 0°; dla kolejnych wpisz kąt skrętu.") : t("2. Skieruj tylną kamerę na następny narożnik, obracając telefon. Celownik pozostaje na środku ekranu — nie przesuwasz go palcem.")}</Text>
    {!manual && <Text style={s.text}>{t("Przytrzymaj telefon nieruchomo przez około 2 sekundy. Gdy status będzie zielony i narożnik znajdzie się w celowniku, zapisz kierunek.")}</Text>}
    <Text style={s.text}>{t("3. Dopiero po zapisaniu kierunku wpisz długość boku albo zmierz ją krokami: Start → przejdź do narożnika → zatrzymaj się → Stop.")}</Text>
    <Text style={s.text}>{t("4. Sprawdź bok i zapisz kolejny punkt. Powtórz dla następnego narożnika.")}</Text>
  </View>;
}
