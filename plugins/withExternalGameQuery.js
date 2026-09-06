const { withAndroidManifest } = require('@expo/config-plugins');

// Android 11+ (API 30+) hides other installed apps from
// PackageManager unless they are declared in <queries>. Without
// this, IntentLauncher.openApplication() throws
// PackageNotFoundException even when the target app IS installed.
const EXTERNAL_GAME_PACKAGE = 'com.IliyaPardazesh.NEUROLIA';

module.exports = function withExternalGameQuery(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.queries) {
      manifest.queries = [{ package: [] }];
    }

    if (!manifest.queries[0].package) {
      manifest.queries[0].package = [];
    }

    const alreadyDeclared = manifest.queries[0].package.some(
      (entry) => entry.$['android:name'] === EXTERNAL_GAME_PACKAGE
    );

    if (!alreadyDeclared) {
      manifest.queries[0].package.push({
        $: { 'android:name': EXTERNAL_GAME_PACKAGE },
      });
    }

    return config;
  });
};