const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const baseline = process.argv.includes('--baseline');
const source = baseline
    ? execFileSync('git', ['show', 'HEAD:service-worker.js'], { cwd: root, encoding: 'utf8' })
    : fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const css = () => new Response('body { background: #faf5e9; }', { headers: { 'content-type': 'text/css' } });
const request = new Request('https://example.com/pensandote/styles.css?v=estilos34');

async function check(name, fresh, cached, expected) {
    let writes = 0;
    const context = vm.createContext({
        URL, console,
        self: { addEventListener() {}, location: { origin: 'https://example.com' } },
        caches: { open: async () => ({
            match: async (_, options) => cached && options?.ignoreSearch ? css() : undefined,
            put: async () => { writes++; }
        }) },
        fetch: async () => { if (fresh instanceof Error) throw fresh; return fresh; }
    });
    vm.runInContext(source, context);
    context.request = request;
    if (expected === 'reject') {
        await assert.rejects(vm.runInContext('networkFirst(request)', context));
    } else {
        const result = await vm.runInContext('networkFirst(request)', context);
        assert.equal(result.status, 200, name);
        assert.match(result.headers.get('content-type'), /^text\/css/, name);
    }
    if (!fresh?.ok || fresh.headers.get('content-type') !== 'text/css') {
        assert.equal(writes, 0, 'No se guarda una respuesta inválida');
    }
    console.log('OK:', name);
}

(async () => {
    await check('503 usa CSS guardado aunque cambie la versión', new Response('error', { status: 503 }), true);
    await check('404 usa CSS guardado', new Response('error', { status: 404 }), true);
    await check('HTML con status 200 no se usa como CSS', new Response('<html>error</html>', { headers: { 'content-type': 'text/html' } }), true);
    await check('Sin internet usa CSS guardado', new Error('offline'), true);
    await check('Sin copia ni respuesta útil rechaza la descarga', new Response('error', { status: 503 }), false, 'reject');
    await check('CSS válido se descarga normalmente', css(), false);

    if (baseline) return;
    const listeners = {};
    const deleted = [];
    let preserved;
    let claimed = false;
    const activation = vm.createContext({
        URL, console,
        self: { location: { href: 'https://example.com/pensandote/service-worker.js' },
            addEventListener: (name, callback) => { listeners[name] = callback; },
            clients: { claim: async () => { claimed = true; } } },
        caches: {
            keys: async () => ['otra-app', 'pensandote-shell-viejo', 'pensandote-shell-v0.10.34-estilos-resilientes'],
            open: async key => ({
                match: async () => key === 'pensandote-shell-viejo' ? css() : undefined,
                put: async (_, response) => { preserved = response; }
            }),
            delete: async key => { deleted.push(key); }
        }
    });
    vm.runInContext(source, activation);
    let activationDone;
    listeners.activate({ waitUntil(promise) { activationDone = promise; } });
    await activationDone;
    assert.equal(preserved.headers.get('content-type'), 'text/css');
    assert.deepEqual(deleted, ['pensandote-shell-viejo']);
    assert.equal(claimed, true);
    console.log('OK: actualización conserva CSS anterior y no borra cachés ajenas');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const guard = html.match(/<script>\s*(\(\(\) => \{[\s\S]*?)<\/script>/)[1];
    const element = { dataset: { styleState: 'pending' } };
    const link = { href: '' };
    const message = { textContent: '' };
    const page = vm.createContext({
        window: {}, Date, clearTimeout() {}, setTimeout() { return 1; },
        document: { documentElement: element, readyState: 'complete',
            getElementById: id => id === 'app-styles' ? link : message }
    });
    vm.runInContext(guard, page);
    page.window.pensandoteStylesFailed();
    assert.match(link.href, /retry=/);
    assert.equal(element.dataset.styleState, 'pending');
    page.window.pensandoteStylesFailed();
    assert.equal(element.dataset.styleState, 'failed');
    assert.match(message.textContent, /Volver a cargar/);
    page.window.pensandoteStylesLoaded();
    assert.equal(element.dataset.styleState, 'ready');
    console.log('OK: reintento, pantalla de recuperación y carga exitosa');
})().catch(error => { console.error(error); process.exitCode = 1; });
