// Pensandote - Edge Function: borrar-cuenta
// ---------------------------------------------------------------------
// Borra la cuenta del usuario logueado y TODOS sus datos. DESTRUCTIVO e
// irreversible. Solo se puede borrar la PROPIA cuenta: la identidad sale
// del JWT (Authorization: Bearer <user access_token>), nunca de un
// parametro de body. No acepta user_id ajeno.
//
// DOS MODOS (body JSON opcional):
//   { "modo": "previo" }  -> NO borra nada. Devuelve que se perderia:
//                            circulos propios, cuantas OTRAS personas hay
//                            adentro, y los nombres de esos circulos. La
//                            app lo muestra antes de pedir que escriba
//                            BORRAR, porque el dueño de un circulo borra
//                            tambien los datos de los demas miembros.
//   (sin modo)            -> borra de verdad.
//
// Plan de borrado (el orden importa: los buckets NO se vacian por FK
// cascade, y circles.owner_id es ON DELETE RESTRICT, asi que hay que
// limpiar storage y circulos propios ANTES de tocar al usuario):
//
//   1. Identidad: getUser(token) -> user_id. Si el token no valida -> 401.
//   2. Idempotencia: si el usuario ya no existe en Auth -> 200 already_deleted.
//   3. Mapear circulos: propios (circles.owner_id = user) y ajenos
//      (circle_members.user_id = user, no propios).
//   4. Recolectar paths de Storage subidos por el user (SELECT antes de
//      borrar las filas, sino se pierde la referencia).
//   5. Storage: borrar carpetas <circle_id>/ de cada bucket para los
//      circulos propios + los objetos sueltos subidos por el user en
//      circulos ajenos.
//   6. Desbloquear las TRES FK con ON DELETE NO ACTION que apuntan a
//      public.users y romperian el borrado:
//        - invitations.claimed_by_user_id  (nullable -> NULL)
//        - circles.legado_desbloqueado_por (nullable -> NULL)
//        - estudios_medicos.creado_por     (NOT NULL -> reasignar al owner)
//   7. Borrar circulos propios (cascade a las 35 tablas con circle_id).
//   8. Borrar membresias en circulos ajenos.
//   9. Borrar filas scopeadas por user que viven en circulos ajenos
//      (checkins, tomas_medicamento, push_subscriptions).
//   10. Borrar public.users. Si esto falla, ABORTAMOS: significa que
//       quedo una FK sin desbloquear y borrar el usuario de Auth
//       cascadearia a public.users y fallaria igual, dejando la cuenta
//       de acceso viva con los datos ya borrados.
//   11. Auth: auth.admin.deleteUser(user) (cascade a las tablas que
//       referencian auth.users directamente: bio_*, mensajes_familia,
//       alertas_panico, native_push_tokens, push_recepciones, caidas).
//
// CORS: responde OPTIONS para que el PWA pueda invocarla.
// Logging: solo counts. NUNCA PII (nombres, mails, contenido). Los nombres
// de los circulos viajan en la respuesta del modo previo (se los mandamos
// al dueño de esos circulos, que ya los conoce) pero no se loguean.
//
// Deploy: verify_jwt=true. Igual validamos el JWT en codigo, asi funciona
// con cualquier ajuste de la plataforma.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Buckets privados cuyas rutas arrancan con <circle_id>/... Verificado
// contra storage.objects: los seis guardan <circle_id>/... y voz-cache
// guarda <circle_id>/<slug>/<hash>.mp3. Borrar la carpeta del circulo
// entero cuando el user es owner.
const BUCKETS_CIRCULO = [
    "fotos", "historias", "estudios", "bio_audios",
    "wapp_zips", "documentos", "voz-cache",
] as const;

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

// Lista recursiva de todos los object keys bajo un prefijo de un bucket.
// El list() de storage es por nivel (no recursivo) y las "carpetas"
// aparecen como entries con id=null. Bajamos en paginas de 100.
async function listarPathsRecursivo(sb: any, bucket: string, prefijo: string): Promise<string[]> {
    const out: string[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
        const { data, error } = await sb.storage.from(bucket).list(prefijo, {
            limit,
            offset,
            sortBy: { column: "name", order: "asc" },
        });
        if (error) {
            console.warn(`[borrar-cuenta] list ${bucket}/${prefijo}`, error.message);
            break;
        }
        const entries = data || [];
        for (const e of entries) {
            const full = prefijo ? `${prefijo}/${e.name}` : e.name;
            if (e.id === null) {
                const hijos = await listarPathsRecursivo(sb, bucket, full);
                out.push(...hijos);
            } else {
                out.push(full);
            }
        }
        if (entries.length < limit) break;
        offset += limit;
    }
    return out;
}

// Borra una lista de object keys de un bucket en lotes. Devuelve cuantos
// se pidieron borrar (best-effort; los errores se loguean y no abortan:
// un archivo huerfano es malo, pero peor es dejar la cuenta a medio borrar).
async function removerPaths(sb: any, bucket: string, paths: string[]): Promise<number> {
    const unicos = [...new Set(paths.filter(Boolean))];
    if (!unicos.length) return 0;
    let borrados = 0;
    const LOTE = 100;
    for (let i = 0; i < unicos.length; i += LOTE) {
        const chunk = unicos.slice(i, i + LOTE);
        const { error } = await sb.storage.from(bucket).remove(chunk);
        if (error) console.warn(`[borrar-cuenta] remove ${bucket} (${chunk.length})`, error.message);
        else borrados += chunk.length;
    }
    return borrados;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    const counts: Record<string, number> = {};

    try {
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Body opcional. Si no es JSON valido, seguimos en modo borrado.
        let modo = "";
        try {
            const body = await req.json();
            modo = String(body?.modo || "");
        } catch (_) { /* sin body */ }

        // --- 1) Identidad: SOLO desde el JWT del usuario. ----------------
        const authz = req.headers.get("Authorization") || "";
        const token = authz.replace(/^Bearer\s+/i, "").trim();
        if (!token) return json({ error: "no_autorizado" }, 401);

        const { data: userData, error: userErr } = await sb.auth.getUser(token);
        if (userErr || !userData?.user) {
            return json({ error: "no_autorizado" }, 401);
        }
        const userId = userData.user.id;

        // --- 2) Idempotencia: si ya no existe en Auth, listo. ------------
        const { data: adminUser } = await sb.auth.admin.getUserById(userId);
        if (!adminUser?.user) {
            return json({ ok: true, already_deleted: true });
        }

        // --- 3) Mapear circulos propios y ajenos. -----------------------
        const { data: propiosRows, error: errProp } = await sb
            .from("circles").select("id, nombre").eq("owner_id", userId);
        if (errProp) return json({ error: "query_fallida", paso: "circles_owner", detail: errProp.message }, 500);
        const propios: string[] = (propiosRows || []).map((c: any) => c.id);

        const { data: membRows, error: errMemb } = await sb
            .from("circle_members").select("circle_id").eq("user_id", userId);
        if (errMemb) return json({ error: "query_fallida", paso: "members", detail: errMemb.message }, 500);
        const todosLosCirculos = [...new Set((membRows || []).map((m: any) => m.circle_id))];
        const ajenos = todosLosCirculos.filter((cid) => !propios.includes(cid));

        counts.circulos_propios = propios.length;
        counts.circulos_ajenos  = ajenos.length;

        // --- MODO PREVIO: contar y volver, sin tocar nada. --------------
        // El dueño de un circulo, al borrarse, borra los datos de todos los
        // miembros. Hay que decirlo con numeros antes de pedir el BORRAR.
        if (modo === "previo") {
            let otrasPersonas = 0;
            const candidatos: any[] = [];
            if (propios.length) {
                const { data: otros } = await sb
                    .from("circle_members")
                    .select("circle_id, user_id, parentesco, permission_level, interface_mode")
                    .in("circle_id", propios).neq("user_id", userId);
                otrasPersonas = new Set((otros || []).map((m: any) => m.user_id)).size;

                // Quien puede recibir un circulo: miembro admin con interfaz
                // de tutor. Al adulto cuidado (solo_ver / simple) no se le
                // pasa: no podria administrarlo, y seria raro ponerle el rol
                // de dueño a la persona que esta siendo cuidada.
                const aptos = (otros || []).filter((m: any) =>
                    m.permission_level === "admin" && m.interface_mode === "dashboard");
                const ids = [...new Set(aptos.map((m: any) => m.user_id))];
                const nombres: Record<string, string> = {};
                if (ids.length) {
                    const { data: us } = await sb.from("users")
                        .select("id, nombre_completo").in("id", ids);
                    for (const u of us || []) nombres[u.id] = u.nombre_completo || "";
                }
                for (const c of propiosRows || []) {
                    const suyos = aptos.filter((m: any) => m.circle_id === c.id);
                    candidatos.push({
                        circle_id: c.id,
                        nombre: c.nombre,
                        puede_recibir: suyos.map((m: any) => ({
                            user_id: m.user_id,
                            nombre: nombres[m.user_id] || "",
                            parentesco: m.parentesco || "",
                        })),
                    });
                }
            }
            return json({
                ok: true,
                modo: "previo",
                circulos_propios:  propios.length,
                circulos_nombres:  (propiosRows || []).map((c: any) => c.nombre).filter(Boolean),
                otras_personas:    otrasPersonas,
                circulos_ajenos:   ajenos.length,
                circulos:          candidatos,
            });
        }

        // --- 4) Recolectar paths de Storage subidos por el user. --------
        // Por autor, en CUALQUIER circulo. Los de circulos propios igual se
        // van con la carpeta del paso 5a (remove de keys ya borradas es no-op).
        const pathsPorBucket: Record<string, string[]> = {
            fotos: [], historias: [], estudios: [], bio_audios: [],
        };

        // fotos_dia.subida_por -> bucket fotos
        {
            const { data } = await sb.from("fotos_dia")
                .select("storage_path").eq("subida_por", userId);
            for (const r of data || []) if (r.storage_path) pathsPorBucket.fotos.push(r.storage_path);
        }
        // historias.narrador_id -> bucket historias
        {
            const { data } = await sb.from("historias")
                .select("storage_path").eq("narrador_id", userId);
            for (const r of data || []) if (r.storage_path) pathsPorBucket.historias.push(r.storage_path);
        }
        // historia_interacciones.user_id (audios de repregunta) -> bucket historias
        {
            const { data } = await sb.from("historia_interacciones")
                .select("storage_path").eq("user_id", userId);
            for (const r of data || []) if (r.storage_path) pathsPorBucket.historias.push(r.storage_path);
        }
        // estudios_medicos: archivos donde el user es paciente o quien lo subio.
        {
            const { data } = await sb.from("estudios_medicos")
                .select("archivo_path")
                .or(`paciente_user_id.eq.${userId},creado_por.eq.${userId}`);
            for (const r of data || []) if (r.archivo_path) pathsPorBucket.estudios.push(r.archivo_path);
        }
        // bio_aportes.audio_path + bio_aporte_cola.audio_path -> bucket bio_audios
        {
            const { data } = await sb.from("bio_aportes")
                .select("audio_path").eq("aportador_id", userId);
            for (const r of data || []) if (r.audio_path) pathsPorBucket.bio_audios.push(r.audio_path);
        }
        {
            const { data } = await sb.from("bio_aporte_cola")
                .select("audio_path").eq("aportador_id", userId);
            for (const r of data || []) if (r.audio_path) pathsPorBucket.bio_audios.push(r.audio_path);
        }

        // --- 5) Storage. ------------------------------------------------
        let objetosBorrados = 0;
        // 5a) Carpetas completas de los circulos propios.
        for (const cid of propios) {
            for (const bucket of BUCKETS_CIRCULO) {
                const paths = await listarPathsRecursivo(sb, bucket, cid);
                objetosBorrados += await removerPaths(sb, bucket, paths);
            }
        }
        // 5b) Objetos sueltos del user en circulos ajenos (y cualquier resto).
        for (const [bucket, paths] of Object.entries(pathsPorBucket)) {
            objetosBorrados += await removerPaths(sb, bucket, paths);
        }
        counts.objetos_storage = objetosBorrados;

        // --- 6) Desbloquear las FK NO ACTION a public.users. ------------
        // invitations.claimed_by_user_id es nullable -> NULL.
        {
            const { error, count } = await sb.from("invitations")
                .update({ claimed_by_user_id: null }, { count: "exact" })
                .eq("claimed_by_user_id", userId);
            if (error) console.warn("[borrar-cuenta] invitations.claimed_by", error.message);
            else counts.invitations_desligadas = count ?? 0;
        }
        // circles.legado_desbloqueado_por es nullable -> NULL. Pasa cuando
        // el user desbloqueo el legado de un circulo que NO es suyo: ese
        // circulo sobrevive y la FK bloquearia el borrado.
        {
            const { error, count } = await sb.from("circles")
                .update({ legado_desbloqueado_por: null }, { count: "exact" })
                .eq("legado_desbloqueado_por", userId);
            if (error) console.warn("[borrar-cuenta] circles.legado_desbloqueado_por", error.message);
            else counts.legados_desligados = count ?? 0;
        }
        // estudios_medicos.creado_por es NOT NULL y NO ACTION: en circulos
        // ajenos reasignamos el autor al owner del circulo (preserva el
        // estudio, que es del paciente, sin romper el borrado). En circulos
        // propios la fila se va con el circulo (paso 7).
        if (ajenos.length) {
            const { data: estCreados } = await sb.from("estudios_medicos")
                .select("id, circle_id").eq("creado_por", userId).in("circle_id", ajenos);
            const porCirculo: Record<string, string[]> = {};
            for (const e of estCreados || []) (porCirculo[e.circle_id] ||= []).push(e.id);
            let reasignados = 0;
            for (const [cid, ids] of Object.entries(porCirculo)) {
                const { data: circ } = await sb.from("circles").select("owner_id").eq("id", cid).maybeSingle();
                const nuevoAutor = circ?.owner_id;
                if (!nuevoAutor) continue;
                const { error } = await sb.from("estudios_medicos")
                    .update({ creado_por: nuevoAutor }).in("id", ids);
                if (error) console.warn("[borrar-cuenta] estudios.creado_por reasignar", error.message);
                else reasignados += ids.length;
            }
            counts.estudios_reasignados = reasignados;
        }

        // --- 7) Borrar circulos propios (cascade). ----------------------
        if (propios.length) {
            const { error, count } = await sb.from("circles")
                .delete({ count: "exact" }).in("id", propios);
            if (error) return json({ error: "delete_fallido", paso: "circles", detail: error.message, counts }, 500);
            counts.circulos_borrados = count ?? propios.length;
        }

        // --- 8) Membresias en circulos ajenos. --------------------------
        {
            const { error, count } = await sb.from("circle_members")
                .delete({ count: "exact" }).eq("user_id", userId);
            if (error) console.warn("[borrar-cuenta] circle_members", error.message);
            else counts.membresias_borradas = count ?? 0;
        }

        // --- 9) Filas scopeadas por user en circulos ajenos. ------------
        // (Las de circulos propios ya cayeron por cascade del paso 7.)
        for (const tabla of ["checkins", "tomas_medicamento", "push_subscriptions"]) {
            const { error, count } = await sb.from(tabla)
                .delete({ count: "exact" }).eq("user_id", userId);
            if (error) console.warn(`[borrar-cuenta] ${tabla}`, error.message);
            else counts[`${tabla}_borradas`] = count ?? 0;
        }

        // --- 10) Fila public.users. ABORTA si falla. --------------------
        // Si una FK NO ACTION quedo colgando, esto falla. Y como
        // public.users.id -> auth.users es CASCADE, borrar el usuario de
        // Auth volveria a intentar este mismo DELETE y fallaria igual:
        // quedaria la cuenta de acceso viva con los datos ya borrados.
        // Mejor parar aca y que el usuario reintente.
        {
            const { error } = await sb.from("users").delete().eq("id", userId);
            if (error) {
                console.error("[borrar-cuenta] public.users bloqueado", error.message);
                return json({
                    error: "borrado_bloqueado",
                    detail: error.message,
                    counts,
                }, 500);
            }
        }

        // --- 11) Auth (cascade a tablas que referencian auth.users). -----
        const { error: errAuth } = await sb.auth.admin.deleteUser(userId);
        if (errAuth) {
            console.error("[borrar-cuenta] auth.deleteUser fallo", errAuth.message);
            return json({
                error: "borrado_parcial",
                detail: "La mayor parte de los datos se borraron, pero la cuenta de acceso no. Intenta de nuevo.",
                counts,
            }, 500);
        }

        console.log("[borrar-cuenta] OK", JSON.stringify(counts));
        return json({ ok: true, deleted: true, counts });
    } catch (err) {
        console.error("[borrar-cuenta] excepcion", String((err as any)?.message ?? err));
        return json({ error: String((err as any)?.message ?? err), counts }, 500);
    }
});
