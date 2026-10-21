import { t } from '../i18n';
import { normalize, parsePositive } from './geometry';
import type { AngleSnap, Project } from './model';
import { ANGLE_DECIMALS, LENGTH_DECIMALS, decimalText, roundDecimal } from './precision';

export type WizardStep = 'start' | 'direction' | 'angle' | 'length' | 'review';
export interface SurveyDraft {
  revision: number;
  step: WizardStep;
  length: string;
  steps: string;
  lengthSource: 'manual' | 'steps';
  unit: 'm' | 'cm';
  turn: string;
  turnSide: 'left' | 'right';
  stepLengthCm?: string;
  stepMeasurementId?: string;
  detectedSteps?: number;
}
export const defaultReferenceIndex = (project: Project) => Math.max(0, project.points.length - 2);
export function referenceOffset(project: Project, index: number, sensorHeading: number) {
  const a = project.points[index], b = project.points[index + 1];
  if (!a || !b) throw new Error(t("Wybierz zapisany bok odniesienia."));
  return normalize(Math.atan2(b.y - a.y, b.x - a.x) - normalize(Math.PI / 2 - sensorHeading));
}
export function previousHeading(project: Project) {
  const end = project.points.at(-1), start = project.points.at(-2);
  return start && end ? Math.atan2(end.y - start.y, end.x - start.x) : 0;
}
export function headingFromTurn(previous: number, input: string, side: 'left' | 'right') {
  const text = input.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) throw new Error(t("Wpisz kąt od 0 do 180°."));
  const angle = Number(text);
  if (!Number.isFinite(angle) || angle < 0 || angle > 180) throw new Error(t("Kąt skrętu musi mieścić się w zakresie 0–180°."));
  return normalize(previous + (side === 'left' ? 1 : -1) * angle * Math.PI / 180);
}
export function turnFromHeading(previous: number, heading: number, stepDegrees = 0) {
  const delta = normalize(heading - previous);
  const degrees = Math.abs(delta) * 180 / Math.PI;
  return { turn: String(stepDegrees ? Math.round(degrees / stepDegrees) * stepDegrees : roundDecimal(degrees, ANGLE_DECIMALS)), turnSide: delta < 0 ? 'right' as const : 'left' as const };
}
export function convertLengthInput(input: string, from: 'm' | 'cm', to: 'm' | 'cm') {
  if (from === to || !input.trim()) return input;
  const value = parsePositive(input) * (to === 'cm' ? 100 : 0.01);
  const rounded = roundDecimal(value, LENGTH_DECIMALS);
  if (rounded <= 0) throw new Error(t("Nieprawidłowa długość."));
  return decimalText(rounded, LENGTH_DECIMALS).replace('.', ',');
}
export function snapTurn(input: string, interval: AngleSnap): string {
  headingFromTurn(0, input, 'left');
  if (!interval) return input;
  const value = Number(input.trim().replace(',', '.'));
  const target = Math.round(value / interval) * interval;
  return Math.abs(target - value) <= Math.min(2, interval / 5) + 1e-9 ? String(target) : input;
}
