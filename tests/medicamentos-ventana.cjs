// El recordatorio tiene que entrar aunque el cron no corra en el minuto
// exacto de la dosis.
//
// El 22/9/2026 el cron paso de cada minuto a cada 10 (migracion
// 20260922103000) porque la instancia estaba frenada. La funcion seguia
// buscando el minuto EXACTO, asi que desde ese dia un remedio solo sonaba
// si su horario caia en :04, :05, :14, :15... Un remedio a las 08:00 no
// sonaba nunca.
//
// Este test lee las funciones del archivo real, les saca las anotaciones
// de TypeScript y las corre con el reloj congelado.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const fuente = fs.readFileSync(
    path.join(__dirname, '../supabase/functions/chequeo-medicamentos/index.ts'), 'utf8');

function extraer(nombre) {
    const desde = fuente.indexOf(`function ${nombre}(`);
    assert.notEqual(desde, -1, `no encontre ${nombre}() — ¿la renombraron?`);
    const hasta = fuente.indexOf('\n}', desde) + 2;
    return fuente.slice(desde, hasta);
}

const sinTipos = (js) => js
    .replace(/:\s*Map<string,\s*string>/g, '')
    .replace(/new Map<string,\s*string>\(\)/g, 'new Map()')
    .replace(/\(minutos:\s*number\)/g, '(minutos)')
    .replace(/\(desdeHaceMin:\s*number,\s*cuantos:\s*number\)/g, '(desdeHaceMin, cuantos)')
    .replace(/\(t:\s*string\)/g, '(t)')
    .replace(/:\s*\{\s*hhmm:\s*string;\s*fecha:\s*string;\s*minutos:\s*number\s*\}/g, '');

const codigo = sinTipos(extraer('ahoraARMenos') + '\n' + extraer('ventanaDeMinutos'));

// La constante, leida del archivo (si alguien la baja, el test lo nota).
const mVentana = /const VENTANA_MINUTOS = (\d+);/.exec(fuente);
assert.ok(mVentana, 'no encontre VENTANA_MINUTOS');
const VENTANA = Number(mVentana[1]);

const mCron = /const MINUTOS_PARA_AVISAR_AL_TUTOR = (\d+);/.exec(fuente);
assert.ok(mCron, 'no encontre MINUTOS_PARA_AVISAR_AL_TUTOR');
const ESPERA_TUTOR = Number(mCron[1]);

/** Corre el codigo con el reloj congelado en ese instante UTC. */
function conReloj(isoUTC) {
    const fijo = new Date(isoUTC).getTime();
    const ctx = vm.createContext({
        Intl,
        Date: class extends Date {
            constructor(...args) { super(...(args.length ? args : [fijo])); }
            static now() { return fijo; }
        },
    });
    vm.runInContext(codigo, ctx);
    return ctx;
}

// --- El cron corre a las 08:05; la dosis es a las 08:00 ------------
{
    const { ventanaDeMinutos } = conReloj('2026-10-04T11:05:30Z'); // 08:05 AR
    const v = ventanaDeMinutos(0, VENTANA);
    assert.ok(v.has('08:00'),
        'una dosis de las 08:00 tiene que entrar en la corrida de las 08:05');
    assert.equal(v.get('08:00'), '2026-10-04');
    assert.ok(v.has('08:05'), 'y el minuto en punto tambien');
    assert.ok(!v.has('07:50'),
        'pero no algo de hace 15 minutos: eso ya lo vio la corrida anterior');
}

// --- La ventana cruza la medianoche con la fecha correcta ---------
{
    const { ventanaDeMinutos } = conReloj('2026-10-04T03:03:00Z'); // 00:03 AR
    const v = ventanaDeMinutos(0, VENTANA);
    assert.ok(v.has('23:55'), 'una dosis de las 23:55 entra a las 00:03');
    assert.equal(v.get('23:55'), '2026-10-03',
        'y con la fecha de AYER: buscarla con la de hoy no la encontraria nunca');
    assert.equal(v.get('00:03'), '2026-10-04');
}

// --- El aviso al tutor mira 30 minutos atras, con la misma ventana -
{
    const { ventanaDeMinutos } = conReloj('2026-10-04T11:35:00Z'); // 08:35 AR
    const v = ventanaDeMinutos(ESPERA_TUTOR, VENTANA);
    assert.ok(v.has('08:00'),
        `una dosis de las 08:00 se revisa ${ESPERA_TUTOR} minutos despues`);
    assert.ok(!v.has('08:30'), 'y no una de hace cinco minutos');
}

// --- La ventana cubre el hueco del cron ----------------------------
assert.ok(VENTANA > 10,
    'el cron corre cada 10 minutos: con una ventana de 10 o menos, un horario puede caer en el medio y no verlo nadie');

console.log(`OK: ventana de ${VENTANA} min — una dosis de las 08:00 entra a las 08:05, y la medianoche no pierde la fecha`);
