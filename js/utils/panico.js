/**
 * Pensándote — botón pánico.
 *
 * POR QUÉ CAMBIÓ
 *
 * Antes esto sólo abría WhatsApp con el mensaje escrito y se detenía
 * ahí: la persona todavía tenía que encontrar el botón verde y
 * tocarlo. Un paso más, en otra app, en el peor momento posible. Si se
 * cayó en la calle y está en el piso, ese paso no sucede, y entonces
 * no se entera nadie.
 *
 * Ahora el aviso sale SOLO, por la misma cañería que ya usamos para
 * todo lo demás: se escribe una fila en alertas_panico y el trigger de
 * la base le manda el aviso push a TODO el círculo, con el link de
 * dónde está. Eso llega al teléfono de la familia con la app cerrada,
 * sin que ella toque nada más.
 *
 * WhatsApp quedó, pero como complemento: suma el contacto primario por
 * un segundo canal. Si no lo manda, el aviso ya salió igual.
 *
 * El orden importa y es a propósito: primero el aviso, después
 * WhatsApp. Si algo falla, que falle lo accesorio.
 */

import { sbClient } from '../auth.js';

/** La ubicación, o null. Nunca bloquea más de 5 segundos. */
async function ubicacionAhora() {
    try {
        const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej,
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        });
        const { latitude, longitude, accuracy } = pos.coords;
        return {
            lat: latitude,
            lng: longitude,
            precision_m: accuracy ?? null,
            maps_url: `https://maps.google.com/?q=${latitude},${longitude}`
        };
    } catch {
        return null;   // sin permiso o sin señal: el aviso sale igual
    }
}

/**
 * Dispara la alerta. Devuelve qué pudo hacer, para que la pantalla le
 * diga la verdad a la persona en vez de prometerle algo que no pasó.
 *
 * @returns {{avisoEnviado: boolean, conUbicacion: boolean, whatsappAbierto: boolean}}
 */
export async function dispararPanico({ circleId, telefonoEmergencia, nombre = null }) {
    const ubi = await ubicacionAhora();
    const resultado = { avisoEnviado: false, conUbicacion: !!ubi, whatsappAbierto: false };

    // 1) El aviso al círculo. Esto es lo que tiene que salir sí o sí.
    if (circleId) {
        try {
            const sb = await sbClient();
            const { data: { user } } = await sb.auth.getUser();
            const { error } = await sb.from('alertas_panico').insert({
                circle_id:   circleId,
                autor_id:    user.id,
                lat:         ubi?.lat ?? null,
                lng:         ubi?.lng ?? null,
                precision_m: ubi?.precision_m ?? null,
                maps_url:    ubi?.maps_url ?? null
            });
            if (error) throw error;
            resultado.avisoEnviado = true;
        } catch (err) {
            console.error('[panico] no pude registrar la alerta', err);
        }
    }

    // 2) WhatsApp al contacto primario, como refuerzo.
    if (telefonoEmergencia) {
        const quien  = (nombre || '').trim() || 'Tu familiar';
        const partes = [
            `🆘 ${quien} tocó el botón de ayuda en Pensándote.`,
            'Puede necesitar asistencia.'
        ];
        partes.push(ubi
            ? `Ubicación: ${ubi.maps_url}`
            : 'Ubicación: no la pude obtener (sin permiso de GPS).');
        const tel = String(telefonoEmergencia).replace(/\D/g, '');
        try {
            window.open(`https://wa.me/${tel}?text=${encodeURIComponent(partes.join('\n'))}`, '_blank');
            resultado.whatsappAbierto = true;
        } catch (err) {
            console.error('[panico] no pude abrir WhatsApp', err);
        }
    }

    return resultado;
}
