// =====================================================================
// Pensandote - Edge Function: recordatorios-clasificar
// ---------------------------------------------------------------------
// Recibe el texto que el usuario dicto en "Haceme acordar" y devuelve
// una clasificacion estructurada que el frontend va a confirmar
// verbalmente antes de insertar.
//
// POST  /functions/v1/recordatorios-clasificar
// Body  { texto: string, circle_id: string }
// Resp  {
//   tipo: 'agenda'|'cocina'|'objeto'|'evento_social'|'nota'|'med_puntual'|'med_toma',
//   titulo: string,
//   detalle: string|null,
//   fecha_hora_objetivo: string|null,
//   relacionado_con_medicamento_id: string|null,
//   confirmacion_hablada: string,
//   confianza: 'alta'|'media'|'baja',
//   interpretacion_ia: object
// }
//
// NO escribe en la DB - eso lo hace el frontend despues de la
// confirmacion del usuario, via RLS con el JWT del mismo.
//
// Env requerida: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
// verify_jwt = true.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

// "Ahora" en zona horaria de Buenos Aires - se lo damos al LLM como
// referencia para resolver fechas relativas ("manana", "el viernes",
// "en 20 minutos") sin que invente.
function nowAR() {
    const fmt = new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", weekday: "long", hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    return {
        iso:    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00-03:00`,
        humano: `${get("weekday")} ${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")} (Buenos Aires)`,
    };
}

const SYSTEM_PROMPT = (ahora: string, meds: Array<{id:string, nombre:string, dosis:string|null, horarios:string[]}>) => `Sos un asistente que clasifica notas de voz cortas de adultos mayores argentinos en una de estas categorias. La persona habla en espanol rioplatense (voseo).

CONTEXTO:
- Ahora es: ${ahora}
- Resolve fechas/horas relativas ("manana", "el viernes", "en 20 minutos", "a la noche") tomando "ahora" como referencia. La noche son las 21:00, la tarde las 17:00, la manana las 09:00 si no especifica.
${meds.length
    ? `- Medicamentos registrados en su tratamiento (usa estos id si tenes que linkear):\n${meds.map(m => `  - id=${m.id} | "${m.nombre}"${m.dosis ? ` (${m.dosis})` : ""}${m.horarios.length ? ` | horarios: ${m.horarios.join(", ")}` : ""}`).join("\n")}`
    : "- No tiene medicamentos cargados en su tratamiento."}

CATEGORIAS (elegi UNA):
1. "agenda"        -> algo que tiene que hacer en un momento concreto (pagar, llamar, ir, comprar). Requiere fecha_hora_objetivo.
2. "cocina"        -> dejo algo en el fuego/horno/hervidor y quiere que le avisen para no quemar. Si no dice cuanto, asumi 20 minutos.
3. "objeto"        -> guardo/dejo algo en un lugar y quiere recordar donde. NO tiene fecha_hora_objetivo.
4. "evento_social" -> recibe una visita, hay un encuentro, viene un familiar, espera una llamada. Requiere fecha_hora_objetivo si la menciona.
5. "nota"          -> no encaja en ninguna otra y no requiere disparo. NO tiene fecha_hora_objetivo.
6. "med_puntual"   -> recordatorio UNICO de tomar un remedio (NO es del tratamiento habitual, es para esta vez). Ej: "tomar el ibuprofeno en 4 horas". Requiere fecha_hora_objetivo. Si matcheas con un medicamento registrado, devolve su id en relacionado_con_medicamento_id.
7. "med_toma"      -> la persona AVISA que YA TOMO un remedio del tratamiento ("ya tome la del mediodia", "tome la pastilla de la presion"). NO es un recordatorio futuro, es una confirmacion. SOLO si matcheas con un medicamento registrado con confianza ALTA: devolve su id en relacionado_con_medicamento_id. Si no matcheas, devolve tipo="nota" y aclara en confirmacion_hablada que no encontraste el remedio en su tratamiento.

REGLA IMPORTANTE de seguridad: NUNCA clasifiques como "med_puntual" un pedido de CARGAR UN TRATAMIENTO RECURRENTE ("todos los dias", "siempre", "todas las mananas a las 8"). En ese caso devolve tipo="nota", confianza="baja" y en confirmacion_hablada deci carinosamente que para cargar un remedio habitual tiene que avisarle a la familia, no se carga por voz.

OUTPUT - devolve SIEMPRE un unico JSON valido (sin texto extra, sin bloques de codigo):
{
  "tipo": "una de las 7",
  "titulo": "frase corta para mostrar (max 60 chars, sin emojis)",
  "detalle": "ampliacion si hace falta o null",
  "fecha_hora_objetivo": "YYYY-MM-DDTHH:MM:SS-03:00 o null",
  "relacionado_con_medicamento_id": "uuid de la lista o null",
  "confirmacion_hablada": "Frase corta y carinosa en voseo que la app le LEE en voz alta para que confirme. Ej: 'Te aviso el viernes a las 9 de la manana que pagues la luz, esta bien?' o 'Anote que dejaste las llaves en la cartera marron.' o 'Marque que ya tomaste la pastilla de la presion del mediodia.' Si no estas seguro, pedile que repita en otras palabras.",
  "confianza": "alta"
}`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    if (!ANTHROPIC_API_KEY) {
        return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key." }, 500);
    }

    let texto = "";
    let circle_id = "";
    try {
        const body = await req.json();
        texto     = String(body?.texto || "").trim();
        circle_id = String(body?.circle_id || "").trim();
    } catch {
        return json({ error: "Body invalido - esperaba { texto, circle_id }" }, 400);
    }
    if (!texto)              return json({ error: "Decime que queres recordar primero." }, 400);
    if (!circle_id)          return json({ error: "Falta circle_id." }, 400);
    if (texto.length > 1500) return json({ error: "Es muy largo. Acortalo un poco." }, 400);

    // Cliente Supabase con el JWT del usuario - RLS valida que sea
    // miembro del circulo automaticamente cuando consultamos
    // medicamentos. Si no es miembro, el SELECT devuelve [] y el LLM
    // simplemente no tiene catalogo (igual sigue funcionando para
    // recordatorios no-medicos).
    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth:   { autoRefreshToken: false, persistSession: false },
    });

    const { data: meds, error: errMeds } = await sb
        .from("medicamentos")
        .select("id, nombre, dosis, horarios")
        .eq("circle_id", circle_id)
        .eq("activo", true);
    if (errMeds) {
        console.error("[recordatorios-clasificar] select meds", errMeds);
        return json({ error: "no_pude_leer_remedios", detalle: errMeds.message }, 500);
    }

    const ahora     = nowAR();
    const medsLista = (meds || []).map((m: any) => ({
        id:       m.id,
        nombre:   m.nombre,
        dosis:    m.dosis ?? null,
        horarios: Array.isArray(m.horarios) ? m.horarios : [],
    }));

    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method:  "POST",
            headers: {
                "Content-Type":      "application/json",
                "x-api-key":         ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model:      "claude-haiku-4-5-20251001",
                max_tokens: 600,
                system:     SYSTEM_PROMPT(ahora.humano, medsLista),
                messages:   [{ role: "user", content: texto }],
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[recordatorios-clasificar] Anthropic", resp.status, txt);
            return json({
                error: `La IA no pudo entender ahora (HTTP ${resp.status}). Proba de nuevo en un rato.`
            }, 502);
        }

        const data = await resp.json();
        const raw  = (data?.content?.[0]?.text || "").trim();

        // Parsear JSON; misma heuristica que como-hago-ia (tomar el
        // primer "{ ... }" por si el modelo agrego texto al costado).
        let parsed: any = null;
        try {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(m ? m[0] : raw);
        } catch {
            parsed = {
                tipo: "nota",
                titulo: texto.slice(0, 60),
                detalle: null,
                fecha_hora_objetivo: null,
                relacionado_con_medicamento_id: null,
                confirmacion_hablada: "Lo anote como una nota. Si querias que te avise, repetilo diciendo cuando.",
                confianza: "baja",
            };
        }

        const TIPOS_VALIDOS = ["agenda","cocina","objeto","evento_social","nota","med_puntual","med_toma"];
        if (!TIPOS_VALIDOS.includes(parsed.tipo)) {
            parsed.tipo = "nota";
        }

        // Defensa contra alucinacion de IDs.
        if (parsed.relacionado_con_medicamento_id) {
            const existe = medsLista.find(m => m.id === parsed.relacionado_con_medicamento_id);
            if (!existe) parsed.relacionado_con_medicamento_id = null;
        }

        return json({
            tipo:                           parsed.tipo,
            titulo:                         String(parsed.titulo || "").slice(0, 200) || texto.slice(0, 60),
            detalle:                        parsed.detalle || null,
            fecha_hora_objetivo:            parsed.fecha_hora_objetivo || null,
            relacionado_con_medicamento_id: parsed.relacionado_con_medicamento_id || null,
            confirmacion_hablada:           parsed.confirmacion_hablada || "Lo anote. Esta bien?",
            confianza:                      parsed.confianza || "media",
            interpretacion_ia:              { ...parsed, ahora_ar: ahora.iso, raw_len: raw.length },
        });
    } catch (err) {
        console.error("[recordatorios-clasificar]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
