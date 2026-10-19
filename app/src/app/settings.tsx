import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Page, s } from '../components/ui';
import { parsePositive } from '../domain/geometry';
import { useStore } from '../infrastructure/store';
import type { AngleSnap, SurveyMode } from '../domain/model';

export default function Settings() {
  const store = useStore();
  const [unit, setUnit] = useState(store.settings.unit);
  const [stepLength, setStepLength] = useState(String(store.settings.stepLengthCm).replace('.', ','));
  const [angleSnap, setAngleSnap] = useState<AngleSnap>(store.settings.angleSnap);
  const [directionMode, setDirectionMode] = useState<SurveyMode>(store.settings.directionMode);
  useEffect(() => {
    if (store.repo) { setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm).replace('.', ',')); setAngleSnap(store.settings.angleSnap); setDirectionMode(store.settings.directionMode); }
  }, [store.repo]);
  return <Page title="Ustawienia" subtitle="Domyślne wartości dla nowych pomiarów" footer={
    <Button label="Zapisz ustawienia" disabled={store.busy || !store.repo} onPress={() => store.run(async () => {
      await store.updateSettings({ unit, stepLengthCm: parsePositive(stepLength), angleSnap, directionMode }); router.back();
    })} />}>
    <View style={s.card}><Text style={s.h2}>Długość</Text>
      <View style={s.row}><Button label="Metry" secondary={unit !== 'm'} onPress={() => setUnit('m')} />
        <Button label="Centymetry" secondary={unit !== 'cm'} onPress={() => setUnit('cm')} /></View>
      <Field label="Długość jednego kroku (cm)" numeric value={stepLength} onChangeText={setStepLength} />
      <Text style={s.muted}>Zmiana ustawienia nie przelicza zapisanych boków ani przywróconego pomiaru roboczego.</Text>
    </View>
    <View style={s.card}><Text style={s.h2}>Przyciąganie kąta</Text>
      <View style={s.row}>{([90, 10, 5, 0] as const).map(value => <Button key={value}
        label={value ? `${value}°` : 'Wyłączone'} secondary={angleSnap !== value} onPress={() => setAngleSnap(value)} />)}</View>
      <Text style={s.muted}>{angleSnap ? `Działa przy zatwierdzaniu ręcznej korekty. Przyciąga do najbliższej wielokrotności, gdy różnica wynosi do ${angleSnap === 5 ? '1' : '2'}°.` : 'Przyciąganie wyłączone. Ręczna korekta zachowuje wpisany kąt.'}</Text>
    </View>
    <View style={s.card}><Text style={s.h2}>Tryb kierunku</Text>
      <View style={s.row}>{([['relative', 'Względny'], ['manual', 'Ręczny'], ['magnetic', 'Magnetyczny']] as const).map(([value, label]) =>
        <Button key={value} label={label} secondary={directionMode !== value} onPress={() => setDirectionMode(value)}
          disabled={value !== 'manual' && !store.capabilities?.[value]} />)}</View>
      <Text style={s.muted}>Wspólny dla wszystkich projektów. Zmiana zatrzyma bieżącą sesję i wymaga ponownego przechwycenia kierunku. Zapisane pomiary zachowują swój tryb i wynik. Przy niedostępnym czujniku użyjemy trybu ręcznego.</Text>
    </View>
    <Button label="Diagnostyka" secondary onPress={() => router.push('/diagnostics')} />
  </Page>;
}
