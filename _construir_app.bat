@echo off
REM ==============================================================
REM  Pensandote - regenerar la app Android (TWA) con notificaciones.
REM  Doble clic. No firma nada: eso necesita la contrasena del
REM  keystore y la pone Charly. El resultado queda en
REM  _construir_log.txt porque la ventana se cierra sola.
REM ==============================================================

cd /d "%~dp0"
set LOG=_construir_log.txt

echo ===== %DATE% %TIME% ===== > "%LOG%"
echo. >> "%LOG%"

echo --- 1) Regenerar el proyecto Android desde twa-manifest --- >> "%LOG%"
node android\setup-twa.js >> "%LOG%" 2>&1
if errorlevel 1 (
    echo. >> "%LOG%"
    echo [ERROR] Fallo setup-twa.js. No sigo con el build. >> "%LOG%"
    exit
)

echo. >> "%LOG%"
echo --- 2) Confirmar que quedo enableNotification true --- >> "%LOG%"
findstr /i "enableNotification" android\app\src\main\res\values\*.xml >> "%LOG%" 2>&1
findstr /i "POST_NOTIFICATIONS" android\app\src\main\AndroidManifest.xml >> "%LOG%" 2>&1

echo. >> "%LOG%"
echo --- 3) Ruta del Android SDK para gradle --- >> "%LOG%"
node android\escribir-local-properties.js >> "%LOG%" 2>&1
if errorlevel 1 (
    echo. >> "%LOG%"
    echo [ERROR] Sin ruta del SDK no puedo compilar. >> "%LOG%"
    exit
)

echo. >> "%LOG%"
echo --- 4) Bundle release SIN firmar --- >> "%LOG%"
del /q android\app\build\outputs\bundle\release\app-release.aab >nul 2>&1
cd android
call gradlew.bat bundleRelease --no-daemon >> "..\%LOG%" 2>&1
cd ..

echo. >> "%LOG%"
echo --- Resultado --- >> "%LOG%"
dir /b /s android\app\build\outputs\bundle >> "%LOG%" 2>&1

echo. >> "%LOG%"
echo [FIN] >> "%LOG%"
exit
