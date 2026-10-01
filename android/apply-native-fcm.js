/*
 * Bubblewrap regenera android/app y los Gradle generados. Ejecutar este paso
 * después de setup-twa.js para conservar la integración Firebase nativa.
 * No copia ni imprime google-services.json: debe estar en android/app/.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = __dirname;
const app = path.join(root, 'app');
const configPath = path.join(app, 'google-services.json');
if (!fs.existsSync(configPath)) throw new Error('Falta android/app/google-services.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (config.project_info?.project_id !== 'pensandote-6038f' ||
    !config.client?.some(c => c.client_info?.android_client_info?.package_name === 'com.juniorworks.pensandote')) {
  throw new Error('La configuración Firebase no pertenece a Pensándote Android');
}

function replaceOnce(file, before, after, marker) {
  let value = fs.readFileSync(file, 'utf8');
  if (value.includes(marker)) return;
  if (!value.includes(before)) throw new Error(`No se encontró el ancla en ${file}: ${before.slice(0, 45)}`);
  value = value.replace(before, after);
  fs.writeFileSync(file, value);
}

replaceOnce(path.join(root, 'build.gradle'),
  "classpath 'com.android.tools.build:gradle:8.9.1'",
  "classpath 'com.android.tools.build:gradle:8.9.1'\n        classpath 'com.google.gms:google-services:4.5.0'",
  "classpath 'com.google.gms:google-services:4.5.0'");

const appGradle = path.join(app, 'build.gradle');
replaceOnce(appGradle,
  "id 'com.android.application'\n}",
  "id 'com.android.application'\n}\n\napply plugin: 'com.google.gms.google-services'",
  "apply plugin: 'com.google.gms.google-services'");
replaceOnce(appGradle,
  "implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.6.2'",
  "implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.6.2'\n        implementation platform('com.google.firebase:firebase-bom:34.19.0')\n        implementation 'com.google.firebase:firebase-messaging'",
  "implementation 'com.google.firebase:firebase-messaging'");
replaceOnce(appGradle, 'minSdkVersion 21', 'minSdkVersion 23', 'minSdkVersion 23');

const manifest = path.join(app, 'src', 'main', 'AndroidManifest.xml');
// LauncherActivity queda como la pantalla de arranque, tal cual la genera
// bubblewrap. Antes metiamos una actividad propia adelante para conseguir el
// token de Firebase y eso trababa el arranque: la app se quedaba colgada
// antes de mostrar nada. El token ahora se pide en segundo plano.
replaceOnce(manifest,
  '        <service\n            android:name=".DelegationService"',
  `        <service android:name="NativeFirebaseMessagingService" android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <service
            android:name=".DelegationService"`,
  '<service android:name="NativeFirebaseMessagingService"');

const javaDir = path.join(app, 'src', 'main', 'java', 'com', 'juniorworks', 'pensandote');
// Restos de la pantalla intermedia que rompia el arranque. setup-twa.js no
// borra los .java que dejo una version anterior, asi que se van de aca.
for (const viejo of ['NativeBootstrapActivity.java']) {
  const ruta = path.join(javaDir, viejo);
  if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
}
for (const name of ['NativeFirebaseMessagingService.java', 'TokenFcm.java']) {
  fs.copyFileSync(path.join(root, 'native-fcm', name), path.join(javaDir, name));
}

// El token se pide al arrancar el proceso, fuera del camino del arranque.
replaceOnce(path.join(javaDir, 'Application.java'),
  `  @Override
  public void onCreate() {
      super.onCreate();`,
  `  @Override
  public void onCreate() {
      super.onCreate();
      TokenFcm.pedirEnSegundoPlano(this);`,
  'TokenFcm.pedirEnSegundoPlano');

replaceOnce(path.join(javaDir, 'LauncherActivity.java'),
  '        return uri;',
  `        String destino = getIntent().getStringExtra("push_url");
        if (destino != null && destino.startsWith("#/")) {
            return Uri.parse(uri.toString().split("#")[0] + destino);
        }
        String token = TokenFcm.conEsperaCorta(this);
        if (token != null && !token.isEmpty() && uri.getFragment() == null) {
            return Uri.parse(uri.toString() + "#/inicio?native_fcm=" + Uri.encode(token));
        }
        return uri;`,
  'TokenFcm.conEsperaCorta');

const launcher = path.join(javaDir, 'LauncherActivity.java');
replaceOnce(launcher,
  'import android.content.pm.ActivityInfo;',
  'import android.Manifest;\nimport android.content.pm.ActivityInfo;\nimport android.content.pm.PackageManager;',
  'import android.Manifest;');
replaceOnce(launcher,
  '    @Override\n    protected void onCreate(Bundle savedInstanceState) {',
  `    private static final int PERMISO_AVISOS = 104;
    private boolean twaLanzada = false;

    // Esperar sólo al diálogo de Android. Si la persona no acepta, la app
    // igualmente abre; nunca dependemos de Firebase para iniciar la TWA.
    @Override
    protected boolean shouldLaunchImmediately() {
        return false;
    }

    private void lanzarTwaUnaVez() {
        if (!twaLanzada && !isFinishing()) {
            twaLanzada = true;
            launchTwa();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISO_AVISOS) lanzarTwaUnaVez();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {`,
  'private static final int PERMISO_AVISOS');
replaceOnce(launcher,
  `            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }`,
  `            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
        if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED &&
                !getSharedPreferences("pensandote_fcm", MODE_PRIVATE).getBoolean("permiso_pedido", false)) {
            getSharedPreferences("pensandote_fcm", MODE_PRIVATE).edit()
                    .putBoolean("permiso_pedido", true).apply();
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, PERMISO_AVISOS);
        } else {
            lanzarTwaUnaVez();
        }
    }`,
  'requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }');

console.log('Integración FCM aplicada al proyecto Android generado.');
