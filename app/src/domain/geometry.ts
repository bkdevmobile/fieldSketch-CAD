import { t } from '../i18n';
import { Capture, id, Observation, Point, Project, STEP_LENGTH_CM, SurveyMode } from './model';
export function parsePositive(input: string): number {
  const normalized = input.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) throw new Error(t("Wpisz dodatnią liczbę, np. 2,5."));
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) throw new Error(t("Wartość musi być dodatnia i skończona."));
  return value;
}
export function stepsToLength(steps: number, stepLengthCm = STEP_LENGTH_CM) {
  if (![steps, stepLengthCm].every(v => Number.isFinite(v) && v > 0) || !Number.isFinite(steps * stepLengthCm))
    throw new Error(t("Nieprawidłowa liczba lub długość kroków."));
  return { lengthCm: steps * stepLengthCm, lengthM: steps * stepLengthCm / 100 };
}
export const normalize = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function circularStats(angles: number[]) {
  if (!angles.length || angles.some(a => !Number.isFinite(a))) throw new Error(t("Brak poprawnych próbek."));
  const x = angles.reduce((s, a) => s + Math.cos(a), 0) / angles.length;
  const y = angles.reduce((s, a) => s + Math.sin(a), 0) / angles.length;
  const r = Math.min(1, Math.hypot(x, y));
  return { mean: Math.atan2(y, x), stdDev: r < 1e-12 ? Infinity : Math.sqrt(-2 * Math.log(r)) };
}
export function nextPoint(origin: Point, lengthM: number, theta: number): Point {
  const p = { id: id(), x: origin.x + lengthM * Math.cos(theta), y: origin.y + lengthM * Math.sin(theta) };
  if (![p.x, p.y].every(Number.isFinite)) throw new Error(t("Współrzędne poza zakresem obliczeń."));
  return p;
}
export function commitSide(project: Project, steps: number, theta: number, mode: SurveyMode,
  referenceFrameId: string, capture: Capture | null, closure = false): Project {
  return commitMeasurement(project, { source: 'steps', steps, stepLengthCm: STEP_LENGTH_CM }, theta, mode, referenceFrameId, capture, closure);
}
export type LengthMeasurement = { source: 'manual'; value: number; unit: 'm' | 'cm' }
  | { source: 'steps'; steps: number; stepLengthCm: number; measurementId?: string; detectedSteps?: number };
export function measurementLength(measurement: LengthMeasurement) {
  if (measurement.source === 'steps') return stepsToLength(measurement.steps, measurement.stepLengthCm);
  if (!Number.isFinite(measurement.value) || measurement.value <= 0) throw new Error(t("Nieprawidłowa długość."));
  const lengthM = measurement.unit === 'cm' ? measurement.value / 100 : measurement.value;
  if (!Number.isFinite(lengthM * 100) || lengthM <= 0) throw new Error(t("Długość poza zakresem obliczeń."));
  return { lengthM, lengthCm: lengthM * 100 };
}
export function commitMeasurement(project: Project, measurement: LengthMeasurement, theta: number, mode: SurveyMode,
  referenceFrameId: string, capture: Capture | null, closure = false, capturedTheta?: number): Project {
  if (project.closed) throw new Error(t("Najpierw cofnij zamknięcie obrysu."));
  if (!Number.isFinite(theta)) throw new Error(t("Nieprawidłowy kierunek."));
  if (capturedTheta !== undefined && !Number.isFinite(capturedTheta)) throw new Error(t("Nieprawidłowy kierunek źródłowy."));
  if (closure && project.points.length < 3) throw new Error(t("Zamknięcie wymaga co najmniej trzech punktów."));
  const from = project.points[project.points.length - 1]!;
  const length = measurementLength(measurement);
  const predictedEnd = nextPoint(from, length.lengthM, theta);
  const observation: Observation = { id: id(), kind: closure ? 'closure' : 'side', fromPointId: from.id,
    toPointId: closure ? project.points[0]!.id : predictedEnd.id, lengthSource: measurement.source,
    stepCount: measurement.source === 'steps' ? measurement.steps : null,
    stepLengthCm: measurement.source === 'steps' ? measurement.stepLengthCm : null,
    ...(measurement.source === 'steps' && measurement.measurementId ? { stepMeasurementId: measurement.measurementId, detectedSteps: measurement.detectedSteps } : {}),
    ...length, theta: normalize(theta), mode,
    ...(capturedTheta === undefined ? {} : { capturedTheta }),
    referenceFrameId, capture, predictedEnd, createdAt: new Date().toISOString() };
  return { ...project, mode, geometryRevision: project.geometryRevision + 1, updatedAt: observation.createdAt,
    points: closure ? project.points : [...project.points, predictedEnd],
    observations: [...project.observations, observation], activeObservationIds: [...project.activeObservationIds, observation.id],
    closed: closure, closureObservationId: closure ? observation.id : null };
}
export function closeOutline(project: Project): Project {
  if (project.points.length < 3 || project.closed) throw new Error(t("Potrzeba otwartego obrysu z minimum trzema punktami."));
  return { ...project, closed: true, updatedAt: new Date().toISOString(), geometryRevision: project.geometryRevision + 1 };
}
export function undoLast(project: Project): Project {
  if (project.closed) return { ...project, closed: false, closureObservationId: null,
    activeObservationIds: project.closureObservationId ? project.activeObservationIds.filter(x => x !== project.closureObservationId) : project.activeObservationIds,
    updatedAt: new Date().toISOString(), geometryRevision: project.geometryRevision + 1 };
  if (project.points.length < 2) throw new Error(t("Brak boku do cofnięcia."));
  return { ...project, points: project.points.slice(0, -1), activeObservationIds: project.activeObservationIds.slice(0, -1),
    updatedAt: new Date().toISOString(), geometryRevision: project.geometryRevision + 1 };
}
export function lastSide(project: Project): Observation | undefined {
  return project.observations.find(o => o.id === project.activeObservationIds.at(-1) && o.kind === 'side');
}
export function editLastSide(project: Project, measurement: LengthMeasurement, theta: number): Project {
  const original = lastSide(project);
  if (!original || project.points.length < 2) throw new Error(t("Brak ostatniego boku do poprawienia."));
  if (project.closureObservationId) throw new Error(t("Najpierw cofnij niezależny pomiar zamknięcia."));
  if (!Number.isFinite(theta)) throw new Error(t("Nieprawidłowy kierunek."));
  const length = measurementLength(measurement);
  const from = project.points.at(-2)!, oldEnd = project.points.at(-1)!;
  const end = { ...nextPoint(from, length.lengthM, theta), id: oldEnd.id };
  const observation: Observation = { ...original, id: id(), supersedesId: original.id,
    capturedTheta: original.capturedTheta ?? original.theta, theta: normalize(theta), ...length,
    lengthSource: measurement.source, stepCount: measurement.source === 'steps' ? measurement.steps : null,
    stepLengthCm: measurement.source === 'steps' ? measurement.stepLengthCm : null,
    predictedEnd: end, createdAt: new Date().toISOString() };
  return { ...project, points: [...project.points.slice(0, -1), end],
    observations: [...project.observations, observation], activeObservationIds: [...project.activeObservationIds.slice(0, -1), observation.id],
    geometryRevision: project.geometryRevision + 1, updatedAt: observation.createdAt };
}
const cross = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
function onSegment(a: Point, b: Point, p: Point) {
  return Math.abs(cross(a, b, p)) < 1e-9 && p.x >= Math.min(a.x, b.x) - 1e-9 && p.x <= Math.max(a.x, b.x) + 1e-9
    && p.y >= Math.min(a.y, b.y) - 1e-9 && p.y <= Math.max(a.y, b.y) + 1e-9;
}
function intersect(a: Point, b: Point, c: Point, d: Point) {
  const u = cross(a, b, c), v = cross(a, b, d), w = cross(c, d, a), z = cross(c, d, b);
  return (u * v < 0 && w * z < 0) || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}
// A measured return to the start is a valid polygon endpoint, not another edge.
// Only collapse numerical coincidence; never snap a real closure error silently.
export function outlinePoints(points: Point[], closed: boolean): Point[] {
  return closed && points.length > 3 && distance(points[0]!, points.at(-1)!) <= 1e-7 ? points.slice(0, -1) : points;
}
export function selfIntersects(input: Point[], closed: boolean): boolean {
  const points = outlinePoints(input, closed);
  const edges = closed ? points.length : points.length - 1;
  for (let i = 0; i < edges; i++) for (let j = i + 1; j < edges; j++) {
    if (j === i + 1 || (closed && i === 0 && j === edges - 1)) continue;
    if (intersect(points[i]!, points[(i + 1) % points.length]!, points[j]!, points[(j + 1) % points.length]!)) return true;
  }
  return false;
}
export function metrics(project: Project) {
  const p = outlinePoints(project.points, project.closed); let perimeter = 0, signed = 0;
  for (let i = 0; i < p.length - (project.closed ? 0 : 1); i++) {
    const a = p[i]!, b = p[(i + 1) % p.length]!;
    perimeter += distance(a, b); signed += a.x * b.y - b.x * a.y;
  }
  const intersects = selfIntersects(p, project.closed);
  const closure = project.observations.find(o => o.id === project.closureObservationId);
  const dx = closure ? closure.predictedEnd.x - p[0]!.x : null;
  const dy = closure ? closure.predictedEnd.y - p[0]!.y : null;
  return { perimeter, area: project.closed && !intersects ? Math.abs(signed) / 2 : null,
    intersects, closure: dx === null || dy === null ? null : { dx, dy, norm: Math.hypot(dx, dy) } };
}

export const activeSides = (project: Project): Observation[] => project.activeObservationIds
  .map(key => project.observations.find(o => o.id === key)!).filter(o => o?.kind === 'side');
export interface SideCorrection { observationId: string; measurement: LengthMeasurement; theta: number;
  capture?: Capture | null; mode?: SurveyMode; referenceFrameId?: string; capturedTheta?: number }
// Rebuild downstream vertices with their original turns, preserving IDs and raw history.
export function correctSides(project: Project, corrections: SideCorrection[]): Project {
  const sides = activeSides(project), edits = new Map(corrections.map(c => [c.observationId, c]));
  if (edits.size !== corrections.length || corrections.some(c => !sides.some(o => o.id === c.observationId)))
    throw new Error(t("Brak boku do poprawienia."));
  const points = [project.points[0]!], observations = [...project.observations], activeObservationIds: string[] = [];
  let delta = 0;
  const now = new Date().toISOString();
  for (const original of sides) {
    const edit = edits.get(original.id);
    const theta = edit ? normalize(edit.theta) : normalize(original.theta + delta);
    if (!Number.isFinite(theta)) throw new Error(t("Nieprawidłowy kierunek."));
    delta = normalize(theta - original.theta);
    const length = edit ? measurementLength(edit.measurement) : { lengthM: original.lengthM, lengthCm: original.lengthCm };
    const end = { ...nextPoint(points.at(-1)!, length.lengthM, theta), id: original.toPointId };
    const moved = !!edit || distance(end, original.predictedEnd) > 1e-10 || Math.abs(normalize(theta - original.theta)) > 1e-10;
    let observation = original;
    if (moved) {
      observation = { ...original, id: id(), supersedesId: original.id, ...length, theta, predictedEnd: end, createdAt: now };
      if (edit) {
        observation = { ...observation, lengthSource: edit.measurement.source,
          stepCount: edit.measurement.source === 'steps' ? edit.measurement.steps : null,
          stepLengthCm: edit.measurement.source === 'steps' ? edit.measurement.stepLengthCm : null,
          stepMeasurementId: edit.measurement.source === 'steps' ? edit.measurement.measurementId : undefined,
          detectedSteps: edit.measurement.source === 'steps' ? edit.measurement.detectedSteps : undefined,
          capture: edit.capture !== undefined ? edit.capture : original.capture,
          mode: edit.mode ?? original.mode, referenceFrameId: edit.referenceFrameId ?? original.referenceFrameId,
          capturedTheta: edit.capturedTheta ?? original.capturedTheta ?? original.theta };
      }
      observations.push(observation);
    }
    points.push(end); activeObservationIds.push(observation.id);
  }
  let closureObservationId = project.closureObservationId;
  const closure = project.observations.find(o => o.id === closureObservationId);
  if (closure) {
    const predictedEnd = nextPoint(points.at(-1)!, closure.lengthM, closure.theta);
    const revised = { ...closure, id: id(), supersedesId: closure.id, predictedEnd, createdAt: now };
    observations.push(revised); activeObservationIds.push(revised.id); closureObservationId = revised.id;
  }
  return { ...project, points, observations, activeObservationIds, closureObservationId,
    geometryRevision: project.geometryRevision + 1, updatedAt: now };
}
export function measurementPrefix(project: Project, index: number): Project {
  return { ...project, points: project.points.slice(0, index + 1), activeObservationIds: activeSides(project).slice(0, index).map(o => o.id),
    closed: false, closureObservationId: null };
}

// Set a calculated closing length by intersecting circles at P1 and the penultimate vertex.
export function correctClosingLength(project: Project, lengthM: number): Project {
  if (!project.closed || project.points.length < 3) throw new Error(t("Potrzeba otwartego obrysu z minimum trzema punktami."));
  measurementLength({ source: 'manual', value: lengthM, unit: 'm' });
  const first = project.points[0]!, a = project.points.at(-2)!, b = project.points.at(-1)!;
  const original = activeSides(project).at(-1)!;
  const d = distance(a, first), radius = original.lengthM;
  if (d < 1e-10) throw new Error(t("Podane długości nie pozwalają zamknąć obrysu. Popraw sąsiedni bok."));
  const x = (radius * radius - lengthM * lengthM + d * d) / (2 * d);
  const h2 = radius * radius - x * x;
  if (h2 < -1e-8 || d > radius + lengthM + 1e-8 || d < Math.abs(radius - lengthM) - 1e-8)
    throw new Error(t("Podane długości nie pozwalają zamknąć obrysu. Popraw sąsiedni bok."));
  const ux = (first.x - a.x) / d, uy = (first.y - a.y) / d, h = Math.sqrt(Math.max(0, h2));
  const candidates = [-1, 1].map(sign => ({ id: b.id, x: a.x + x * ux - sign * h * uy, y: a.y + x * uy + sign * h * ux }));
  const end = candidates.sort((u, v) => distance(u, b) - distance(v, b))[0]!;
  return correctSides(project, [{ observationId: original.id, measurement: original.lengthSource === 'steps'
    ? { source: 'steps', steps: original.stepCount!, stepLengthCm: original.stepLengthCm!, measurementId: original.stepMeasurementId, detectedSteps: original.detectedSteps }
    : { source: 'manual', value: radius, unit: 'm' }, theta: Math.atan2(end.y - a.y, end.x - a.x) }]);
}
