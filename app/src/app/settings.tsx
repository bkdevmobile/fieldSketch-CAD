import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Page, s } from '../components/ui';
import { parsePositive } from '../domain/geometry';
import { useStore } from '../infrastructure/store';

export default function Settings() {
  const store = useStore();
  const [unit, setUnit] = useState(store.settings.unit);
  const [stepLength, setStepLength] = useState(String(store.settings.stepLengthCm).replace('.', ','));
  useEffect(() => {
    if (store.repo) { setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm).replace('.', ',')); }
  }, [store.repo]);
  return <Page title="Ustawienia" subtitle="Domyślne wartości dla nowych pomiarów" footer={
    <Button label="Zapisz ustawienia" disabled={store.busy || !store.repo} onPress={() => store.run(async () => {
      await store.updateSettings({ unit, stepLengthCm: parsePositive(stepLength) }); router.back();
    })} />}>
    <View style={s.card}><Text style={s.h2}>Długość</Text>
      <View style={s.row}><Button label="Metry" secondary={unit !== 'm'} onPress={() => setUnit('m')} />
        <Button label="Centymetry" secondary={unit !== 'cm'} onPress={() => setUnit('cm')} /></View>
      <Field label="Długość jednego kroku (cm)" numeric value={stepLength} onChangeText={setStepLength} />
      <Text style={s.muted}>Zmiana ustawienia nie przelicza zapisanych boków ani przywróconego pomiaru roboczego.</Text>
    </View>
    <Button label="Logi pomiarowe" secondary onPress={() => router.push('/logs')} />
  </Page>;
}
