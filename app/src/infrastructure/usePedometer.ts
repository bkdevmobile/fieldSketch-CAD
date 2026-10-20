import { useEffect, useRef, useState } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { orientation, StepSample } from './native';
import { prepareStepSession } from '../domain/stepPermission';

async function waitForActiveApp() {
  if (AppState.currentState === 'active') return;
  await new Promise<void>((resolve, reject) => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') { clearTimeout(timeout); listener.remove(); resolve(); }
    });
    const timeout = setTimeout(() => { listener.remove(); reject(new Error('Wróć do aplikacji i ponów Start krokomierza.')); }, 2000);
  });
}

export function usePedometer(sessionId: string | null) {
  const [reading, setReading] = useState<StepSample | null>(null);
  const alive = useRef(true);
  const current = useRef({ sessionId, reading }); current.current = { sessionId, reading };
  useEffect(() => {
    alive.current = true;
    let listener: { remove(): void } | undefined;
    try {
      listener = orientation().addListener('stepSample', sample => {
        const active = current.current;
        if (sample.sessionId === active.sessionId && sample.measurementId === active.reading?.measurementId) {
          current.current.reading = sample; setReading(sample);
        }
      });
    } catch { /* The app's native capability check reports a missing module. */ }
    return () => {
      alive.current = false;
      listener?.remove();
      if (current.current.reading?.active) void orientation().stopStepMeasurement(current.current.reading.measurementId).catch(() => {});
    };
  }, []);
  useEffect(() => { setReading(value => value?.sessionId === sessionId ? value : null); }, [sessionId]);
  const start = async (recoverSession?: () => Promise<string>) => {
    let expectedSession = current.current.sessionId;
    if (!expectedSession) throw new Error('Rozpocznij sesję i przechwyć kierunek.');
    let prompted = false;
    const prepared = await prepareStepSession(expectedSession, async () => {
      if (Platform.OS !== 'android' || Number(Platform.Version) < 29) return true;
      const permission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
      if (await PermissionsAndroid.check(permission)) return true;
      prompted = true;
      const granted = await PermissionsAndroid.request(permission) === PermissionsAndroid.RESULTS.GRANTED;
      await waitForActiveApp();
      return granted;
    }, () => prompted ? null : current.current.sessionId, recoverSession && (async () => {
      if (!alive.current || AppState.currentState !== 'active') throw new Error('Pomiar kroków anulowany po opuszczeniu aplikacji.');
      return recoverSession();
    }));
    expectedSession = prepared.sessionId;
    if (!alive.current || AppState.currentState !== 'active') throw new Error('Wróć do aplikacji przed uruchomieniem krokomierza.');
    const result = await orientation().startStepMeasurement(expectedSession);
    if (!alive.current || AppState.currentState !== 'active' || (!prepared.recovered && current.current.sessionId !== expectedSession)) {
      await orientation().stopStepMeasurement(result.measurementId);
      throw new Error('Pomiar kroków anulowany po opuszczeniu sesji.');
    }
    current.current.reading = result; setReading(result); return result;
  };
  const stop = async () => {
    const measurementId = current.current.reading?.measurementId;
    if (!measurementId) throw new Error('Brak pomiaru kroków do zatrzymania.');
    const result = await orientation().stopStepMeasurement(measurementId);
    if (result.measurementId !== current.current.reading?.measurementId) throw new Error('Pomiar kroków zmienił się. Sprawdź odległość.');
    current.current.reading = result; setReading(result); return result;
  };
  return { reading, walking: !!reading?.active && reading.sessionId === sessionId, start, stop };
}
