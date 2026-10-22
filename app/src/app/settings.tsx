import { useTheme, Button, Field, Page } from '../components/ui';
import { t } from '../i18n';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { roundedInput } from '../domain/precision';
import { parsePositive } from '../domain/geometry';
import { useStore } from '../infrastructure/store';
import type { AngleSnap, SurveyMode, ThemePreference } from '../domain/model';
import { Check, Compass, Magnet, Palette, Ruler } from 'lucide-react-native';
import { LENGTH_UNITS, LengthUnit } from '../domain/units';
import { SectionTitle, Segments } from '../components/presentation';
import { LANGUAGES, LANGUAGE_NAMES, LanguagePreference } from '../i18n';

export default function Settings() {
  const { s } = useTheme();
  const store = useStore();
  const [unit, setUnit] = useState(store.settings.unit);
  const [theme, setTheme] = useState<ThemePreference>(store.settings.theme ?? 'system');
  const [stepLength, setStepLength] = useState(roundedInput(String(store.settings.stepLengthCm), 3));
  const [angleSnap, setAngleSnap] = useState<AngleSnap>(store.settings.angleSnap);
  const [directionMode, setDirectionMode] = useState<SurveyMode>(store.settings.directionMode);
  const [language, setLanguage] = useState<LanguagePreference>(store.settings.language ?? 'system');
  useEffect(() => setLanguage(store.settings.language ?? 'system'), [store.settings.language]);
  useEffect(() => {
    if (store.repo) { setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm).replace('.', ',')); setAngleSnap(store.settings.angleSnap); setDirectionMode(store.settings.directionMode); }
  }, [store.repo]);
  return <Page title={t("Ustawienia")} subtitle={t("Dla wszystkich szkiców")} footer={
    <Button label={t("Zapisz ustawienia")} icon={Check} disabled={store.busy || !store.repo} onPress={() => store.run(async () => {
      await store.updateSettings({ unit, stepLengthCm: parsePositive(stepLength, 3), angleSnap, directionMode, language, theme });
      // Let translated headers update before leaving the settings screen.
      requestAnimationFrame(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      });
    })} />}>
    <View style={s.card}><SectionTitle title={t('Motyw')} icon={Palette} />
      <Segments<ThemePreference> label={t('Motyw')} value={theme} onChange={setTheme}
        options={[{ value: 'dark', label: t('Ciemny') }, { value: 'light', label: t('Jasny') }, { value: 'system', label: t('Wg systemu') }]} />
    </View>
    <View style={s.card}><SectionTitle title={t("Język aplikacji")} icon={Compass} />
      <Segments<LanguagePreference> label={t("Język aplikacji")} value={language} onChange={setLanguage} minOptionWidth={120}
        options={[{ value: 'system', label: t("Systemowy") }, ...LANGUAGES.map(value => ({ value, label: LANGUAGE_NAMES[value] }))]} />
      <Text style={s.muted}>{t("Przy wyborze Systemowy używamy języka telefonu. Jeśli nie jest obsługiwany, używamy angielskiego. Język nie zmienia jednostek pomiaru.")}</Text>
    </View>
    <View style={s.card}><SectionTitle title={t("Długość")} icon={Ruler} />
      <Text style={s.label}>{t("Domyślna jednostka")}</Text><Segments<LengthUnit> label={t("Domyślna jednostka")} value={unit} onChange={setUnit} minOptionWidth={120}
        options={LENGTH_UNITS.map(value => ({ value, label: { m: t('Metry'), cm: t('Centymetry'), ft: t('Stopy'), in: t('Cale') }[value] + ` (${value})` }))} />
      <Field label={t("Długość jednego kroku (cm)")} numeric decimalPlaces={3} value={stepLength} onChangeText={setStepLength} />
      <Text style={s.muted}>{t("Zmiana ustawienia nie przelicza zapisanych boków ani przywróconego pomiaru roboczego.")}</Text>
    </View>
    <View style={s.card}><SectionTitle title={t("Przyciąganie kąta")} icon={Magnet} />
      <Segments<AngleSnap> label={t("Przyciąganie kąta")} value={angleSnap} onChange={setAngleSnap}
        options={([90, 10, 5, 0] as const).map(value => ({ value, label: value ? `${value}°` : t("Wył.") }))} />
      <Text style={s.muted}>{angleSnap ? t("Działa przy zatwierdzaniu ręcznej korekty. Przyciąga do najbliższej wielokrotności, gdy różnica wynosi do {0}°.", [angleSnap === 5 ? '1' : '2']) : t("Przyciąganie wyłączone. Ręczna korekta zachowuje wpisany kąt.")}</Text>
    </View>
    <View style={s.card}><SectionTitle title={t("Tryb kierunku")} icon={Compass} />
      <Segments<SurveyMode> label={t("Tryb kierunku")} value={directionMode} onChange={setDirectionMode}
        options={([['relative', t("Względny")], ['manual', t("Ręczny")], ['magnetic', t("Magnetyczny")]] as const).map(([value, label]) => ({ value, label,
          disabled: value !== 'manual' && !store.capabilities?.[value] }))} />
      <Text style={s.muted}>{t("Wspólny dla wszystkich szkiców. Zmiana zatrzyma bieżącą sesję i wymaga ponownego przechwycenia kierunku. Zapisane pomiary zachowują swój tryb i wynik. Przy niedostępnym czujniku użyjemy trybu ręcznego.")}</Text>
    </View>
  </Page>;
}
