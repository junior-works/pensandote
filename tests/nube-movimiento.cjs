const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
    const source = fs.readFileSync(path.join(__dirname, '../js/utils/nube-movimiento.js'), 'utf8');
    const { gestoNube, aperturaNube, suavizar } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
    for (let frame = 1; frame < 7200; frame++) {
        const t = frame / 60;
        const a = gestoNube(t, 1), b = gestoNube(t - 1 / 60, 1);
        assert(Math.abs(a.x - b.x) < 0.04);
        assert(Math.abs(a.y - b.y) < 0.08);
        assert(Math.abs(a.giro - b.giro) < 0.02);
        assert(Math.abs(a.escala - b.escala) < 0.001);
        assert(aperturaNube(t) >= 0 && aperturaNube(t) <= 1);
    }
    let mouth = 1;
    for (let frame = 0; frame < 30; frame++) mouth = suavizar(mouth, 0, 1 / 60);
    assert(mouth < 0.001, 'La boca debe cerrar gradualmente al terminar');
    assert(Math.abs(suavizar(0, 1, 1 / 30) - suavizar(suavizar(0, 1, 1 / 60), 1, 1 / 60)) < 1e-9);
    const assistant = fs.readFileSync(path.join(__dirname, '../js/nube-asistente.js'), 'utf8');
    assert(!assistant.includes('void el.offsetWidth'), 'Sin reflow por sílaba');
    assert(assistant.includes('cancelAnimationFrame(animacionFrame)'), 'Limpieza al navegar');
    assert(assistant.includes('onPause:') && assistant.includes('onResume:') && assistant.includes('onStart:'));
    console.log('OK: 7200 frames sin saltos, boca acotada, cierre suave, ritmo independiente de FPS y limpieza de animación');
})().catch(error => { console.error(error); process.exitCode = 1; });
