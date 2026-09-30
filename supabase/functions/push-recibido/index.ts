// Pensandote - Edge Function: push-recibido
//
// Acuse de recibo de un aviso, mandado por el service worker del telefono.
//
// ---------------------------------------------------------------------
// POR QUE EXISTE
// ---------------------------------------------------------------------
// Hasta ahora "entregado" solo significaba que Google acepto el mensaje.
// Eso no distingue dos cosas muy distintas:
//
//   a) el push viajo entero y el telefono decidio no mostrarlo (permisos,
//      ahorro de bateria, canal silenciado);
//   b) el push nunca llego a despertar al telefono.
//
// Sin esa distincion la unica fuente de informacion era preguntarle al
// usuario si vio algo, y cuando lo que se depura es justamente "no me
// llega nada", eso no avanza: el servidor dice una cosa, la persona dice
// otra, y no hay arbitro.
//
// Ahora el service worker, apenas corre el evento push, pega aca con el
// aviso_id que venia adentro del push. Si el acuse llega, fue (a). Si no
// llega, fue (b). Y se sabe solo, sin que nadie mire una pantalla.
//
// AUTENTICACION: el aviso_id es el id de la fila en push_outbox y viaja
// unicamente dentro del push cifrado. Solo lo conoce el telefono que lo
// recibio, asi que alcanza como credencial — mismo criterio que usa
// enviar-push con outbox_id. verify_jwt tiene que quedar en false: el
// service worker no tiene sesion.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    try {
        const body = await req.json().catch(() => ({}));
        const avisoId = typeof body?.aviso_id === "string" ? body.aviso_id.trim() : "";
        if (!avisoId) return json({ error: "aviso_id_requerido" }, 400);

        const mostrado = body?.mostrado === true;
        const errorCliente = typeof body?.error === "string" && body.error
            ? body.error.slice(0, 200)
            : null;
        const version = typeof body?.version === "string" ? body.version.slice(0, 20) : null;

        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Solo marcamos el primer acuse: si el mismo aviso llega a dos
        // dispositivos, el que interesa es que llego a alguno.
        const { data, error } = await sb
            .from("push_outbox")
            .update({
                recibido_at:    new Date().toISOString(),
                mostrado,
                error_cliente:  errorCliente,
                version_receptor: version
            })
            .eq("id", avisoId)
            .is("recibido_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            console.error("[push-recibido]", error);
            return json({ error: "no_pude_registrar", detail: error.message }, 500);
        }
        // Sin fila: el id no existe o ya estaba acusado. No es un error del
        // telefono y no tiene sentido que reintente.
        return json({ ok: true, registrado: !!data });
    } catch (err) {
        console.error("[push-recibido]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
