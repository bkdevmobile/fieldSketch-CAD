import { useTheme } from './ui';
import { t } from '../i18n';
import React from 'react';
import { Text, View } from 'react-native';
import { Check, Compass, MapPin, Ruler } from 'lucide-react-native';
import { BrandMark } from './Brand';
import type { WizardStep } from '../domain/survey';

export function SurveyHeading({ name, subtitle, step, closed, showSteps = true }: { name: string; subtitle: string; step: WizardStep; closed: boolean; showSteps?: boolean }) {
  const { colors, s } = useTheme();
  const current = closed ? 3 : step === 'length' ? 1 : step === 'review' ? 2 : 0;
  return <View style={{ gap: 18 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
        <BrandMark size={29} />
      </View>
      <View style={{ flex: 1, gap: 3 }}><Text style={[s.h2, { fontWeight: '600', letterSpacing: -0.3 }]}>{name}</Text><Text style={s.muted}>{subtitle}</Text></View>
    </View>
    {showSteps && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {([{ label: t("Kierunek"), Icon: Compass }, { label: t("Długość"), Icon: Ruler }, { label: t("Zapis"), Icon: MapPin }]).map(({ label, Icon }, index) => {
        const selected = index === current, complete = index < current, Mark = complete ? Check : Icon;
        return <React.Fragment key={label}>
          {index > 0 && <View style={{ width: 8, height: 1, backgroundColor: colors.line }} />}
          <View accessible accessibilityLabel={`${index + 1}. ${label}${selected ? t(", bieżący etap") : complete ? t(", ukończony") : ''}`}
            style={{ flex: 1, minHeight: 36, paddingHorizontal: 4, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: selected ? colors.mint : 'transparent' }}>
            <Mark size={15} strokeWidth={1.8} color={selected || complete ? colors.green : colors.muted} accessible={false} />
            <Text style={{ fontSize: 11, fontWeight: selected ? '600' : '400', color: selected ? colors.ink : colors.muted, flexShrink: 1 }}>{label}</Text>
          </View>
        </React.Fragment>;
      })}
    </View>}
  </View>;
}
