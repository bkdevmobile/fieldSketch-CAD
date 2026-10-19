import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, fmt, Page, s } from '../components/ui';
import { useStore } from '../infrastructure/store';

export default function Diagnostics() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const projectId = id ?? store.sessionProject;
  const project = store.projects.find(p => p.id === projectId);
  const active = !!project && store.sessionProject === project.id && !!store.sessionId;
  const live = active && store.live?.sessionId === store.sessionId ? store.live : null;
  const [notes, setNotes] = useState(''), [reference, setReference] = useState('');
  return <Page title="Diagnostyka" subtitle={project?.name ?? 'Wybierz projekt lub otwórz logi'} compactHeader>
    {project ? <>
      <View style={s.card}><Text style={s.h2}>Sesja i czujniki</Text>
        <Text style={s.text}>{active ? 'Sesja aktywna' : 'Brak aktywnej sesji dla tego projektu'}</Text>
        {live && <Text style={s.muted}>Rozrzut {fmt(live.stdDevDeg)}° · jakość {live.accuracy}/3 · {live.ready ? 'okno gotowe' : 'stabilizowanie…'}</Text>}
        {active && <Button label="Zatrzymaj sesję czujników" secondary disabled={store.busy} onPress={() => store.run(store.stop)} />}
        <Text style={s.muted}>Zatrzymanie sesji wymaga ponownego przechwycenia kierunku i odtworzenia odniesienia przy powrocie do pomiaru.</Text>
      </View>
      <View style={s.card}><Text style={s.h2}>Kontekst próby</Text>
        <Field label="Otoczenie i uwagi testera" value={notes} onChangeText={setNotes} />
        <Field label="Pomiar odniesienia i metoda" value={reference} onChangeText={setReference} />
        <Button label="Dopisz kontekst do loga" disabled={!active || store.busy || (!notes.trim() && !reference.trim())} onPress={() => store.run(async () => {
          await store.log('test_context', { notes, independentReference: reference || null, geometryRevision: project.geometryRevision });
          Alert.alert('Zapisano', 'Kontekst został dodany do loga sesji.');
        })} />
        {!active && <Text style={s.muted}>Aby dopisać kontekst, rozpocznij pomiar w tym projekcie.</Text>}
      </View>
      <Button label="Otwórz logi projektu" secondary onPress={() => router.push({ pathname: '/logs', params: { projectId: project.id } })} />
    </> : store.projects.map(p => <Button key={p.id} label={p.name} secondary onPress={() => router.push({ pathname: '/diagnostics', params: { id: p.id } })} />)}
    <Button label="Wszystkie logi" secondary onPress={() => router.push('/logs')} />
  </Page>;
}
