// Un pedido no puede quedar archivado como respuesta.
//
// Antes, `preguntar()` guardaba primero y entendia despues: con el
// "¿como estas hoy?" en pantalla, "Llama a mi hija" quedaba registrado
// como un dia bueno; con una pregunta de recuerdos abierta, "Necesito
// ayuda" se guardaba como una historia de su vida, visible para todo el
// circulo, y nadie atendia el pedido.
//
// Este test lee las funciones del archivo real — no una copia — y las
// corre contra los casos que fallaban.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../js/nube-asistente.js'), 'utf8');

/** Saca una funcion del archivo por su nombre, tal como esta escrita. */
function extraer(nombre, sangria = '') {
    const firma = `${sangria}function ${nombre}(`;
    const desde = source.indexOf(firma);
    assert.notEqual(desde, -1, `no encontre ${nombre}() — ¿la renombraron?`);
    const hasta = source.indexOf(`\n${sangria}}`, desde) + sangria.length + 2;
    return source.slice(desde, hasta).replace(new RegExp(`^${sangria}`, 'gm'), '');
}

const codigo = [
    'sinTildes', 'esPedidoDeAccion', 'esSenalDeMalestar',
    'parecePedidoDeRecordatorio', 'pareceConsultaDeOrganismo', 'pareceConsultaDeCuidado',
].map(n => extraer(n)).concat(
    ['estadoDesdeRespuesta', 'pareceRespuestaDeRelato', 'pareceRespuestaDeCheckin', 'pareceNegativa']
        .map(n => extraer(n, '    '))
).join('\n');

const ctx = vm.createContext({});
vm.runInContext(codigo, ctx);
const { esPedidoDeAccion, estadoDesdeRespuesta, pareceRespuestaDeRelato, pareceNegativa } = ctx;

// --- Lo que rompia -------------------------------------------------
assert.equal(esPedidoDeAccion('Llamá a mi hija'), true,
    'un pedido de llamar no es una respuesta al chequeo');
assert.equal(estadoDesdeRespuesta('Llamá a mi hija'), null,
    'pedir que llamen a alguien no significa que este bien');
assert.equal(esPedidoDeAccion('Necesito ayuda'), true,
    'un pedido de ayuda se atiende, no se archiva');
assert.equal(pareceRespuestaDeRelato('Necesito ayuda'), false,
    'un pedido de ayuda NO se guarda como historia del circulo');
assert.equal(pareceRespuestaDeRelato('Llamá a mi hija'), false,
    'un mandado NO se guarda como historia del circulo');

// --- Lo que tiene que seguir andando -------------------------------
assert.equal(esPedidoDeAccion('Estoy bien'), false);
assert.equal(estadoDesdeRespuesta('Estoy bien'), 'bien');
assert.equal(estadoDesdeRespuesta('Más o menos'), 'regular');
assert.equal(estadoDesdeRespuesta('Bárbaro, gracias'), 'bien',
    'las vocales con tilde tienen que entrar: \\b no las reconoce en JS');
assert.equal(pareceRespuestaDeRelato('Mi primer trabajo fue en una panadería del barrio'), true);

// --- Malestar: queda anotado Y se atiende --------------------------
assert.equal(esPedidoDeAccion('Me duele la rodilla'), true);
assert.equal(estadoDesdeRespuesta('Me duele la rodilla'), 'mal');

// --- No asumir que esta bien por descarte --------------------------
assert.equal(estadoDesdeRespuesta('Hoy no tengo ganas de nada'), null,
    'sin senal clara, el animo queda sin registrar en vez de inventarse un "bien"');

// --- Poder decir que no --------------------------------------------
assert.equal(pareceNegativa('ahora no'), true);
assert.equal(pareceNegativa('otro día'), true);
assert.equal(pareceNegativa('Estoy bien'), false);

console.log('OK: un pedido se atiende, un recuerdo se guarda, y nadie queda "bien" por descarte');
