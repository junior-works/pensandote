package com.juniorworks.pensandote;

import android.content.Context;
import android.content.SharedPreferences;

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

    private Guardian() {}

    static boolean estaPrendido(Context c) {
        return prefs(c).getBoolean(CLAVE, false);
    }

    static void prender(Context c, boolean si) {
        prefs(c).edit().putBoolean(CLAVE, si).apply();
    }

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
