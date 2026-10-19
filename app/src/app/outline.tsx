import React from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { Button, Page, s, fmt } from '../components/ui';
import { useStore } from '../infrastructure/store';
import { lastSide, metrics } from '../domain/geometry';
export default function Outline() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { projects } = useStore();
  const project = projects.find(p => p.id === id);
  if (!project) return <Page title="Obrys"><Text>Projekt niedostępny.</Text></Page>;
  const m = metrics(project);
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  return <Page title="Podsumowanie szkicu" subtitle={project.name} footer={
    <View style={{ gap: 8 }}><Button label="Eksportuj PNG" disabled={project.points.length < 2}
      onPress={() => router.push({ pathname: '/export', params: { id } })} />
    <Button label={project.closed ? 'Wróć do projektu' : 'Kontynuuj pomiar'} secondary
      onPress={() => router.replace({ pathname: '/project', params: { id } })} /></View>
  }>
    <OutlineCanvas project={project} />
    {!!lastSide(project) && !project.closureObservationId && <Button label="Popraw ostatni bok" secondary
      onPress={() => router.push({ pathname: '/edit-side', params: { id } })} />}
    <View style={s.card}><Text style={s.h2}>{project.closed ? 'Obrys zamknięty' : 'Otwarta trasa'}</Text>
      <Text style={s.text}>{project.closed ? 'Obwód' : 'Długość trasy'}: {fmt(m.perimeter * 100)} cm</Text>
      <Text style={s.text}>Pole: {m.area === null ? 'niedostępne' : `${fmt(m.area, 2)} m²`}</Text>
      {m.intersects && <Text style={s.warningText}>Samoprzecięcie obrysu. Pole nie jest prezentowane.</Text>}
      <Text style={s.text}>{m.closure ? `Błąd zamknięcia: ${fmt(m.closure.norm * 100)} cm\nΔX ${fmt(m.closure.dx * 100)} cm · ΔY ${fmt(m.closure.dy * 100)} cm` : 'Brak pomiaru zamknięcia'}</Text>
      {project.closed && !project.closureObservationId && <Text style={s.muted}>Bok zamykający do P1 jest wyliczony.</Text>}
    </View>
    <View style={s.card}><Text style={s.h2}>Punkty w układzie lokalnym</Text>
      {project.points.map((p, i) => <Text key={p.id} style={s.text}>P{i + 1} · X {fmt(p.x * 100)} cm · Y {fmt(p.y * 100)} cm</Text>)}
    </View><Text style={s.muted}>{estimated ? 'Długości pochodzące z kroków są szacunkowe.' : 'Długości wpisane ręcznie.'}</Text>
  </Page>;
}
