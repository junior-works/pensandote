/**
 * Pensándote — botón pánico.
 *
 * Flujo v1:
 *  1) Pedir geolocalización (con timeout corto, para no congelar la UI).
 *  2) Disparar notificación a ntfy.sh con el topic del círculo.
 *  3) Abrir WhatsApp del contacto de emergencia con un mensaje pre-armado
 *     que incluye el link de Google Maps a la coordenada.
 *
 * TODO: leer topic real del círculo (`circles.ntfy_topic`?) — no está en
 * el schema todavía, decidir si lo agregamos a `circles` o a `medical_info`.
 */

export async function dispararPanico({ telefonoEmergencia, ntfyTopic }) {
    let posStr = 'ubicación no disponible';
    let mapsUrl = '';

    try {
        const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej,
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        });
        const { latitude, longitude } = pos.coords;
        posStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch {
        // sin permisos / timeout: igual seguimos
    }

    // ntfy.sh — fire and forget
    if (ntfyTopic) {
        fetch(`https://ntfy.sh/${ntfyTopic}`, {
            method: 'POST',
            headers: {
                'Title': 'EMERGENCIA — Pensándote',
                'Priority': 'urgent',
                'Tags': 'rotating_light'
            },
            body: `Botón de pánico activado.\nUbicación: ${posStr}\n${mapsUrl}`
        }).catch(() => {});
    }

    // WhatsApp
    if (telefonoEmergencia) {
        const msg = encodeURIComponent(
            `Necesito ayuda. Activé el botón de Pensándote.\nUbicación: ${mapsUrl || posStr}`
        );
        // Nº en formato internacional sin + ni espacios
        const tel = telefonoEmergencia.replace(/\D/g, '');
        window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
    }
}
