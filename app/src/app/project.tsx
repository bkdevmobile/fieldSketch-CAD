import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Keyboard, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, fmt, Page, s } from '../components/ui';
import { AngleSlider } from '../components/AngleSlider';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { Capture, Project, SurveyMode } from '../domain/model';
import { closeOutline, commitMeasurement, LengthMeasurement, measurementLength, metrics, normalize, parsePositive, undoLast } from '../domain/geometry';
import { convertLengthInput, headingFromTurn, previousHeading, SurveyDraft, turnFromHeading, WizardStep } from '../domain/survey';
import { orientation } from '../infrastructure/native';
import { message, useStore } from '../infrastructure/store';
import { usePedometer } from '../infrastructure/usePedometer';

const modeLabels: Record<SurveyMode, string> = { magnetic: 'Magnetyczny', relative: 'Względny', manual: 'Ręczny' };
interface Frozen { theta: number; capture: Capture | null; sessionId: string }
export default function Survey() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), project = store.projects.find(p => p.id === id);
  const [mode, setMode] = useState<SurveyMode>(project?.mode ?? 'relative');
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
  const [frozen, setFrozen] = useState<Frozen | null>(null);
  const [offset, setOffset] = useState<number | null>(null), [anchorIndex, setAnchorIndex] = useState(0);
  const [fineDelta, setFineDelta] = useState(0), [sliderBase, setSliderBase] = useState(0);
  const [fitKey, setFitKey] = useState(0), [diagnostics, setDiagnostics] = useState(false);
  const [contextText, setContextText] = useState(''), [reference, setReference] = useState('');
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
      setMode(project.mode); setHydrated(true);
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
  }, [store.sessionId]);
  useEffect(() => { setFitKey(key => key + 1); Keyboard.dismiss(); }, [step]);
  if (!project) return <Page title="Projekt"><Text style={s.text}>Ładowanie projektu lub projekt został usunięty.</Text></Page>;
  const fit = () => setFitKey(key => key + 1);
  const start = () => store.run(async () => { await store.start(project, mode); setStep('direction'); });
  const setDirection = (value: Frozen) => {
    setFrozen(value); setSliderBase(value.theta); setFineDelta(0);
    const values = turnFromHeading(previous, first ? 0 : value.theta);
    setTurn(values.turn); setTurnSide(values.turnSide); setResumeNote(''); setStep('angle'); fit();
  };
  const changeMode = (next: SurveyMode) => store.run(async () => {
    if (active) await store.stop();
    await writes.current;
    const p = { ...project, mode: next, updatedAt: new Date().toISOString() };
    await store.repo!.save(p, 'mode_changed'); await store.refresh();
    setMode(next); setFrozen(null); setOffset(null); setStep('direction');
  });
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
      const direction = first ? 0 : headingFromTurn(previous, turn, turnSide);
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
  const persist = async (next: Project, kind: string, before = project) => {
    if (!active) throw new Error('Rozpocznij sesję, aby zmiana miała log diagnostyczny.');
    await store.log(`${kind}_intent`, { revisionBefore: before.geometryRevision, revisionAfter: next.geometryRevision,
      lastPointBefore: before.points.at(-1), lastPointAfter: next.points.at(-1),
      observation: next.observations.length > before.observations.length ? next.observations.at(-1) : null,
      activeObservationIds: next.activeObservationIds, closed: next.closed, metrics: metrics(next) });
    await writes.current;
    try { await store.repo!.save(next, kind); }
    catch (error) { await store.log('project_save_failed', { kind, message: String(error) }); throw error; }
    setFrozen(null); setLength(''); setSteps(''); setStepMeasurementId(undefined); setDetectedSteps(undefined); setTurn('0'); setStep('direction'); fit();
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
    setTurn(value); setTurnSide(side); setFineDelta(0);
    try { setSliderBase(headingFromTurn(previous, value, side)); } catch { }
  };
  const switchUnit = (next: 'm' | 'cm') => store.run(async () => { setLength(convertLengthInput(length, unit, next)); setUnit(next); fit(); });
  const nextStep = () => { Keyboard.dismiss(); setStep(step === 'angle' ? 'length' : 'review'); fit(); };
  const back = () => { Keyboard.dismiss(); setStep(step === 'review' ? 'length' : step === 'length' ? 'angle' : 'direction'); };
  const showCamera = step === 'direction' && mode !== 'manual';
  const currentLive = store.live?.sessionId === store.sessionId ? store.live : null;
  const liveTheta = active && currentLive && !needsReference ? first ? 0 : normalize(Math.PI / 2 - currentLive.headingRad + (offset ?? 0)) : undefined;
  const previewTheta = theta ?? (step === 'direction' ? liveTheta : undefined);
  const title = { start: 'Zapisz pierwszy punkt', direction: needsReference ? 'Odtwórz odniesienie' : 'Wskaż kierunek',
    angle: 'Sprawdź kierunek', length: 'Podaj długość', review: `Zapisz punkt P${project.points.length + 1}` }[step];
  const blocked = store.busy || !hydrated || !!draftError || pedometer.walking;
  const turnFields = <>
    {first ? <Text style={s.text}>Pierwszy bok wyznacza kierunek 0° szkicu.</Text> : <>
      <Field label="Kąt skrętu od poprzedniego boku (°)" value={turn} onChangeText={value => updateTurn(value)} numeric onEndEditing={fit} />
      <View style={s.row}><Button secondary={turnSide !== 'left'} label="W lewo" onPress={() => { updateTurn(turn, 'left'); fit(); }} />
        <Button secondary={turnSide !== 'right'} label="W prawo" onPress={() => { updateTurn(turn, 'right'); fit(); }} /></View>
      {!!angleError && <Text accessibilityRole="alert" style={s.warningText}>{angleError}</Text>}
    </>}
  </>;
  return <Page title={project.name} subtitle={`Punkt P${project.points.length} → P${project.points.length + 1} · ${modeLabels[mode]}`}
    compactHeader resetKey={step} footer={<>
    <OutlineCanvas project={project} compact unit={unit} fitKey={fitKey}
      preview={previewTheta === undefined ? undefined : { theta: previewTheta, lengthM: ['length', 'review'].includes(step) ? lengthM : undefined }} />
      {!project.closed && <View style={{ flexDirection: 'row', gap: 10 }}>
        {step !== 'start' && step !== 'direction' && <View style={{ flex: 1 }}><Button label="Wstecz" secondary onPress={back} disabled={blocked} /></View>}
        <View style={{ flex: 2 }}>
          {pedometer.walking ? <Button label="Stop · zakończ liczenie" onPress={() => store.run(async () => { await stopWalking(); })} disabled={store.busy} />
            : step === 'start' ? <Button label="Zapisz punkt P1" onPress={active ? () => setStep('direction') : start} disabled={blocked} />
            : step === 'direction' ? <Button label={!active ? 'Rozpocznij sesję' : needsReference ? 'Ustaw odniesienie' : mode === 'manual' ? 'Ustaw kierunek' : 'Przechwyć kierunek'}
              onPress={active ? capture : start} disabled={blocked || (active && mode !== 'manual' && !permission?.granted)} />
            : step === 'review' ? <Button label="Zapisz punkt" onPress={() => store.run(async () => { await saveCurrent(); })}
              disabled={blocked || !frozenValid || theta === undefined || !measurement} />
            : <Button label={step === 'angle' ? 'Dalej · długość' : 'Sprawdź punkt'} onPress={nextStep}
              disabled={blocked || theta === undefined || (step === 'length' && !measurement)} />}
        </View>
      </View>}
      <Button label={project.closed ? 'Zobacz podsumowanie' : 'Zakończ'} secondary disabled={store.busy || !hydrated}
        onPress={project.closed ? () => router.push({ pathname: '/outline', params: { id } }) : finish} />
    </>}>
    {!!draftError && <View style={s.warning}><Text accessibilityRole="alert" style={s.warningText}>Nie udało się zachować etapu roboczego: {draftError}</Text>
      <Button label="Ponów zapis etapu" secondary onPress={enqueueDraft} /></View>}
    {!!resumeNote && <Text style={s.muted}>{resumeNote}</Text>}
    {project.closed ? <View style={s.card}><Text style={s.h2}>Obrys zamknięty</Text><Text style={s.text}>Otwórz podsumowanie albo cofnij zamknięcie w opcjach pomiaru.</Text></View> :
      <View style={s.card}><Text style={s.eyebrow}>{step === 'start' ? 'POCZĄTEK' : `${['direction', 'angle'].includes(step) ? '1. KIERUNEK' : step === 'length' ? '2. DŁUGOŚĆ' : '3. ZAPIS PUNKTU'}`}</Text>
        <Text style={s.h2}>{title}</Text>
        {step === 'start' && <Text style={s.text}>Stań w miejscu, od którego zaczynasz obrys. P1 będzie początkiem szkicu.</Text>}
        {step === 'direction' && <>
          <Text style={s.muted}>{needsReference ? 'Stań w początku znanego boku i wyceluj w jego koniec. Następnie wróć do aktualnego punktu.' : 'Stań nad początkiem boku i wyceluj w następny narożnik.'}</Text>
          {needsReference && <Button secondary label={`Bok odniesienia: P${anchorIndex + 1} → P${anchorIndex + 2} (zmień)`}
            onPress={() => setAnchorIndex((anchorIndex + 1) % (project.points.length - 1))} />}
          {showCamera && <View style={{ height: 200, backgroundColor: '#172F2A', borderRadius: 14, overflow: 'hidden' }}>
            {permission?.granted ? <CameraView style={{ flex: 1 }} facing="back" active={active} /> :
              <View style={{ padding: 20, gap: 12 }}><Text style={{ color: 'white' }}>Udostępnij kamerę do celowania albo wybierz tryb ręczny w opcjach pomiaru.</Text>
                <Button label="Udostępnij kamerę" disabled={permission?.canAskAgain === false} onPress={() => store.run(async () => { await requestPermission(); })} /></View>}
            {permission?.granted && <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%' }}>
              <View style={{ width: 48, height: 2, left: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
              <View style={{ width: 2, height: 48, top: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
            </View>}
          </View>}
          {mode === 'manual' ? turnFields : <Text style={s.muted}>{active && currentLive ? `Rozrzut ${fmt(currentLive.stdDevDeg)}° · jakość ${currentLive.accuracy}/3 · ${currentLive.ready ? 'okno gotowe' : 'stabilizowanie…'}` : 'Rozpocznij sesję i celuj nieruchomo przez około 2 sekundy.'}</Text>}
        </>}
        {step === 'angle' && <>
          <Text style={s.muted}>Odczyt zatrzymany. Popraw kąt lub przejdź do długości.</Text>{turnFields}
          {!first && mode !== 'manual' && <AngleSlider value={fineDelta} disabled={blocked} onChange={value => {
            setFineDelta(value); const corrected = turnFromHeading(previous, sliderBase + value * Math.PI / 180);
            setTurn(corrected.turn); setTurnSide(corrected.turnSide);
          }} onComplete={fit} />}
          <Button label="Zmierz ponownie" secondary onPress={() => setStep('direction')} disabled={store.busy} />
        </>}
        {step === 'length' && <>
          <Text style={s.muted}>{pedometer.walking ? 'Przejdź do następnego punktu, a następnie zatrzymaj liczenie.' : 'Wpisz długość lub zmierz odcinek krokami.'}</Text>
          <View style={s.row}><Button label="Długość" disabled={pedometer.walking} secondary={lengthSource !== 'manual'} onPress={() => { setLengthSource('manual'); fit(); }} />
            <Button label="Kroki" disabled={pedometer.walking} secondary={lengthSource !== 'steps'} onPress={() => { setLengthSource('steps'); fit(); }} /></View>
          {lengthSource === 'manual' ? <>
            <Field label={`Długość boku (${unit})`} value={length} onChangeText={setLength} numeric placeholder="np. 4,50" onEndEditing={fit} />
            <View style={s.row}><Button label="m" secondary={unit !== 'm'} onPress={() => switchUnit('m')} disabled={store.busy} />
              <Button label="cm" secondary={unit !== 'cm'} onPress={() => switchUnit('cm')} disabled={store.busy} /></View>
          </> : <><Field label="Liczba kroków" value={steps} onChangeText={setSteps} disabled={pedometer.walking} numeric placeholder="np. 6 lub 2,5" onEndEditing={fit} />
            <Field label="Długość kroku (cm)" value={stepLength} onChangeText={setStepLength} disabled={pedometer.walking} numeric onEndEditing={fit} />
            <Text style={s.muted}>Długość oszacowana z kroków</Text>
            {pedometer.walking ? <Text accessibilityLiveRegion="polite" style={s.h2}>{pedometer.reading?.steps ?? 0} kroków · pomiar w toku</Text>
              : store.capabilities?.stepDetector ? <Button label="Start krokomierza" secondary onPress={startWalking} disabled={store.busy || !frozenValid} />
                : <Text style={s.muted}>Ten telefon nie udostępnia detektora kroków. Wpisz ich liczbę ręcznie albo podaj długość.</Text>}
          </>}
          <Text style={s.h2}>{lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>

        </>}
        {step === 'review' && <>
          <Text style={s.text}>Skręt: {first ? '0° · pierwszy bok' : `${turn}° ${turnSide === 'left' ? 'w lewo' : 'w prawo'}`}</Text>
          <Text style={s.h2}>Długość: {lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>
          <Text style={s.muted}>{lengthSource === 'manual' ? 'Długość wpisana ręcznie' : 'Długość oszacowana z wpisanych kroków'}</Text>
          <View style={s.row}><Button secondary label="Popraw kąt" onPress={() => setStep('angle')} /><Button secondary label="Popraw długość" onPress={() => setStep('length')} /></View>
          {project.points.length >= 3 && <Button secondary label="Zapisz jako pomiar powrotu do P1" disabled={blocked || !measurement || theta === undefined}
            onPress={() => store.run(async () => { await saveCurrent(true); })} />}
        </>}
      </View>}

    <Button label={diagnostics ? 'Ukryj opcje pomiaru' : 'Opcje pomiaru i diagnostyka'} secondary onPress={() => setDiagnostics(value => !value)} />
    {diagnostics && <View style={s.card}>
      <Text style={s.h2}>Tryb i kontrola</Text>
      <View style={s.row}>{(['relative', 'manual', 'magnetic'] as SurveyMode[]).map(value => <Button key={value}
        label={modeLabels[value]} secondary={mode !== value} onPress={() => changeMode(value)}
        disabled={store.busy || pedometer.walking || (value !== 'manual' && !store.capabilities?.[value])} />)}</View>
      <Button label={project.closed ? 'Cofnij zamknięcie' : 'Cofnij ostatni bok'} secondary
        disabled={store.busy || pedometer.walking || !active || (!project.closed && project.points.length < 2)}
        onPress={() => store.run(async () => { await persist(undoLast(project), 'undo'); })} />
      {project.closed && !active && <Button label="Rozpocznij sesję do korekty" onPress={start} disabled={store.busy} />}
      <Field label="Otoczenie i uwagi testera" value={contextText} onChangeText={setContextText} />
      <Field label="Pomiar odniesienia i metoda" value={reference} onChangeText={setReference} />
      <Button label="Dopisz kontekst do loga" secondary disabled={!active || store.busy} onPress={() => store.run(async () => {
        await store.log('test_context', { notes: contextText, independentReference: reference || null, geometryRevision: project.geometryRevision });
        Alert.alert('Zapisano', 'Kontekst został dodany do loga sesji.');
      })} />
      <Button label="Otwórz logi projektu" secondary disabled={pedometer.walking} onPress={() => router.push({ pathname: '/logs', params: { projectId: id } })} />
      {active && <Button label="Zatrzymaj sesję czujników" secondary disabled={store.busy} onPress={() => store.run(store.stop)} />}
    </View>}
  </Page>;
}
