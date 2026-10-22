import { createLegalAcceptance, hasCurrentLegalAcceptance, isLegalAcceptance, LEGAL_NOTICE_VERSION } from '../src/domain/legal';

test('new installs, older versions and malformed records require acknowledgement', () => {
  for (const value of [undefined, null, {}, true, { version: LEGAL_NOTICE_VERSION },
    { version: LEGAL_NOTICE_VERSION, acceptedAt: 'not a date' },
    { version: LEGAL_NOTICE_VERSION, acceptedAt: '2026-02-30T10:00:00.000Z' },
    { version: 'previous-version', acceptedAt: '2026-10-21T10:00:00.000Z' }]) {
    expect(hasCurrentLegalAcceptance(value)).toBe(false);
  }
});

test('confirmation records the current version and UTC time without granting diagnostics consent', () => {
  const value = createLegalAcceptance(true, new Date('2026-10-22T20:00:00+02:00'));
  expect(value).toEqual({ version: LEGAL_NOTICE_VERSION, acceptedAt: '2026-10-22T18:00:00.000Z' });
  expect(hasCurrentLegalAcceptance(value)).toBe(true);
  expect(isLegalAcceptance(value)).toBe(true);
  expect(value).not.toHaveProperty('errorReporting');
  expect(() => createLegalAcceptance(false)).toThrow();
});
