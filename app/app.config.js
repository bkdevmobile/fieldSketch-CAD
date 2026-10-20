module.exports = {
  name: 'outlineGo', slug: 'fieldsketch-cad', version: '0.1.0', scheme: 'fieldsketch',
  icon: './assets/brand/icon.png',
  orientation: 'portrait', userInterfaceStyle: 'light', platforms: ['android'],
  android: { package: 'pl.fieldsketch.cad.prototype', versionCode: 1, allowBackup: false, softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: { foregroundImage: './assets/brand/adaptive-foreground.png', monochromeImage: './assets/brand/adaptive-monochrome.png', backgroundColor: '#1B684B' },
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.SYSTEM_ALERT_WINDOW'] },
  plugins: ['expo-router', ['expo-camera', { cameraPermission: 'Kamera służy do celowania w kolejny punkt.', recordAudioAndroid: false }],
    ['expo-splash-screen', { image: './assets/brand/splash-mark.png', backgroundColor: '#F5F4EE', imageWidth: 180, resizeMode: 'contain' }]],
};
