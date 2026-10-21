import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from '../i18n';
import { activeSides, correctSides, correctClosingLength, distance, outlinePoints, normalize, parsePositive, SideCorrection } from '../domain/geometry';
import { useStore } from '../infrastructure/store';
import { Button, Field, Page, s } from '../components/ui';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { AngleControls } from '../components/AngleControls';
import { headingFromTurn } from '../domain/survey';
export default function Dimensions() {
  const { id } = useLocalSearchParams<{ id: string }>(), store = useStore();
  const project = store.projects.find(p => p.id === id);
  const sides = project ? activeSides(project) : [];
  const unit = store.settings.unit, factor = unit === 'cm' ? 100 : 1;
  const [rows, setRows] = useState<{ length: string; turn: string; side: 'left' | 'right' }[]>([]);
  const [selected, setSelected] = useState(0);
  const [closing, setClosing] = useState(''), [closingEdited, setClosingEdited] = useState(false);
  const [revision, setRevision] = useState(-1);
  useEffect(() => {
    if (!project) return;
    setRevision(project.geometryRevision); setClosingEdited(false);
    setClosing(String(Number((distance(project.points[0]!, project.points.at(-1)!) * factor).toPrecision(12))));
    setRows(sides.map((o, i) => { const delta = normalize(o.theta - (sides[i - 1]?.theta ?? 0)); const turn = { turn: String(Math.abs(delta) * 180 / Math.PI), turnSide: delta < 0 ? 'right' as const : 'left' as const };
      return { length: String(Number((o.lengthM * factor).toPrecision(12))), turn: turn.turn, side: turn.turnSide }; }));
  }, [project?.id, project?.geometryRevision, unit]);
  if (!project) return <Page title={t("Wymiary i punkty")}><Text>{t("Szkic niedostępny.")}</Text></Page>;
  const hasClosing = project.closed && outlinePoints(project.points, true).length === project.points.length;
  let preview = project, error = '', corrections: SideCorrection[] = [];
  try {
    if (rows.length !== sides.length || revision !== project.geometryRevision) throw new Error(t("Otwórz edytor ponownie, aby wczytać aktualny szkic."));
    let theta = sides[0]?.theta ?? 0;
    rows.forEach((row, i) => {
      const original = sides[i]!;
      if (i) theta = headingFromTurn(theta, row.turn, row.side);
      const value = parsePositive(row.length), lengthM = value / factor;
      if (Math.abs(lengthM - original.lengthM) > 1e-10 || Math.abs(normalize(theta - original.theta)) > 1e-6)
        corrections.push({ observationId: original.id, measurement: Math.abs(lengthM - original.lengthM) > 1e-10
          ? { source: 'manual', value, unit } : original.lengthSource === 'steps'
            ? { source: 'steps', steps: original.stepCount!, stepLengthCm: original.stepLengthCm!, measurementId: original.stepMeasurementId, detectedSteps: original.detectedSteps }
            : { source: 'manual', value: original.lengthM, unit: 'm' }, theta });
    });
    if (corrections.length) preview = correctSides(project, corrections);
    if (hasClosing && closingEdited) preview = correctClosingLength(preview, parsePositive(closing) / factor);
  } catch (e) { error = e instanceof Error ? e.message : String(e); }
  const update = (i: number, patch: Partial<typeof rows[number]>) => setRows(current => current.map((r, j) => i === j ? { ...r, ...patch } : r));
  const row = rows[selected];
  return <Page title={t("Wymiary i punkty")} subtitle={project.name} footer={<>
    <Button label={t("Zapisz poprawki")} disabled={store.busy || !!error || !(corrections.length || closingEdited)} onPress={() => store.run(async () => {
      const current = await store.repo!.load(id);
      if (!current || current.geometryRevision !== revision) throw new Error(t("Otwórz edytor ponownie, aby wczytać aktualny szkic."));
      let next = corrections.length ? correctSides(current, corrections) : current;
      if (hasClosing && closingEdited) next = correctClosingLength(next, parsePositive(closing) / factor);
      await store.repo!.save(next, 'dimensions_corrected', store.plan);
      await store.stop(); await store.refresh(); router.back();
    })} /><Button label={t("Anuluj")} quiet disabled={store.busy} onPress={() => router.back()} />
  </>}>
    <Text style={s.muted}>{t("Zmień długości w tabeli. Korekta kąta przelicza dalsze punkty, zachowując skręty. Pomiary źródłowe pozostają w historii.")}</Text>
    <OutlineCanvas project={preview} unit={unit} compact />
    {rows.map((r, i) => <View key={sides[i]!.id} style={s.card}>
      <Button label={t("Punkt P{0} · bok P{1}–P{0}", [i + 2, i + 1])} secondary onPress={() => setSelected(i)} />
      <Field label={t("Długość boku ({0})", [unit])} numeric value={r.length} disabled={store.busy} onChangeText={length => update(i, { length })} />
    </View>)}
    {!!row && <View style={s.card}>
      <View style={s.row}><Button label={t("Poprzedni punkt")} secondary disabled={!selected || store.busy} onPress={() => setSelected(v => v - 1)} />
        <Text style={s.h2}>P{selected + 1} → P{selected + 2}</Text>
        <Button label={t("Następny punkt")} secondary disabled={selected >= rows.length - 1 || store.busy} onPress={() => setSelected(v => v + 1)} /></View>
      {selected > 0 ? <AngleControls label={t("Kąt skrętu (°)")} value={row.turn} side={row.side} disabled={store.busy}
        onEndEditing={() => {}} onChange={turn => update(selected, { turn })} onSideChange={side => update(selected, { side })} />
        : <Text style={s.muted}>{t("Pierwszy bok zachowuje kierunek odniesienia.")}</Text>}
      <Button label={t("Zmierz ten bok ponownie")} secondary disabled={store.busy || !!error || (!!corrections.length || closingEdited)}
        onPress={() => router.push({ pathname: '/project', params: { id, remeasure: sides[selected]!.id } })} />
      {(!!corrections.length || closingEdited) && <Text style={s.muted}>{t("Zapisz lub anuluj poprawki przed ponownym pomiarem.")}</Text>}
    </View>}
    {hasClosing && <View style={s.card}><Field label={t("Bok zamykający do P1 ({0})", [unit])} numeric value={closing} disabled={store.busy}
      onChangeText={value => { setClosing(value); setClosingEdited(true); }} /><Text style={s.muted}>{t("Korekta zamknięcia dopasowuje ostatni narożnik, zachowując długość poprzedniego boku.")}</Text></View>}
    {!!error && <Text accessibilityRole="alert" style={s.warningText}>{error}</Text>}

  </Page>;
}
