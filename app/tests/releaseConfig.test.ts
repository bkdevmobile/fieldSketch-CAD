jest.mock('expo/config-plugins', () => ({
  withStringsXml: (config: unknown, action: (mod: unknown) => unknown) => { xmlAction = action; return config; },
  withAppBuildGradle: (config: unknown, action: (mod: unknown) => unknown) => { gradleAction = action; return config; },
}));
let xmlAction: (mod: any) => any;
let gradleAction: (mod: any) => any;
const plugin = require('../scripts/with-release.cjs');
const fs = require('node:fs');
const crypto = require('node:crypto');
const publicKeyFixture = crypto.generateKeyPairSync('rsa', { modulusLength: 1024 }).publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
beforeEach(() => {
  // Configuration tests must not depend on a developer's private-directory files.
  const exists = fs.existsSync, read = fs.readFileSync;
  jest.spyOn(fs, 'existsSync').mockImplementation((...args: any[]) => String(args[0]).endsWith('google-play-public-key.txt') ? true : exists(...args));
  jest.spyOn(fs, 'readFileSync').mockImplementation((...args: any[]) => String(args[0]).endsWith('google-play-public-key.txt') ? publicKeyFixture : read(...args));
});
afterEach(() => jest.restoreAllMocks());

test('prebuild removes debug release signing and recreates signing using environment only', () => {
  plugin({});
  const input = { modResults: { contents: 'android { buildTypes { debug { signingConfig signingConfigs.debug } release { signingConfig signingConfigs.debug } } }\n' } };
  const first = gradleAction(input).modResults.contents as string;
  expect(first).toContain('debug { signingConfig signingConfigs.debug }');
  expect(first).toContain('release { signingConfig null }');
  expect(first).toContain("System.getenv('OUTLINEGO_STORE_PASSWORD')");
  expect(first).toContain("throw new GradleException('Release signing is required.");
  expect(gradleAction({ modResults: { contents: first } }).modResults.contents).toBe(first);
});

test('prebuild writes one public licensing resource and preserves existing strings', () => {
  plugin({});
  const mod = { modResults: { resources: { string: [{ $: { name: 'app_name' }, _: 'outlineGo' }] } } };
  xmlAction(mod); xmlAction(mod);
  expect(mod.modResults.resources.string.filter(row => row.$.name === 'outlinego_play_public_key')).toHaveLength(1);
  expect(mod.modResults.resources.string[0]!._).toBe('outlineGo');
});
