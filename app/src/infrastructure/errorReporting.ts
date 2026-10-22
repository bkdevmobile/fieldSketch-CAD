import * as Sentry from '@sentry/react-native';
import type { Event, ErrorEvent } from '@sentry/react-native';
import { makeFetchTransport } from '@sentry/react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredDsn = Constants.expoConfig?.extra?.sentryDsn;

/** Do not enable a non-EU endpoint by accident. The DSN is a public client key. */
export function isEuSentryDsn(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /^o\d+\.ingest\.de\.sentry\.io$/.test(url.hostname)
      && /^[a-f0-9]{32}$/.test(url.username) && !url.password && !url.port
      && /^\/\d+$/.test(url.pathname) && !url.search && !url.hash;
  } catch { return false; }
}

export const errorReportingAvailable = isEuSentryDsn(configuredDsn);
let consent = false;
let generation = 0;
let initialized = false;
const inFlight = new Set<AbortController>();

// Exception messages, function names and arbitrary paths may contain sketch data.
// Keep only bundled source positions; everything else is rebuilt from an allowlist.
export function sanitizeErrorEvent(event: Event): ErrorEvent | null {
  if (event.type || !event.exception?.values?.length) return null;
  const exceptions = event.exception.values.slice(-3).map(exception => ({
    type: ['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError'].includes(exception.type ?? '')
      ? exception.type : 'Error',
    value: 'Application error (details removed for privacy)',
    mechanism: { type: 'generic', handled: exception.mechanism?.handled !== false },
    stacktrace: {
      frames: exception.stacktrace?.frames?.filter(frame =>
        /^(?:app:\/\/\/)?(?:index\.android\.bundle|index\.bundle)$/.test(frame.filename ?? ''))
        .slice(-40).map(frame => ({ filename: 'app:///index.android.bundle',
          ...(Number.isSafeInteger(frame.lineno) && frame.lineno! > 0 ? { lineno: frame.lineno } : {}),
          ...(Number.isSafeInteger(frame.colno) && frame.colno! >= 0 ? { colno: frame.colno } : {}), in_app: true })) ?? [],
    },
  }));
  return {
    type: undefined,
    ...(typeof event.event_id === 'string' && /^[a-f0-9]{32}$/.test(event.event_id) ? { event_id: event.event_id } : {}),
    ...(typeof event.timestamp === 'number' && Number.isFinite(event.timestamp) ? { timestamp: event.timestamp } : {}),
    platform: 'javascript', level: event.level === 'fatal' ? 'fatal' : 'error',
    release: `com.bk.dev.mobile.outlinego@${Constants.expoConfig?.version ?? '0.1.0'}+${Constants.expoConfig?.android?.versionCode ?? 2}`,
    dist: String(Constants.expoConfig?.android?.versionCode ?? 2),
    environment: __DEV__ ? 'development' : 'production',
    exception: { values: exceptions },
    fingerprint: ['outlinego-js', exceptions.at(-1)?.type ?? 'Error',
      ...exceptions.flatMap(exception => exception.stacktrace.frames.slice(-5)
        .map(frame => `${frame.lineno ?? 0}:${frame.colno ?? 0}`))],
    debug_meta: { images: event.debug_meta?.images?.filter(image => image.type === 'sourcemap'
      && /^(?:app:\/\/\/)?(?:index\.android\.bundle|index\.bundle)$/.test(image.code_file ?? '')
      && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(image.debug_id ?? ''))
      .slice(0, 1).map(image => ({ type: 'sourcemap', code_file: 'app:///index.android.bundle', debug_id: image.debug_id })) ?? [] },
    // sendDefaultPii=false sets infer_ip=never in the SDK envelope metadata.
    // The receiving server still sees the connection's IP address.
    contexts: { os: { name: 'Android', version: Platform.OS === 'android' ? Platform.constants.Release : String(Platform.Version) } },
  };
}

/** No disk/offline queue. Revoke immediately, including queued and active requests. */
const consentTransport: NonNullable<Sentry.ReactNativeOptions['transport']> = options => {
  const thisGeneration = generation;
  const delegate = makeFetchTransport(options, (url, init) => {
    if (!consent || generation !== thisGeneration) return Promise.reject(new Error('Reporting disabled'));
    const controller = new AbortController(); inFlight.add(controller);
    return fetch(url, { ...init, signal: controller.signal }).finally(() => inFlight.delete(controller));
  });
  const transport: ReturnType<typeof makeFetchTransport> = {
    send: envelope => consent && generation === thisGeneration ? delegate.send(envelope) : Promise.resolve({}),
    flush: timeout => delegate.flush(timeout),
  };
  return transport;
};

export function setErrorReportingConsent(enabled: boolean) {
  const next = enabled === true && errorReportingAvailable;
  if (next === consent) return;
  consent = next; generation++;
  if (!next) {
    for (const controller of inFlight) controller.abort();
    inFlight.clear();
    const client = Sentry.getClient();
    if (client) client.getOptions().enabled = false;
    Sentry.getCurrentScope().setClient(undefined);
    Sentry.getCurrentScope().clear(); Sentry.getIsolationScope().clear();
    initialized = false;
    return;
  }
  try { Sentry.init({
    dsn: configuredDsn, enableNative: false, autoInitializeNativeSdk: false,
    enableNativeCrashHandling: false, enableNativeNagger: false,
    enableAutoSessionTracking: false, enableAutoPerformanceTracing: false,
    enableAppStartTracking: false, enableNativeFramesTracking: false, enableStallTracking: false,
    sendDefaultPii: false, sendClientReports: false, maxBreadcrumbs: 0,
    enableLogs: false, attachScreenshot: false, attachViewHierarchy: false,
    defaultIntegrations: false,
    integrations: [Sentry.reactNativeErrorHandlersIntegration({ patchGlobalPromise: false })],
    transport: consentTransport,
    beforeSend: event => consent ? sanitizeErrorEvent(event) : null,
    beforeBreadcrumb: () => null,
  });
  initialized = true;
  } catch {
    // Monitoring must never prevent saving settings or using the app.
    setErrorReportingConsent(false);
  }
}

/** Only call for unexpected exceptions; validation/access-limit errors are not bugs. */
export function reportUnexpectedError(error: unknown) {
  if (consent && initialized && error instanceof Error) Sentry.captureException(error);
}
