import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { orientation, StepSample } from './native';

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
  useEffect(() => { setReading(null); }, [sessionId]);
  const start = async () => {
    const expectedSession = current.current.sessionId;
    if (!expectedSession) throw new Error('Rozpocznij sesję i przechwyć kierunek.');
    if (Platform.OS === 'android' && Number(Platform.Version) >= 29) {
      const permission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
      const granted = await PermissionsAndroid.check(permission) || await PermissionsAndroid.request(permission) === PermissionsAndroid.RESULTS.GRANTED;
      if (!granted) throw new Error('Brak zgody na krokomierz. Możesz wpisać długość lub liczbę kroków ręcznie.');
    }
    if (!alive.current || current.current.sessionId !== expectedSession) throw new Error('Sesja zmieniła się. Przechwyć kierunek ponownie.');
    const result = await orientation().startStepMeasurement(expectedSession);
    if (!alive.current || current.current.sessionId !== expectedSession) {
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
