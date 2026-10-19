import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Image, Maximize2, Pencil, Route } from 'lucide-react-native';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { Button, Page, s, fmt, colors } from '../components/ui';
import { Badge, Disclosure } from '../components/presentation';
import { Dialog } from '../components/overlays';
import { useStore } from '../infrastructure/store';
import { lastSide, metrics } from '../domain/geometry';
export default function Outline() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { projects, settings } = useStore();
  const [expanded, setExpanded] = useState(false);
  const project = projects.find(p => p.id === id);
  if (!project) return <Page title="Obrys"><Text>Projekt niedostępny.</Text></Page>;
  const m = metrics(project), unit = settings.unit, factor = unit === 'cm' ? 100 : 1;
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  return <Page title="Podsumowanie" subtitle={project.name} footer={
    <><Button label="Eksportuj PNG" icon={Image} disabled={project.points.length < 2}
      onPress={() => router.push({ pathname: '/export', params: { id } })} />
    <Button label={project.closed ? 'Wróć do projektu' : 'Kontynuuj pomiar'} icon={ArrowLeft} secondary
      onPress={() => router.replace({ pathname: '/project', params: { id } })} /></>
  }>
    <View style={s.card}><OutlineCanvas project={project} unit={unit} compact />
      <Button label="Powiększ szkic" icon={Maximize2} quiet onPress={() => setExpanded(true)} /></View>
    <View style={s.card}><Badge label={project.closed ? 'Obrys zamknięty' : 'Otwarta trasa'} icon={project.closed ? Check : Route} />
      <View style={[s.row, { alignItems: 'flex-start' }]}><View style={{ flex: 1, minWidth: 120, gap: 4 }}>
        <Text style={s.label}>{project.closed ? 'Obwód' : 'Długość trasy'}</Text><Text style={s.measureValue}>{fmt(m.perimeter * factor, 2)} <Text style={s.muted}>{unit}</Text></Text></View>
        <View style={{ flex: 1, minWidth: 100, gap: 4 }}><Text style={s.label}>Pole</Text><Text style={s.measureValue}>{m.area === null ? '—' : fmt(m.area, 2)} <Text style={s.muted}>{m.area === null ? '' : 'm²'}</Text></Text></View></View>
      {m.intersects && <Text style={s.warningText}>Samoprzecięcie obrysu. Pole nie jest prezentowane.</Text>}
      <View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 12, gap: 6 }}>
        <Text style={s.muted}>{m.closure ? `Błąd zamknięcia: ${fmt(m.closure.norm * factor, 2)} ${unit}\nΔX ${fmt(m.closure.dx * factor, 2)} ${unit} · ΔY ${fmt(m.closure.dy * factor, 2)} ${unit}` : 'Brak niezależnego pomiaru zamknięcia.'}</Text>
        {project.closed && !project.closureObservationId && <Text style={s.muted}>Bok zamykający do P1 jest wyliczony.</Text>}
      </View>
    </View>
    {!!lastSide(project) && !project.closureObservationId && <Button label="Popraw ostatni bok" icon={Pencil} secondary
      onPress={() => router.push({ pathname: '/edit-side', params: { id } })} />}
    <Disclosure title="Punkty w układzie lokalnym">
      {project.points.map((p, i) => <View key={p.id} style={[s.row, { justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 8 }]}>
        <Text style={s.label}>P{i + 1}</Text><Text style={s.muted}>X {fmt(p.x * factor, 2)} {unit}</Text><Text style={s.muted}>Y {fmt(p.y * factor, 2)} {unit}</Text></View>)}
    </Disclosure>
    <Text style={s.muted}>{estimated ? 'Długości pochodzące z kroków są szacunkowe.' : 'Długości wpisane ręcznie.'}</Text>
    <Dialog visible={expanded} title="Szkic" subtitle={project.name} fullWidth onClose={() => setExpanded(false)}>
      <OutlineCanvas project={project} unit={unit} />
    </Dialog>
  </Page>;
}
