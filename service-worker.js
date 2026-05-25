/* Pensándote — Service Worker (v0.4.0)
 *
 * Estrategia:
 *   - App shell (HTML, JS, CSS, JSON):   NETWORK-FIRST con `cache:'no-store'`
 *     en el fetch interno, así un deploy nuevo se ve sin quedar pegado al
 *     HTTP cache del navegador.
 *   - Estáticos (PNG/JPG/SVG/ICO/WEBP/WOFF): CACHE-FIRST. Cambian poco;
 *     ahorrar red importa en mobile.
 *   - skipWaiting + clients.claim para que un nuevo SW tome el control sin
 *     esperar que el usuario cierre todas las tabs.
 *   - Borrado de caches viejos en `activate`.
 *
 * Si rompemos algo del shell, BUMPEAR CACHE_NAME.
 *
 * Scope: el SW vive en el mismo directorio que index.html (subpath
 * /pensandote/ en GitHub Pages, raíz en dev local). Como se registra con
 * path relativo (`./service-worker.js`), el scope se deriva solo y queda
 * correcto en ambos entornos.
 */

const CACHE_NAME = 'pensandote-shell-v0.9.27';

const SHELL_FILES = [
    './',
    './index.html',
    './styles.css',
    './manifest.json',
    './app.js',
    './config.js',
    './js/mocks.js',
    './js/state.js',
    './js/router.js',
    './js/ui.js',
    './js/dev-panel.js',
    './js/screens-simple.js',
    './js/screens-dashboard.js',
    './js/screens-v2.js',
    './js/screens-real.js',
    './js/screens-hogar.js',
    './js/screens-admin.js',
    './js/preview.js',
    './js/screens-papa.js',
    './js/install-prompt.js',
    './js/data-emotiva.js',
    './js/audio.js',
    './js/auth.js',
    './js/circles.js'
];

const STATIC_EXT = /\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf)$/i;

// ---------------------------------------------------------------------------
// install: precache best-effort + skipWaiting
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // cache.add por archivo (no addAll) — si uno falla, los demás siguen.
        await Promise.all(SHELL_FILES.map(f =>
            cache.add(new Request(f, { cache: 'no-store' }))
                 .catch(err => console.warn('[sw] no precache:', f, err?.message || err))
        ));
        await self.skipWaiting();
    })());
});

// ---------------------------------------------------------------------------
// activate: limpiar caches viejos + tomar el control de los clients ya abiertos
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        );
        await self.clients.claim();
    })());
});

// ---------------------------------------------------------------------------
// fetch: network-first para shell, cache-first para estáticos
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    // Cross-origin (Supabase, ntfy, fonts.googleapis, dicebear, etc.):
    // dejar pasar sin tocar.
    if (url.origin !== self.location.origin) return;

    if (STATIC_EXT.test(url.pathname)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

// Network-first: fuerza bypass del HTTP cache del navegador con
// `cache: 'no-store'`. Si la red falla, cae al cache; si es una
// navegación y tampoco hay cache, sirve el index.html offline.
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh && fresh.ok && fresh.type !== 'opaque') {
            cache.put(request, fresh.clone()).catch(() => {});
        }
        return fresh;
    } catch (_) {
        const hit = await cache.match(request);
        if (hit) return hit;
        if (request.mode === 'navigate') {
            const idx = await cache.match('./index.html');
            if (idx) return idx;
        }
        throw _;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(request);
    if (hit) return hit;
    const fresh = await fetch(request);
    if (fresh && fresh.ok && fresh.type !== 'opaque') {
        cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
}

// Permite que el front mande `postMessage('skipWaiting')` cuando detecte
// un nuevo SW esperando, así forzamos la transición sin tener que cerrar
// la PWA. Aún no lo usamos desde app.js, pero queda listo.
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});

// ---------------------------------------------------------------------
// Web Push — handler `push` y `notificationclick`
// ---------------------------------------------------------------------
//
// Payload esperado (lo manda la edge function `enviar-push`):
//   { title: string, body: string, url?: string, tag?: string }
//
// Si llega vacío o malformado, mostramos un fallback genérico (Chrome
// exige una notificación por cada push silencioso o cierra la
// suscripción).
self.addEventListener('push', (event) => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; }
    catch (_) {
        try { data = { body: event.data?.text() || '' }; } catch (__) {}
    }
    const title = data.title || 'Pensándote';
    const opts = {
        body:  data.body || '',
        icon:  './assets/icon-192.png',
        badge: './assets/icon-192.png',
        // tag agrupa: dos pushes con el mismo tag se "consolidan" en
        // una sola notificación, evitando spam (ej. "papá no marcó hoy"
        // sobre el mismo círculo durante el día).
        tag:   data.tag || 'pensandote',
        // url viaja como dato para que `notificationclick` sepa adónde
        // llevar al usuario al tocarla.
        data:  { url: data.url || './' }
    };
    event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || './';
    event.waitUntil((async () => {
        const clientList = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });
        // Si la PWA ya está abierta en alguna pestaña, la enfocamos
        // y navegamos a la URL del aviso (mismo origen — usamos hash
        // para que sea instantáneo).
        for (const client of clientList) {
            if ('focus' in client) {
                try { client.postMessage({ type: 'push-navigate', url: targetUrl }); } catch (_) {}
                return client.focus();
            }
        }
        // Si no hay ninguna abierta, la abrimos.
        if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl);
        }
    })());
});
