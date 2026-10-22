jest.mock('@sentry/react-native', () => ({
  init: jest.fn(), captureException: jest.fn(), getClient: jest.fn(),
  getCurrentScope: () => ({ clear: jest.fn(), setClient: jest.fn() }),
  getIsolationScope: () => ({ clear: jest.fn() }),
  reactNativeErrorHandlersIntegration: jest.fn(() => ({ name: 'ReactNativeErrorHandlers' })),
}));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {
  version: '0.1.0', android: { versionCode: 2 }, extra: { sentryDsn: 'https://0123456789abcdef0123456789abcdef@o123.ingest.de.sentry.io/456' },
} } }));
jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 35, constants: { Release: '15' } } }));
jest.mock('@sentry/react', () => ({ makeFetchTransport: jest.fn((_options, fetcher) => ({
  send: (envelope: unknown) => fetcher('https://o123.ingest.de.sentry.io/api/456/envelope/', { method: 'POST', body: JSON.stringify(envelope) }).then(() => ({})),
  flush: () => Promise.resolve(true),
})) }));

import * as Sentry from '@sentry/react-native';
import { isEuSentryDsn, reportUnexpectedError, sanitizeErrorEvent, setErrorReportingConsent } from '../src/infrastructure/errorReporting';

beforeEach(() => {
  Object.assign(globalThis, { __DEV__: false });
  setErrorReportingConsent(false); jest.clearAllMocks();
});
afterEach(() => setErrorReportingConsent(false));

test('only accepts a public HTTPS DSN in the chosen EU region', () => {
  const valid = 'https://0123456789abcdef0123456789abcdef@o123.ingest.de.sentry.io/456';
  expect(isEuSentryDsn(valid)).toBe(true);
  for (const invalid of ['', undefined, valid.replace('https:', 'http:'), valid.replace('.de.', '.us.'),
    valid.replace('.io/', '.io.evil.example/'), valid + '?secret=1', valid.replace('@', ':secret@')]) {
    expect(isEuSentryDsn(invalid)).toBe(false);
  }
});

test('drops arbitrary context, messages and paths, preserving only bundled error positions', () => {
  const result = sanitizeErrorEvent({
    event_id: 'a'.repeat(32), timestamp: 123, message: 'My private sketch', user: { email: 'private@example.test' },
    extra: { receipt: 'purchase-token' }, tags: { project: 'My private sketch' },
    breadcrumbs: [{ message: 'sensor log' }], contexts: { device: { name: 'My phone' } },
    debug_meta: { images: [
      { type: 'sourcemap', code_file: '/storage/My private sketch.png', debug_id: 'sensor log' },
      { type: 'sourcemap', code_file: 'app:///index.android.bundle', debug_id: '12345678-1234-1234-1234-123456789abc' },
    ] },
    exception: { values: [{ type: 'Private sketch', value: 'My private sketch: purchase-token',
      stacktrace: { frames: [
        { filename: '/storage/My private sketch.png', function: 'private@example.test', lineno: 8 },
        { filename: 'app:///index.android.bundle', function: 'purchase-token', lineno: 12, colno: 9,
          pre_context: ['My private sketch'], vars: { note: 'sensor log' } },
      ] },
    }] },
  });
  expect(result?.exception?.values?.[0]?.stacktrace?.frames).toEqual([
    { filename: 'app:///index.android.bundle', lineno: 12, colno: 9, in_app: true },
  ]);
  for (const secret of ['My private sketch', 'private@example.test', 'purchase-token', 'sensor log', 'My phone']) {
    expect(JSON.stringify(result)).not.toContain(secret);
  }
  expect(result).toMatchObject({ release: 'com.bk.dev.mobile.outlinego@0.1.0+2', contexts: { os: { name: 'Android', version: '15' } } });
  expect(result?.debug_meta?.images).toEqual([{ type: 'sourcemap', code_file: 'app:///index.android.bundle', debug_id: '12345678-1234-1234-1234-123456789abc' }]);
  expect(sanitizeErrorEvent({ message: 'log only' })).toBeNull();
  expect(sanitizeErrorEvent({ type: 'transaction' })).toBeNull();
});

test('SDK initialization failure cannot break settings saving and leaves reporting off', () => {
  jest.mocked(Sentry.init).mockImplementationOnce(() => { throw new Error('SDK unavailable'); });
  expect(() => setErrorReportingConsent(true)).not.toThrow();
  reportUnexpectedError(new Error('do not send'));
  expect(Sentry.captureException).not.toHaveBeenCalled();
});

test('SDK and reporting stay off until consent, and disabling blocks capture', () => {
  reportUnexpectedError(new Error('not consented'));
  expect(Sentry.init).not.toHaveBeenCalled(); expect(Sentry.captureException).not.toHaveBeenCalled();
  setErrorReportingConsent(true); setErrorReportingConsent(true);
  expect(Sentry.init).toHaveBeenCalledTimes(1);
  const options = jest.mocked(Sentry.init).mock.calls[0]![0];
  expect(options).toMatchObject({ enableNative: false, autoInitializeNativeSdk: false, defaultIntegrations: false,
    sendDefaultPii: false, enableLogs: false, sendClientReports: false, maxBreadcrumbs: 0,
    enableAutoSessionTracking: false, attachScreenshot: false, attachViewHierarchy: false });
  expect(options.integrations).toEqual([{ name: 'ReactNativeErrorHandlers' }]);
  const error = new TypeError('private details'); reportUnexpectedError(error);
  expect(Sentry.captureException).toHaveBeenCalledWith(error);
  setErrorReportingConsent(false); jest.mocked(Sentry.captureException).mockClear();
  reportUnexpectedError(error); expect(Sentry.captureException).not.toHaveBeenCalled();
  expect(options.beforeSend!({ type: undefined, exception: { values: [{ type: 'Error' }] } }, {})).toBeNull();
});

test('revocation aborts active requests and stale queues remain blocked after re-enabling', async () => {
  let signal: AbortSignal | undefined;
  const fetchMock = jest.fn((_url: unknown, init?: RequestInit) => {
    signal = init?.signal ?? undefined;
    return new Promise<Response>((_resolve, reject) => signal!.addEventListener('abort', () => reject(new Error('aborted'))));
  });
  const originalFetch = globalThis.fetch; globalThis.fetch = fetchMock as typeof fetch;
  try {
    setErrorReportingConsent(true);
    const options = jest.mocked(Sentry.init).mock.calls[0]![0];
    const transport = options.transport!({ url: 'https://o123.ingest.de.sentry.io/api/456/envelope/', recordDroppedEvent: () => {} });
    const envelope: Parameters<typeof transport.send>[0] = [{ event_id: 'a'.repeat(32), sent_at: '2026-10-22T00:00:00Z' }, [[{ type: 'event' }, { type: undefined }]]];
    const pending = transport.send(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    setErrorReportingConsent(false);
    expect(signal?.aborted).toBe(true);
    await expect(pending).rejects.toThrow('aborted');
    await transport.send(envelope); expect(fetchMock).toHaveBeenCalledTimes(1);
    setErrorReportingConsent(true);
    await transport.send(envelope); expect(fetchMock).toHaveBeenCalledTimes(1);
  } finally { globalThis.fetch = originalFetch; }
});
