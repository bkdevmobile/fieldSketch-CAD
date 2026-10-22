const { withAndroidManifest } = require('expo/config-plugins');

// Native events bypass the JS privacy filter. Keep native initialization disabled.
module.exports = config => withAndroidManifest(config, mod => {
  const app = mod.modResults.manifest.application[0];
  const name = 'io.sentry.auto-init';
  app['meta-data'] = (app['meta-data'] || []).filter(item => item.$['android:name'] !== name);
  app['meta-data'].push({ $: { 'android:name': name, 'android:value': 'false' } });
  return mod;
});
