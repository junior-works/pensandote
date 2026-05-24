// =====================================================================
// Pensándote — Edge Function: aceptar-invitacion-simple
// ---------------------------------------------------------------------
// Implementa el caso A: "el link ES el login" para invitados modo SIMPLE.
//
// Flujo:
//   1) Recibe { token } en POST body.
//   2) Valida la invitación (existe, no vencida, no reclamada, modo simple).
//   3) Crea (o reusa) un auth.user sintético con email único derivado del
//      token (no hay email real porque al adulto mayor no le pedimos uno).
//   4) Inserta perfil + circle_members con los valores sugeridos.
//   5) Marca la invitación reclamada.
//   6) Genera un magic-link admin → devuelve el `hashed_token`.
//      El front lo intercambia con `supabase.auth.verifyOtp({token_hash,
//      type:'magiclink'})` para obtener una sesión real (la admin API
//      NO expone un createSession directo).
//
// Env requerida en el entorno Edge: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// =====================================================================

// @ts-ignore — Deno std en runtime de Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        const token = typeof body?.token === "string" ? body.token.trim() : "";
        if (!token) return json({ error: "token_requerido" }, 400);

        // Cliente con service_role: by-passea RLS y puede usar admin API.
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // -----------------------------------------------------------
        // 1) Buscar la invitación y validar.
        // -----------------------------------------------------------
        const { data: inv, error: errInv } = await sb
            .from("invitations")
            .select("*")
            .eq("token", token)
            .maybeSingle();

        if (errInv) throw errInv;
        if (!inv)   return json({ error: "invitacion_no_encontrada" }, 404);

        if (new Date(inv.expires_at).getTime() < Date.now())
            return json({ error: "invitacion_vencida" }, 410);

        if (inv.claimed_at)
            return json({ error: "invitacion_ya_reclamada" }, 409);

        if (inv.interface_mode_sugerido !== "simple")
            return json({ error: "no_es_modo_simple" }, 400);

        // -----------------------------------------------------------
        // 2) Crear (o reusar) el auth.user sintético.
        //    Email determinístico a partir del token, así un mismo
        //    token siempre apunta al mismo usuario aunque haya reintentos.
        // -----------------------------------------------------------
        const syntheticEmail = `simple+${token.toLowerCase()}@pensandote.app`;

        let userId: string | null = null;
        const { data: createdUser, error: errCreate } = await sb.auth.admin.createUser({
            email: syntheticEmail,
            email_confirm: true,        // saltea verificación de email
            user_metadata: {
                pensandote_kind: "simple",
                circle_id:       inv.circle_id,
                parentesco:      inv.parentesco_sugerido,
                invited_by:      inv.invited_by,
            },
        });

        if (errCreate) {
            // Probablemente "email already registered" → buscamos al usuario.
            // listUsers pagina; con perPage alto cubrimos proyectos chicos.
            // TODO: cuando crezca, usar getUserByEmail si Supabase lo expone.
            const { data: list, error: errList } =
                await sb.auth.admin.listUsers({ perPage: 200 });
            if (errList) throw errCreate; // mejor devolver el original
            const existing = list.users.find((u) => u.email === syntheticEmail);
            if (!existing) throw errCreate;
            userId = existing.id;
        } else {
            userId = createdUser.user!.id;
        }

        // -----------------------------------------------------------
        // 3) Perfil + membresía (upsert para idempotencia).
        // -----------------------------------------------------------
        const { error: errProfile } = await sb
            .from("users")
            .upsert({ id: userId }, { onConflict: "id" });
        if (errProfile) throw errProfile;

        const { error: errMember } = await sb
            .from("circle_members")
            .upsert(
                {
                    circle_id:        inv.circle_id,
                    user_id:          userId,
                    interface_mode:   "simple",
                    parentesco:       inv.parentesco_sugerido || "Familiar",
                    permission_level: inv.permission_level_sugerido || "editor",
                },
                { onConflict: "circle_id,user_id" }
            );
        if (errMember) throw errMember;

        // -----------------------------------------------------------
        // 4) Marcar invitación reclamada.
        // -----------------------------------------------------------
        const { error: errClaim } = await sb
            .from("invitations")
            .update({
                claimed_at:         new Date().toISOString(),
                claimed_by_user_id: userId,
            })
            .eq("token", token);
        if (errClaim) throw errClaim;

        // -----------------------------------------------------------
        // 5) Generar un magic link y devolver el token_hash.
        //    El front lo cambia por una sesión vía verifyOtp.
        // -----------------------------------------------------------
        const { data: link, error: errLink } = await sb.auth.admin.generateLink({
            type:  "magiclink",
            email: syntheticEmail,
        });
        if (errLink) throw errLink;

        const props = (link as any)?.properties ?? {};
        const token_hash = props.hashed_token;
        if (!token_hash) {
            throw new Error("no se pudo generar token_hash de magic link");
        }

        return json({
            ok:                true,
            circle_id:         inv.circle_id,
            parentesco:        inv.parentesco_sugerido,
            interface_mode:    "simple",
            user_id:           userId,
            token_hash,                // ← el front llama verifyOtp con esto
            verification_type: "magiclink",
        });
    } catch (err) {
        console.error("[aceptar-invitacion-simple]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
