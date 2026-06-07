// =====================================================================
// Pensandote - Edge Function: bio-narrar
// ---------------------------------------------------------------------
// Biografia Etapa 4: narracion con IA. Recibe varios aportes YA APROBADOS
// (bio_aportes) de UN circulo y arma un "capitulo" en prosa fluida, en dos
// variantes (1ra y 3ra persona), con Claude Sonnet 4.6. El aportador lo
// revisa, edita, regenera o descarta desde el frontend.
//
// POST  /functions/v1/bio-narrar
// Body  {
//   circle_id: string,            // circulo activo (regla ferrea: uno solo)
//   aporte_ids: string[],         // bio_aportes a narrar (todos del circulo)
//   etapa?: string,               // 'ninez'|'juventud'|'adultez'|'familia'|'trabajo'|'otro'
//   titulo_interno?: string,      // titulo de curaduria opcional
//   capitulo_id?: string          // si viene, REGENERA ese capitulo
// }
// Resp  { ok: true, capitulo_id, titulo, texto_primera, texto_tercera }
//
// REGLA FERREA (memoria pensandote-no-mezclar-circulos): todo el material
// pertenece a UN circulo. Si algun aporte es de otro circulo, se aborta.
// Jamas se cruza contexto entre biografias.
//
// Env requerida: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
//                SUPABASE_SERVICE_ROLE_KEY.
// verify_jwt = true (lo invoca el aportador logueado desde el frontend).
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ANTHROPIC_API_KEY  = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY  = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ETAPAS_VALIDAS = ["ninez", "juventud", "adultez", "familia", "trabajo", "otro"];

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

// System prompt: castellano rioplatense, calido, sin inventar. Genera las
// dos variantes (1ra/3ra) en una sola llamada y un titulo interno breve.
function systemPrompt(personaCentral: string, correcciones: Array<{ antes: string|null, despues: string|null, nota: string|null }>): string {
    const aprendizajes = correcciones.length
        ? `\nAPRENDIZAJES DE ESTE APORTADOR (corregilos en este texto):\n` +
          correcciones.map((c) => {
              if (c.antes && c.despues) return `- Antes: "${c.antes}" -> Despues: "${c.despues}"`;
              if (c.nota)               return `- Pedido: "${c.nota}"`;
              if (c.despues)            return `- Prefiere: "${c.despues}"`;
              return null;
          }).filter(Boolean).join("\n")
        : "";

    return `Sos el redactor de la biografia de ${personaCentral}.
Tu trabajo es transformar fragmentos crudos (transcripciones, notas, mensajes
de WhatsApp) en prosa biografica.

REGLAS:
- No inventes hechos. Si algo no esta en los fragmentos, no lo escribas.
- Tono calido, claro, sin adornos innecesarios. Sin metaforas grandilocuentes.
- Castellano rioplatense (voseo).
- Evita cliches ("entranable", "inolvidable", "atesorar recuerdos").
- Prosa fluida en uno o dos parrafos. Sin titulos, sin vinetas, sin negritas.
- Si los fragmentos estan sueltos, conectalos con cuidado; no fuerces transiciones.
- Si hay nombres propios de familiares, usalos con naturalidad. No digas
  "su hija" si tenes el nombre.
- Genera DOS variantes del mismo capitulo:
    "texto_primera"  -> primera persona ("Naci en...")
    "texto_tercera"  -> tercera persona ("Nacio en...")
- Devolve un titulo interno breve (4-7 palabras, no se muestra al sujeto).${aprendizajes}

DEVOLVE EN JSON ESTRICTO (sin texto extra, sin bloques de codigo):
{ "titulo": "...", "texto_primera": "...", "texto_tercera": "..." }`;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    if (!ANTHROPIC_API_KEY) {
        return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key." }, 500);
    }

    let circle_id = "", etapa = "otro", titulo_interno = "", capitulo_id = "";
    let aporte_ids: string[] = [];
    try {
        const body = await req.json();
        circle_id      = String(body?.circle_id || "").trim();
        etapa          = String(body?.etapa || "otro").trim();
        titulo_interno = String(body?.titulo_interno || "").trim();
        capitulo_id    = String(body?.capitulo_id || "").trim();
        aporte_ids     = Array.isArray(body?.aporte_ids)
            ? body.aporte_ids.map((x: unknown) => String(x || "").trim()).filter(Boolean)
            : [];
    } catch {
        return json({ error: "Body invalido - esperaba { circle_id, aporte_ids, etapa }" }, 400);
    }
    if (!circle_id)         return json({ error: "Falta circle_id." }, 400);
    if (!aporte_ids.length) return json({ error: "Elegi al menos un recuerdo para narrar." }, 400);
    if (!ETAPAS_VALIDAS.includes(etapa)) etapa = "otro";

    // --- 1) Identidad: usuario autenticado ---
    const authHeader = req.headers.get("Authorization") || "";
    const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth:   { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: errUser } = await sbUser.auth.getUser();
    if (errUser || !user) return json({ error: "Sesion invalida." }, 401);

    // --- 2) service_role para el trabajo pesado ---
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- 3) REGLA FERREA: el caller es miembro admin/editor del circulo ---
    const { data: miembro, error: errMiembro } = await sb
        .from("circle_members")
        .select("id, permission_level")
        .eq("circle_id", circle_id)
        .eq("user_id", user.id)
        .maybeSingle();
    if (errMiembro) {
        console.error("[bio-narrar] check miembro", errMiembro);
        return json({ error: "No pude validar la membresia." }, 500);
    }
    if (!miembro) return json({ error: "No sos miembro de este circulo." }, 403);
    if (!["admin", "editor"].includes(miembro.permission_level)) {
        return json({ error: "Solo un familiar con permisos puede armar capitulos." }, 403);
    }

    // --- 4) Leer los aportes (todos deben ser de ESTE circulo) ---
    const { data: aportes, error: errAportes } = await sb
        .from("bio_aportes")
        .select("id, circle_id, transcripcion")
        .in("id", aporte_ids);
    if (errAportes) {
        console.error("[bio-narrar] leer aportes", errAportes);
        return json({ error: "No pude leer los recuerdos." }, 500);
    }
    const ajenos = (aportes || []).filter((a: any) => a.circle_id !== circle_id);
    if (ajenos.length) {
        // No mezclar circulos: si algun aporte es de otro circulo, abortamos.
        return json({ error: "Algun recuerdo no pertenece a este circulo." }, 400);
    }
    const fragmentos = (aportes || [])
        .map((a: any) => String(a.transcripcion || "").trim())
        .filter(Boolean);
    if (!fragmentos.length) {
        return json({ error: "Los recuerdos elegidos no tienen texto para narrar." }, 400);
    }
    const idsUsados = (aportes || []).map((a: any) => a.id);

    // --- 5) Si regenera: validar que el capitulo sea del mismo circulo ---
    if (capitulo_id) {
        const { data: cap, error: errCap } = await sb
            .from("bio_capitulos")
            .select("id, circle_id")
            .eq("id", capitulo_id)
            .maybeSingle();
        if (errCap) {
            console.error("[bio-narrar] leer capitulo", errCap);
            return json({ error: "No pude leer el capitulo." }, 500);
        }
        if (!cap || cap.circle_id !== circle_id) {
            return json({ error: "El capitulo no pertenece a este circulo." }, 400);
        }
    }

    // --- 6) Persona central + few-shot de correcciones del aportador ---
    let personaCentral = "tu familiar";
    try {
        const { data: miembros } = await sb
            .from("circle_members")
            .select("interface_mode, parentesco, user:users(nombre_completo)")
            .eq("circle_id", circle_id);
        const central = (miembros || []).find((m: any) => m.interface_mode === "simple");
        const nombre = (central?.user?.nombre_completo || "").trim();
        if (nombre) personaCentral = nombre;
        else if (central?.parentesco) personaCentral = String(central.parentesco);
    } catch (e) {
        console.warn("[bio-narrar] persona central", e);
    }

    let correcciones: Array<{ antes: string|null, despues: string|null, nota: string|null }> = [];
    try {
        const { data: corr } = await sb
            .from("bio_correcciones")
            .select("texto_antes, texto_despues, nota")
            .eq("circle_id", circle_id)
            .eq("usuario_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
        correcciones = (corr || []).map((c: any) => ({
            antes:   c.texto_antes ?? null,
            despues: c.texto_despues ?? null,
            nota:    c.nota ?? null,
        }));
    } catch (e) {
        console.warn("[bio-narrar] correcciones", e);
    }

    // --- 7) Llamar a Anthropic (Sonnet 4.6) ---
    const userMsg = `FRAGMENTOS:\n` +
        fragmentos.map((f, i) => `${i + 1}. ${f}`).join("\n") +
        `\n\nArma el capitulo a partir SOLO de estos fragmentos.`;

    let parsed: any = null;
    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method:  "POST",
            headers: {
                "Content-Type":      "application/json",
                "x-api-key":         ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model:       "claude-sonnet-4-6",
                max_tokens:  2000,
                temperature: 0.4,
                system:      systemPrompt(personaCentral, correcciones),
                messages:    [{ role: "user", content: userMsg }],
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[bio-narrar] Anthropic", resp.status, txt);
            return json({ error: `La IA no pudo armar el capitulo (HTTP ${resp.status}). Proba de nuevo en un rato.` }, 502);
        }

        const data = await resp.json();
        const raw  = (data?.content?.[0]?.text || "").trim();
        try {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(m ? m[0] : raw);
        } catch (e) {
            console.error("[bio-narrar] parse JSON", e, raw.slice(0, 400));
            return json({ error: "La IA devolvio un formato inesperado. Proba regenerar." }, 500);
        }
    } catch (err) {
        console.error("[bio-narrar] fetch", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }

    const titulo        = String(parsed?.titulo || titulo_interno || "Capitulo sin titulo").slice(0, 200);
    const texto_primera = String(parsed?.texto_primera || "").trim();
    const texto_tercera = String(parsed?.texto_tercera || "").trim();
    if (!texto_primera && !texto_tercera) {
        return json({ error: "La IA no devolvio texto. Proba regenerar." }, 500);
    }

    // --- 8) Persistir: UPDATE si regenera, INSERT si es nuevo ---
    let outCapId = capitulo_id;
    if (capitulo_id) {
        const { error: errUpd } = await sb
            .from("bio_capitulos")
            .update({
                titulo, texto_primera, texto_tercera,
                etapa, updated_at: new Date().toISOString(),
            })
            .eq("id", capitulo_id);
        if (errUpd) {
            console.error("[bio-narrar] update capitulo", errUpd);
            return json({ error: "No pude guardar el capitulo regenerado." }, 500);
        }
        // Refrescamos la trazabilidad de fragmentos (puede haber cambiado la seleccion).
        await sb.from("bio_capitulo_fragmentos").delete().eq("capitulo_id", capitulo_id);
    } else {
        // orden = max(orden de la etapa) + 10, para dejar lugar a reordenar.
        let orden = 0;
        try {
            const { data: maxRow } = await sb
                .from("bio_capitulos")
                .select("orden")
                .eq("circle_id", circle_id)
                .eq("etapa", etapa)
                .order("orden", { ascending: false })
                .limit(1)
                .maybeSingle();
            orden = (maxRow?.orden ?? 0) + 10;
        } catch (_) { orden = 10; }

        const { data: ins, error: errIns } = await sb
            .from("bio_capitulos")
            .insert({
                circle_id, titulo, texto_primera, texto_tercera,
                etapa, orden, estado: "borrador", creado_por: user.id,
            })
            .select("id")
            .single();
        if (errIns || !ins) {
            console.error("[bio-narrar] insert capitulo", errIns);
            return json({ error: "No pude guardar el capitulo." }, 500);
        }
        outCapId = ins.id;
    }

    // Trazabilidad: que aportes alimentaron este capitulo.
    if (idsUsados.length) {
        const filas = idsUsados.map((aporteId: string) => ({
            capitulo_id: outCapId, aporte_id: aporteId,
        }));
        const { error: errFrag } = await sb
            .from("bio_capitulo_fragmentos")
            .upsert(filas, { onConflict: "capitulo_id,aporte_id", ignoreDuplicates: true });
        if (errFrag) console.warn("[bio-narrar] fragmentos", errFrag);
    }

    return json({
        ok: true,
        capitulo_id:   outCapId,
        titulo,
        texto_primera,
        texto_tercera,
    });
});
