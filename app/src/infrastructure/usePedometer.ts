import { t } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { orientation, StepSample } from './native';
import { prepareStepSession } from '../domain/stepPermission';
import { hasStepPermission } from './stepPermission';

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
    if (!expectedSession) throw new Error(t("Rozpocznij sesję i przechwyć kierunek."));
    // Never open a permission dialog after capturing a direction: it can
    // restart the relative sensor frame. Permission is requested at survey start.
    const prepared = await prepareStepSession(expectedSession, hasStepPermission,
      () => current.current.sessionId, recoverSession && (async () => {
      if (!alive.current || AppState.currentState !== 'active') throw new Error(t("Pomiar kroków anulowany po opuszczeniu aplikacji."));
      return recoverSession();
    }));
    expectedSession = prepared.sessionId;
    if (!alive.current || AppState.currentState !== 'active') throw new Error(t("Wróć do aplikacji przed uruchomieniem krokomierza."));
    const result = await orientation().startStepMeasurement(expectedSession);
    if (!alive.current || AppState.currentState !== 'active' || (!prepared.recovered && current.current.sessionId !== expectedSession)) {
      await orientation().stopStepMeasurement(result.measurementId);
      throw new Error(t("Pomiar kroków anulowany po opuszczeniu sesji."));
    }
    current.current.reading = result; setReading(result); return result;
  };
  const stop = async () => {
    const measurementId = current.current.reading?.measurementId;
    if (!measurementId) throw new Error(t("Brak pomiaru kroków do zatrzymania."));
    const result = await orientation().stopStepMeasurement(measurementId);
    if (result.measurementId !== current.current.reading?.measurementId) throw new Error(t("Pomiar kroków zmienił się. Sprawdź odległość."));
    current.current.reading = result; setReading(result); return result;
  };
  return { reading, walking: !!reading?.active && reading.sessionId === sessionId, start, stop };
}
