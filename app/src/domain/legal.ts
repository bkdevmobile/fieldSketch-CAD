import { t } from '../i18n';

// Increase only for material changes requiring a renewed acknowledgement.
export const LEGAL_NOTICE_VERSION = '2026-10-22.1';
export const LEGAL_URLS = {
  terms: 'https://outlinego-27ab5.web.app/terms.html',
  privacy: 'https://outlinego-27ab5.web.app/privacy.html',
  measurement: 'https://outlinego-27ab5.web.app/measurement-notice.html',
} as const;

export interface LegalAcceptance { version: string; acceptedAt: string }

export function isLegalAcceptance(value: unknown): value is LegalAcceptance {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LegalAcceptance>;
  const timestamp = typeof candidate.acceptedAt === 'string' ? Date.parse(candidate.acceptedAt) : NaN;
  return typeof candidate.version === 'string' && !!candidate.version.trim()
    && Number.isFinite(timestamp) && new Date(timestamp).toISOString() === candidate.acceptedAt;
}

export const hasCurrentLegalAcceptance = (value: unknown) =>
  isLegalAcceptance(value) && value.version === LEGAL_NOTICE_VERSION;

export function createLegalAcceptance(confirmed: boolean, now = new Date()): LegalAcceptance {
  if (confirmed !== true) throw new Error(t('Zaakceptuj regulamin i potwierdź ograniczenia pomiarów.'));
  return { version: LEGAL_NOTICE_VERSION, acceptedAt: now.toISOString() };
}
