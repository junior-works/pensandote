const assert = require('node:assert/strict');
const fs = require('node:fs');
const css = fs.readFileSync(require('node:path').join(__dirname, '../styles.css'), 'utf8');
const system = css.slice(css.indexOf('SISTEMA ÚNICO DE CONTROLES'));
function rgb(hex) { return hex.match(/../g).map(n => parseInt(n, 16)); }
function luminance(values) {
    const c = values.map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
let count = 0;
for (const match of system.matchAll(/--control-ink: #([0-9a-f]{6});\s*--control-top: [^;]+;\s*--control-bottom: rgba\((\d+),(\d+),(\d+),([.\d]+)\);\s*--control-border: #([0-9a-f]{6})/g)) {
    const alpha = Number(match[5]);
    const fill = [Number(match[2]), Number(match[3]), Number(match[4])].map((value, i) => value * alpha + rgb('faf5e9')[i] * (1 - alpha));
    assert(contrast(rgb(match[1]), fill) >= 4.5, 'Texto del control insuficiente');
    assert(contrast(rgb(match[6]), fill) >= 3, 'Borde del control insuficiente');
    count++;
}
assert.equal(count, 6, 'Revisar todas las variantes, incluida neutral');
assert(system.includes('--admin-bg: #faf5e9;'));
assert(system.includes('--font-admin: var(--font-ui);'));
assert(system.includes('.tabs { flex-wrap: wrap;'));
console.log('OK: 6 paletas con texto >=4.5:1 y bordes >=3:1; tema y fuente compartidos, pestañas adaptables');
