import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, HardDrive, Settings2 } from 'lucide-react-native';
import { Button, Field, Page, s, colors } from '../components/ui';
import { newProject } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { BrandMark } from '../components/Brand';

export default function NewProject() {
  const store = useStore(); const [name, setName] = useState('');
  const preferred = store.settings.directionMode;
  const effectiveMode = preferred === 'manual' || store.capabilities?.[preferred] ? preferred : 'manual';
  const create = () => store.run(async () => {
    if (!name.trim()) throw new Error('Podaj nazwę szkicu.');
    if (!store.repo) throw new Error('Baza nie jest jeszcze gotowa.');
    const project = newProject(name, effectiveMode);
    await store.repo.save(project, 'create'); await store.refresh();
    router.replace({ pathname: '/project', params: { id: project.id } });
  });
  return <Page title="Nowy szkic" subtitle="Zacznij od nazwy" footer={
    <Button label="Utwórz szkic" iconEnd={ArrowRight} onPress={create} disabled={store.busy || !store.repo || !name.trim()} />}>
    <View style={s.card}><Field label="Nazwa szkicu" value={name} onChangeText={setName} placeholder="np. Ogród za domem" />
      <View style={s.row}><HardDrive size={16} color={colors.muted} accessible={false} /><Text style={s.muted}>Szkic zostanie zapisany na telefonie.</Text></View></View>
    <View style={{ gap: 16, paddingTop: 8 }}><View style={s.row}><BrandMark size={24} /><Text style={s.h2}>Gotowy do pomiaru</Text></View>
      <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>Kierunek</Text><Text style={s.text}>{{ relative: 'Względny', manual: 'Ręczny', magnetic: 'Magnetyczny' }[effectiveMode]}</Text></View>
      <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>Długość kroku</Text><Text style={s.text}>{store.settings.stepLengthCm} cm</Text></View>
      <Button label="Zmień ustawienia" icon={Settings2} quiet align="start" onPress={() => router.push('/settings')} />
    </View>
  </Page>;
}
