import { t } from '../i18n';
import { AppState, PermissionsAndroid, Platform } from 'react-native';

const needsRuntimePermission = () => Platform.OS === 'android' && Number(Platform.Version) >= 29;

export async function hasStepPermission() {
  return !needsRuntimePermission() || PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);
}

export async function requestStepPermissionBeforeDirection() {
  if (await hasStepPermission()) return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);
  // Permission dialogs may pause the Activity. Start the orientation session
  // only after it has resumed, so its reference frame cannot be lost here.
  if (AppState.currentState !== 'active') await new Promise<void>((resolve, reject) => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') { clearTimeout(timeout); listener.remove(); resolve(); }
    });
    const timeout = setTimeout(() => {
      listener.remove(); reject(new Error(t("Wróć do aplikacji i ponów przygotowanie odczytu.")));
    }, 2000);
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
