@echo off
REM ==============================================================
REM  Pensandote — relanzar el server local de la maqueta navegable
REM  Doble-click en este archivo y queda sirviendo en :5501.
REM  Carpeta servida: la del propio .bat (esta worktree).
REM  Tiene que tener config.js para arrancar en modo real.
REM ==============================================================

cd /d "%~dp0"

if not exist config.js (
    echo.
    echo  [!]  Falta config.js en %CD%
    echo       Sin el, la app arranca en modo demo.
    echo.
)

echo Sirviendo %CD%  en  http://localhost:5501
echo (Ctrl+C para parar.)
echo.

npx --yes http-server -p 5501 -c-1 --silent
