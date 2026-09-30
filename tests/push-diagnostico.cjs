const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const handlers = new Map();
let ultimo = null;
let mostrado = null;

const db = {
    objectStoreNames: { contains: () => false },
    createObjectStore: () => {},
    close: () => {},
    transaction: () => {
        const tx = {
            objectStore: () => ({ put: value => { ultimo = value; } }),
        };
        queueMicrotask(() => tx.oncomplete());
        return tx;
    }
};

const indexedDB = {
    open: () => {
        const req = { result: db };
        queueMicrotask(() => {
            req.onupgradeneeded();
            req.onsuccess();
        });
        return req;
    }
};

const self = {
    indexedDB,
    addEventListener: (name, fn) => handlers.set(name, fn),
    registration: {
        showNotification: async (title, options) => { mostrado = { title, options }; }
    }
};

const source = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
vm.runInNewContext(source, { self, console, Promise, Date, setTimeout, clearTimeout });

const push = handlers.get('push');
assert.equal(typeof push, 'function');

let trabajo;
push({
    data: { json: () => ({ title: 'Prueba de fondo', body: 'Hola', tag: 'diagnostico-test' }) },
    waitUntil: promise => { trabajo = promise; }
});

trabajo.then(() => {
    assert.equal(mostrado.title, 'Prueba de fondo');
    assert.equal(mostrado.options.tag, 'diagnostico-test');
    assert.equal(ultimo.aceptado, true);
    assert.equal(ultimo.version, '1');
    assert.ok(ultimo.recibido);
    assert.equal(ultimo.body, undefined, 'el diagnóstico no guarda contenido familiar');
    self.registration.showNotification = async () => { throw new Error('permiso del sistema'); };
    push({
        data: { json: () => ({ title: 'Segunda prueba' }) },
        waitUntil: promise => { trabajo = promise; }
    });
    return trabajo;
}).then(() => {
    assert.equal(ultimo.aceptado, false);
    assert.equal(ultimo.error, 'permiso del sistema');
    console.log('push-diagnostico: OK');
}).catch(err => { console.error(err); process.exitCode = 1; });
