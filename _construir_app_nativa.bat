@echo off
REM ==============================================================
REM  Pensandote - compilar y FIRMAR la app Android con Firebase
REM  nativo, para instalarla en el telefono.
REM
REM  El orden importa: setup-twa.js regenera android/app desde cero
REM  y se lleva puesta la integracion Firebase, asi que
REM  apply-native-fcm.js tiene que correr DESPUES. Ese es el paso
REM  que se olvida y deja una app sin notificaciones nativas.
REM
REM  Al final bubblewrap pide la contrasena del keystore para
REM  firmar. La escribe Charly en esta ventana: no queda guardada
REM  en ningun archivo ni la ve nadie mas.
REM
REM  El detalle queda en _construir_nativa_log.txt.
REM ==============================================================

cd /d "%~dp0"
set LOG=_construir_nativa_log.txt

echo ===== %DATE% %TIME% ===== > "%LOG%"

echo [1/4] Regenerando el proyecto Android...
echo --- 1) Regenerar el proyecto Android --- >> "%LOG%"
node android\setup-twa.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] fallo setup-twa.js >> "%LOG%" & goto :error )

echo [2/4] Reaplicando la integracion Firebase nativa...
echo. >> "%LOG%"
echo --- 2) Integracion Firebase nativa --- >> "%LOG%"
node android\apply-native-fcm.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] fallo apply-native-fcm.js >> "%LOG%" & goto :error )

echo [3/4] Ruta del Android SDK...
echo. >> "%LOG%"
echo --- 3) Ruta del Android SDK --- >> "%LOG%"
node android\escribir-local-properties.js >> "%LOG%" 2>&1
if errorlevel 1 ( echo [ERROR] sin ruta del SDK >> "%LOG%" & goto :error )

echo. >> "%LOG%"
echo --- Comprobaciones --- >> "%LOG%"
findstr /i "POST_NOTIFICATIONS" android\app\src\main\AndroidManifest.xml >> "%LOG%" 2>&1
findstr /i "NativeFirebaseMessagingService" android\app\src\main\AndroidManifest.xml >> "%LOG%" 2>&1
findstr /i "google-services" android\app\build.gradle >> "%LOG%" 2>&1

echo.
echo ================================================================
echo  [4/4] Ahora bubblewrap va a pedir la contrasena del keystore.
echo        Escribila aca (no se ve mientras la tipeas) y Enter.
echo ================================================================
echo.
cd android
call bubblewrap build --skipPwaValidation
cd ..

echo.
echo --- APK generados --- >> "%LOG%"
dir /b /s android\app-release-signed.apk >> "%LOG%" 2>&1
dir /b /s android\app\build\outputs\apk >> "%LOG%" 2>&1
goto :fin

:error
echo.
echo  Fallo un paso previo. Mira _construir_nativa_log.txt
echo.

:fin
echo. >> "%LOG%"
echo [FIN] >> "%LOG%"
echo.
echo Listo. El detalle esta en _construir_nativa_log.txt
echo.
pause
