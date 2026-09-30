// Diagnóstico local de Web Push. La respuesta del servidor sólo confirma
// aceptación por el proveedor; este registro prueba si el service worker
// del dispositivo llegó a ejecutar el evento push.

const DB_NAME = 'pensandote-push-diagnostico';

function leerUltimo() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) { resolve(null); return; }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains('estado')) {
                request.result.createObjectStore('estado');
            }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('estado', 'readonly');
            const get = tx.objectStore('estado').get('ultimo');
            get.onsuccess = () => { db.close(); resolve(get.result || null); };
            get.onerror = () => { db.close(); reject(get.error); };
        };
    });
}

async function versionReceptor() {
    if (!('serviceWorker' in navigator) || !('MessageChannel' in window)) return null;
    const sw = navigator.serviceWorker.controller ||
        (await navigator.serviceWorker.getRegistration())?.active;
    if (!sw) return null;
    return new Promise(resolve => {
        const canal = new MessageChannel();
        const timer = setTimeout(() => { canal.port1.close(); resolve(null); }, 1500);
        canal.port1.onmessage = event => {
            clearTimeout(timer);
            canal.port1.close();
            resolve(event.data?.version || null);
        };
        try {
            sw.postMessage({ type: 'push-diagnostico-version' }, [canal.port2]);
        } catch (_) {
            clearTimeout(timer);
            canal.port1.close();
            resolve(null);
        }
    });
}

export async function diagnosticoPushLocal() {
    const [version, ultimo] = await Promise.all([versionReceptor(), leerUltimo()]);
    return { version, ultimo };
}
