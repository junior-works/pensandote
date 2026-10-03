// Vincula un token Firebase del Android instalado con la cuenta autenticada.
// Nunca acepta user_id del cliente. La tabla no es accesible desde la Data API.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!jwt) return reply({ error: "sin_sesion" }, 401);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await sb.auth.getUser(jwt);
    if (authError || !user) return reply({ error: "sesion_invalida" }, 401);

    const input = await req.json().catch(() => ({}));
    const token = typeof input.token === "string" ? input.token.trim() : "";
    if (!/^[A-Za-z0-9:._-]{40,4096}$/.test(token)) return reply({ error: "token_invalido" }, 400);
    const action = input.action === "remove" ? "remove" : "register";

    if (action === "remove") {
        const { error } = await sb.from("native_push_tokens")
            .delete().eq("token", token).eq("user_id", user.id);
        if (error) return reply({ error: "no_se_pudo_desvincular" }, 500);
        return reply({ ok: true, action });
    }

    // Dato de diagnostico, nunca de confianza: viene del cliente, se
    // recorta y se acepta solo si parece un nombre de cache nuestro.
    const crudo = typeof input.shell === "string" ? input.shell.trim().slice(0, 80) : "";
    const shell = /^[A-Za-z0-9._-]{1,80}$/.test(crudo) ? crudo : null;

    const { error } = await sb.from("native_push_tokens").upsert({
        token, user_id: user.id, platform: "android",
        updated_at: new Date().toISOString(),
        ...(shell ? { shell } : {}),
    }, { onConflict: "token" });
    if (error) return reply({ error: "no_se_pudo_registrar" }, 500);
    return reply({ ok: true, action });
});
