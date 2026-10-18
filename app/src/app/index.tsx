import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Page, Field, s } from '../components/ui';
import { newProject } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { orientation } from '../infrastructure/native';
export default function Projects() {
  const store = useStore(); const [name, setName] = useState('');
  const create = () => store.run(async () => {
    if (!name.trim()) throw new Error('Podaj nazwę projektu.');
    if (!store.repo) throw new Error('Baza nie jest jeszcze gotowa.');
    const project = newProject(name, store.capabilities?.magnetic ? 'magnetic' : 'manual');
    await store.repo.save(project, 'create'); await store.refresh(); setName('');
    router.push({ pathname: '/project', params: { id: project.id } });
  });
  const remove = (id: string) => Alert.alert('Usunąć projekt?', 'Usunięte zostaną pomiary i powiązane logi.', [
    { text: 'Anuluj', style: 'cancel' }, { text: 'Usuń', style: 'destructive', onPress: () => store.run(async () => {
      if (store.sessionProject === id) await store.stop();
      for (const log of await orientation().listLogs()) if (log.projectId === id) await orientation().deleteLog(log.id);
      await store.repo!.remove(id); await store.refresh();
    }) },
  ]);
  return <Page title="Od kroków do obrysu" subtitle="Celuj, przejdź odcinek i zapisz szkic. Wszystko pozostaje na telefonie.">
    <View style={s.card}><Text style={s.h2}>Nowy projekt</Text>
      <Field label="Nazwa projektu" value={name} onChangeText={setName} placeholder="np. Taras przy domu" />
      <Button label="Rozpocznij pomiar" onPress={create} disabled={store.busy || !store.repo} />
      <Text style={s.muted}>1 krok = 75 cm · długości szacunkowe</Text>
    </View>
    <View style={s.row}><Text style={s.h2}>Twoje projekty</Text><Text style={s.muted}>{store.projects.length}</Text></View>
    {!store.projects.length && <Text style={s.muted}>Pierwszy obrys zaczyna się od punktu P1. Utwórz projekt powyżej.</Text>}
    {store.projects.map(p => <View key={p.id} style={s.card}>
      <Text style={s.h2}>{p.name}</Text><Text style={s.muted}>{p.points.length} punktów · {p.closed ? 'zamknięty' : 'otwarty'} · {new Date(p.updatedAt).toLocaleDateString('pl-PL')}</Text>
      <Button label="Otwórz projekt" onPress={() => router.push({ pathname: '/project', params: { id: p.id } })} />
      <Button label="Usuń projekt" secondary danger onPress={() => remove(p.id)} disabled={store.busy} />
    </View>)}
    <Button label="Logi pomiarowe" secondary onPress={() => router.push('/logs')} />
    <Text style={s.muted}>{store.capabilities?.device ?? 'Sprawdzanie urządzenia…'}{store.capabilities && ` · Android ${store.capabilities.android}`}</Text>
    <Text style={s.muted}>Szkic pomocniczy. Dokładność kierunku i kroków wymaga kontroli w terenie.</Text>
  </Page>;
}
