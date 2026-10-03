// Verificador del proyecto. Dos cosas:
//   1. SINTAXIS, parseando cada archivo COMO MODULO. Esto es lo que
//      importa: `node --check archivo.js` lo parsea como script viejo y
//      deja pasar errores que el navegador si rechaza. Me paso: subi un
//      `}` de mas y la app no arrancaba en el telefono mientras aca
//      "compilaba bien".
//   2. Que cada import apunte a un archivo que existe y a un nombre que
//      ese archivo realmente exporta.
import fs from 'fs'; import path from 'path'; import os from 'os';
import { execFileSync } from 'child_process';

const raiz = process.cwd();
const archivos = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) {
  if (e.name==='node_modules'||e.name.startsWith('.')) continue;
  const f=path.join(d,e.name);
  if (e.isDirectory()) walk(f); else if (e.name.endsWith('.js')) archivos.push(f);
}})(raiz);

let fallas = 0;
const tmp = path.join(os.tmpdir(), `chk-${process.pid}.mjs`);
for (const f of archivos) {
  fs.copyFileSync(f, tmp);
  try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); }
  catch (e) {
    const msg = String(e.stderr || e.message).split('\n').filter(Boolean).slice(0,4).join(' | ');
    console.log('SINTAXIS', path.relative(raiz,f), '->', msg.replace(tmp, path.relative(raiz,f)));
    fallas++;
  }
}
try { fs.unlinkSync(tmp); } catch {}

const exportsDe = (f) => {
  const t = fs.readFileSync(f,'utf8'); const out = new Set();
  for (const m of t.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)) out.add(m[1]);
  for (const m of t.matchAll(/^export\s+(?:const|let|var|class)\s+(\w+)/gm)) out.add(m[1]);
  for (const m of t.matchAll(/^export\s*\{([^}]+)\}/gm))
    for (const p of m[1].split(',')) { const n=p.trim().split(/\s+as\s+/).pop().trim(); if(n) out.add(n); }
  if (/^export\s+default/m.test(t)) out.add('default');
  return out;
};
const cache = new Map();
for (const f of archivos) {
  const t = fs.readFileSync(f,'utf8');
  for (const m of t.matchAll(/import\s+([^'"]*?)\s*from\s*['"](\.[^'"]+)['"]/g)) {
    const destino = path.resolve(path.dirname(f), m[2]);
    if (!fs.existsSync(destino)) { console.log('FALTA ARCHIVO', path.relative(raiz,f), '->', m[2]); fallas++; continue; }
    if (!cache.has(destino)) cache.set(destino, exportsDe(destino));
    const llaves = m[1].trim().match(/\{([^}]*)\}/);
    if (!llaves) continue;
    for (const p of llaves[1].split(',')) {
      const n = p.trim().split(/\s+as\s+/)[0].trim();
      if (n && !cache.get(destino).has(n)) { console.log('NO EXPORTA', path.relative(raiz,f), '->', m[2], ':', n); fallas++; }
    }
  }
}
console.log(fallas ? `\n${fallas} problema(s)` : `\nOK: ${archivos.length} archivos — sintaxis de modulo y imports`);
process.exit(fallas ? 1 : 0);
