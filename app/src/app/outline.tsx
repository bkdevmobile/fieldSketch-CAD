import { LengthUnit, fromMetres, displayArea, areaUnit } from '../domain/units';
import { useTheme, Button, Page, fmt } from '../components/ui';
import { t } from '../i18n';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, FileDown, Image, Maximize2, Pencil, Route } from 'lucide-react-native';
import { SketchNote } from '../components/SketchNote';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { Badge, Disclosure } from '../components/presentation';
import { Dialog } from '../components/overlays';
import { useStore } from '../infrastructure/store';
import { lastSide, metrics, outlinePoints } from '../domain/geometry';
import { shareDxf } from '../infrastructure/shareDxf';
import { usePlusOffer } from '../components/PlusOffer';
export default function Outline() {
  const { colors, s } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>(); const store = useStore(), { projects, settings } = store;
  const [expanded, setExpanded] = useState(false);
  const plus = usePlusOffer();
  const project = projects.find(p => p.id === id);
  if (!project) return <Page title={t("Obrys")}><Text>{t("Szkic niedostępny.")}</Text></Page>;
  const m = metrics(project), unit = settings.unit, factor = fromMetres(1, unit);
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  return <Page title={t("Podsumowanie")} subtitle={project.name} footer={
    <><View style={s.row}><View style={{ flex: 1 }}><Button label={t("Eksportuj PNG")} icon={Image} disabled={store.busy || project.points.length < 2}
      onPress={() => router.push({ pathname: '/export', params: { id } })} />
    </View><View style={{ flex: 1 }}><Button label={store.plan === 'plus' ? t("Eksportuj DXF") : 'DXF · Plus'} icon={FileDown} secondary disabled={store.busy || project.points.length < 2}
      onPress={() => { if (store.plan !== 'plus') { plus.show('dxf'); return; } void store.run(async () => { await shareDxf(project, unit, store.plan); }); }} /></View></View>
    <Button label={project.closed ? t("Wróć do szkicu") : t("Kontynuuj pomiar")} icon={ArrowLeft} secondary
      onPress={() => router.replace({ pathname: '/project', params: { id } })} /></>
  }>
    {plus.offer}
    <View style={s.card}><OutlineCanvas project={project} unit={unit} compact />
      <Button label={t("Powiększ szkic")} icon={Maximize2} quiet onPress={() => setExpanded(true)} /></View>
    <View style={s.card}><Badge label={project.closed ? t("Obrys zamknięty") : t("Otwarta trasa")} icon={project.closed ? Check : Route} />
      <View style={[s.row, { alignItems: 'flex-start' }]}><View style={{ flex: 1, minWidth: 120, gap: 4 }}>
        <Text style={s.label}>{project.closed ? t("Obwód") : t("Długość trasy")}</Text><Text style={s.measureValue}>{fmt(m.perimeter * factor, 3)} <Text style={s.muted}>{unit}</Text></Text></View>
        <View style={{ flex: 1, minWidth: 100, gap: 4 }}><Text style={s.label}>{t("Pole")}</Text><Text style={s.measureValue}>{m.area === null ? '—' : fmt(displayArea(m.area, unit), 2)} <Text style={s.muted}>{m.area === null ? '' : areaUnit(unit)}</Text></Text></View></View>
      {m.intersects && <Text style={s.warningText}>{t("Samoprzecięcie obrysu. Pole nie jest prezentowane.")}</Text>}
      <View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 12, gap: 6 }}>
        <Text style={s.muted}>{m.closure ? t("Błąd zamknięcia: {0} {1}\nΔX {2} {3} · ΔY {4} {5}", [fmt(m.closure.norm * factor, 3), unit, fmt(m.closure.dx * factor, 3), unit, fmt(m.closure.dy * factor, 3), unit]) : t("Brak niezależnego pomiaru zamknięcia.")}</Text>
        {project.closed && !project.closureObservationId && <Text style={s.muted}>{outlinePoints(project.points, true).length < project.points.length ? t("Ostatni zmierzony bok wraca do P1.") : t("Bok zamykający do P1 jest wyliczony.")}</Text>}
      </View>
    </View>
    {!!lastSide(project) && !project.closureObservationId && <Button label={t("Popraw ostatni bok")} icon={Pencil} secondary
      onPress={() => router.push({ pathname: '/edit-side', params: { id } })} />}
    <SketchNote project={project} />
    {!!project.activeObservationIds.length && <Button label={t("Wymiary i punkty")} icon={Pencil} secondary disabled={store.busy}
      onPress={() => router.push({ pathname: '/dimensions', params: { id } })} />}
    <Disclosure title={t("Punkty w układzie lokalnym")}>
      {project.points.map((p, i) => <View key={p.id} style={[s.row, { justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 8 }]}>
        <Text style={s.label}>P{i + 1}</Text><Text style={s.muted}>X {fmt(p.x * factor, 3)} {unit}</Text><Text style={s.muted}>Y {fmt(p.y * factor, 3)} {unit}</Text></View>)}
    </Disclosure>
    <Text style={s.muted}>{estimated ? t("Długości pochodzące z kroków są szacunkowe.") : t("Długości wpisane ręcznie.")}</Text>
    <Text style={s.muted}>{t("DXF: obrys 2D i opisy na osobnych warstwach. Jednostka:")}{' '}{unit}{t(". Opisy długości są niezależnymi tekstami CAD.")}</Text>
    <Dialog visible={expanded} title={t("Szkic")} subtitle={project.name} fullWidth onClose={() => setExpanded(false)}>
      <OutlineCanvas project={project} unit={unit} />
    </Dialog>
  </Page>;
}
