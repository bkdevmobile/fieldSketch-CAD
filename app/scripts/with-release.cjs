const { withAppBuildGradle, withGradleProperties, withStringsXml } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Only the PUBLIC licensing key is embedded in the application.
module.exports = config => {
  config = withGradleProperties(config, mod => {
    for (const key of ['android.enableMinifyInReleaseBuilds', 'android.enableShrinkResourcesInReleaseBuilds']) {
      mod.modResults = mod.modResults.filter(row => row.type !== 'property' || row.key !== key);
      mod.modResults.push({ type: 'property', key, value: 'true' });
    }
    return mod;
  });
  const keyFile = path.resolve(__dirname, '../../_private/google-play-public-key.txt');
  const key = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim().replace(/\s/g, '') : '';
  if (key && crypto.createPublicKey({ key: Buffer.from(key, 'base64'), format: 'der', type: 'spki' }).asymmetricKeyType !== 'rsa') {
    throw new Error('Google Play licensing requires an RSA public key.');
  }
  config = withStringsXml(config, mod => {
    const strings = mod.modResults.resources.string ?? [];
    mod.modResults.resources.string = strings.filter(row => row.$.name !== 'outlinego_play_public_key');
    mod.modResults.resources.string.push({ $: { name: 'outlinego_play_public_key', translatable: 'false' }, _: key });
    return mod;
  });
  return withAppBuildGradle(config, mod => {
    const marker = '// outlineGo release signing';
    let source = mod.modResults.contents;
    // Expo's non-optimizing default rules include -dontoptimize.
    source = source.replace(/getDefaultProguardFile\(["']proguard-android\.txt["']\)/g,
      'getDefaultProguardFile("proguard-android-optimize.txt")');
    if (source.includes(marker)) source = source.slice(0, source.indexOf(marker)).trimEnd() + '\n';
    // Expo's template defaults to debug signing for release. Remove it explicitly.
    source = source.replace(/(release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/, '$1signingConfig null');
    source += `
${marker}
def outlineGoSigning = ['OUTLINEGO_STORE_FILE', 'OUTLINEGO_STORE_PASSWORD', 'OUTLINEGO_KEY_ALIAS', 'OUTLINEGO_KEY_PASSWORD'].every { System.getenv(it) }
android {
    if (outlineGoSigning) {
        signingConfigs {
            outlineGoRelease {
                storeFile file(System.getenv('OUTLINEGO_STORE_FILE'))
                storeType 'PKCS12'
                storePassword System.getenv('OUTLINEGO_STORE_PASSWORD')
                keyAlias System.getenv('OUTLINEGO_KEY_ALIAS')
                keyPassword System.getenv('OUTLINEGO_KEY_PASSWORD')
            }
        }
        buildTypes.release.signingConfig signingConfigs.outlineGoRelease
    } else {
        buildTypes.release.signingConfig null
    }
}
gradle.taskGraph.whenReady { graph ->
    if (!outlineGoSigning && graph.allTasks.any { it.project == project && it.name ==~ /(?i)(assemble|bundle|package|install).*Release/ }) {
        throw new GradleException('Release signing is required. Use scripts/build-aab.ps1 or scripts/build-apk.ps1.')
    }
}
`;
    mod.modResults.contents = source; return mod;
  });
};
