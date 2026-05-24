/**
 * Pensándote — generador de íconos PWA.
 *
 * Toma los SVGs canónicos (icon.svg, icon-maskable.svg) y los rasteriza
 * a los tamaños que el manifest necesita. Pensado para correrse con:
 *
 *     npx --yes sharp@0.33.5 --version          # bootstrap por si acaso
 *     node assets/gen_icons.cjs
 *
 * Si no tenés sharp en el cache de npx, podés hacer:
 *     npm i --no-save sharp@0.33.5
 *     node assets/gen_icons.cjs
 */

const fs   = require('fs');
const path = require('path');

const ASSETS = __dirname;
const TARGETS = [
    { src: 'icon.svg',          out: 'icon-192.png',          size: 192 },
    { src: 'icon.svg',          out: 'icon-512.png',          size: 512 },
    { src: 'icon-maskable.svg', out: 'icon-maskable-512.png', size: 512 }
];

(async () => {
    let sharp;
    try {
        sharp = require('sharp');
    } catch (e) {
        console.error('No encontré sharp. Probá:  npm i --no-save sharp@0.33.5');
        process.exit(1);
    }

    for (const t of TARGETS) {
        const srcPath = path.join(ASSETS, t.src);
        const outPath = path.join(ASSETS, t.out);
        await sharp(srcPath, { density: 384 })
            .resize(t.size, t.size, { fit: 'contain', background: '#faf5e9' })
            .png({ compressionLevel: 9 })
            .toFile(outPath);
        console.log(`✓ ${t.out} (${t.size}×${t.size})`);
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
