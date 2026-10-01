@echo off
REM ==============================================================
REM  Pensandote - compilar y FIRMAR la app Android con Firebase.
REM
REM  El orden importa: setup-twa.js regenera android/app desde cero
REM  y borra la integracion Firebase, asi que apply-native-fcm.js
REM  tiene que correr DESPUES.
REM
REM  El APK firmado sirve para dos cosas con un solo build: se
REM  instala a mano en el telefono para probar, y es el mismo
REM  archivo que se sube a Play Console.
REM
REM  bubblewrap pide la contrasena del keystore en esta ventana.
REM  La ventana queda abierta al final a proposito: si algo falla,
REM  el error se lee ahi.
REM ==============================================================

cd /d "%~dp0"
set LOG=_construir_nativa_log.txt

echo ===== %DATE% %TIME% ===== > "%LOG%"

echo [1/4] Regenerando el proyecto Android...
node android\setup-twa.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] setup-twa.js >> "%LOG%" & goto :fin )

echo [2/4] Reaplicando Firebase nativo...
node android\apply-native-fcm.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] apply-native-fcm.js >> "%LOG%" & goto :fin )

echo [3/4] Ruta del Android SDK...
node android\escribir-local-properties.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] sin ruta del SDK >> "%LOG%" & goto :fin )

echo. >> "%LOG%"
echo --- Comprobaciones --- >> "%LOG%"
findstr /i "POST_NOTIFICATIONS" android\app\src\main\AndroidManifest.xml >> "%LOG%" 2>&1
findstr /i "NativeFirebaseMessagingService" android\app\src\main\AndroidManifest.xml >> "%LOG%" 2>&1
findstr /i "LauncherActivity.class" android\app\src\main\java\com\juniorworks\pensandote\NativeBootstrapActivity.java >> "%LOG%" 2>&1
findstr /i "native_fcm_token" android\app\src\main\java\com\juniorworks\pensandote\LauncherActivity.java >> "%LOG%" 2>&1

echo.
echo ==================================================================
echo  [4/4] Ahora pide la contrasena del keystore.
echo        Esta en android\KEYSTORE_INFO.txt, linea "Keystore pass".
echo        Escribila aca (no se ve al tipear) y Enter.
echo ==================================================================
echo.
cd android
call bubblewrap build --skipPwaValidation
cd ..

echo. >> "%LOG%"
echo --- APK firmado --- >> "%LOG%"
dir android\app-release-signed.apk >> "%LOG%" 2>&1

:fin
echo [FIN] >> "%LOG%"
echo.
echo ==================================================================
echo  Termino. Si hubo error, esta arriba en esta misma ventana.
echo ==================================================================
pause
