const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');
module.exports = config => {
  config = withAndroidManifest(config, mod => {
    AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults).$['android:localeConfig'] = '@xml/locales_config';
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(mod.modResults);
    const changes = new Set((activity.$['android:configChanges'] || '').split('|').filter(Boolean));
    changes.add('locale'); changes.add('layoutDirection');
    activity.$['android:configChanges'] = [...changes].join('|'); return mod;
  });
  return withDangerousMod(config, ['android', async mod => {
    const dir = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'locales_config.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<locale-config xmlns:android="http://schemas.android.com/apk/res/android">\n' +
      ['pl', 'en', 'de', 'es', 'fr'].map(language => `  <locale android:name="${language}" />`).join('\n') + '\n</locale-config>\n');
    return mod;
  }]);
};
