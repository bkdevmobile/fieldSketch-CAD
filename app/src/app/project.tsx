import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, fmt, Page, s, colors } from '../components/ui';
import { Capture, Project, SurveyMode } from '../domain/model';
import { closeOutline, commitSide, metrics, normalize, parsePositive, stepsToLength, undoLast } from '../domain/geometry';
import { orientation } from '../infrastructure/native';
import { useStore } from '../infrastructure/store';

const modeLabels: Record<SurveyMode, string> = { magnetic: 'Magnetyczny', relative: 'Względny', manual: 'Ręczny' };
export default function Survey() {
  const { id } = useLocalSearchParams<{ id: string }>(); const store = useStore();
  const project = store.projects.find(p => p.id === id);
  const [mode, setMode] = useState<SurveyMode>(project?.mode ?? 'manual');
  const [permission, requestPermission] = useCameraPermissions();
  const [steps, setSteps] = useState(''); const [angle, setAngle] = useState('0');
  const [frozen, setFrozen] = useState<{ theta: number; capture: Capture | null; sessionId: string } | null>(null);
  const [offset, setOffset] = useState<number | null>(null); const [anchorIndex, setAnchorIndex] = useState(0);
  const [contextText, setContextText] = useState(''); const [reference, setReference] = useState('');
  const active = store.sessionProject === id && !!store.sessionId;
  useEffect(() => { setFrozen(null); setOffset(null); }, [store.sessionId]);
  useEffect(() => { if (project) setMode(project.mode); }, [project?.id]);
  let preview = '';
  try { preview = `${fmt(stepsToLength(parsePositive(steps)).lengthCm, 2)} cm`; } catch { }
  if (!project) return <Page title="Projekt"><Text style={s.text}>Ładowanie projektu lub projekt został usunięty.</Text></Page>;
  const quality = metrics(project);
  const start = () => store.run(async () => { await store.start(project, mode); });
  const changeMode = (next: SurveyMode) => store.run(async () => {
    if (active) await store.stop();
    setMode(next); setFrozen(null); setOffset(null);
    const p = { ...project, mode: next, updatedAt: new Date().toISOString() };
    await store.repo!.save(p, 'mode_changed'); await store.refresh();
  });
  const acceptCapture = async (capture: Capture) => {
    const rawTheta = normalize(Math.PI / 2 - capture.headingRad);
    let frameOffset = offset;
    if (frameOffset === null) {
      if (project.points.length > 1) {
        const index = Math.min(anchorIndex, project.points.length - 2);
        const a = project.points[index]!, b = project.points[index + 1]!;
        frameOffset = normalize(Math.atan2(b.y - a.y, b.x - a.x) - rawTheta);
        setOffset(frameOffset);
        await store.log('reference_registered', { fromPointId: a.id, toPointId: b.id, frameOffset, capture });
        Alert.alert('Odniesienie ustawione', 'Wróć do aktualnego punktu i przechwyć kierunek następnego boku.');
        return;
      }
      frameOffset = mode === 'relative' ? -rawTheta : 0; setOffset(frameOffset);
      await store.log('reference_registered', { firstSideAsPositiveX: mode === 'relative', frameOffset, capture });
    }
    setFrozen({ theta: normalize(rawTheta + (frameOffset ?? 0)), capture, sessionId: capture.sessionId });
  };
  const capture = () => store.run(async () => {
    if (!active) throw new Error('Najpierw rozpocznij sesję.');
    if (mode === 'manual') {
      const value = Number(angle.trim().replace(',', '.'));
      if (!angle.trim() || !Number.isFinite(value)) throw new Error('Wpisz poprawny kąt w stopniach.');
      setFrozen({ theta: normalize(value * Math.PI / 180), capture: null, sessionId: store.sessionId! });
      await store.log('manual_direction', { angleDeg: value }); return;
    }
    const value = await orientation().captureDirection();
    if (!value.stable) {
      Alert.alert('Kierunek wymaga kontroli', `Rozrzut ${fmt(value.stdDevDeg)}°. Jakość czujnika: ${value.accuracy}/3. Możesz ponowić celowanie albo świadomie użyć tej próby.`, [
        { text: 'Ponów', style: 'cancel', onPress: () => store.run(async () => { await store.log('capture_rejected', { capture: value }); }) },
        { text: 'Użyj mimo ostrzeżenia', onPress: () => store.run(async () => { await store.log('capture_warning_accepted', { capture: value }); await acceptCapture(value); }) },
      ]);
    } else await acceptCapture(value);
  });
  const persist = async (next: Project, kind: string) => {
    if (!active) throw new Error('Rozpocznij sesję, aby zmiana miała log diagnostyczny.');
    await store.log(`${kind}_intent`, { revisionBefore: project.geometryRevision, revisionAfter: next.geometryRevision,
      lastPointBefore: project.points.at(-1), lastPointAfter: next.points.at(-1),
      observation: next.observations.length > project.observations.length ? next.observations.at(-1) : null,
      activeObservationIds: next.activeObservationIds, closed: next.closed, metrics: metrics(next) });
    try { await store.repo!.save(next, kind); }
    catch (e) { await store.log('project_save_failed', { kind, message: String(e) }); throw e; }
    setFrozen(null); setSteps('');
    await store.refresh();
    try { await store.log(`${kind}_committed`, { geometryRevision: next.geometryRevision }); }
    catch { throw new Error('Zmiana została zapisana w projekcie, ale nie udało się dopisać potwierdzenia do loga. Zakończ sesję i sprawdź pamięć telefonu.'); }
  };
  const save = (closure: boolean) => store.run(async () => {
    if (!frozen || frozen.sessionId !== store.sessionId) throw new Error('Przechwyć ponownie kierunek w bieżącej sesji.');
    const next = commitSide(project, parsePositive(steps), frozen.theta, mode, frozen.sessionId, frozen.capture, closure);
    await persist(next, closure ? 'closure_measured' : 'side_added');
    setFrozen(null); setSteps('');
  });
  const setModeDisabled = (m: SurveyMode) => store.busy || (m !== 'manual' && !store.capabilities?.[m]);
  return <Page title={project.name} subtitle={`Stanowisko P${project.points.length} · ${project.closed ? 'obrys zamknięty' : 'obrys otwarty'}`}>
    <View style={s.row}>{(['magnetic', 'relative', 'manual'] as SurveyMode[]).map(m =>
      <Button key={m} label={`${mode === m ? '✓ ' : ''}${modeLabels[m]}`} secondary={mode !== m} disabled={setModeDisabled(m)} onPress={() => changeMode(m)} />)}</View>
    {mode !== 'manual' && <View style={{ height: 240, backgroundColor: '#172F2A', borderRadius: 18, overflow: 'hidden' }}>
      {permission?.granted ? <CameraView style={{ flex: 1 }} facing="back" active={active} /> :
        <View style={{ padding: 24, gap: 16 }}><Text style={{ color: 'white', lineHeight: 22 }}>Udostępnij kamerę do celowania lub wybierz tryb ręczny.</Text>
          <Button label="Udostępnij kamerę" disabled={permission?.canAskAgain === false} onPress={() => store.run(async () => { await requestPermission(); })} /></View>}
      {permission?.granted && <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 48, height: 2, backgroundColor: '#BAF2CD', position: 'absolute' }} />
        <View style={{ width: 2, height: 48, backgroundColor: '#BAF2CD', position: 'absolute' }} />
      </View>}
    </View>}
    <View style={s.card}>
      <Text style={s.h2}>1. Zapisz kierunek</Text>
      <Text style={s.muted}>Stań nad początkiem boku i wyceluj w następny punkt. Po zapisaniu kierunku możesz przejść odcinek.</Text>
      {!active ? <Button label="Rozpocznij sesję pomiarową" onPress={start} disabled={store.busy} /> :
        <Text style={{ color: colors.green, fontWeight: '700' }}>● Sesja i zapis logów aktywne</Text>}
      {mode === 'manual' ? <Field label="Kąt od osi X w stopniach" value={angle} onChangeText={setAngle} placeholder="0 = w prawo, 90 = w górę" /> : <>
        <Text style={s.text}>{active && store.live ? `Kierunek ${fmt((store.live.headingRad * 180 / Math.PI + 360) % 360)}° · rozrzut ${fmt(store.live.stdDevDeg)}°` : 'Oczekiwanie na próbki sensora…'}</Text>
        <Text style={s.muted}>{store.live && active ? `Pochylenie ${fmt(store.live.pitchDeg)}° · jakość ${store.live.accuracy}/3 · ${store.live.ready ? 'okno 2 s gotowe' : 'stabilizowanie…'}` : 'Celuj nieruchomo przez 2 sekundy.'}</Text>
      </>}
      {mode !== 'manual' && offset === null && project.points.length > 1 && <View style={{ gap: 10 }}>
        <Text style={s.warningText}>Odtwórz odniesienie. Stań w początku wybranego boku i celuj w jego koniec.</Text>
        <Button secondary label={`Bok odniesienia: P${anchorIndex + 1} → P${anchorIndex + 2} (zmień)`}
          onPress={() => setAnchorIndex((anchorIndex + 1) % (project.points.length - 1))} />
      </View>}
      <Button label={mode !== 'manual' && offset === null && project.points.length > 1 ? 'Ustaw odniesienie kierunku' : frozen ? 'Przechwyć kierunek ponownie' : 'Przechwyć kierunek'}
        onPress={capture} disabled={store.busy || !active || project.closed || (mode !== 'manual' && !permission?.granted)} />
      {frozen && <Text style={{ color: colors.green, fontWeight: '600' }}>Kierunek zapisany: {fmt(frozen.theta * 180 / Math.PI)}° w układzie projektu.</Text>}
    </View>
    <View style={s.card}><Text style={s.h2}>2. Wpisz kroki</Text>
      <Field label="Liczba kroków" numeric value={steps} onChangeText={setSteps} placeholder="np. 10 lub 2,5" />
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.ink }}>{preview || '— cm'}</Text>
      <Text style={s.muted}>Szacowana długość · 1 krok = 75 cm</Text>
      <Button label={`Dodaj punkt P${project.points.length + 1}`} onPress={() => save(false)} disabled={store.busy || !frozen || project.closed} />
      {project.points.length >= 3 && !project.closed && <Button secondary label="Zapisz jako pomiar powrotu do P1" onPress={() => save(true)} disabled={store.busy || !frozen} />}
    </View>
    <View style={s.card}><Text style={s.h2}>Szkic i kontrola</Text>
      <Text style={s.text}>{project.points.length} punktów · {fmt(quality.perimeter * 100)} cm {project.closed ? 'obwodu' : 'trasy'}</Text>
      <Text style={s.muted}>{quality.closure ? `Błąd zamknięcia: ${fmt(quality.closure.norm * 100)} cm` : 'Brak pomiaru zamknięcia'}</Text>
      <Button label="Zobacz obrys 2D" onPress={() => router.push({ pathname: '/outline', params: { id } })} />
      {!project.closed && project.points.length >= 3 && <Button label="Połącz obrys z P1 bez pomiaru" secondary disabled={store.busy || !active}
        onPress={() => store.run(async () => { await persist(closeOutline(project), 'outline_closed'); setFrozen(null); })} />}
      <Button label={project.closed ? 'Cofnij zamknięcie' : 'Cofnij ostatni bok'} secondary disabled={store.busy || !active || (!project.closed && project.points.length < 2)}
        onPress={() => store.run(async () => { await persist(undoLast(project), 'undo'); setFrozen(null); })} />
    </View>
    <View style={s.card}><Text style={s.h2}>Kontekst próby</Text>
      <Field label="Otoczenie i uwagi testera" value={contextText} onChangeText={setContextText} placeholder="np. otwarte pole, operator A" />
      <Field label="Pomiar odniesienia i metoda (opcjonalnie)" value={reference} onChangeText={setReference} placeholder="np. P1–P2: 730 cm, taśma" />
      <Button label="Dopisz kontekst do loga" secondary disabled={!active || store.busy} onPress={() => store.run(async () => {
        await store.log('test_context', { notes: contextText, independentReference: reference || null, geometryRevision: project.geometryRevision });
        Alert.alert('Zapisano', 'Kontekst został dodany do loga sesji.');
      })} />
      <Button label="Otwórz logi projektu" secondary onPress={() => router.push({ pathname: '/logs', params: { projectId: id } })} />
      {active && <Button label="Zakończ sesję" secondary disabled={store.busy} onPress={() => store.run(store.stop)} />}
    </View>
  </Page>;
}
