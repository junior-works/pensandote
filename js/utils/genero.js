/**
 * Pensándote — heurística de género para el ícono de contactos.
 *
 * Devuelve un emoji por contacto:
 *   👩 femenino  ·  👨 masculino  ·  👤 neutro / no determinable
 *
 * Orden de decisión:
 *   1) `parentesco` — matcheo contra listas explícitas. Tomamos la
 *      PRIMERA palabra (así "Hija mayor" matchea por "Hija").
 *   2) Si no matchea o no hay parentesco, miramos el primer nombre:
 *      termina en "a" → fem; "o" → masc; otra cosa → neutro.
 *      Hay un set de NOMBRE_AMBIGUO para casos comunes argentinos donde
 *      la terminación engaña (Luca, Andrea, etc.).
 *
 * Normalización: lowercase + saca tildes + saca "ñ" (compañera ≡ companera).
 *
 * `foto_url` NO se evalúa acá — los renderers priorizan la foto cuando
 * existe; este helper solo decide el fallback.
 *
 * Para extender las listas: agregá la palabra (sin tildes ni ñ) al set
 * correspondiente.
 */

const PARENTESCO_F = new Set([
    'mama','hija','hermana','sobrina','tia','madre','abuela','nieta',
    'prima','vecina','esposa','cuidadora','enfermera','amiga','companera',
    'suegra','madrina','cunada','novia','doctora','medica','dra','sra'
]);

const PARENTESCO_M = new Set([
    'papa','hijo','hermano','sobrino','tio','padre','abuelo','nieto',
    'primo','vecino','esposo','cuidador','enfermero','amigo','companero',
    'suegro','padrino','cunado','novio','medico','doctor','dr','sr'
]);

// Nombres argentinos comunes donde la terminación NO indica género de
// forma confiable → mejor neutro.
const NOMBRE_AMBIGUO = new Set([
    'andrea','luca','joshua','bautista','noa','noah','dakota'
]);

function normalizar(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFD')                  // separa los acentos en chars combinantes
        .replace(/[̀-ͯ]/g, '')   // borra los combinantes (acentos, virgulilla)
        .trim();
}

function porParentesco(parentesco) {
    if (!parentesco) return null;
    const w = normalizar(parentesco).split(/\s+/)[0];
    if (!w) return null;
    if (PARENTESCO_F.has(w)) return 'f';
    if (PARENTESCO_M.has(w)) return 'm';
    return null;
}

function porNombre(nombre) {
    const first = normalizar(nombre).split(/\s+/)[0];
    if (!first) return null;
    if (NOMBRE_AMBIGUO.has(first)) return null;
    const last = first.slice(-1);
    if (last === 'a') return 'f';
    if (last === 'o') return 'm';
    return null;
}

/** 'f' | 'm' | null (no determinable). */
export function generoDeContacto({ nombre, parentesco } = {}) {
    return porParentesco(parentesco) || porNombre(nombre) || null;
}

/** Emoji del contacto. Si hay foto_url, los renderers la priorizan ANTES. */
export function iconoContacto(contacto = {}) {
    const g = generoDeContacto(contacto);
    if (g === 'f') return '👩';
    if (g === 'm') return '👨';
    return '👤';
}
