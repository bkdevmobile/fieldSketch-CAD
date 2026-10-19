import React, { useState } from 'react';
import { Alert, Keyboard, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Button, colors, Page, Field, s } from '../components/ui';
import { newProject } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { orientation } from '../infrastructure/native';
export default function Projects() {
  const store = useStore(); const [name, setName] = useState('');
  const [menu, setMenu] = useState(false);
  const [projectMenu, setProjectMenu] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleProjects = store.projects.slice(0, visibleCount);
  const selectedProject = store.projects.find(p => p.id === projectMenu);
  const openProject = (id: string) => router.push({ pathname: '/project', params: { id } });
  const create = () => store.run(async () => {
    if (!name.trim()) throw new Error('Podaj nazwę projektu.');
    if (!store.repo) throw new Error('Baza nie jest jeszcze gotowa.');
    const preferred = store.settings.directionMode;
    const project = newProject(name, preferred === 'manual' || store.capabilities?.[preferred] ? preferred : 'manual');
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
    <Stack.Screen options={{ headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Menu główne"
      onPress={() => { Keyboard.dismiss(); setMenu(true); }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[s.h2, { fontSize: 28 }]}>⋮</Text></Pressable> }} />
    <Modal visible={menu} animationType="slide" onRequestClose={() => setMenu(false)}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}><Page title="Menu" compactHeader
        footer={<Button label="Wróć" onPress={() => setMenu(false)} />}>
        <Button label="Ustawienia" secondary onPress={() => { setMenu(false); router.push('/settings'); }} />
        <Button label="Logi pomiarowe" secondary onPress={() => { setMenu(false); router.push('/logs'); }} />
      </Page></SafeAreaView>
    </Modal>
    <Modal visible={!!selectedProject} animationType="slide" onRequestClose={() => setProjectMenu(null)}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}><Page title={selectedProject?.name ?? 'Projekt'} compactHeader
        footer={<Button label="Wróć" onPress={() => setProjectMenu(null)} />}>
        <Button label="Otwórz" disabled={store.busy} onPress={() => { if (selectedProject) { setProjectMenu(null); openProject(selectedProject.id); } }} />
        <Button label="Usuń" secondary danger disabled={store.busy} onPress={() => { if (selectedProject) { setProjectMenu(null); remove(selectedProject.id); } }} />
      </Page></SafeAreaView>
    </Modal>
    <View style={s.card}><Text style={s.h2}>Nowy projekt</Text>
      <Field label="Nazwa projektu" value={name} onChangeText={setName} placeholder="np. Taras przy domu" />
      <Button label="Rozpocznij pomiar" onPress={create} disabled={store.busy || !store.repo} />
      <Text style={s.muted}>Długość w m/cm lub kroki · 1 krok = {store.settings.stepLengthCm} cm</Text>
    </View>
    <View style={s.row}><Text style={s.h2}>Twoje projekty</Text><Text style={s.muted}>{store.projects.length}</Text></View>
    {!store.projects.length && <Text style={s.muted}>Pierwszy obrys zaczyna się od punktu P1. Utwórz projekt powyżej.</Text>}
    {!!visibleProjects.length && <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.white }}>
      {visibleProjects.map((p, index) => <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 4,
        borderBottomWidth: index < visibleProjects.length - 1 ? 1 : 0, borderColor: colors.line }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Otwórz projekt ${p.name}`} disabled={store.busy}
          onPress={() => openProject(p.id)} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 56, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.65 : 1 })}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[s.text, { flex: 1, fontWeight: '600' }]}>{p.name}</Text>
          <Text numberOfLines={1} style={[s.muted, { flexShrink: 0 }]}>{new Date(p.updatedAt).toLocaleDateString('pl-PL')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Menu projektu ${p.name}`} disabled={store.busy}
          onPress={() => { Keyboard.dismiss(); setProjectMenu(p.id); }} style={({ pressed }) => ({ minWidth: 44, minHeight: 56,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}>
          <Text style={[s.h2, { fontSize: 28 }]}>⋮</Text>
        </Pressable>
      </View>)}
    </View>}
    {visibleCount < store.projects.length && <Button label="Więcej" secondary onPress={() => setVisibleCount(count => count + 10)} />}
    <Text style={s.muted}>{store.capabilities?.device ?? 'Sprawdzanie urządzenia…'}{store.capabilities && ` · Android ${store.capabilities.android}`}</Text>
    <Text style={s.muted}>Szkic pomocniczy. Dokładność kierunku i kroków wymaga kontroli w terenie.</Text>
  </Page>;
}
