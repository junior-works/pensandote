// FCM HTTP v1. La cuenta de servicio vive sólo en el secreto de Edge Functions.
type ServiceAccount = {
    project_id: string;
    client_email: string;
    private_key: string;
};

let cachedAccessToken = "";
let cachedUntil = 0;

function base64url(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function accessToken(account: ServiceAccount): Promise<string> {
    if (cachedAccessToken && Date.now() < cachedUntil) return cachedAccessToken;
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
    const claims = base64url(new TextEncoder().encode(JSON.stringify({
        iss: account.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
    })));
    const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
    const binary = atob(pem);
    const keyBytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", keyBytes, {
        name: "RSASSA-PKCS1-v1_5", hash: "SHA-256",
    }, false, ["sign"]);
    const unsigned = `${header}.${claims}`;
    const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key,
        new TextEncoder().encode(unsigned)));
    const assertion = `${unsigned}.${base64url(signature)}`;
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        }),
    });
    if (!response.ok) throw new Error(`OAuth FCM HTTP ${response.status}`);
    const result = await response.json();
    if (!result.access_token) throw new Error("OAuth FCM sin access_token");
    cachedAccessToken = result.access_token;
    cachedUntil = Date.now() + Math.max(60, (result.expires_in || 3600) - 120) * 1000;
    return cachedAccessToken;
}

export async function sendNativeFcm(
    token: string,
    data: { title: string; body: string; url: string; circle_id: string; tag: string; tipo?: string },
): Promise<{ ok: boolean; unregistered?: boolean; error?: string }> {
    const secret = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!secret) return { ok: false, error: "FIREBASE_SERVICE_ACCOUNT_JSON no configurado" };
    let account: ServiceAccount;
    try { account = JSON.parse(secret); }
    catch (_) { return { ok: false, error: "FIREBASE_SERVICE_ACCOUNT_JSON inválido" }; }
    if (account.project_id !== "pensandote-6038f" || !account.client_email || !account.private_key) {
        return { ok: false, error: "Cuenta Firebase de otro proyecto o incompleta" };
    }
    const auth = await accessToken(account);
    const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: {
                token,
                data: { ...data, tipo: data.tipo || "" },
                android: { priority: "HIGH", ttl: "86400s" },
            } }),
        },
    );
    if (response.ok) return { ok: true };
    const body = await response.json().catch(() => ({}));
    const details = body?.error?.details || [];
    const unregistered = details.some((d: any) => d?.errorCode === "UNREGISTERED");
    return {
        ok: false,
        unregistered,
        error: `FCM HTTP ${response.status}: ${String(body?.error?.status || "error")}`,
    };
}
