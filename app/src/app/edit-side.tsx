import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, fmt, Page, s } from '../components/ui';
import { OutlineCanvas } from '../components/OutlineCanvas';
import { AngleControls } from '../components/AngleControls';
import { AngleSlider } from '../components/AngleSlider';
import { Segments } from '../components/presentation';
import { Check } from 'lucide-react-native';
import { editLastSide, lastSide, LengthMeasurement, measurementLength, parsePositive } from '../domain/geometry';
import { convertLengthInput, headingFromTurn, previousHeading, snapTurn, turnFromHeading } from '../domain/survey';
import { useStore } from '../infrastructure/store';

export default function EditSide() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), project = store.projects.find(p => p.id === id);
  const original = project && lastSide(project);
  const [length, setLength] = useState(''), [unit, setUnit] = useState<'m' | 'cm'>('m');
  const [source, setSource] = useState<'manual' | 'steps'>('manual'), [steps, setSteps] = useState('');
  const [stepLength, setStepLength] = useState('75');
  const [turn, setTurn] = useState('0'), [side, setSide] = useState<'left' | 'right'>('left');
  const [fitKey, setFitKey] = useState(0);
  const [delta, setDelta] = useState(0), sliderBase = useRef(0);
  const angleEdited = useRef(false), turnDraft = useRef(turn);
  turnDraft.current = turn;
  useEffect(() => {
    if (!project || !original) return;
    setLength(String(original.lengthM).replace('.', ','));
    setSource(original.lengthSource === 'manual' ? 'manual' : 'steps');
    setSteps(String(original.stepCount ?? '')); setStepLength(String(original.stepLengthCm ?? store.settings.stepLengthCm));
    const previous = previousHeading({ ...project, points: project.points.slice(0, -1) });
    const values = turnFromHeading(previous, original.theta); setTurn(values.turn); setSide(values.turnSide);
    sliderBase.current = Number(values.turn.replace(',', '.')); setDelta(0);
  }, [original?.id]);
  if (!project || !original || project.closureObservationId) return <Page title="Korekta boku">
    <Text style={s.text}>{project?.closureObservationId ? 'Najpierw cofnij niezależny pomiar zamknięcia w projekcie.' : 'Brak boku do poprawienia.'}</Text>
  </Page>;
  let preview = project, valid = false, error = '';
  let measurement: LengthMeasurement | undefined, theta = 0;
  try {
    measurement = source === 'manual' ? { source: 'manual', value: parsePositive(length), unit }
      : { source: 'steps', steps: parsePositive(steps), stepLengthCm: parsePositive(stepLength) };
    theta = project.points.length === 2 ? original.theta : headingFromTurn(previousHeading({ ...project, points: project.points.slice(0, -1) }), turn, side);
    preview = editLastSide(project, measurement, theta); valid = true;
  } catch (e) { error = e instanceof Error ? e.message : String(e); }
  const applySnap = () => {
    let value = turnDraft.current;
    if (angleEdited.current) {
      try { value = snapTurn(value, store.settings.angleSnap); setTurn(value); turnDraft.current = value; angleEdited.current = false; } catch { }
    }
    setFitKey(v => v + 1); return value;
  };
  const save = () => store.run(async () => {
    if (!measurement || !valid) throw new Error('Uzupełnij poprawny kąt i długość.');
    const selectedTurn = applySnap();
    const selectedTheta = project.points.length === 2 ? original.theta : headingFromTurn(previousHeading({ ...project, points: project.points.slice(0, -1) }), selectedTurn, side);
    const next = editLastSide(project, measurement, selectedTheta);
    const opened = store.sessionProject !== id || !store.sessionId;
    if (opened) await store.start(project, 'manual');
    try {
      await store.log('side_corrected_intent', { revisionBefore: project.geometryRevision, observation: next.observations.at(-1) });
      await store.repo!.save(next, 'side_corrected'); await store.refresh();
      await store.log('side_corrected_committed', { geometryRevision: next.geometryRevision });
    } finally { if (opened) await store.stop(); }
    router.replace({ pathname: '/outline', params: { id } });
  });
  return <Page title="Popraw ostatni bok" subtitle={`P${project.points.length - 1} → P${project.points.length}`} compactHeader
    footer={<><Button label="Zapisz poprawki" icon={Check} onPress={save} disabled={store.busy || !valid} />
      <Button label="Anuluj" quiet onPress={() => router.back()} disabled={store.busy} /></>}>
    <View style={s.card}>
      {project.points.length === 2 ? <Text style={s.text}>Pierwszy bok zachowuje kierunek odniesienia.</Text> : <>
        <AngleControls label="Kąt skrętu (°)" value={turn} side={side} disabled={store.busy}
          onChange={value => { angleEdited.current = true; turnDraft.current = value; setTurn(value); setDelta(0); sliderBase.current = Number(value.replace(',', '.')) || 0; }} onEndEditing={() => {
            const value = applySnap(); sliderBase.current = Number(value.replace(',', '.')) || 0; setDelta(0);
          }}
          onSideChange={value => { setSide(value); setFitKey(v => v + 1); }} />
        <AngleSlider value={delta} disabled={store.busy} onChange={value => {
          angleEdited.current = false; setDelta(value);
          const next = String(Math.max(0, Math.min(180, Math.round((sliderBase.current + value) / 5) * 5)));
          turnDraft.current = next; setTurn(next);
        }} onComplete={() => setFitKey(v => v + 1)} />
      </>}
      <Segments<'manual' | 'steps'> label="Źródło długości" value={source} options={[{ value: 'manual', label: 'Długość' }, { value: 'steps', label: 'Kroki' }]} onChange={next => {
        if (source === 'steps' && next === 'manual') { try { setLength(String(measurementLength({ source: 'steps', steps: parsePositive(steps), stepLengthCm: parsePositive(stepLength) }).lengthM * (unit === 'cm' ? 100 : 1)).replace('.', ',')); } catch { } }
        setSource(next);
      }} />
      {source === 'manual' ? <><Field label={`Długość boku (${unit})`} numeric value={length} onChangeText={setLength} onEndEditing={() => setFitKey(v => v + 1)} />
        <Segments<'m' | 'cm'> label="Jednostka długości" value={unit} options={[{ value: 'm', label: 'm' }, { value: 'cm', label: 'cm' }]}
          onChange={next => { void store.run(async () => { setLength(convertLengthInput(length, unit, next)); setUnit(next); }); }} /></>
        : <><Field label="Liczba kroków" numeric value={steps} onChangeText={setSteps} onEndEditing={() => setFitKey(v => v + 1)} />
          <Field label="Długość kroku dla tego boku (cm)" numeric value={stepLength} onChangeText={setStepLength} onEndEditing={() => setFitKey(v => v + 1)} /></>}
      {!!error && <Text style={s.warningText}>{error}</Text>}
      {valid && measurement && <Text style={s.measureValue}>{fmt(measurementLength(measurement).lengthM, 2)} m</Text>}
    </View>
    <OutlineCanvas project={preview} fitKey={fitKey} />
    <Text style={s.muted}>Wcześniejsze punkty pozostają na miejscu. Zmieniasz końcowy punkt boku; pomiar źródłowy pozostaje w historii.</Text>
  </Page>;
}
