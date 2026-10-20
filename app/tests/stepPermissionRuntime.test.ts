jest.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: jest.fn() },
  Platform: { OS: 'android', Version: 36 },
  PermissionsAndroid: {
    PERMISSIONS: { ACTIVITY_RECOGNITION: 'activity' },
    RESULTS: { GRANTED: 'granted' },
    check: jest.fn(), request: jest.fn(),
  },
}));

import { AppState, AppStateStatus, PermissionsAndroid, Platform } from 'react-native';
import { hasStepPermission, requestStepPermissionBeforeDirection } from '../src/infrastructure/stepPermission';

beforeEach(() => {
  jest.resetAllMocks();
  AppState.currentState = 'active';
  Platform.Version = 36;
  jest.mocked(PermissionsAndroid.check).mockResolvedValue(false);
  jest.mocked(PermissionsAndroid.request).mockResolvedValue('granted');
});

test('przed kierunkiem prosi o pierwszą zgodę', async () => {
  expect(await requestStepPermissionBeforeDirection()).toBe(true);
  expect(PermissionsAndroid.request).toHaveBeenCalledTimes(1);
});

test('wcześniejsza zgoda nie otwiera kolejnego okna', async () => {
  jest.mocked(PermissionsAndroid.check).mockResolvedValue(true);
  expect(await requestStepPermissionBeforeDirection()).toBe(true);
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});

test('odmowa pozwala przejść do pomiaru z ręczną długością', async () => {
  jest.mocked(PermissionsAndroid.request).mockResolvedValue('denied');
  expect(await requestStepPermissionBeforeDirection()).toBe(false);
});

test('Start krokomierza nie pyta o zgodę i nie przerywa sesji kierunku', async () => {
  expect(await hasStepPermission()).toBe(false);
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});

test('przed rozpoczęciem kierunku czeka na powrót z okna Androida', async () => {
  AppState.currentState = 'background';
  let resume: (state: AppStateStatus) => void = () => {};
  const remove = jest.fn();
  jest.mocked(AppState.addEventListener).mockImplementation((_event, listener) => {
    resume = listener; return { remove };
  });
  let ready = false;
  const preparation = requestStepPermissionBeforeDirection().then(value => { ready = value; });
  // Drain the permission check/request promises before the resume event.
  await new Promise(resolve => setImmediate(resolve));
  expect(ready).toBe(false);
  AppState.currentState = 'active'; resume('active');
  await preparation;
  expect(ready).toBe(true);
  expect(remove).toHaveBeenCalledTimes(1);
});

test('Android przed 10 nie wymaga zgody runtime', async () => {
  Platform.Version = 28;
  expect(await requestStepPermissionBeforeDirection()).toBe(true);
  expect(PermissionsAndroid.check).not.toHaveBeenCalled();
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});
