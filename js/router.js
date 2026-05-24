/**
 * Pensándote — router minimalista por hash.
 *
 * Las rutas viven en la URL (`#/inicio`, `#/emergencias`, `#/tutorial/t-foto-wsp`).
 * El router le pide a `app.js` cuál es la pantalla a mostrar; la decisión
 * de qué pantalla aplica para qué interface_mode la toma `app.js`.
 */

let _renderer = null;

/** Registra el callback que va a recibir cada cambio de ruta. */
export function onRouteChange(renderer) {
    _renderer = renderer;
    window.addEventListener('hashchange', _trigger);
    // dispará uno inicial al registrarse
    _trigger();
}

/** Devuelve la ruta actual normalizada: { name, params }. */
export function currentRoute() {
    const raw = (window.location.hash || '#/inicio').slice(1); // sin el '#'
    const [path, queryStr] = raw.split('?');
    const parts = path.split('/').filter(Boolean);  // ['tutorial', 't-foto-wsp']
    const name = parts[0] || 'inicio';
    const params = parts.slice(1);
    const query = Object.fromEntries(new URLSearchParams(queryStr || ''));
    return { name, params, query, raw };
}

/** Navega programáticamente. */
export function go(path) {
    if (!path.startsWith('#')) path = '#' + (path.startsWith('/') ? path : '/' + path);
    if (window.location.hash === path) {
        _trigger();
    } else {
        window.location.hash = path;
    }
}

/**
 * Igual que go() pero reemplaza la entrada actual del historial en
 * lugar de empujar una nueva. Útil para flujos donde no queremos que
 * el botón "atrás" del navegador / Android retroceda paso por paso
 * (ej: pasos del tutorial). hashchange NO se dispara con replaceState,
 * así que llamamos manualmente al renderer.
 */
export function goReplace(path) {
    if (!path.startsWith('#')) path = '#' + (path.startsWith('/') ? path : '/' + path);
    if (window.location.hash === path) {
        _trigger();
        return;
    }
    history.replaceState(null, '', path);
    _trigger();
}

/** Vuelve a renderear la ruta actual (útil cuando cambia el estado). */
export function refresh() {
    _trigger();
}

function _trigger() {
    if (typeof _renderer === 'function') {
        _renderer(currentRoute());
    }
}
