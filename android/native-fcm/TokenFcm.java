package com.juniorworks.pensandote;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.android.gms.tasks.Tasks;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.concurrent.TimeUnit;

/**
 * Guarda el token de Firebase en el telefono para poder pasarselo a la web
 * al abrir la app.
 *
 * Antes esto lo hacia una pantalla propia que corria antes del TWA. Esa
 * pantalla rompia el arranque: dejaba la app colgada antes de mostrar nada.
 * Pedir el token no justifica meterse en el camino del arranque, asi que
 * ahora se pide en segundo plano y se lee de aca cuando hace falta.
 */
final class TokenFcm {
    private static final String PREFS = "pensandote_fcm";
    private static final String CLAVE = "token";

    private TokenFcm() {}

    private static SharedPreferences prefs(Context contexto) {
        return contexto.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void guardar(Context contexto, String token) {
        if (token == null || token.isEmpty()) return;
        prefs(contexto).edit().putString(CLAVE, token).apply();
    }

    static String guardado(Context contexto) {
        return prefs(contexto).getString(CLAVE, null);
    }

    /** Pide el token y lo guarda. Sin bloquear a nadie. */
    static void pedirEnSegundoPlano(Context contexto) {
        try {
            FirebaseMessaging.getInstance().getToken()
                .addOnSuccessListener(token -> guardar(contexto, token));
        } catch (Throwable e) {
            // Sin token no hay avisos nativos, pero la app tiene que abrir igual.
        }
    }

    /**
     * El token guardado, esperando un poco si todavia no hay ninguno.
     *
     * Solo espera la primera vez que se abre la app recien instalada: despues
     * ya quedo guardado y vuelve al instante. El limite es corto a proposito;
     * si vence, la app abre igual y el token se registra en la proxima
     * apertura. Nunca vale la pena colgar el arranque por esto.
     */
    static String conEsperaCorta(Context contexto) {
        String token = guardado(contexto);
        if (token != null) return token;
        try {
            token = Tasks.await(FirebaseMessaging.getInstance().getToken(), 2, TimeUnit.SECONDS);
            guardar(contexto, token);
            return token;
        } catch (Throwable e) {
            return null;
        }
    }
}
