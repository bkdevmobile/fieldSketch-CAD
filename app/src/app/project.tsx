import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Keyboard, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, colors, Field, fmt, Page, s } from '../components/ui';
import { AngleSlider } from '../components/AngleSlider';
import { AngleControls } from '../components/AngleControls';
import { FloatingSketch } from '../components/FloatingSketch';
import { StepControls } from '../components/StepControls';
import { Capture, Project, SurveyMode } from '../domain/model';
import { closeOutline, commitMeasurement, LengthMeasurement, measurementLength, metrics, normalize, parsePositive, undoLast } from '../domain/geometry';
import { convertLengthInput, headingFromTurn, previousHeading, snapTurn, SurveyDraft, turnFromHeading, WizardStep } from '../domain/survey';
import { orientation } from '../infrastructure/native';
import { message, useStore } from '../infrastructure/store';
import { usePedometer } from '../infrastructure/usePedometer';

const modeLabels: Record<SurveyMode, string> = { magnetic: 'Magnetyczny', relative: 'Względny', manual: 'Ręczny' };
interface Frozen { theta: number; capture: Capture | null; sessionId: string }
export default function Survey() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), project = store.projects.find(p => p.id === id);
  const preferredMode = store.settings.directionMode;
  const mode: SurveyMode = preferredMode === 'manual' || !store.capabilities || store.capabilities[preferredMode] ? preferredMode : 'manual';
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<WizardStep>('direction');
  const [length, setLength] = useState(''), [steps, setSteps] = useState('');
  const [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [lengthSource, setLengthSource] = useState<'manual' | 'steps'>('manual');
  const [stepLength, setStepLength] = useState(String(store.settings.stepLengthCm));
  const [stepMeasurementId, setStepMeasurementId] = useState<string | undefined>();
  const [detectedSteps, setDetectedSteps] = useState<number | undefined>();
  const pedometer = usePedometer(store.sessionProject === id ? store.sessionId : null);
  const [turn, setTurn] = useState('0'), [turnSide, setTurnSide] = useState<'left' | 'right'>('left');
  const angleEdited = useRef(false), angleDraft = useRef({ turn, turnSide });
  angleDraft.current = { turn, turnSide };
  const [frozen, setFrozen] = useState<Frozen | null>(null);
  const [offset, setOffset] = useState<number | null>(null), [anchorIndex, setAnchorIndex] = useState(0);
  const [fineDelta, setFineDelta] = useState(0), [sliderBase, setSliderBase] = useState(0);
  const [fitKey, setFitKey] = useState(0);
  const [correctAngle, setCorrectAngle] = useState(false);
  const [menu, setMenu] = useState(false);
  const [hydrated, setHydrated] = useState(false), [draftError, setDraftError] = useState(''), [resumeNote, setResumeNote] = useState('');
  const writes = useRef<Promise<void>>(Promise.resolve());
  const finishing = useRef(false);
  const active = store.sessionProject === id && !!store.sessionId;
  const latestSession = useRef(store.sessionId); latestSession.current = store.sessionId;
  const previous = project ? previousHeading(project) : 0;
  const first = project?.points.length === 1;
  const needsReference = mode !== 'manual' && offset === null && !first;
  const frozenValid = frozen && active && frozen.sessionId === store.sessionId;
  let theta: number | undefined, angleError = '';
  try { if (frozenValid) theta = first ? 0 : headingFromTurn(previous, turn, turnSide); }
  catch (error) { angleError = message(error); }
  let measurement: LengthMeasurement | undefined, lengthM: number | undefined;
  try {
    measurement = lengthSource === 'manual' ? { source: 'manual', value: parsePositive(length), unit }
      : { source: 'steps', steps: parsePositive(steps), stepLengthCm: parsePositive(stepLength), measurementId: stepMeasurementId, detectedSteps };
    lengthM = measurementLength(measurement).lengthM;
  } catch { measurement = undefined; }
  const draft: SurveyDraft | null = project ? { revision: project.geometryRevision, step, length, steps, lengthSource, unit, turn, turnSide, stepLengthCm: stepLength, stepMeasurementId, detectedSteps } : null;
  const latest = useRef({ draft, repo: store.repo, id });
  latest.current = { draft, repo: store.repo, id };
  const enqueueDraft = () => {
    const current = latest.current;
    if (!current.draft || !current.repo || finishing.current) return;
    writes.current = writes.current.catch(() => {}).then(() => current.repo!.saveDraft(current.id, current.draft!));
    void writes.current.then(() => setDraftError(''), error => setDraftError(message(error)));
  };
  useEffect(() => {
    if (!project || !store.repo) return;
    let mounted = true;
    setHydrated(false);
    void store.repo.loadDraft(id).then(saved => {
      if (!mounted) return;
      if (saved && saved.revision === project.geometryRevision) {
        setLength(saved.length); setSteps(saved.steps); setUnit(saved.unit); setLengthSource(saved.lengthSource);
        setStepLength(saved.stepLengthCm ?? String(store.settings.stepLengthCm)); setStepMeasurementId(saved.stepMeasurementId); setDetectedSteps(saved.detectedSteps);
        setTurn(saved.turn); setTurnSide(saved.turnSide);
        setStep(saved.step === 'start' ? 'start' : 'direction');
        setResumeNote('Przywrócono wpisane dane. Przechwyć kierunek ponownie przed zapisaniem punktu.');
      } else { setStep(project.points.length === 1 ? 'start' : 'direction'); setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm)); }
      setHydrated(true);
    }, error => { if (mounted) setDraftError(message(error)); });
    return () => { mounted = false; };
  }, [id, store.repo]);
  useEffect(() => { if (hydrated) enqueueDraft(); }, [hydrated, id, step, length, steps, unit, lengthSource, turn, turnSide, stepLength, stepMeasurementId, detectedSteps, project?.geometryRevision]);
  useEffect(() => {
    if (!pedometer.reading) return;
    setSteps(String(pedometer.reading.steps)); setDetectedSteps(pedometer.reading.steps);
    setStepMeasurementId(pedometer.reading.measurementId);
  }, [pedometer.reading]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => { if (state !== 'active' && hydrated) enqueueDraft(); });
    return () => sub.remove();
  }, [hydrated]);
  useEffect(() => {
    setFrozen(null); setOffset(null);
    setStep(current => current === 'start' ? 'start' : 'direction');
  }, [store.sessionId, mode]);
  useEffect(() => { setFitKey(key => key + 1); Keyboard.dismiss(); }, [step]);
  if (!project) return <Page title="Projekt"><Text style={s.text}>Ładowanie projektu lub projekt został usunięty.</Text></Page>;
  const fit = () => setFitKey(key => key + 1);
  const start = () => store.run(async () => { await store.start(project, mode); setStep('direction'); });
  const setDirection = (value: Frozen) => {
    angleEdited.current = false;
    setCorrectAngle(false);
    setFrozen(value); setSliderBase(value.theta); setFineDelta(0);
    const values = turnFromHeading(previous, first ? 0 : value.theta);
    setTurn(values.turn); setTurnSide(values.turnSide); setResumeNote(''); setStep('angle'); fit();
  };
  const acceptCapture = async (capture: Capture) => {
    const rawTheta = normalize(Math.PI / 2 - capture.headingRad);
    let frameOffset = offset;
    if (frameOffset === null) {
      if (project.points.length > 1) {
        const index = Math.min(anchorIndex, project.points.length - 2);
        const a = project.points[index]!, b = project.points[index + 1]!;
        frameOffset = normalize(Math.atan2(b.y - a.y, b.x - a.x) - rawTheta);
        await store.log('reference_registered', { fromPointId: a.id, toPointId: b.id, frameOffset, capture });
        setOffset(frameOffset);
        Alert.alert('Odniesienie ustawione', 'Wróć do aktualnego punktu i przechwyć kierunek następnego boku.');
        return;
      }
      frameOffset = -rawTheta;
      await store.log('reference_registered', { firstSideAsPositiveX: true, frameOffset, capture });
      setOffset(frameOffset);
    }
    setDirection({ theta: normalize(rawTheta + frameOffset), capture, sessionId: capture.sessionId });
  };
  const capture = () => store.run(async () => {
    if (!active) throw new Error('Najpierw rozpocznij sesję.');
    if (mode === 'manual') {
      const direction = first ? 0 : headingFromTurn(previous, applySnap(), turnSide);
      await store.log('manual_direction', { theta: direction, turn, turnSide });
      setDirection({ theta: direction, capture: null, sessionId: store.sessionId! });
      return;
    }
    const value = await orientation().captureDirection();
    if (value.sessionId !== store.sessionId) throw new Error('Sesja czujnika zmieniła się. Przechwyć kierunek ponownie.');
    if (!value.stable) {
      Alert.alert('Kierunek wymaga kontroli', `Rozrzut ${fmt(value.stdDevDeg)}°. Jakość czujnika: ${value.accuracy}/3. Ponów celowanie albo świadomie użyj tej próby.`, [
        { text: 'Ponów', style: 'cancel', onPress: () => store.run(async () => { await store.log('capture_rejected', { capture: value }); }) },
        { text: 'Użyj mimo ostrzeżenia', onPress: () => store.run(async () => {
          const current = latestSession.current;
          if (current !== value.sessionId) throw new Error('Sesja czujnika wygasła. Rozpocznij ją ponownie.');
          await store.log('capture_warning_accepted', { capture: value }); await acceptCapture(value);
        }) },
      ]);
    } else await acceptCapture(value);
  });
  const persist = async (next: Project, kind: string, before = project, sessionStarted = false) => {
    if (!active && !sessionStarted) throw new Error('Rozpocznij sesję, aby zmiana miała log diagnostyczny.');
    await store.log(`${kind}_intent`, { revisionBefore: before.geometryRevision, revisionAfter: next.geometryRevision,
      lastPointBefore: before.points.at(-1), lastPointAfter: next.points.at(-1),
      observation: next.observations.length > before.observations.length ? next.observations.at(-1) : null,
      activeObservationIds: next.activeObservationIds, closed: next.closed, metrics: metrics(next) });
    await writes.current;
    try { await store.repo!.save(next, kind); }
    catch (error) { await store.log('project_save_failed', { kind, message: String(error) }); throw error; }
    setFrozen(null); setLength(''); setSteps(''); setStepLength(String(store.settings.stepLengthCm)); setStepMeasurementId(undefined); setDetectedSteps(undefined); setTurn('0'); setStep('direction'); fit();
    await store.refresh();
    try { await store.log(`${kind}_committed`, { geometryRevision: next.geometryRevision }); }
    catch { throw new Error('Pomiar zapisano, ale nie udało się dopisać potwierdzenia do loga. Sprawdź pamięć telefonu.'); }
  };
  const saveCurrent = async (closure = false, selected = measurement) => {
    if (!frozenValid || theta === undefined || !selected) throw new Error('Uzupełnij kierunek oraz dodatnią długość.');
    const next = commitMeasurement(project, selected, theta, mode, frozen!.sessionId, frozen!.capture, closure, frozen!.theta);
    await persist(next, closure ? 'closure_measured' : 'side_added');
    return next;
  };
  const chooseFinish = (base: Project) => Alert.alert('Zakończ pomiar', 'Zamknij obrys połączeniem do P1 albo zachowaj go otwartym.', [
    { text: 'Wróć do pomiaru', style: 'cancel' },
    { text: 'Zostaw otwarty', onPress: () => complete(base, false) },
    ...(base.points.length >= 3 && !base.closed ? [{ text: 'Zamknij obrys', onPress: () => complete(base, true) }] : []),
  ]);
  const complete = (base: Project, close: boolean) => store.run(async () => {
    finishing.current = true;
    try {
      if (close) await persist(closeOutline(base), 'outline_closed', base);
      await writes.current; await store.repo!.removeDraft(id);
      if (active) await store.stop();
      router.replace({ pathname: '/outline', params: { id } });
    } catch (error) { finishing.current = false; throw error; }
  });
  const presentFinish = (selected = measurement) => {
    Keyboard.dismiss();
    let valid = false;
    try { if (selected) { measurementLength(selected); valid = true; } } catch { }
    if (frozen || length.trim() || steps.trim()) Alert.alert('Niezapisany bok', 'Zapisz kompletny pomiar lub odrzuć go przed zakończeniem.', [
      { text: 'Wróć do pomiaru', style: 'cancel' },
      { text: 'Odrzuć', onPress: () => chooseFinish(project) },
      ...(frozenValid && theta !== undefined && valid ? [{ text: 'Zapisz', onPress: () => store.run(async () => { chooseFinish(await saveCurrent(false, selected)); }) }] : []),
    ]);
    else chooseFinish(project);
  };
  const stopWalking = async () => {
    const result = await pedometer.stop(); setSteps(String(result.steps)); fit(); return result;
  };
  const finish = () => {
    if (!pedometer.walking) { presentFinish(); return; }
    store.run(async () => {
      const result = await stopWalking();
      presentFinish({ source: 'steps', steps: result.steps, stepLengthCm: parsePositive(stepLength), measurementId: result.measurementId, detectedSteps: result.steps });
    });
  };
  const startWalking = () => store.run(async () => {
    if (!frozenValid) throw new Error('Przechwyć kierunek przed pomiarem kroków.');
    parsePositive(stepLength);
    Keyboard.dismiss(); await pedometer.start(); setLengthSource('steps');
  });
  const updateTurn = (value: string, side = turnSide) => {
    angleEdited.current = true; angleDraft.current = { turn: value, turnSide: side };
    setTurn(value); setTurnSide(side); setFineDelta(0);
    try { setSliderBase(headingFromTurn(previous, value, side)); } catch { }
  };
  const applySnap = () => {
    let value = angleDraft.current.turn;
    if (angleEdited.current && !first) {
      try {
        value = snapTurn(value, store.settings.angleSnap);
        const direction = headingFromTurn(previous, value, angleDraft.current.turnSide);
        setTurn(value); angleDraft.current.turn = value;
        setFineDelta(Math.max(-15, Math.min(15, normalize(direction - sliderBase) * 180 / Math.PI)));
        angleEdited.current = false;
      } catch { }
    }
    fit(); return value;
  };
  const switchUnit = (next: 'm' | 'cm') => store.run(async () => { setLength(convertLengthInput(length, unit, next)); setUnit(next); fit(); });
  const nextStep = () => { if (step === 'angle') applySnap(); Keyboard.dismiss(); setStep(step === 'angle' ? 'length' : 'review'); fit(); };
  const back = () => { Keyboard.dismiss(); setStep(step === 'review' ? 'length' : step === 'length' ? 'angle' : 'direction'); };
  const showCamera = step === 'direction' && mode !== 'manual';
  const currentLive = store.live?.sessionId === store.sessionId ? store.live : null;
  const readoutReady = active && !!currentLive?.ready && currentLive.horizontalProjection >= 0.2 && currentLive.accuracy >= 2 && currentLive.stdDevDeg <= 3;
  const liveTheta = active && currentLive && !needsReference ? first ? 0 : normalize(Math.PI / 2 - currentLive.headingRad + (offset ?? 0)) : undefined;
  const previewTheta = theta ?? (step === 'direction' ? liveTheta : undefined);
  const title = { start: 'Zapisz pierwszy punkt', direction: needsReference ? 'Odtwórz odniesienie' : 'Wskaż kierunek',
    angle: 'Sprawdź kierunek', length: 'Podaj długość', review: `Zapisz punkt P${project.points.length + 1}` }[step];
  const blocked = store.busy || !hydrated || !!draftError || pedometer.walking;
  const turnFields = <>
    {first ? <Text style={s.text}>Pierwszy bok wyznacza kierunek 0° szkicu.</Text> : <>
      <AngleControls value={turn} side={turnSide} onChange={value => updateTurn(value)} onEndEditing={applySnap}
        disabled={blocked} onSideChange={side => { updateTurn(turn, side); fit(); }} />
      {!!angleError && <Text accessibilityRole="alert" style={s.warningText}>{angleError}</Text>}
    </>}
  </>;
  return <Page title={project.name} subtitle={`Punkt P${project.points.length} → P${project.points.length + 1} · ${modeLabels[mode]}`}
    compactHeader resetKey={step} overlay={<FloatingSketch project={project} unit={unit} fitKey={fitKey}
      preview={previewTheta === undefined ? undefined : { theta: previewTheta, lengthM: ['length', 'review'].includes(step) ? lengthM : undefined }} />} footer={<>
      {!project.closed && <View style={{ flexDirection: 'row', gap: 10 }}>
        {step !== 'start' && step !== 'direction' && <View style={{ flex: 1 }}><Button label="Wstecz" secondary onPress={back} disabled={blocked} /></View>}
        <View style={{ flex: 2 }}>
          {step === 'start' ? <Button label="Zapisz punkt P1" onPress={active ? () => setStep('direction') : start} disabled={blocked} />
            : step === 'direction' ? <Button label={!active ? 'Rozpocznij pomiar' : needsReference ? 'Ustaw odniesienie' : mode === 'manual' ? 'Ustaw kierunek' : 'Przechwyć kierunek'}
              onPress={active ? capture : start} disabled={blocked || (active && mode !== 'manual' && !permission?.granted)} />
            : step === 'review' ? <Button label="Zapisz punkt" onPress={() => store.run(async () => { await saveCurrent(); })}
              disabled={blocked || !frozenValid || theta === undefined || !measurement} />
            : <Button label={step === 'angle' ? 'Dalej · długość' : 'Dalej · zapisz punkt'} onPress={nextStep}
              disabled={blocked || theta === undefined || (step === 'length' && !measurement)} />}
        </View>
      </View>}
      <Button label={project.closed ? 'Zobacz podsumowanie' : 'Zakończ'} secondary disabled={store.busy || !hydrated}
        onPress={project.closed ? () => router.push({ pathname: '/outline', params: { id } }) : finish} />
    </>}>
    <Stack.Screen options={{ headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Menu projektu"
      onPress={() => { Keyboard.dismiss(); setMenu(true); }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[s.h2, { fontSize: 28 }]}>⋮</Text></Pressable> }} />
    <Modal visible={menu} animationType="slide" onRequestClose={() => setMenu(false)}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}><Page title="Opcje projektu" subtitle={project.name}
        footer={<Button label="Wróć do pomiaru" onPress={() => setMenu(false)} />}>
        <Button label={project.closed ? 'Cofnij zamknięcie' : 'Cofnij ostatni bok'} secondary
          disabled={blocked || (!project.closed && project.points.length < 2)} onPress={() => {
            Alert.alert('Cofnąć zapis?', 'Bieżący niezapisany pomiar zostanie odrzucony. Obserwacja źródłowa pozostanie w historii.', [
              { text: 'Anuluj', style: 'cancel' }, { text: 'Cofnij', onPress: () => store.run(async () => {
                if (!active) await store.start(project, mode);
                await persist(undoLast(project), 'undo', project, !active); setMenu(false);
              }) },
            ]);
          }} />
        {step === 'review' && project.points.length >= 3 && !project.closed && <Button secondary label="Zapisz jako pomiar powrotu do P1"
          disabled={blocked || !frozenValid || !measurement || theta === undefined}
          onPress={() => store.run(async () => { await saveCurrent(true); setMenu(false); })} />}
        <Button label="Diagnostyka projektu" secondary disabled={blocked} onPress={() => { setMenu(false); router.push({ pathname: '/diagnostics', params: { id } }); }} />
        <Button label="Ustawienia" secondary disabled={blocked} onPress={() => { setMenu(false); router.push('/settings'); }} />
      </Page></SafeAreaView>
    </Modal>
    {!!draftError && <View style={s.warning}><Text accessibilityRole="alert" style={s.warningText}>Nie udało się zachować etapu roboczego: {draftError}</Text>
      <Button label="Ponów zapis etapu" secondary onPress={enqueueDraft} /></View>}
    {!!resumeNote && <Text style={s.muted}>{resumeNote}</Text>}
    {project.closed ? <View style={s.card}><Text style={s.h2}>Obrys zamknięty</Text><Text style={s.text}>Otwórz podsumowanie albo cofnij zamknięcie w menu projektu ⋮.</Text></View> :
      <View style={s.card}><Text style={s.eyebrow}>{step === 'start' ? 'POCZĄTEK' : `${['direction', 'angle'].includes(step) ? '1. KIERUNEK' : step === 'length' ? '2. DŁUGOŚĆ' : '3. ZAPIS PUNKTU'}`}</Text>
        <Text style={s.h2}>{title}</Text>
        {step === 'start' && <Text style={s.text}>Stań w miejscu, od którego zaczynasz obrys. P1 będzie początkiem szkicu.</Text>}
        {step === 'direction' && <>
          <Text style={s.muted}>{needsReference ? 'Stań w początku znanego boku i wyceluj w jego koniec. Następnie wróć do aktualnego punktu.' : 'Stań nad początkiem boku i wyceluj w następny narożnik.'}</Text>
          {needsReference && <Button secondary label={`Bok odniesienia: P${anchorIndex + 1} → P${anchorIndex + 2} (zmień)`}
            onPress={() => setAnchorIndex((anchorIndex + 1) % (project.points.length - 1))} />}
          {showCamera && <View style={{ height: 200, backgroundColor: '#172F2A', borderRadius: 14, overflow: 'hidden' }}>
            {permission?.granted ? <CameraView style={{ flex: 1 }} facing="back" active={active} /> :
              <View style={{ padding: 20, gap: 12 }}><Text style={{ color: 'white' }}>Udostępnij kamerę do celowania albo wybierz tryb ręczny w ustawieniach.</Text>
                <Button label="Udostępnij kamerę" disabled={permission?.canAskAgain === false} onPress={() => store.run(async () => { await requestPermission(); })} /></View>}
            {permission?.granted && <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%' }}>
              <View style={{ width: 48, height: 2, left: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
              <View style={{ width: 2, height: 48, top: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
            </View>}
          </View>}
          {mode === 'manual' ? turnFields : <Text accessibilityRole="text" style={[s.muted, readoutReady && { color: colors.green, fontWeight: '700' }]}>
            {!active ? 'Rozpocznij pomiar i celuj nieruchomo przez około 2 sekundy.' : !currentLive?.ready ? 'Stabilizowanie…' : currentLive.horizontalProjection < 0.2 ? 'Ustaw telefon bardziej poziomo.' : readoutReady ? 'Gotowy do przechwycenia' : 'Słaba jakość odczytu — sprawdź kierunek.'}
          </Text>}
        </>}
        {step === 'angle' && <>
          <Text style={s.muted}>Odczyt zatrzymany. Popraw kąt lub przejdź do długości.</Text>
          <Text style={s.h2}>{first ? '0° · pierwszy bok' : `${turn}° ${turnSide === 'left' ? 'w lewo' : 'w prawo'}`}</Text>
          {!first && mode !== 'manual' && <Button secondary label={correctAngle ? 'Ukryj korektę kąta' : 'Popraw kąt'} onPress={() => { if (correctAngle) applySnap(); setCorrectAngle(value => !value); }} />}
          {(mode === 'manual' || correctAngle || !!angleError) && turnFields}
          {!first && mode !== 'manual' && correctAngle && <AngleSlider value={fineDelta} disabled={blocked} onChange={value => {
            setFineDelta(value); const corrected = turnFromHeading(previous, sliderBase + value * Math.PI / 180, 5);
            angleEdited.current = false; angleDraft.current = corrected;
            setTurn(corrected.turn); setTurnSide(corrected.turnSide);
          }} onComplete={applySnap} />}
          <Button label="Zmierz ponownie" secondary onPress={() => setStep('direction')} disabled={store.busy} />
        </>}
        {step === 'length' && <>
          <Text style={s.muted}>{pedometer.walking ? 'Przejdź do następnego punktu, a następnie zatrzymaj liczenie.' : 'Wpisz długość lub zmierz odcinek krokami.'}</Text>
          <View style={s.row}><Button label="Wpisz długość" disabled={pedometer.walking} secondary={lengthSource !== 'manual'} onPress={() => { setLengthSource('manual'); fit(); }} />
            <Button label="Krokomierz" disabled={pedometer.walking} secondary={lengthSource !== 'steps'} onPress={() => { setLengthSource('steps'); fit(); }} /></View>
          {lengthSource === 'manual' ? <>
            <Field label={`Długość boku (${unit})`} value={length} onChangeText={setLength} numeric placeholder="np. 4,50" onEndEditing={fit} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Zmień jednostkę długości, aktualnie ${unit}`} disabled={store.busy}
              onPress={() => Alert.alert('Jednostka tego pomiaru', 'Wybierz jednostkę; wpisana długość zostanie przeliczona.', [
                { text: 'Metry', onPress: () => switchUnit('m') }, { text: 'Centymetry', onPress: () => switchUnit('cm') }, { text: 'Anuluj', style: 'cancel' },
              ])} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={[s.label, { textDecorationLine: 'underline' }]}>Jednostka: {unit} ▾</Text></Pressable>
          </> : <><StepControls value={steps} onChange={setSteps} onEndEditing={fit} walking={pedometer.walking}
            busy={store.busy} canStart={!!store.capabilities?.stepDetector && !!frozenValid}
            onToggle={pedometer.walking ? () => store.run(async () => { await stopWalking(); }) : startWalking} />
            <Text style={s.muted}>1 krok = {stepLength} cm · długość szacunkowa</Text>
            {pedometer.walking ? <Text accessibilityLiveRegion="polite" style={s.h2}>{pedometer.reading?.steps ?? 0} kroków · pomiar w toku</Text>
              : !store.capabilities?.stepDetector && <Text style={s.muted}>Ten telefon nie udostępnia detektora kroków. Wpisz ich liczbę ręcznie albo podaj długość.</Text>}
          </>}
          <Text style={s.h2}>{lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>

        </>}
        {step === 'review' && <>
          <Text style={s.text}>Skręt: {first ? '0° · pierwszy bok' : `${turn}° ${turnSide === 'left' ? 'w lewo' : 'w prawo'}`}</Text>
          <Text style={s.h2}>Długość: {lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>
          <Text style={s.muted}>{lengthSource === 'manual' ? 'Długość wpisana ręcznie' : 'Długość oszacowana z wpisanych kroków'}</Text>
          <View style={s.row}><Button secondary label="Popraw kąt" onPress={() => { setCorrectAngle(true); setStep('angle'); }} /><Button secondary label="Popraw długość" onPress={() => setStep('length')} /></View>
        </>}
      </View>}

  </Page>;
}
