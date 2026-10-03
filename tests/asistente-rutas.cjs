// Las rutas que el asistente puede ofrecer tienen que existir de verdad.
//
// El prompt de `asistente-pensa` describe la app: donde esta cada cosa y
// a que pantalla puede llevar. Esa descripcion vive en un archivo
// distinto del que dibuja las pantallas, asi que se desincroniza sola y
// en silencio. Paso: el prompt afirmaba que PAMI y ANSES estaban dentro
// de Salud cuando esa pantalla ya no los mostraba — y encima no habia
// NINGUN boton en toda la app que llevara ahi.
//
// Este test compara la lista blanca de rutas de la edge function contra
// las rutas que la app realmente monta. No puede comprobar que el texto
// en prosa del prompt sea cierto; si puede comprobar que ninguna ruta
// ofrecida termine en una pantalla inexistente.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const funcion = fs.readFileSync(path.join(raiz, 'supabase/functions/asistente-pensa/index.ts'), 'utf8');
const app = fs.readFileSync(path.join(raiz, 'app.js'), 'utf8');

// Rutas que el modelo tiene permitido devolver en una accion ir_a.
const bloque = funcion.slice(funcion.indexOf('const RUTAS_OK'), funcion.indexOf(']);', funcion.indexOf('const RUTAS_OK')));
const ofrecidas = [...bloque.matchAll(/"#\/([a-z0-9-]+)"/g)].map(m => m[1]);
assert.ok(ofrecidas.length >= 10, 'no pude leer RUTAS_OK — ¿cambio el formato?');

// Rutas que la app sabe dibujar: la tabla del modo demo + las del modo real.
const tabla = app.slice(app.indexOf('const RUTAS = {'), app.indexOf('\n};', app.indexOf('const RUTAS = {')));
const montadas = new Set([
    ...[...tabla.matchAll(/^\s*'([a-z0-9-]+)':/gm)].map(m => m[1]),
    ...[...app.matchAll(/ruta\.name === '([a-z0-9-]+)'/g)].map(m => m[1]),
]);

const huerfanas = ofrecidas.filter(r => !montadas.has(r));
assert.deepEqual(huerfanas, [],
    `el asistente puede mandar a pantallas que no existen: ${huerfanas.join(', ')}`);

// PAMI y ANSES ademas tiene que ser alcanzable SIN el asistente: una
// persona que no pregunta tiene que poder llegar sola.
const salud = fs.readFileSync(path.join(raiz, 'js/screens-simple.js'), 'utf8');
assert.ok(salud.includes('data-go="#/pami-anses"'),
    'PAMI y ANSES quedo sin boton: solo se llega si el ayudante te lleva');

console.log(`OK: las ${ofrecidas.length} rutas que el asistente puede ofrecer existen, y a PAMI y ANSES se llega sin preguntar`);
