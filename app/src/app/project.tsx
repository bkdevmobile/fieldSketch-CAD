import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, Pressable, Text, View } from 'react-native';
import { Dialog, MenuAnchor, PopupMenu, useDialogs } from '../components/overlays';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button, colors, Field, fmt, Page, s } from '../components/ui';
import { AngleSlider } from '../components/AngleSlider';
import { AngleControls } from '../components/AngleControls';
import { FloatingSketch } from '../components/FloatingSketch';
import { StepControls } from '../components/StepControls';
import { SurveyHeading } from '../components/SurveyHeading';
import { Activity, ArrowLeft, ArrowRight, Camera, Check, ChevronDown, CircleAlert, CircleCheck, Compass, Crosshair, EllipsisVertical, Flag, Footprints, MapPin, Pencil, RotateCcw, Ruler, Settings2, SlidersHorizontal, Undo2 } from 'lucide-react-native';
import { Capture, Project, SurveyMode } from '../domain/model';
import { closeOutline, commitMeasurement, LengthMeasurement, measurementLength, metrics, normalize, parsePositive, undoLast } from '../domain/geometry';
import { convertLengthInput, defaultReferenceIndex, headingFromTurn, previousHeading, referenceOffset, snapTurn, SurveyDraft, turnFromHeading, WizardStep } from '../domain/survey';
import { orientation } from '../infrastructure/native';
import { message, useStore } from '../infrastructure/store';
import { usePedometer } from '../infrastructure/usePedometer';
import { captureErrorText } from '../domain/captureError';
import { directionReady } from '../domain/directionReadiness';
import { MeasurementHelp } from '../components/MeasurementHelp';

const modeLabels: Record<SurveyMode, string> = { magnetic: 'Magnetyczny', relative: 'Względny', manual: 'Ręczny' };
interface Frozen { theta: number; capture: Capture | null; sessionId: string; authorizedSessionId?: string }
export default function Survey() {
  const Alert = useDialogs();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), project = store.projects.find(p => p.id === id);
  const preferredMode = store.settings.directionMode;
  const mode: SurveyMode = preferredMode === 'manual' || !store.capabilities || store.capabilities[preferredMode] ? preferredMode : 'manual';
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<WizardStep>('direction');
  const [length, setLength] = useState(''), [steps, setSteps] = useState('');
  const [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [lengthSource, setLengthSource] = useState<'manual' | 'steps'>(store.settings.lengthInput ?? 'steps');
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
  const [help, setHelp] = useState(false), [aimHint, setAimHint] = useState(false);
  const [focused, setFocused] = useState(false), [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [startFailed, setStartFailed] = useState(false);
  const [startAttempt, setStartAttempt] = useState(0);
  const autoAttempt = useRef<string | null>(null);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor>();
  const [hydrated, setHydrated] = useState(false), [draftError, setDraftError] = useState(''), [resumeNote, setResumeNote] = useState('');
  const writes = useRef<Promise<void>>(Promise.resolve());
  const finishing = useRef(false);
  const permissionFlow = useRef(false), permissionResumeSession = useRef<string | null>(null);
  const lastMode = useRef(mode), screenFocused = useRef(focused); screenFocused.current = focused;
  const active = store.sessionProject === id && !!store.sessionId;
  const previous = project ? previousHeading(project) : 0;
  const first = project?.points.length === 1;
  const needsReference = mode !== 'manual' && offset === null && !first;
  const frozenValid = frozen && active && (frozen.authorizedSessionId ?? frozen.sessionId) === store.sessionId;
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
      } else { setStep(project.points.length === 1 ? 'start' : 'direction'); setLengthSource(store.settings.lengthInput ?? 'steps'); setUnit(store.settings.unit); setStepLength(String(store.settings.stepLengthCm)); }
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
    const sub = AppState.addEventListener('change', state => {
      setForeground(state === 'active');
      if (state !== 'active' && hydrated) enqueueDraft();
    });
    return () => sub.remove();
  }, [hydrated]);
  useEffect(() => {
    const modeChanged = lastMode.current !== mode; lastMode.current = mode;
    if (!modeChanged && (permissionFlow.current || (permissionResumeSession.current !== null && permissionResumeSession.current === store.sessionId))) {
      if (store.sessionId === permissionResumeSession.current) permissionResumeSession.current = null;
      setOffset(null); return;
    }
    setFrozen(null); setOffset(null);
    if (project) setAnchorIndex(defaultReferenceIndex(project));
    setStep(current => current === 'start' ? 'start' : 'direction');
  }, [store.sessionId, mode]);
  useEffect(() => { setFitKey(key => key + 1); Keyboard.dismiss(); }, [step]);
  useEffect(() => {
    if (!focused || !foreground) { autoAttempt.current = null; return; }
    if (!project || project.closed || !hydrated || draftError || step !== 'direction' || help || active || store.busy
      || (mode !== 'manual' && !permission?.granted)) return;
    const key = `${id}:${mode}:${startAttempt}`;
    if (autoAttempt.current === key) return;
    autoAttempt.current = key; setStartFailed(false);
    void store.run(async () => {
      try { await store.start(project, mode); }
      catch (error) { setStartFailed(true); throw error; }
    });
  }, [focused, foreground, hydrated, draftError, step, help, active, store.busy, permission?.granted, id, mode, project?.closed, startAttempt]);
  if (!project) return <Page title="Szkic"><Text style={s.text}>Ładowanie szkicu lub szkic został usunięty.</Text></Page>;
  const fit = () => setFitKey(key => key + 1);
  const retryStart = () => { autoAttempt.current = null; setStartFailed(false); setStartAttempt(value => value + 1); };
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
        frameOffset = referenceOffset(project, index, capture.headingRad);
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
    if (!directionReady(store.live, store.sessionId)) throw new Error('Skieruj telefon na narożnik i przytrzymaj go nieruchomo. Zapisz kierunek po pojawieniu się zielonego statusu.');
    let value: Capture;
    try { value = await orientation().captureDirection(); }
    catch (error) {
      try { await store.log('capture_failed', { message: message(error) }); } catch { }
      throw new Error(captureErrorText(error));
    }
    if (value.sessionId !== store.sessionId) throw new Error('Sesja czujnika zmieniła się. Przechwyć kierunek ponownie.');
    if (!value.stable || !directionReady({ ...value, ready: true }, store.sessionId)) {
      await store.log('capture_rejected', { capture: value });
      throw new Error('Telefon poruszył się lub jakość odczytu spadła. Przytrzymaj go nieruchomo i ponów zapis kierunku po zielonym statusie.');
    }
    await acceptCapture(value);
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
    const savedDirection = frozen!;
    permissionFlow.current = true;
    try {
      Keyboard.dismiss();
      await pedometer.start(async () => {
        if (!screenFocused.current || AppState.currentState !== 'active') throw new Error('Wróć do szkicu przed uruchomieniem krokomierza.');
        const session = await store.start(project, mode);
        permissionResumeSession.current = session;
        setFrozen({ ...savedDirection, authorizedSessionId: session });
        // The captured geometry stays in its original frame. The next capture
        // will require a new reference, because the sensor session restarted.
        setOffset(null);
        await store.log('step_permission_session_resumed', { sourceSessionId: savedDirection.sessionId, theta: savedDirection.theta, step: 'length' });
        return session;
      });
      setLengthSource('steps');
    } finally {
      permissionFlow.current = false;
      if (!screenFocused.current || AppState.currentState !== 'active') { setFrozen(null); setStep('direction'); }
    }
  });
  const chooseLengthSource = (source: 'manual' | 'steps') => {
    setLengthSource(source); void store.rememberUi({ lengthInput: source }); fit();
  };
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
  const nextStep = () => {
    if (pedometer.walking || !frozenValid || theta === undefined || (step === 'length' && !measurement)) return;
    if (step === 'angle') applySnap(); Keyboard.dismiss(); setStep(step === 'angle' ? 'length' : 'review'); fit();
  };
  const back = () => { Keyboard.dismiss(); setStep(step === 'review' ? 'length' : step === 'length' ? 'angle' : 'direction'); };
  const showCamera = step === 'direction' && mode !== 'manual';
  const currentLive = store.live?.sessionId === store.sessionId ? store.live : null;
  const readoutReady = active && directionReady(currentLive, store.sessionId);
  const StatusIcon = readoutReady ? CircleCheck : active && currentLive?.ready ? CircleAlert : Compass;
  const statusColor = readoutReady ? colors.ready : active && currentLive?.ready ? colors.amber : colors.muted;
  const statusLabel = !active ? startFailed ? 'Nie udało się przygotować odczytu. Wybierz ponowienie poniżej.' : !permission?.granted ? 'Udostępnij kamerę, aby celować telefonem.' : 'Przygotowywanie odczytu…' : !currentLive?.ready ? 'Przytrzymaj telefon nieruchomo przez około 2 sekundy.' : currentLive.horizontalProjection < 0.2 ? 'Skieruj kamerę na narożnik przed sobą, nie w ziemię.' : readoutReady ? 'Telefon stabilny — możesz zapisać kierunek.' : 'Odczyt nie jest gotowy. Przytrzymaj telefon nieruchomo.';
  const liveTheta = active && currentLive && !needsReference ? first ? 0 : normalize(Math.PI / 2 - currentLive.headingRad + (offset ?? 0)) : undefined;
  const previewTheta = theta ?? (step === 'direction' ? liveTheta : undefined);
  const title = { start: 'Zapisz pierwszy punkt', direction: needsReference ? 'Odtwórz odniesienie' : 'Wskaż kierunek',
    angle: 'Kierunek zapisany', length: 'Podaj długość', review: 'Sprawdź bok przed zapisem' }[step];
  const blocked = store.busy || !hydrated || !!draftError || pedometer.walking;
  const turnFields = <>
    {first ? <Text style={s.text}>Pierwszy bok wyznacza kierunek 0° szkicu.</Text> : <>
      <AngleControls value={turn} side={turnSide} onChange={value => updateTurn(value)} onEndEditing={applySnap}
        disabled={blocked} onSideChange={side => { updateTurn(turn, side); fit(); }} />
      {!!angleError && <Text accessibilityRole="alert" style={s.warningText}>{angleError}</Text>}
    </>}
  </>;
  return <Page title={project.name} subtitle={`Punkt P${project.points.length} → P${project.points.length + 1} · ${modeLabels[mode]}`}
    heading={<SurveyHeading name={project.name} subtitle={`Punkt P${project.points.length} → P${project.points.length + 1} · ${modeLabels[mode]}`} step={step} closed={project.closed} />}
    compactHeader resetKey={step} overlay={step !== 'start' && <FloatingSketch project={project} unit={unit} fitKey={fitKey}
      preview={previewTheta === undefined ? undefined : { theta: previewTheta, lengthM: ['length', 'review'].includes(step) ? lengthM : undefined }} />} footer={<>
      {!project.closed && <View style={{ flexDirection: 'row', gap: 10 }}>
        {step !== 'start' && step !== 'direction' && <View style={{ flex: 1 }}><Button label="Wstecz" icon={ArrowLeft} secondary onPress={back} disabled={blocked} /></View>}
        <View style={{ flex: 2 }}>
          {step === 'start' ? <Button label="Stoję w narożniku · zapisz P1" iconEnd={MapPin} onPress={() => setStep('direction')} disabled={blocked} />
            : step === 'direction' ? <Button label={needsReference ? 'Zapisz odniesienie' : mode === 'manual' ? 'Ustaw kierunek' : 'Zapisz kierunek do narożnika'}
              iconEnd={Crosshair} onPress={capture} disabled={blocked || !active || help || !foreground || !focused || (mode !== 'manual' && (!permission?.granted || !readoutReady))} />
            : step === 'review' ? <Button label="Zapisz punkt" iconEnd={Check} onPress={() => store.run(async () => { await saveCurrent(); })}
              disabled={blocked || !frozenValid || theta === undefined || !measurement} />
            : <Button label={step === 'angle' ? 'Kierunek gotowy · podaj długość' : 'Sprawdź bok'} iconEnd={ArrowRight} onPress={nextStep}
              disabled={blocked || theta === undefined || (step === 'length' && !measurement)} />}
        </View>
      </View>}
      <Button label={project.closed ? 'Zobacz podsumowanie' : 'Zakończ'} icon={Flag} quiet disabled={store.busy || !hydrated}
        onPress={project.closed ? () => router.push({ pathname: '/outline', params: { id } }) : finish} />
    </>}>
    <Stack.Screen options={{ headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Menu szkicu"
      onPress={event => { Keyboard.dismiss(); setMenuAnchor({ x: event.nativeEvent.pageX + 22, y: event.nativeEvent.pageY + 22 }); setMenu(true); }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
      <EllipsisVertical size={22} strokeWidth={1.8} color={colors.ink} accessible={false} /></Pressable> }} />
    <PopupMenu visible={menu} anchor={menuAnchor} title={project.name} onClose={() => setMenu(false)} items={[
      { label: project.closed ? 'Cofnij zamknięcie' : 'Cofnij ostatni bok', icon: Undo2,
        disabled: blocked || (!project.closed && project.points.length < 2), onPress: () => {
          Alert.alert('Cofnąć zapis?', 'Bieżący niezapisany pomiar zostanie odrzucony. Obserwacja źródłowa pozostanie w historii.', [
            { text: 'Anuluj', style: 'cancel' }, { text: 'Cofnij', icon: Undo2, onPress: () => store.run(async () => {
              if (!active) await store.start(project, mode);
              await persist(undoLast(project), 'undo', project, !active);
            }) },
          ]);
        } },
      ...(step === 'review' && project.points.length >= 3 && !project.closed ? [{ label: 'Zapisz jako pomiar powrotu do P1', icon: MapPin,
        disabled: blocked || !frozenValid || !measurement || theta === undefined,
        onPress: () => { void store.run(async () => { await saveCurrent(true); }); } }] : []),
      { label: 'Diagnostyka szkicu', icon: Activity, disabled: blocked, onPress: () => router.push({ pathname: '/diagnostics', params: { id } }) },
      { label: 'Jak wykonać pomiar?', icon: Compass, disabled: pedometer.walking, onPress: () => setHelp(true) },
      { label: 'Ustawienia', icon: Settings2, disabled: blocked, onPress: () => router.push('/settings') },
    ]} />
    {!!draftError && <View style={s.warning}><Text accessibilityRole="alert" style={s.warningText}>Nie udało się zachować etapu roboczego: {draftError}</Text>
      <Button label="Ponów zapis etapu" secondary onPress={enqueueDraft} /></View>}
    {!!resumeNote && <Text style={s.muted}>{resumeNote}</Text>}
    {project.closed ? <View style={s.card}><Text style={s.h2}>Obrys zamknięty</Text><Text style={s.text}>Otwórz podsumowanie albo cofnij zamknięcie w menu szkicu ⋮.</Text></View> :
      <View style={s.measurement}>
        <Text style={s.stepTitle}>{title}</Text>
        {step === 'start' && <MeasurementHelp manual={mode === 'manual'} />}
        {step === 'direction' && <>
          <Text style={s.text}>{needsReference ? `Stań przy P${anchorIndex + 1} i skieruj kamerę na P${anchorIndex + 2}. Zapisz odniesienie, a następnie wróć do P${project.points.length}, aby mierzyć kolejny bok.` : mode === 'manual' ? 'Ustaw skręt względem poprzedniego boku.' : `Stań przy P${project.points.length}. Obróć telefon, aż następny narożnik znajdzie się w celowniku.`}</Text>
          {mode !== 'manual' && <Text style={s.muted}>Celownik jest nieruchomy. Celujesz, obracając telefon — nie przesuwając palcem po ekranie.</Text>}
          <Button label="Jak wykonać pomiar?" icon={Compass} quiet align="start" onPress={() => setHelp(true)} />
          {!active && !store.busy && autoAttempt.current !== null && <Button label="Ponów przygotowanie odczytu" secondary onPress={retryStart} />}
          {needsReference && <Button secondary label={`Bok odniesienia: P${anchorIndex + 1} → P${anchorIndex + 2} (zmień)`}
            onPress={() => setAnchorIndex((anchorIndex + 1) % (project.points.length - 1))} />}
          {mode !== 'manual' && <View accessible accessibilityRole="text" accessibilityLabel={statusLabel} accessibilityLiveRegion="polite"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
            <StatusIcon size={19} strokeWidth={1.8} color={statusColor} accessible={false} />
            <Text style={[s.muted, { flex: 1, color: statusColor, fontWeight: readoutReady ? '600' : '400' }]}>{statusLabel}</Text>
          </View>}
          {aimHint && showCamera && <Text accessibilityRole="alert" style={s.warningText}>Celuj telefonem — celownik się nie przesuwa. Obróć telefon tak, aby narożnik znalazł się na środku obrazu.</Text>}
          {showCamera && <View style={{ height: 212, backgroundColor: colors.ink, borderRadius: 20, overflow: 'hidden' }}>
            {permission?.granted ? <CameraView style={{ flex: 1 }} facing="back" active={active && focused && foreground} /> :
              <View style={{ padding: 20, gap: 12 }}><Text style={{ color: 'white' }}>Udostępnij kamerę do celowania albo wybierz tryb ręczny w ustawieniach.</Text>
                <Button label="Udostępnij kamerę" icon={Camera} disabled={permission?.canAskAgain === false} onPress={() => store.run(async () => { await requestPermission(); })} /></View>}
            {permission?.granted && <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%' }}>
              <View style={{ width: 48, height: 2, left: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
              <View style={{ width: 2, height: 48, top: -24, backgroundColor: '#BAF2CD', position: 'absolute' }} />
            </View>}
            {permission?.granted && <Pressable accessibilityRole="button" accessibilityLabel="Jak ustawić celownik?" onTouchStart={() => setAimHint(true)} onPress={() => setAimHint(true)} style={{ position: 'absolute', inset: 0 }} />}
          </View>}
          {mode === 'manual' && <View style={s.workPanel}>{turnFields}</View>}
        </>}
        {step === 'angle' && <>
          <Text style={s.muted}>Odczyt zatrzymany. Popraw kąt lub przejdź do długości.</Text>
          {(first || (mode !== 'manual' && !correctAngle && !angleError)) && <Text style={s.measureValue}>{first ? '0° · pierwszy bok' : `${turn}° ${turnSide === 'left' ? 'w lewo' : 'w prawo'}`}</Text>}
          {!first && mode !== 'manual' && <Button quiet align="start" icon={SlidersHorizontal} label={correctAngle ? 'Ukryj korektę kąta' : 'Popraw kąt'} onPress={() => { if (correctAngle) applySnap(); setCorrectAngle(value => !value); }} />}
          {(mode === 'manual' || correctAngle || !!angleError) && <View style={s.workPanel}>{turnFields}
          {!first && mode !== 'manual' && correctAngle && <AngleSlider value={fineDelta} disabled={blocked} onChange={value => {
            setFineDelta(value); const corrected = turnFromHeading(previous, sliderBase + value * Math.PI / 180, 5);
            angleEdited.current = false; angleDraft.current = corrected;
            setTurn(corrected.turn); setTurnSide(corrected.turnSide);
          }} onComplete={applySnap} />}</View>}
          <Button label="Zmierz ponownie" icon={RotateCcw} quiet align="start" onPress={() => setStep('direction')} disabled={store.busy} />
        </>}
        {step === 'length' && <>
          <Text style={s.muted}>{pedometer.walking ? 'Idź do narożnika, na który celowałeś. Zatrzymaj się i naciśnij Stop.' : 'Kierunek jest zapisany. Teraz wpisz długość boku lub zmierz ją krokami.'}</Text>
          <View style={s.segment}><View style={{ flex: 1 }}><Button label="Wpisz długość" icon={Ruler} compact disabled={pedometer.walking || store.busy} secondary={lengthSource !== 'manual'} onPress={() => chooseLengthSource('manual')} /></View>
            <View style={{ flex: 1 }}><Button label="Krokomierz" icon={Footprints} compact disabled={pedometer.walking || store.busy} secondary={lengthSource !== 'steps'} onPress={() => chooseLengthSource('steps')} /></View></View>
          <View style={s.workPanel}>
          {lengthSource === 'manual' ? <>
            <Field label={`Długość boku (${unit})`} value={length} onChangeText={setLength} numeric placeholder="np. 4,50" onEndEditing={fit} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Zmień jednostkę długości, aktualnie ${unit}`} disabled={store.busy}
              onPress={() => Alert.alert('Jednostka tego pomiaru', 'Wybierz jednostkę; wpisana długość zostanie przeliczona.', [
                { text: 'Metry', onPress: () => switchUnit('m') }, { text: 'Centymetry', onPress: () => switchUnit('cm') }, { text: 'Anuluj', style: 'cancel' },
              ])} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={s.label}>Jednostka: {unit}</Text><ChevronDown size={16} color={colors.muted} accessible={false} /></Pressable>
          </> : <><Text style={s.text}>Stojąc w początku boku, naciśnij Start. Przejdź do wskazanego narożnika, zatrzymaj się i naciśnij Stop. Dopiero potem sprawdź bok.</Text><StepControls value={steps} onChange={setSteps} onEndEditing={fit} walking={pedometer.walking}
            busy={store.busy} canStart={!!store.capabilities?.stepDetector && !!frozenValid}
            onToggle={pedometer.walking ? () => store.run(async () => { await stopWalking(); }) : startWalking} />
            <Text style={s.muted}>1 krok = {stepLength} cm · długość szacunkowa</Text>
            {pedometer.walking ? <Text accessibilityLiveRegion="polite" style={s.h2}>{pedometer.reading?.steps ?? 0} kroków · pomiar w toku</Text>
              : !store.capabilities?.stepDetector && <Text style={s.muted}>Ten telefon nie udostępnia detektora kroków. Wpisz ich liczbę ręcznie albo podaj długość.</Text>}
          </>}
          <Text style={s.measureValue}>{lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>
          </View>

        </>}
        {step === 'review' && <>
          <Text style={s.text}>Skręt: {first ? '0° · pierwszy bok' : `${turn}° ${turnSide === 'left' ? 'w lewo' : 'w prawo'}`}</Text>
          <Text style={s.measureValue}>{lengthM === undefined ? '—' : `${fmt(lengthM * (unit === 'cm' ? 100 : 1), 2)} ${unit}`}</Text>
          <Text style={s.muted}>{lengthSource === 'manual' ? 'Długość wpisana ręcznie' : 'Długość oszacowana z wpisanych kroków'}</Text>
          <View style={s.row}><Button secondary icon={Pencil} label="Popraw kąt" onPress={() => { setCorrectAngle(true); setStep('angle'); }} /><Button secondary icon={Ruler} label="Popraw długość" onPress={() => setStep('length')} /></View>
        </>}
      </View>}

    <Dialog visible={help} title="Jak wykonać pomiar?" onClose={() => setHelp(false)} footer={<Button label="Rozumiem · wróć do pomiaru" onPress={() => setHelp(false)} />}>
      <MeasurementHelp manual={mode === 'manual'} />
    </Dialog>
  </Page>;
}
