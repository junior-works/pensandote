const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const text = fs.readFileSync(path.join(__dirname, '../js/data-emotiva.js'), 'utf8');
const source = text.slice(text.indexOf('function urlBase64ToUint8Array'), text.indexOf('export async function desactivarAvisos'))
    .replaceAll('export async function', 'async function')
    .replaceAll('export function', 'function');

function scenario({ permission = 'granted', row = true, dbError = null, deleteError = null, expired = false, old = true } = {}) {
    const calls = { unsubscribed: 0, subscribed: 0, written: 0, deleted: 0 };
    const saved = new Map();
    let current;
    const subscription = endpoint => ({ endpoint, expirationTime: expired ? 1 : null,
        unsubscribe: async () => { calls.unsubscribed++; current = null; return true; },
        toJSON: () => ({ keys: { p256dh: 'key', auth: 'auth' } }) });
    current = old ? subscription('old-endpoint') : null;
    const reg = { pushManager: {
        getSubscription: async () => current,
        subscribe: async () => { calls.subscribed++; current = subscription('new-endpoint'); return current; }
    } };
    const sb = {
        auth: { getUser: async () => ({ data: { user: { id: 'me' } } }),
            getSession: async () => ({ data: { session: { access_token: 'token', user: { id: 'me' } } } }) },
        from: () => ({ select() { return this; }, delete() { calls.deleted++; this.deleting = true; return this; },
            eq() { if (this.deleting && ++this.filters === 2) return Promise.resolve({ error: deleteError }); return this; },
            filters: 0,
            maybeSingle: async () => ({ data: row ? { endpoint: 'old-endpoint' } : null, error: dbError }),
            insert: async record => { calls.written++; calls.record = record; return { error: null }; }
        })
    };
    const context = vm.createContext({
        window: { Notification: {}, PushManager: {}, PENSANDOTE_CONFIG: { SUPABASE_URL: 'https://example.com', SUPABASE_ANON_KEY: 'public' } },
        navigator: { serviceWorker: { ready: Promise.resolve(reg) }, userAgent: 'Android' },
        Notification: { permission, requestPermission: async () => 'granted' },
        localStorage: {
            getItem: key => saved.get(key) || null,
            setItem: (key, value) => saved.set(key, value),
            removeItem: key => saved.delete(key)
        },
        sbClient: async () => sb, enriquecer: (_, error) => new Error(error.message),
        setTimeout, clearTimeout, Date, console, Uint8Array, atob,
        fetch: async (_, options) => { calls.payload = JSON.parse(options.body); return { ok: true, json: async () => ({ sent: 1 }) }; }
    });
    vm.runInContext(source, context);
    return { context, calls, saved };
}
(async () => {
    let s = scenario({ row: false });
    assert.equal((await vm.runInContext('estadoAvisos()', s.context)).renovar, true);
    await vm.runInContext('activarAvisos("AQID")', s.context);
    assert.equal(s.calls.unsubscribed, 1);
    assert.equal(s.calls.subscribed, 1);
    assert.equal(s.calls.record.endpoint, 'new-endpoint');
    console.log('OK: registro eliminado se renueva, no se recicla');
    s = scenario();
    assert.equal((await vm.runInContext('estadoAvisos()', s.context)).estado, 'activado');
    await vm.runInContext('activarAvisos("AQID")', s.context);
    assert.equal(s.calls.unsubscribed, 0);
    assert.equal(s.calls.subscribed, 0);
    assert.equal(s.calls.written, 0);
    console.log('OK: registro válido se conserva');
    s = scenario({ expired: true });
    await vm.runInContext('activarAvisos("AQID")', s.context);
    assert.equal(s.calls.subscribed, 1);
    s = scenario({ permission: 'denied' });
    assert.equal((await vm.runInContext('estadoAvisos()', s.context)).estado, 'bloqueado');
    s = scenario({ dbError: { message: 'sin conexión' } });
    assert.equal((await vm.runInContext('estadoAvisos()', s.context)).estado, 'error');
    await assert.rejects(vm.runInContext('activarAvisos("AQID")', s.context));
    assert.equal(s.calls.unsubscribed, 0);
    console.log('OK: una falla de conexión no elimina un registro válido');
    s = scenario();
    await vm.runInContext('probarAviso("circle")', s.context);
    assert.equal(s.calls.payload.user_id, 'me');
    console.log('OK: la prueba se dirige sólo a la cuenta actual');
    s = scenario({ row: false });
    assert.equal(await vm.runInContext('repararAvisosConPermiso("AQID")', s.context), true);
    assert.equal(s.calls.subscribed, 1);
    assert.equal(s.calls.written, 1);
    console.log('OK: permiso concedido repara un registro perdido');
    s = scenario({ row: false });
    s.saved.set('pensandote:avisos:apagados-a-proposito', '1');
    assert.equal(await vm.runInContext('repararAvisosConPermiso("AQID")', s.context), false);
    assert.equal(s.calls.subscribed, 0);
    console.log('OK: no reactiva avisos apagados a propósito');
    s = scenario({ permission: 'denied', row: false });
    assert.equal(await vm.runInContext('repararAvisosConPermiso("AQID")', s.context), false);
    assert.equal(s.calls.subscribed, 0);
    console.log('OK: no intenta reparar permisos bloqueados');
    s = scenario();
    await vm.runInContext('reconectarAvisos("AQID")', s.context);
    assert.equal(s.calls.deleted, 1);
    assert.equal(s.calls.unsubscribed, 1);
    assert.equal(s.calls.subscribed, 1);
    assert.equal(s.calls.written, 1);
    assert.equal(s.calls.record.endpoint, 'new-endpoint');
    console.log('OK: reconectar borra el endpoint viejo y crea uno nuevo');
    s = scenario({ deleteError: { message: 'sin permiso' } });
    await assert.rejects(vm.runInContext('reconectarAvisos("AQID")', s.context));
    assert.equal(s.calls.unsubscribed, 0);
    console.log('OK: si falla el borrado remoto conserva la conexión local');
})().catch(error => { console.error(error); process.exitCode = 1; });
