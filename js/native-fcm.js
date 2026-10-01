// Puente mínimo TWA → sesión web: el token llega sólo en el fragmento #,
// que no se envía a GitHub Pages. Se limpia antes de renderizar la ruta.
const PENDING = 'pensandote:native-fcm:pending';
const REGISTERED = 'pensandote:native-fcm:registered';
const TOKEN_PATTERN = /^[A-Za-z0-9:._-]{40,4096}$/;

export function capturarTokenNativo() {
    const hash = location.hash || '';
    const [path, query = ''] = hash.slice(1).split('?');
    if (!query) return;
    const params = new URLSearchParams(query);
    const token = params.get('native_fcm');
    if (!token) return;
    params.delete('native_fcm');
    history.replaceState(history.state, '', location.pathname + location.search +
        '#' + path + (params.toString() ? '?' + params.toString() : ''));
    if (!TOKEN_PATTERN.test(token)) return;
    try { localStorage.setItem(PENDING, JSON.stringify({ token, at: Date.now() })); } catch (_) {}
}

function pendingToken() {
    try {
        const pending = JSON.parse(localStorage.getItem(PENDING) || 'null');
        if (!pending || !TOKEN_PATTERN.test(pending.token) || Date.now() - pending.at > 86400000) {
            localStorage.removeItem(PENDING);
            return null;
        }
        return pending.token;
    } catch (_) { return null; }
}

async function callServer(sb, token, action) {
    const cfg = window.PENSANDOTE_CONFIG;
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) return false;
    const response = await fetch(`${cfg.SUPABASE_URL}/functions/v1/registrar-push-nativo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': cfg.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token, action }),
    });
    if (!response.ok) throw new Error(`Registro Android: HTTP ${response.status}`);
    return true;
}

export async function registrarTokenNativo(sb, userId) {
    const token = pendingToken();
    if (!token || !userId) return false;
    await callServer(sb, token, 'register');
    try {
        localStorage.setItem(REGISTERED, JSON.stringify({ token, userId }));
        localStorage.removeItem(PENDING);
    } catch (_) {}
    return true;
}

export async function desregistrarTokenNativo(sb) {
    let registered;
    try { registered = JSON.parse(localStorage.getItem(REGISTERED) || 'null'); }
    catch (_) { return; }
    if (!registered?.token || !registered?.userId) return;
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user?.id !== registered.userId) return;
    await callServer(sb, registered.token, 'remove');
    try { localStorage.removeItem(REGISTERED); } catch (_) {}
}
