import { t } from '../i18n';
import type { Project } from './model';

export type Plan = 'free' | 'plus';
export type PlusReason = 'projects' | 'points' | 'dxf' | 'watermark' | 'general';
export const FREE_PROJECT_LIMIT = 3;
export const FREE_POINT_LIMIT = 8;
export const PLUS_PRICE_PLN = '29,99 zł';
export const FREE_WATERMARK = 'Utworzono w outlineGo · Free';

export const canCreateProject = (count: number, plan: Plan) => plan === 'plus' || count < FREE_PROJECT_LIMIT;
export const canAddPoint = (project: Project, plan: Plan) => plan === 'plus' || project.points.length < FREE_POINT_LIMIT;

export class AccessLimitError extends Error {
  constructor(readonly reason: PlusReason) {
    super(reason === 'projects' ? t("Masz już 3 szkice. Usuń jeden albo odblokuj Plus.")
      : reason === 'points' ? t("Limit Free to 8 punktów. Możesz zamknąć obrys, zakończyć lub poprawić szkic.")
      : t("Eksport DXF wymaga outlineGo Plus."));
  }
}

// Enforce limits on writes as well as in the UI. Existing data is never
// rejected merely for exceeding Free limits: corrections/undo/closing remain.
export function assertProjectSave(next: Project, previous: Project | null, count: number, plan: Plan) {
  if (plan === 'plus') return;
  if (!previous && !canCreateProject(count, plan)) throw new AccessLimitError('projects');
  if ((!previous && next.points.length > FREE_POINT_LIMIT)
    || (previous && next.points.length > previous.points.length && next.points.length > FREE_POINT_LIMIT)
    || (previous && next.activeObservationIds.length > previous.activeObservationIds.length && !canAddPoint(previous, plan)))
    throw new AccessLimitError('points');
}
