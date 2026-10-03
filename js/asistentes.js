/**
 * Pensándote — el catálogo de ayudantes.
 *
 * El ayudante es del CÍRCULO, no de la app. Una persona habla con Nube y
 * otra con el Diego, y el tutor ve el que corresponde a cada una. Por eso
 * el slug vive en `circles.asistente` y acá sólo está lo que necesita el
 * navegador para dibujarlo.
 *
 * Los nombres para armar frases (sujeto, mención) están también en la
 * tabla `asistentes` de la base, porque los avisos push los arma un
 * trigger y no puede importar este archivo. Si agregás uno, va en los dos
 * lados.
 *
 * DOS FORMAS DE DIBUJAR, y es la diferencia que más importa:
 *
 *   'sprite'   Nube. Una sola imagen con nueve cuadros y capas separadas
 *              de ojos y boca, así que puede mover la boca al hablar.
 *
 *   'imagenes' El Diego. Doce archivos sueltos, uno por expresión,
 *              más los parches de boca que se recortaron aparte (ver
 *              `boca` más abajo). Con eso sí mueve la boca al hablar,
 *              por amplitud, no por fonema.
 *
 * Además las doce cabezas no están calzadas entre sí (hasta 32 px de
 * corrimiento sobre un lienzo de 1254). A la escala en que se ve la cara
 * son unos 4 px, y el fundido de `transicionMs` los disimula. Si algún
 * día se ve un salto, es por acá.
 */

import { state } from './state.js';

export const ASISTENTES = {
    nube: {
        slug:   'nube',
        nombre: 'Nube',
        sujeto: 'Nube',
        mencionA: 'a Nube',
        descripcion: 'El de siempre.',
        modo: 'sprite',
        hoja: './assets/nube/nube-sprites-v1.webp',
        retrato: './assets/nube/nube-reposo.webp',
        animaBoca: true,
        transicionMs: 0,

        // La voz la pone el telefono; nosotros solo decimos que preferimos.
        // Esto es lo que ya habia, que se habia elegido para un perrito:
        // apenas mas aguda y mas lenta, para que no suene imperativa.
        voz: {
            rate: 0.88,
            pitch: 1.06,
            indice: 0,
            nombres: /(elena|helena|laura|dalia|sabina|sofia|sofía|paulina|monica|mónica|luciana|valentina|female|mujer)/i
        }
    },
    diego: {
        slug:   'diego',
        nombre: 'Diego',
        sujeto: 'El Diego',
        mencionA: 'al Diego',
        descripcion: 'Un personaje inspirado en el Diego joven.',
        modo: 'imagenes',
        carpeta: './assets/asistentes/diego/',
        retrato: './assets/asistentes/diego/00-reposo.webp',
        animaBoca: true,
        transicionMs: 150,

        // Grave y un poco mas pausado. No va a sonar a el: es una voz
        // sintetica del telefono. Lo que si logra es que no sea la misma
        // voz que Nube, que era lo que lo volvia el mismo personaje.
        voz: {
            rate: 0.90,
            pitch: 0.90,
            indice: 1,
            nombres: /(jorge|pablo|diego|carlos|miguel|andres|andrés|lucas|male|hombre|masculin)/i
        },

        // LA BOCA, que es lo delicado.
        //
        // Las siete poses de habla vienen como cabezas enteras, y esas
        // cabezas difieren de la base en TODOS lados, no sólo en la boca:
        // medido, el cambio fuerte cubre el pelo y el contorno. Alternar
        // las cabezas completas haría saltar la cara entera.
        //
        // Así que de cada pose se recortó sólo el parche de la boca, con
        // una máscara de caja redondeada y bordes difuminados, recortada
        // además contra la silueta de la cara base para no inventar
        // contorno.
        //
        // El recorte NO es el que sugiere el paquete. Ese (455x245 desde
        // y=790) cortaba el labio de abajo: cuando la mandíbula baja, el
        // labio queda más abajo, y al difuminarse ahí se mezclaba con el
        // mentón de la cara cerrada y el labio se perdía. Medido, el
        // movimiento real llega hasta y=1159, no hasta 1035. Este recorte
        // (540x420 desde 360,760) lo cubre entero.
        //
        // Y la máscara es caja redondeada, no elipse: una elipse se come
        // justo las esquinas de abajo, que es donde vive ese labio.
        boca: {
            carpeta: './assets/asistentes/diego/bocas/',
            caja: { left: '28.71%', top: '60.61%', width: '43.06%', height: '33.49%' },
            // El motor interpola amplitud de 0 a 1: 'suave' entra primero y
            // 'abierta' se le superpone en los picos. Es sincronía
            // APROXIMADA por amplitud, no fonética: el paquete no trae
            // tiempos de fonemas y no los vamos a inventar.
            suave:   'boca-entreabierta.webp',
            abiertas: ['boca-a.webp', 'boca-e.webp', 'boca-o.webp'],
            otras:   { fv: 'boca-fv.webp', i: 'boca-i.webp' }
        },
        // Los nueve estados de EXPRESION que usa el rig. `talkSoft` y
        // `talkOpen` apuntan al reposo porque el habla no se dibuja
        // cambiando la cabeza: se dibuja con los parches de boca de
        // arriba, pegados sobre esta misma cara.
        cuadros: {
            idle:      '00-reposo.webp',
            listening: '03-escucha.webp',
            blink:     '02-parpadeo-cerrado.webp',
            happy:     '04-sonrisa-amplia.webp',
            talkSoft:  '00-reposo.webp',
            talkOpen:  '00-reposo.webp',
            thinking:  '06-pensando.webp',
            empathy:   '05-empatia.webp',
            surprised: '11-ceja-arriba.webp'
        },
        // Para el parpadeo en dos tiempos y los micro-movimientos del reposo.
        extras: {
            parpadeoMedio: '01-parpadeo-medio.webp',
            miradaIzq:     '07-mirada-izquierda.webp',
            miradaDer:     '08-mirada-derecha.webp',
            serio:         '09-serio.webp',
            cabezaInclinada: '10-cabeza-inclinada.webp'
        }
    }
};

export const ASISTENTE_POR_DEFECTO = 'nube';

/** El ayudante de un círculo, con Nube como red de seguridad. */
export function asistenteDe(circulo) {
    const slug = circulo?.asistente || ASISTENTE_POR_DEFECTO;
    return ASISTENTES[slug] || ASISTENTES[ASISTENTE_POR_DEFECTO];
}

/** La URL de la imagen de un estado. Sólo para el modo 'imagenes'. */
export function archivoDeCuadro(asis, estado) {
    if (asis.modo !== 'imagenes') return null;
    const archivo = asis.cuadros?.[estado] || asis.cuadros?.idle;
    return archivo ? asis.carpeta + archivo : null;
}

export function listaDeAsistentes() {
    return Object.values(ASISTENTES);
}

/**
 * El ayudante del circulo que se esta mirando ahora.
 *
 * Existe porque el nombre del ayudante aparece en DECENAS de textos de
 * las dos pantallas ("Hablar con X", "avisos de X", "X se lo va a
 * preguntar"). Si cada pantalla lo resuelve por su cuenta, alcanza con
 * que una se olvide para que al papa de Charly le diga "Hablar con
 * Nube" abajo de la cara del Diego. Paso.
 */
export function asistenteActual() {
    const circulo = (state.circulosReal || [])
        .find(x => x.id === state.circuloActivoIdReal);
    return asistenteDe(circulo);
}
