/**
 * Pensándote — panel flotante de desarrollo.
 *
 * En modo demo: alterna entre los 4 miembros mock para ver simple vs
 * dashboard sin login. En modo real: muestra al usuario logueado y
 * permite volver al modo demo. También tiene un atajo para ir al
 * login real desde el modo demo.
 *
 * Cuando estabilicemos auth, este panel se esconde detrás de un flag
 * (e.g. ?dev=1) o se elimina del build.
 */

import { state, miembroActivo, setMiembroActivo, setModo, onStateChange } from './state.js';
import { configEsReal } from './auth.js';
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
        const enReal = state.modo === 'real';
        const cfgReal = configEsReal();
        el.innerHTML = `
            <header class="dev-panel__head">
                <strong>🛠 Dev · ${enReal ? 'real' : 'demo'}</strong>
                <button class="dev-panel__toggle" aria-label="Plegar / desplegar">_</button>
            </header>
            <div class="dev-panel__body">
                ${enReal ? renderReal() : renderDemo(cfgReal)}
                <p class="dev-panel__foot">
                    Maqueta v0.3 · ${cfgReal ? 'config OK' : 'sin config (demo only)'}
                </p>
            </div>
        `;
        wire(el);
    }

    render();
    onStateChange(render);
}

function renderDemo(cfgReal) {
    const activo = miembroActivo();
    return `
        <p class="dev-panel__hint">Cambiar miembro activo:</p>
        <ul class="dev-panel__list">
            ${state.miembros.map(m => {
                const tag = TAGS[m.interface_mode];
                const sel = m.id === activo.id ? ' is-selected' : '';
                return `
                    <li>
                        <button class="dev-panel__member${sel}" data-member="${m.id}">
                            <img src="${m.foto_url}" alt="" width="32" height="32">
                            <span class="dev-panel__name">
                                <strong>${m.nombre_corto}</strong>
                                <small>${m.parentesco}</small>
                            </span>
                            <span class="dev-panel__tag" style="background:${tag.color}">
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
        ${cfgReal ? `
            <p class="dev-panel__hint" style="margin-top:0.6rem;">Modo real:</p>
            <div class="dev-panel__shortcuts">
                <button data-modo="real">🔐 Ir al login</button>
            </div>
        ` : ''}
    `;
}

function renderReal() {
    const u = state.usuarioReal;
    return `
        <p class="dev-panel__hint">Sesión Supabase:</p>
        <div class="dev-panel__real">
            ${u
                ? `<strong>${u.email || u.id}</strong><br>
                   <small>${state.circulosReal.length} círculo(s)</small>`
                : `<small>Sin sesión</small>`}
        </div>
        <div class="dev-panel__shortcuts" style="margin-top:0.6rem;">
            <button data-modo="demo">🎭 Ver demo</button>
        </div>
    `;
}

function wire(el) {
    el.querySelectorAll('[data-member]').forEach(btn => {
        btn.addEventListener('click', () => {
            setMiembroActivo(btn.dataset.member);
            go('#/inicio');
        });
    });
    el.querySelectorAll('[data-go]').forEach(btn => {
        btn.addEventListener('click', () => go(btn.dataset.go));
    });
    el.querySelectorAll('[data-modo]').forEach(btn => {
        btn.addEventListener('click', () => {
            setModo(btn.dataset.modo);
            if (btn.dataset.modo === 'demo') go('#/inicio');
        });
    });
    el.querySelector('.dev-panel__toggle').addEventListener('click', () => {
        el.classList.toggle('is-collapsed');
    });
}
