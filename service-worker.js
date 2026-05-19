/* Pensándote — Service Worker
 *
 * Estrategia v0.1 (cache shell mínimo):
 *  - precache de los archivos estáticos del shell
 *  - network-first para todo lo demás (la app es 99% online por Supabase)
 *  - sin background sync ni push (todavía)
 *
 * Cuando rompamos algo del shell, BUMPEAR CACHE_NAME (sufijo de versión).
 */

const CACHE_NAME = 'pensandote-shell-v0.2.0';

const SHELL_FILES = [
    './',
    './index.html',
    './styles.css',
    './manifest.json',
    './app.js',
    './js/mocks.js',
    './js/state.js',
    './js/router.js',
    './js/ui.js',
    './js/dev-panel.js',
    './js/screens-simple.js',
    './js/screens-dashboard.js',
    './js/screens-v2.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(SHELL_FILES))
            .catch(err => console.warn('[sw] precache parcial:', err))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Sólo cacheamos GET.
    if (request.method !== 'GET') return;

    // Bypass para Supabase y para cualquier llamada cross-origin (auth, RPC, storage).
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(resp => {
                // Clonamos para guardar en cache sin consumir el body
                const copy = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
                return resp;
            })
            .catch(() => caches.match(request).then(hit => hit || caches.match('./index.html')))
    );
});
