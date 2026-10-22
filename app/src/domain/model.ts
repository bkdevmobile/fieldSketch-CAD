export type SurveyMode = 'magnetic' | 'relative' | 'manual';
export interface Point { id: string; x: number; y: number }
export interface Capture {
  headingRad: number; stdDevDeg: number; accuracy: number; sampleCount: number;
  horizontalProjection: number; stable: boolean; sessionId: string; timestampUtc: string;
}
export interface Observation {
  id: string; kind: 'side' | 'closure'; fromPointId: string; toPointId: string;
  lengthSource?: 'steps' | 'manual';
  stepCount: number | null; stepLengthCm: number | null; lengthCm: number; lengthM: number;
  capturedTheta?: number;
  supersedesId?: string;
  stepMeasurementId?: string;
  detectedSteps?: number;
  theta: number; mode: SurveyMode; referenceFrameId: string; capture: Capture | null;
  predictedEnd: Point; createdAt: string;
}
export interface Project {
  note?: string; pinned?: boolean;
  id: string; schemaVersion: 1; name: string; createdAt: string; updatedAt: string;
  geometryRevision: number; mode: SurveyMode; points: Point[]; observations: Observation[];
  activeObservationIds: string[]; closed: boolean; closureObservationId: string | null;
}
export const STEP_LENGTH_CM = 75;
export type AngleSnap = 0 | 5 | 10 | 90;
export type ThemePreference = 'light' | 'dark' | 'system';
export interface UserSettings { unit: import('./units').LengthUnit; stepLengthCm: number; angleSnap: AngleSnap; directionMode: SurveyMode;
  theme?: ThemePreference; sketchDocked?: boolean;
  sketchCorner?: import('./floatingSketch').SketchCorner; lengthInput?: 'manual' | 'steps'; language?: import('../i18n').LanguagePreference }
export const DEFAULT_SETTINGS: UserSettings = { unit: 'm', stepLengthCm: STEP_LENGTH_CM, angleSnap: 90, directionMode: 'relative', sketchCorner: 'bottom-right', sketchDocked: true, lengthInput: 'steps', language: 'system', theme: 'system' };
export const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export function newProject(name: string, mode: SurveyMode): Project {
  const now = new Date().toISOString();
  return { id: id(), schemaVersion: 1, name: name.trim(), createdAt: now, updatedAt: now,
    geometryRevision: 0, mode, points: [{ id: id(), x: 0, y: 0 }], observations: [],
    activeObservationIds: [], closed: false, closureObservationId: null };
}
