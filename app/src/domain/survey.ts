import { normalize, parsePositive } from './geometry';
import type { Project } from './model';

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
export function previousHeading(project: Project) {
  const end = project.points.at(-1), start = project.points.at(-2);
  return start && end ? Math.atan2(end.y - start.y, end.x - start.x) : 0;
}
export function headingFromTurn(previous: number, input: string, side: 'left' | 'right') {
  const text = input.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) throw new Error('Wpisz kąt od 0 do 180°.');
  const angle = Number(text);
  if (!Number.isFinite(angle) || angle < 0 || angle > 180) throw new Error('Kąt skrętu musi mieścić się w zakresie 0–180°.');
  return normalize(previous + (side === 'left' ? 1 : -1) * angle * Math.PI / 180);
}
export function turnFromHeading(previous: number, heading: number) {
  const delta = normalize(heading - previous);
  return { turn: String(Number((Math.abs(delta) * 180 / Math.PI).toFixed(2))), turnSide: delta < 0 ? 'right' as const : 'left' as const };
}
export function convertLengthInput(input: string, from: 'm' | 'cm', to: 'm' | 'cm') {
  if (from === to || !input.trim()) return input;
  const value = parsePositive(input) * (to === 'cm' ? 100 : 0.01);
  return String(Number(value.toPrecision(12))).replace('.', ',');
}
