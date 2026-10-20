interface DirectionSample {
  sessionId: string; ready: boolean; horizontalProjection: number; accuracy: number; stdDevDeg: number;
}
export function directionReady(sample: DirectionSample | null, sessionId: string | null) {
  return !!sample && !!sessionId && sample.sessionId === sessionId && sample.ready
    && Number.isFinite(sample.horizontalProjection) && sample.horizontalProjection >= 0.2
    && sample.accuracy >= 2 && Number.isFinite(sample.stdDevDeg) && sample.stdDevDeg <= 3;
}
