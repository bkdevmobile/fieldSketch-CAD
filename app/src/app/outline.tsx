import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { Page, s, fmt } from '../components/ui';
import { useStore } from '../infrastructure/store';
import { metrics } from '../domain/geometry';
export default function Outline() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { projects } = useStore();
  const project = projects.find(p => p.id === id);
  if (!project) return <Page title="Obrys"><Text>Projekt niedostępny.</Text></Page>;
  const m = metrics(project);
  return <Page title="Obrys 2D" subtitle={project.name}>
    <OutlineCanvas project={project} />
    <View style={s.card}><Text style={s.h2}>{project.closed ? 'Obrys zamknięty' : 'Otwarta trasa'}</Text>
      <Text style={s.text}>{project.closed ? 'Obwód' : 'Długość trasy'}: {fmt(m.perimeter * 100)} cm</Text>
      <Text style={s.text}>Pole: {m.area === null ? 'niedostępne' : `${fmt(m.area, 2)} m²`}</Text>
      {m.intersects && <Text style={s.warningText}>Samoprzecięcie obrysu. Pole nie jest prezentowane.</Text>}
      <Text style={s.text}>{m.closure ? `Błąd zamknięcia: ${fmt(m.closure.norm * 100)} cm\nΔX ${fmt(m.closure.dx * 100)} cm · ΔY ${fmt(m.closure.dy * 100)} cm` : 'Brak pomiaru zamknięcia'}</Text>
    </View>
    <View style={s.card}><Text style={s.h2}>Punkty w układzie lokalnym</Text>
      {project.points.map((p, i) => <Text key={p.id} style={s.text}>P{i + 1} · X {fmt(p.x * 100)} cm · Y {fmt(p.y * 100)} cm</Text>)}
    </View><Text style={s.muted}>Długości oszacowano krokami. Wynik wymaga niezależnej kontroli.</Text>
  </Page>;
}
