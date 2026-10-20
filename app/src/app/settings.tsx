import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Page, s } from '../components/ui';
import { parsePositive } from '../domain/geometry';
import { useStore } from '../infrastructure/store';
import type { AngleSnap, SurveyMode } from '../domain/model';
import { Activity, Check, Compass, Magnet, Ruler } from 'lucide-react-native';
import { SectionTitle, Segments } from '../components/presentation';

export default function Settings() {
  const store = useStore();
  const [unit, setUnit] = useState(store.settings.unit);
  const [stepLength, setStepLength] = useState(String(store.settings.stepLengthCm).replace('.', ','));
  const [angleSnap, setAngleSnap] = useState<AngleSnap>(store.settings.angleSnap);
  const [directionMode, setDirectionMode] = useState<SurveyMode>(store.settings.directionMode);
  useEffect(() => {
    if (store.repo) { setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm).replace('.', ',')); setAngleSnap(store.settings.angleSnap); setDirectionMode(store.settings.directionMode); }
  }, [store.repo]);
  return <Page title="Ustawienia" subtitle="Dla wszystkich szkiców" footer={
    <Button label="Zapisz ustawienia" icon={Check} disabled={store.busy || !store.repo} onPress={() => store.run(async () => {
      await store.updateSettings({ unit, stepLengthCm: parsePositive(stepLength), angleSnap, directionMode }); router.back();
    })} />}>
    <View style={s.card}><SectionTitle title="Długość" icon={Ruler} />
      <Text style={s.label}>Domyślna jednostka</Text><Segments<'m' | 'cm'> label="Domyślna jednostka" value={unit} onChange={setUnit}
        options={[{ value: 'm', label: 'Metry' }, { value: 'cm', label: 'Centymetry' }]} />
      <Field label="Długość jednego kroku (cm)" numeric value={stepLength} onChangeText={setStepLength} />
      <Text style={s.muted}>Zmiana ustawienia nie przelicza zapisanych boków ani przywróconego pomiaru roboczego.</Text>
    </View>
    <View style={s.card}><SectionTitle title="Przyciąganie kąta" icon={Magnet} />
      <Segments<AngleSnap> label="Przyciąganie kąta" value={angleSnap} onChange={setAngleSnap}
        options={([90, 10, 5, 0] as const).map(value => ({ value, label: value ? `${value}°` : 'Wył.' }))} />
      <Text style={s.muted}>{angleSnap ? `Działa przy zatwierdzaniu ręcznej korekty. Przyciąga do najbliższej wielokrotności, gdy różnica wynosi do ${angleSnap === 5 ? '1' : '2'}°.` : 'Przyciąganie wyłączone. Ręczna korekta zachowuje wpisany kąt.'}</Text>
    </View>
    <View style={s.card}><SectionTitle title="Tryb kierunku" icon={Compass} />
      <Segments<SurveyMode> label="Tryb kierunku" value={directionMode} onChange={setDirectionMode}
        options={([['relative', 'Względny'], ['manual', 'Ręczny'], ['magnetic', 'Magnetyczny']] as const).map(([value, label]) => ({ value, label,
          disabled: value !== 'manual' && !store.capabilities?.[value] }))} />
      <Text style={s.muted}>Wspólny dla wszystkich szkiców. Zmiana zatrzyma bieżącą sesję i wymaga ponownego przechwycenia kierunku. Zapisane pomiary zachowują swój tryb i wynik. Przy niedostępnym czujniku użyjemy trybu ręcznego.</Text>
    </View>
    <Button label="Diagnostyka" icon={Activity} quiet onPress={() => router.push('/diagnostics')} />
  </Page>;
}
