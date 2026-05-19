/**
 * Pensándote — panel flotante de desarrollo.
 *
 * Permite cambiar el "miembro activo" sin un flujo de login real, así
 * podemos ver de un toque la UI simple vs la UI dashboard, con distintos
 * roles. Cuando entre Supabase Auth, este panel desaparece (o se esconde
 * detrás de una flag).
 */

import { state, miembroActivo, setMiembroActivo } from './state.js';
import { go } from './router.js';

const TAGS = {
    simple:    { label: 'simple',    color: '#f4b860' },
    dashboard: { label: 'dashboard', color: '#6ca0a0' }
};

export function montarDevPanel() {
    const el = document.createElement('aside');
    el.id = 'dev-panel';
    el.setAttribute('aria-label', 'Panel de desarrollo');
    document.body.appendChild(el);

    function render() {
        const activo = miembroActivo();
        el.innerHTML = `
            <header class="dev-panel__head">
                <strong>🛠 Dev</strong>
                <button class="dev-panel__toggle" aria-label="Plegar / desplegar">_</button>
            </header>
            <div class="dev-panel__body">
                <p class="dev-panel__hint">Cambiar miembro activo:</p>
                <ul class="dev-panel__list">
                    ${state.miembros.map(m => {
                        const tag = TAGS[m.interface_mode];
                        const sel = m.id === activo.id ? ' is-selected' : '';
                        return `
                            <li>
                                <button class="dev-panel__member${sel}" data-id="${m.id}">
                                    <img src="${m.foto_url}" alt="" width="32" height="32">
                                    <span class="dev-panel__name">
                                        <strong>${m.nombre_corto}</strong>
                                        <small>${m.parentesco}</small>
                                    </span>
                                    <span class="dev-panel__tag"
                                          style="background:${tag.color}">
                                        ${tag.label}
                                    </span>
                                </button>
                            </li>
                        `;
                    }).join('')}
                </ul>
                <p class="dev-panel__hint">Ir a:</p>
                <div class="dev-panel__shortcuts">
                    <button data-go="#/inicio">Inicio</button>
                    <button data-go="#/v2/pense">v2 Pensé</button>
                    <button data-go="#/v2/historias">v2 Historias</button>
                </div>
                <p class="dev-panel__foot">
                    Maqueta v0.2 · datos mock · sin Supabase
                </p>
            </div>
        `;

        el.querySelectorAll('.dev-panel__member').forEach(btn => {
            btn.addEventListener('click', () => {
                setMiembroActivo(btn.dataset.id);
                // Reset a inicio para evitar quedar atrapado en una ruta
                // que el nuevo modo no expone.
                go('#/inicio');
            });
        });

        el.querySelectorAll('[data-go]').forEach(btn => {
            btn.addEventListener('click', () => go(btn.dataset.go));
        });

        el.querySelector('.dev-panel__toggle').addEventListener('click', () => {
            el.classList.toggle('is-collapsed');
        });
    }

    render();

    // re-render cuando cambia el miembro (para reflejar la selección)
    import('./state.js').then(({ onStateChange }) => {
        onStateChange(render);
    });
}
