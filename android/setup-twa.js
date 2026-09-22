/*
 * Non-interactive Bubblewrap TWA setup for "Pensándote".
 * Replicates `bubblewrap init` programmatically (the CLI init is interactive and
 * cannot run under a non-interactive shell). Generates twa-manifest.json, scaffolds
 * the Android project, writes the manifest checksum, creates a NEW signing key, and
 * dumps all keystore secrets to KEYSTORE_INFO.txt.
 *
 * Run:  node android/setup-twa.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// @bubblewrap/core is bundled inside the globally-installed CLI.
const CORE = 'C:\\Users\\perro\\AppData\\Roaming\\npm\\node_modules\\@bubblewrap\\cli\\node_modules\\@bubblewrap\\core';
const core = require(CORE);
const { TwaManifest, TwaGenerator, Config, JdkHelper, KeyTool, ConsoleLog } = core;

const ANDROID_DIR = __dirname;
const MANIFEST_URL = 'https://junior-works.github.io/pensandote/manifest.json';
const KEYSTORE_PATH = path.join(ANDROID_DIR, 'android.keystore');
const KEY_ALIAS = 'pensandote';

// Confirmed app metadata.
const PACKAGE_ID = 'com.juniorworks.pensandote';
const APP_NAME = 'Pensándote';
const LAUNCHER_NAME = 'Pensándote';
const THEME_COLOR = '#faf5e9';
const BACKGROUND_COLOR = '#faf5e9';

// The web manifest's start_url is "./" (no source param), unlike CTP whose web
// manifest already carries "./?source=pwa". Set the start URL explicitly so the
// TWA launches with the source marker, resolving to /pensandote/?source=pwa.
const START_URL = '/pensandote/?source=pwa';

// Signing identity (provided).
const SIGNING_IDENTITY = {
  fullName: 'Carlos Acevedo',
  organizationalUnit: 'Junior Works',
  organization: 'Junior Works',
  country: 'AR',
};

function computeChecksum(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}

function genPassword() {
  // 24 url-safe chars, no shell-hostile characters.
  return crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, m => ({ '+': 'A', '/': 'B', '=': '' }[m]));
}

async function main() {
  const log = new ConsoleLog('setup-twa');

  console.log('1) Fetching web manifest and building TWA manifest...');
  const twaManifest = await TwaManifest.fromWebManifest(MANIFEST_URL);

  // 'color' is hoisted to the CLI's node_modules.
  const Color = require('C:\\Users\\perro\\AppData\\Roaming\\npm\\node_modules\\@bubblewrap\\cli\\node_modules\\color');

  // Override with confirmed values.
  twaManifest.packageId = PACKAGE_ID;
  twaManifest.name = APP_NAME;
  twaManifest.launcherName = LAUNCHER_NAME;
  twaManifest.startUrl = START_URL;
  twaManifest.display = 'standalone';
  twaManifest.orientation = 'portrait';
  twaManifest.themeColor = new Color(THEME_COLOR);
  twaManifest.backgroundColor = new Color(BACKGROUND_COLOR);
  twaManifest.navigationColor = new Color(THEME_COLOR);
  twaManifest.appVersionCode = 2;
  twaManifest.appVersionName = '1.0.1';
  twaManifest.minSdkVersion = 21;
  twaManifest.signingKey = { path: KEYSTORE_PATH, alias: KEY_ALIAS };
  twaManifest.generatorApp = 'bubblewrap-cli';
  // enableNotifications en true: sin esto el TWA no declara el permiso ni
  // habilita el DelegationService, asi que la app instalada NO muestra
  // ninguna notificacion web. Estuvo en false hasta el 23/09/2026, o sea
  // que el bundle que habia listo para subir a Play Store era una app que
  // no avisaba nada — el mismo problema que en el navegador, pero peor,
  // porque parece una app de verdad.
  //
  // En true, los avisos pasan a pertenecer a la app instalada 'Pensandote',
  // que aparece en la lista de aplicaciones de Android con su propio
  // permiso de notificaciones y su propio inicio automatico. Eso es lo que
  // falta hoy: en Xiaomi el sistema no despierta a Chrome, pero una app
  // instalada es otra cosa.
  twaManifest.enableNotifications = true;

  const validationError = twaManifest.validate();
  if (validationError) {
    throw new Error('twa-manifest validation failed: ' + validationError);
  }

  console.log('   packageId       :', twaManifest.packageId);
  console.log('   name            :', twaManifest.name);
  console.log('   host            :', twaManifest.host);
  console.log('   startUrl        :', twaManifest.startUrl);
  console.log('   fullScopeUrl    :', twaManifest.fullScopeUrl && twaManifest.fullScopeUrl.toString());
  console.log('   display         :', twaManifest.display);
  console.log('   orientation     :', twaManifest.orientation);
  console.log('   iconUrl         :', twaManifest.iconUrl);
  console.log('   maskableIconUrl :', twaManifest.maskableIconUrl);

  const manifestFile = path.join(ANDROID_DIR, 'twa-manifest.json');
  await twaManifest.saveToFile(manifestFile);
  console.log('   -> wrote', manifestFile);

  console.log('2) Generating Android project scaffold...');
  const twaGenerator = new TwaGenerator();
  await twaGenerator.createTwaProject(ANDROID_DIR, twaManifest, log);
  console.log('   -> project generated');

  console.log('3) Writing manifest checksum...');
  const manifestContents = fs.readFileSync(manifestFile);
  fs.writeFileSync(path.join(ANDROID_DIR, 'manifest-checksum.txt'), computeChecksum(manifestContents));

  console.log('4) Creating NEW signing key...');
  if (fs.existsSync(KEYSTORE_PATH)) {
    console.log('   keystore already exists, skipping creation:', KEYSTORE_PATH);
  } else {
    const config = await Config.loadConfig(path.join(process.env.USERPROFILE, '.bubblewrap', 'config.json'));
    if (!config) throw new Error('Could not load ~/.bubblewrap/config.json');
    const jdkHelper = new JdkHelper(process, config);
    const keytool = new KeyTool(jdkHelper, log);

    // PKCS12 keystores (JDK 17 default) do NOT support a key password that
    // differs from the store password — keytool silently forces them equal.
    // Use a single password for both so apksigner/jarsigner succeed.
    const keystorePassword = genPassword();
    const keyPassword = keystorePassword;

    await keytool.createSigningKey({
      fullName: SIGNING_IDENTITY.fullName,
      organizationalUnit: SIGNING_IDENTITY.organizationalUnit,
      organization: SIGNING_IDENTITY.organization,
      country: SIGNING_IDENTITY.country,
      password: keystorePassword,
      keypassword: keyPassword,
      alias: KEY_ALIAS,
      path: KEYSTORE_PATH,
    });

    const info = [
      '================================================================',
      '  KEYSTORE INFO — Pensándote (com.juniorworks.pensandote)',
      '  GUARDAR EN LUGAR SEGURO. Sin estas credenciales NO se puede',
      '  publicar updates de la app en Google Play. NUNCA commitear.',
      '================================================================',
      '',
      'Keystore path : ' + KEYSTORE_PATH,
      'Key alias     : ' + KEY_ALIAS,
      'Keystore pass : ' + keystorePassword,
      'Key pass      : ' + keyPassword,
      '',
      'Signing identity:',
      '  CN (Name)        : ' + SIGNING_IDENTITY.fullName,
      '  OU (Org Unit)    : ' + SIGNING_IDENTITY.organizationalUnit,
      '  O  (Organization): ' + SIGNING_IDENTITY.organization,
      '  C  (Country)     : ' + SIGNING_IDENTITY.country,
      '',
      'Validity      : 20000 days (~54 años)',
      'Key algorithm : RSA 2048',
      '',
      'Para buildear: las passwords se pasan por env vars',
      '  BUBBLEWRAP_KEYSTORE_PASSWORD y BUBBLEWRAP_KEY_PASSWORD',
      '================================================================',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(ANDROID_DIR, 'KEYSTORE_INFO.txt'), info, 'utf8');
    console.log('   -> signing key created:', KEYSTORE_PATH);
    console.log('   -> secrets written to KEYSTORE_INFO.txt');

    // Emit passwords to stdout (captured by caller, NOT persisted to repo) so the
    // build step can pick them up via env vars without re-reading the file.
    console.log('__KEYSTORE_PASSWORD__=' + keystorePassword);
    console.log('__KEY_PASSWORD__=' + keyPassword);
  }

  console.log('DONE: TWA setup complete.');
}

main().catch(err => {
  console.error('SETUP FAILED:', err && err.stack ? err.stack : err);
  process.exit(1);
});
