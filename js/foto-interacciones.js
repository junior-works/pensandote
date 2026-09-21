/** Reacciones rápidas y comentarios del muro familiar. */

import { h, installModalBackButton, cleanupModalBackButton } from './ui.js';
import { reaccionarFoto, comentarFoto } from './data-emotiva.js';

export const EMOJIS_FOTO = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

function lista(valor) {
    return Array.isArray(valor) ? valor : [];
}

function nombreComentario(comentario, miembros, usuarioId) {
    if (comentario.user_id === usuarioId) return 'Vos';
    const miembro = lista(miembros).find(m => m.user_id === comentario.user_id);
    return miembro?.user?.nombre_completo
        || miembro?.nombre_completo
        || miembro?.parentesco
        || comentario.autor
        || 'Un familiar';
}

export function renderFotoInteracciones(foto, miembros, usuarioId) {
    const reacciones = lista(foto.foto_reacciones);
    const comentarios = [...lista(foto.foto_comentarios)]
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    const propia = reacciones.find(r => r.user_id === usuarioId)?.emoji;
    const conteos = new Map(EMOJIS_FOTO.map(emoji => [
        emoji,
        reacciones.filter(r => r.emoji === emoji).length
    ]));

    const activas = EMOJIS_FOTO.filter(emoji => conteos.get(emoji));

    return `
        <section class="foto-interacciones" data-foto-interacciones="${h(foto.id)}">
            <div class="foto-reacciones-resumen" aria-label="Reacciones de la foto">
                ${activas.length
                    ? activas.map(emoji => `
                        <span class="foto-reaccion-chip${propia === emoji ? ' is-propia' : ''}">
                            <span aria-hidden="true">${emoji}</span> ${conteos.get(emoji)}
                        </span>`).join('')
                    : '<span class="foto-reacciones-pista">Tocá la foto para reaccionar</span>'}
            </div>

            <details class="foto-comentarios">
                <summary>💬 ${comentarios.length
                    ? `${comentarios.length} ${comentarios.length === 1 ? 'comentario' : 'comentarios'}`
                    : 'Comentar'}</summary>
                ${comentarios.length ? `
                    <ul class="foto-comentarios__lista">
                        ${comentarios.map(c => `
                            <li><strong>${h(nombreComentario(c, miembros, usuarioId))}</strong> ${h(c.texto)}</li>
                        `).join('')}
                    </ul>
                ` : '<p class="foto-comentarios__vacio">Todavía nadie comentó.</p>'}
                <form class="foto-comentarios__form" data-foto-comentar>
                    <label class="sr-only" for="comentario-${h(foto.id)}">Escribir un comentario</label>
                    <input id="comentario-${h(foto.id)}" maxlength="280" required
                           placeholder="Escribí algo lindo…" autocomplete="off">
                    <button type="submit" aria-label="Enviar comentario">Enviar</button>
                </form>
            </details>
        </section>
    `;
}

/**
 * Conecta todas las interacciones dentro de un muro.
 * En demo actualiza sólo el estado de pantalla; en real persiste por RLS.
 */
export function wireFotoInteracciones(root, fotos, {
    circleId,
    usuarioId,
    miembros = [],
    demo = false,
    onError = null
} = {}) {
    const porId = new Map(lista(fotos).map(f => [String(f.id), f]));

    function reportar(error) {
        console.error('[foto-interacciones]', error);
        if (onError) onError(error);
    }

    function reemplazar(foto, abierto = false) {
        const anterior = [...root.querySelectorAll('[data-foto-interacciones]')]
            .find(el => el.dataset.fotoInteracciones === String(foto.id));
        if (!anterior) return;
        anterior.outerHTML = renderFotoInteracciones(foto, miembros, usuarioId);
        const nuevo = [...root.querySelectorAll('[data-foto-interacciones]')]
            .find(el => el.dataset.fotoInteracciones === String(foto.id));
        if (abierto) nuevo?.querySelector('.foto-comentarios')?.setAttribute('open', '');
        if (nuevo) conectar(nuevo, foto);
    }

    async function guardarReaccion(foto, emoji, botones) {
        const reacciones = lista(foto.foto_reacciones);
        const indice = reacciones.findIndex(r => r.user_id === usuarioId);
        const quitar = indice >= 0 && reacciones[indice].emoji === emoji;
        botones.forEach(b => { b.disabled = true; });
        try {
            if (!demo) {
                await reaccionarFoto({ fotoId: foto.id, circleId, emoji, quitar });
            }
            if (quitar) {
                reacciones.splice(indice, 1);
            } else {
                const nueva = { user_id: usuarioId, emoji, created_at: new Date().toISOString() };
                if (indice >= 0) reacciones[indice] = nueva;
                else reacciones.push(nueva);
            }
            foto.foto_reacciones = reacciones;
            reemplazar(foto);
            return true;
        } catch (error) {
            botones.forEach(b => { b.disabled = false; });
            reportar(error);
            return false;
        }
    }

    function abrirFoto(foto) {
        document.querySelector('.foto-reaccion-overlay')?.remove();
        const propia = lista(foto.foto_reacciones).find(r => r.user_id === usuarioId)?.emoji;
        const overlay = document.createElement('div');
        overlay.className = 'foto-reaccion-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Foto familiar y reacciones');
        overlay.innerHTML = `
            <button class="foto-reaccion-overlay__cerrar" type="button" aria-label="Cerrar">×</button>
            <figure class="foto-reaccion-overlay__foto">
                <div class="foto-reaccion-overlay__lienzo">
                    <img src="${h(foto.url)}" alt="${h(foto.epigrafe || 'Foto familiar')}">
                    <div class="foto-reacciones-flotantes" aria-label="Elegí una reacción">
                        ${EMOJIS_FOTO.map(emoji => `
                            <button type="button"
                                    class="foto-reaccion-flotante${propia === emoji ? ' is-elegida' : ''}"
                                    data-foto-reaccion-flotante="${emoji}"
                                    aria-pressed="${propia === emoji}"
                                    aria-label="${propia === emoji ? 'Quitar' : 'Reaccionar con'} ${emoji}">
                                ${emoji}
                            </button>`).join('')}
                    </div>
                </div>
                ${foto.epigrafe ? `<figcaption>${h(foto.epigrafe)}</figcaption>` : ''}
            </figure>
            <p class="foto-reaccion-overlay__ayuda">Elegí una reacción</p>
        `;
        document.body.appendChild(overlay);
        document.body.classList.add('foto-reaccion-abierta');

        let cerrada = false;
        function cerrar() {
            if (cerrada) return;
            cerrada = true;
            cleanupModalBackButton(overlay);
            overlay.remove();
            document.body.classList.remove('foto-reaccion-abierta');
        }
        installModalBackButton(overlay, cerrar);
        overlay.querySelector('.foto-reaccion-overlay__cerrar').addEventListener('click', cerrar);
        overlay.addEventListener('click', ev => { if (ev.target === overlay) cerrar(); });
        overlay.querySelectorAll('[data-foto-reaccion-flotante]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const ok = await guardarReaccion(
                    foto,
                    btn.dataset.fotoReaccionFlotante,
                    [...overlay.querySelectorAll('button')]
                );
                if (ok) cerrar();
            });
        });
    }

    function conectar(contenedor, foto) {
        contenedor.querySelector('[data-foto-comentar]')?.addEventListener('submit', async ev => {
            ev.preventDefault();
            const input = ev.currentTarget.querySelector('input');
            const texto = input.value.trim();
            if (!texto) return;
            const boton = ev.currentTarget.querySelector('button');
            boton.disabled = true;
            try {
                const creado = demo
                    ? {
                        id: crypto.randomUUID(),
                        user_id: usuarioId,
                        texto,
                        created_at: new Date().toISOString()
                    }
                    : await comentarFoto({ fotoId: foto.id, circleId, texto });
                foto.foto_comentarios = [...lista(foto.foto_comentarios), creado];
                reemplazar(foto, true);
            } catch (error) {
                boton.disabled = false;
                reportar(error);
            }
        });
    }

    root.querySelectorAll('[data-foto-interacciones]').forEach(contenedor => {
        const foto = porId.get(contenedor.dataset.fotoInteracciones);
        if (foto) conectar(contenedor, foto);
    });
    root.querySelectorAll('[data-foto-abrir]').forEach(elemento => {
        const foto = porId.get(elemento.dataset.fotoAbrir);
        if (!foto) return;
        elemento.addEventListener('click', ev => {
            ev.stopPropagation();
            abrirFoto(foto);
        });
        elemento.addEventListener('keydown', ev => {
            if (ev.key !== 'Enter' && ev.key !== ' ') return;
            ev.preventDefault();
            abrirFoto(foto);
        });
    });
}
