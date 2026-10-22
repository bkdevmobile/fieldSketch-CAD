import { LENGTH_UNITS, LengthUnit, fromMetres } from '../domain/units';
import { useTheme, Button, Field, fmt, Page } from '../components/ui';
import { t } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { AngleControls } from '../components/AngleControls';
import { AngleSlider } from '../components/AngleSlider';
import { Segments } from '../components/presentation';
import { Check } from 'lucide-react-native';
import { editLastSide, lastSide, LengthMeasurement, measurementLength, parsePositive } from '../domain/geometry';
import { convertLengthInput, headingFromTurn, previousHeading, snapTurn, turnFromHeading } from '../domain/survey';
import { decimalText } from '../domain/precision';
import { useStore } from '../infrastructure/store';

export default function EditSide() {
  const { s } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), project = store.projects.find(p => p.id === id);
  const original = project && lastSide(project);
  const [length, setLength] = useState(''), [unit, setUnit] = useState<LengthUnit>('m');
  const [source, setSource] = useState<'manual' | 'steps'>('manual'), [steps, setSteps] = useState('');
  const [stepLength, setStepLength] = useState('75');
  const [turn, setTurn] = useState('0'), [side, setSide] = useState<'left' | 'right'>('left');
  const [fitKey, setFitKey] = useState(0);
  const [delta, setDelta] = useState(0), sliderBase = useRef(0);
  const lengthTouched = useRef(false), angleTouched = useRef(false);
  const angleEdited = useRef(false), turnDraft = useRef(turn);
  turnDraft.current = turn;
  useEffect(() => {
    if (!project || !original) return;
    lengthTouched.current = false; angleTouched.current = false;
    setUnit(store.settings.unit);
    setLength(decimalText(fromMetres(original.lengthM, store.settings.unit), 3).replace('.', ','));
    setSource(original.lengthSource === 'manual' ? 'manual' : 'steps');
    setSteps(String(original.stepCount ?? '')); setStepLength(decimalText(original.stepLengthCm ?? store.settings.stepLengthCm, 3));
    const previous = previousHeading({ ...project, points: project.points.slice(0, -1) });
    const values = turnFromHeading(previous, original.theta); setTurn(values.turn); setSide(values.turnSide);
    sliderBase.current = Number(values.turn.replace(',', '.')); setDelta(0);
  }, [original?.id]);
  if (!project || !original || project.closureObservationId) return <Page title={t("Korekta boku")}>
    <Text style={s.text}>{project?.closureObservationId ? t("Najpierw cofnij niezależny pomiar zamknięcia w projekcie.") : t("Brak boku do poprawienia.")}</Text>
  </Page>;
  let preview = project, valid = false, error = '';
  let measurement: LengthMeasurement | undefined, theta = 0;
  try {
    measurement = !lengthTouched.current ? (original.lengthSource === 'manual'
      ? { source: 'manual', value: original.lengthM, unit: 'm' }
      : { source: 'steps', steps: original.stepCount!, stepLengthCm: original.stepLengthCm! }) : source === 'manual' ? { source: 'manual', value: parsePositive(length, 3), unit }
      : { source: 'steps', unit, steps: parsePositive(steps), stepLengthCm: parsePositive(stepLength) };
    theta = !angleTouched.current || project.points.length === 2 ? original.theta : headingFromTurn(previousHeading({ ...project, points: project.points.slice(0, -1) }), turn, side);
    preview = editLastSide(project, measurement, theta, !lengthTouched.current); valid = true;
  } catch (e) { error = e instanceof Error ? e.message : String(e); }
  const applySnap = () => {
    let value = turnDraft.current;
    if (angleEdited.current) {
      try { value = snapTurn(value, store.settings.angleSnap); setTurn(value); turnDraft.current = value; angleEdited.current = false; } catch { }
    }
    setFitKey(v => v + 1); return value;
  };
  const save = () => store.run(async () => {
    if (!measurement || !valid) throw new Error(t("Uzupełnij poprawny kąt i długość."));
    const selectedTurn = applySnap();
    const selectedTheta = !angleTouched.current || project.points.length === 2 ? original.theta : headingFromTurn(previousHeading({ ...project, points: project.points.slice(0, -1) }), selectedTurn, side);
    const next = editLastSide(project, measurement, selectedTheta, !lengthTouched.current);
    const opened = store.sessionProject !== id || !store.sessionId;
    if (opened) await store.start(project, 'manual');
    try {
      await store.log('side_corrected_intent', { revisionBefore: project.geometryRevision, observation: next.observations.at(-1) });
      await store.repo!.save(next, 'side_corrected', store.plan); await store.refresh();
      await store.log('side_corrected_committed', { geometryRevision: next.geometryRevision });
    } finally { if (opened) await store.stop(); }
    router.replace({ pathname: '/outline', params: { id } });
  });
  return <Page title={t("Popraw ostatni bok")} subtitle={`P${project.points.length - 1} → P${project.points.length}`} compactHeader
    footer={<><Button label={t("Zapisz poprawki")} icon={Check} onPress={save} disabled={store.busy || !valid} />
      <Button label={t("Anuluj")} quiet onPress={() => router.back()} disabled={store.busy} /></>}>
    <View style={s.card}>
      {project.points.length === 2 ? <Text style={s.text}>{t("Pierwszy bok zachowuje kierunek odniesienia.")}</Text> : <>
        <AngleControls label={t("Kąt skrętu (°)")} value={turn} side={side} disabled={store.busy}
          onChange={value => { angleTouched.current = true; angleEdited.current = true; turnDraft.current = value; setTurn(value); setDelta(0); sliderBase.current = Number(value.replace(',', '.')) || 0; }} onEndEditing={() => {
            const value = applySnap(); sliderBase.current = Number(value.replace(',', '.')) || 0; setDelta(0);
          }}
          onSideChange={value => { angleTouched.current = true; setSide(value); setFitKey(v => v + 1); }} />
        <AngleSlider value={delta} disabled={store.busy} onChange={value => {
          angleTouched.current = true; angleEdited.current = false; setDelta(value);
          const next = String(Math.max(0, Math.min(180, Math.round((sliderBase.current + value) / 5) * 5)));
          turnDraft.current = next; setTurn(next);
        }} onComplete={() => setFitKey(v => v + 1)} />
      </>}
      <Segments<'manual' | 'steps'> label={t("Źródło długości")} value={source} options={[{ value: 'manual', label: t("Długość") }, { value: 'steps', label: t('Kroki') }]} onChange={next => {
        lengthTouched.current = true;
        if (source === 'steps' && next === 'manual') { try { setLength(decimalText(measurementLength({ source: 'steps', steps: parsePositive(steps), stepLengthCm: parsePositive(stepLength) }).lengthM * (fromMetres(1, unit)), 3).replace('.', ',')); } catch { } }
        setSource(next);
      }} />
      {source === 'manual' ? <><Field label={t("Długość boku ({0})", [unit])} numeric decimalPlaces={3} value={length} onChangeText={value => { lengthTouched.current = true; setLength(value); }} onEndEditing={() => setFitKey(v => v + 1)} />
        <Segments<LengthUnit> label={t("Jednostka długości")} value={unit} options={LENGTH_UNITS.map(value => ({ value, label: value }))}
          onChange={next => { void store.run(async () => { lengthTouched.current = true; setLength(convertLengthInput(length, unit, next)); setUnit(next); }); }} /></>
        : <><Field label={t("Liczba kroków")} numeric value={steps} onChangeText={value => { lengthTouched.current = true; setSteps(value); }} onEndEditing={() => setFitKey(v => v + 1)} />
          <Field label={t("Długość kroku dla tego boku (cm)")} numeric decimalPlaces={3} value={stepLength} onChangeText={value => { lengthTouched.current = true; setStepLength(value); }} onEndEditing={() => setFitKey(v => v + 1)} /></>}
      {!!error && <Text style={s.warningText}>{error}</Text>}
      {valid && measurement && <Text style={s.measureValue}>{fmt(fromMetres(lengthTouched.current ? measurementLength(measurement).lengthM : original.lengthM, unit), 3)} {unit}</Text>}
    </View>
    <OutlineCanvas project={preview} fitKey={fitKey} unit={unit} />
    <Text style={s.muted}>{t("Wcześniejsze punkty pozostają na miejscu. Zmieniasz końcowy punkt boku; pomiar źródłowy pozostaje w historii.")}</Text>
  </Page>;
}
