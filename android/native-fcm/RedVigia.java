package com.juniorworks.pensandote;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.os.Build;

/**
 * Decide cuando la persona "salio" y prende o apaga el guardian.
 *
 * LA SENAL
 *
 * Conectada a WiFi = esta en un lugar fijo. Con datos moviles = esta
 * en la calle. Es imperfecta: en lo de una amiga tambien hay WiFi, y
 * ahi el guardian se apaga aunque haya salido. La alternativa precisa
 * —mirar a QUE red se conecto— exige el permiso de ubicacion, que
 * Android muestra con un cartel que asusta y que Play te hace
 * justificar con un video. Para el caso que importa, caminar por la
 * calle y el colectivo, la senal simple alcanza.
 *
 * POR QUE NO ES UN RECEIVER COMUN
 *
 * Desde Android 7 el sistema ya no entrega el aviso de "cambio la
 * conexion" a los receivers declarados en el manifiesto. Hay que
 * registrar un NetworkCallback con un PendingIntent, que es la forma
 * que sobrevive a que el proceso se muera: Android nos despierta.
 *
 * Nada de esto arranca solo: Application lo activa unicamente si la
 * persona prendio el cuidado en la calle desde la app.
 */
public class RedVigia extends BroadcastReceiver {

    static final String ACCION_RED_CAMBIO = "com.juniorworks.pensandote.RED_CAMBIO";

    /** ¿Hay una red WiFi activa en este momento? */
    static boolean hayWifi(Context c) {
        try {
            ConnectivityManager cm =
                (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            Network red = cm.getActiveNetwork();
            if (red == null) return false;
            NetworkCapabilities caps = cm.getNetworkCapabilities(red);
            return caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI);
        } catch (Throwable t) {
            // Ante la duda decimos que SI hay WiFi: preferimos no prender
            // el guardian de mas antes que comerle la bateria por un error
            // nuestro leyendo el estado de la red.
            return true;
        }
    }

    /** Empieza a escuchar cambios de red. Idempotente. */
    static void vigilar(Context c) {
        try {
            ConnectivityManager cm =
                (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return;

            Intent i = new Intent(c, RedVigia.class).setAction(ACCION_RED_CAMBIO);
            PendingIntent pi = PendingIntent.getBroadcast(c, 0, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);

            NetworkRequest req = new NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build();
            cm.registerNetworkCallback(req, pi);
        } catch (Throwable t) {
            // Sin vigilancia de red el guardian simplemente no se prende solo.
        }
    }

    @Override
    public void onReceive(Context c, Intent intent) {
        if (!Guardian.estaPrendido(c)) return;

        Intent svc = new Intent(c, GuardianCaidas.class);
        if (hayWifi(c)) {
            c.stopService(svc);
        } else {
            try {
                if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(svc);
                else                             c.startService(svc);
            } catch (Throwable t) {
                // Android puede negarse a arrancar servicios en segundo
                // plano en algunos estados. Lo reintentara en el proximo
                // cambio de red.
            }
        }
    }
}
