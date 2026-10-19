module.exports = {
  name: 'FieldSketch CAD', slug: 'fieldsketch-cad', version: '0.1.0', scheme: 'fieldsketch',
  orientation: 'portrait', userInterfaceStyle: 'light', platforms: ['android'],
  android: { package: 'pl.fieldsketch.cad.prototype', versionCode: 1, allowBackup: false, softwareKeyboardLayoutMode: 'resize',
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.SYSTEM_ALERT_WINDOW'] },
  plugins: ['expo-router', ['expo-camera', { cameraPermission: 'Kamera służy do celowania w kolejny punkt.', recordAudioAndroid: false }]],
};
