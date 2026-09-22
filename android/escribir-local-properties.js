/*
 * Escribe android/local.properties con la ruta del Android SDK.
 *
 * Gradle necesita saber donde esta el SDK y lo lee de este archivo. El
 * archivo NO se versiona (es una ruta de esta maquina) y ademas
 * setup-twa.js regenera el proyecto y se lo lleva puesto, asi que cada
 * vez que se regenera hay que volver a escribirlo. En vez de hacerlo a
 * mano y olvidarse, lo sacamos de la config de bubblewrap, que ya tiene
 * la ruta correcta porque es la que uso para generar el proyecto.
 *
 * Run: node android/escribir-local-properties.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG = path.join(os.homedir(), '.bubblewrap', 'config.json');
const DESTINO = path.join(__dirname, 'local.properties');

if (!fs.existsSync(CONFIG)) {
    console.error('No encuentro la config de bubblewrap en', CONFIG);
    process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const sdk = cfg.androidSdkPath;
if (!sdk) {
    console.error('La config de bubblewrap no tiene androidSdkPath:', Object.keys(cfg).join(', '));
    process.exit(1);
}

// Gradle espera las barras y los dos puntos escapados en Windows.
const escapada = sdk.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
fs.writeFileSync(DESTINO, 'sdk.dir=' + escapada + os.EOL, 'utf8');
console.log('sdk.dir =', sdk);
console.log('-> escrito', DESTINO);
