module.exports = {
  name: 'outlineGo', slug: 'fieldsketch-cad', version: '0.1.0', scheme: 'fieldsketch',
  icon: './assets/brand/icon.png',
  extra: { sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? require('./sentry.config.cjs').dsn },
  orientation: 'portrait', userInterfaceStyle: 'automatic', platforms: ['android'],
  android: { package: 'com.bk.dev.mobile.outlinego', versionCode: 2, allowBackup: false, softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: { foregroundImage: './assets/brand/adaptive-foreground.png', monochromeImage: './assets/brand/adaptive-monochrome.png', backgroundColor: '#1B684B' },
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.SYSTEM_ALERT_WINDOW'] },
  plugins: ['expo-router',
    ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT ? [['@sentry/react-native/expo', { organization: require('./sentry.config.cjs').organization, project: process.env.SENTRY_PROJECT }]] : []),
    './scripts/with-languages.cjs', './scripts/with-release.cjs', './scripts/with-error-reporting.cjs', ['expo-camera', { cameraPermission: 'Kamera służy do celowania w kolejny punkt.', recordAudioAndroid: false }],
    ['expo-splash-screen', { image: './assets/brand/splash-mark.png', backgroundColor: '#F5F4EE', imageWidth: 180, resizeMode: 'contain' }]],
};
