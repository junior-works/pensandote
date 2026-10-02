package com.juniorworks.pensandote;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * El interruptor del cuidado en la calle.
 *
 * Esto nunca viene prendido de fabrica. La persona lo prende desde la
 * app, y lo puede apagar cuando quiera sin pedirle permiso a nadie.
 *
 * Es deliberado. Un telefono que sabe cuando una persona sale de su
 * casa es una cosa seria, aunque el dato no salga del aparato. La
 * diferencia entre cuidar a alguien y vigilarlo es que lo sepa y pueda
 * decidir.
 */
final class Guardian {

    private static final String PREFS  = "pensandote_caidas";
    private static final String CLAVE  = "cuidado_en_la_calle";

    private static final String CLAVE_PENDIENTES = "pendientes";

    /**
     * Cuantos candidatos viajan en una sola apertura. El servicio puede
     * haber juntado 200; la URL de arranque no es lugar para 200.
     */
    private static final int MAX_POR_APERTURA = 40;

    /**
     * Cuantas veces se entrega el mismo candidato antes de soltarlo.
     * No hay camino de vuelta desde la web hacia el lado nativo, asi
     * que no podemos esperar un "lo guarde". Le damos dos aperturas:
     * una sola podria caer en un arranque donde la web no llego a
     * subirlo. A la tercera lo soltamos, porque la alternativa es
     * arrastrarlo para siempre.
     */
    private static final int ENTREGAS_MAX = 2;

    private Guardian() {}

    static boolean estaPrendido(Context c) {
        return prefs(c).getBoolean(CLAVE, false);
    }

    static void prender(Context c, boolean si) {
        prefs(c).edit().putBoolean(CLAVE, si).apply();
    }

    /**
     * Saca los candidatos guardados para que el arranque los lleve a la
     * web, y deja anotado que ya viajaron. La web los sube con el
     * instante de la caida como clave, asi que repetir uno no duplica
     * nada: es mas barato mandarlo dos veces que perderlo una.
     *
     * Devuelve null si no hay nada que mandar.
     */
    static String tomarCandidatos(Context c) {
        try {
            final SharedPreferences p = prefs(c);
            final JSONArray lista = new JSONArray(p.getString(CLAVE_PENDIENTES, "[]"));
            if (lista.length() == 0) return null;

            final JSONArray viajan = new JSONArray();
            final JSONArray quedan = new JSONArray();

            for (int i = 0; i < lista.length(); i++) {
                final JSONObject fila = lista.optJSONObject(i);
                if (fila == null) continue;

                final int entregas = fila.optInt("entregas", 0);
                if (entregas >= ENTREGAS_MAX) continue;      // se suelta

                if (viajan.length() < MAX_POR_APERTURA) {
                    viajan.put(fila);
                    fila.put("entregas", entregas + 1);
                }
                quedan.put(fila);
            }

            p.edit().putString(CLAVE_PENDIENTES, quedan.toString()).apply();
            return viajan.length() > 0 ? viajan.toString() : null;
        } catch (Throwable t) {
            // Un candidato perdido no justifica que la app no abra.
            return null;
        }
    }

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
