/**
 * Pensándote — botón pánico.
 *
 * Flujo:
 *   1) Pedir geolocalización (timeout corto, seguir sin coords si no
 *      hay permiso — el aviso igual sale).
 *   2) Abrir WhatsApp del contacto de emergencia primario con un
 *      mensaje pre-armado tipo "🆘 [Nombre] tocó el botón…" + link de
 *      Google Maps.
 *
 * NO usamos ntfy.sh: la familia no va a instalar la app ntfy ni
 * suscribirse a un topic — fricción que no hacen. WhatsApp lo tienen
 * todos. La columna `circles.ntfy_topic` queda en la DB pero no se usa.
 */

export async function dispararPanico({ telefonoEmergencia, nombre = null }) {
    if (!telefonoEmergencia) {
        // Caller debería validar antes y mostrar UI honesta, pero
        // damos un error claro por si no.
        throw new Error('sin teléfono de emergencia configurado');
    }

    let mapsUrl = '';
    try {
        const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej,
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        });
        const { latitude, longitude } = pos.coords;
        mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch {
        // sin permisos / timeout: seguimos, el mensaje lo aclara
    }

    const quien = (nombre || '').trim() || 'Tu familiar';
    const partes = [
        `🆘 ${quien} tocó el botón de ayuda en Pensándote.`,
        'Puede necesitar asistencia.'
    ];
    if (mapsUrl) partes.push(`Ubicación: ${mapsUrl}`);
    else         partes.push('Ubicación: no la pude obtener (sin permiso de GPS).');

    const tel = String(telefonoEmergencia).replace(/\D/g, '');
    const msg = encodeURIComponent(partes.join('\n'));
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
}
