import { modal, speakES } from '../ui.js';

/** El permiso se cambia en el teléfono: no prometer hacerlo desde la web. */
export async function ayudaAvisos() {
    const iphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const instalada = window.matchMedia?.('(display-mode: standalone)').matches;
    const chrome = 'Si la abrís desde Chrome: tocá el ícono de controles junto a la dirección, entrá en Permisos o Notificaciones y elegí “Permitir”.';
    const app = 'Desde el ícono instalado: mantené apretado el ícono de Pensándote, tocá “Información de la app” y después “Notificaciones”. Activálas.';
    const pasos = iphone
        ? (instalada
            ? ['Abrí Ajustes del teléfono.', 'Entrá en Notificaciones y buscá Pensándote.', 'Encendé “Permitir notificaciones” y volvé a la app.']
            : ['Abrí Pensándote en Safari.', 'Tocá Compartir y elegí “Agregar a pantalla de inicio”.', 'Abrila desde ese nuevo ícono y tocá “Sí, avisame”.'])
        : [instalada ? app : chrome,
            instalada ? chrome : app,
            'Volvé a Pensándote y tocá “Sí, avisame”.'];
    const value = await modal({
        titulo: 'Activemos los avisos juntos',
        cuerpo: `<p>Este permiso se cambia en tu teléfono. No necesitás cerrar tu sesión.</p><ol class="avisos-pasos">${pasos.map(p => `<li>${p}</li>`).join('')}</ol>`,
        acciones: [
            { label: 'Leeme los pasos', clase: 'btn--familia btn--full', value: 'leer' },
            { label: 'Ya entendí', clase: 'btn--inicio btn--full', value: 'ok' }
        ]
    });
    if (value === 'leer') {
        speakES('Te acompaño a activar los avisos. ' + pasos.join(' '));
        await ayudaAvisos();
    }
}

export async function probarAvisosGuiados(circleId) {
    let local = false;
    let enviado = false;
    let error = '';
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
            await reg.showNotification('Nube: prueba del teléfono', {
                body: 'Esta es la primera prueba. Ahora te mando otra por internet.',
                icon: './assets/icon-192.png', tag: 'nube-prueba-local'
            });
            local = true;
        }
        const { probarAviso } = await import('../data-emotiva.js');
        const result = await probarAviso(circleId);
        enviado = result?.sent > 0;
        if (!enviado) error = 'El servidor no pudo enviar la segunda prueba. Volvé a activar los avisos.';
    } catch (_) { error = 'No pude completar la prueba. Revisá la conexión y volvé a intentarlo.'; }
    const value = await modal({
        titulo: '¿Te llegaron los dos avisos?',
        cuerpo: `<p>${local ? 'El teléfono aceptó la primera prueba.' : 'El teléfono no aceptó la primera prueba.'}</p><p>${enviado ? 'La segunda se envió por internet. Buscá los dos avisos en la parte superior del teléfono.' : error}</p><p>Esta prueba se hizo con la app abierta. Para comprobar el segundo plano, volvé a la pantalla principal del teléfono, apagá la pantalla y pedile a un familiar que te mande algo. No uses “Forzar detención”. Hasta que veas ese aviso, no podemos confirmar la entrega.</p>`,
        acciones: [
            ...(local && enviado ? [{ label: 'Sí, me llegaron', clase: 'btn--inicio btn--full', value: 'si' }] : []),
            { label: 'Necesito ayuda', clase: 'btn--familia btn--full', value: 'ayuda' },
            { label: 'Cerrar', clase: 'btn--full', value: 'cerrar' }
        ]
    });
    if (value === 'ayuda') await ayudaAvisos();
}
