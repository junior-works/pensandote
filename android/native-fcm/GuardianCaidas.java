package com.juniorworks.pensandote;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Mira el acelerometro mientras la persona esta en la calle.
 *
 * POR QUE ES UN SERVICIO EN PRIMER PLANO
 *
 * Android mata todo lo que corre en segundo plano. Para que el sensor
 * siga midiendo con la app cerrada no hay alternativa: hace falta un
 * foreground service, y eso obliga a una notificacion permanente. Es
 * un costo visible y la persona la va a ver. Por eso el texto de esa
 * notificacion dice la verdad en castellano claro, y por eso el
 * servicio se apaga solo cuando vuelve a casa: que no este ahi todo el
 * dia recordandole que la estan mirando.
 *
 * POR QUE NO HABLA CON SUPABASE
 *
 * El servicio no tiene la sesion de la persona y no queremos
 * credenciales guardadas en el telefono. Guarda los candidatos en
 * SharedPreferences y LauncherActivity se los pasa a la web la proxima
 * vez que se abra la app, igual que hace con el token de Firebase.
 *
 * Para la fase de calibracion eso alcanza de sobra: no hay que avisar
 * a nadie en el momento, solo acumular. Y de paso no gasta red ni
 * bateria mientras ella camina.
 */
public class GuardianCaidas extends Service implements SensorEventListener {

    static final String PREFS            = "pensandote_caidas";
    static final String CLAVE_PENDIENTES = "pendientes";
    static final String CLAVE_ACTIVO     = "guardian_activo";

    private static final String CANAL   = "pensandote_guardian_v1";
    private static final int    NOTIF_ID = 4710;

    /** Tope de candidatos guardados. Si la web no se abre en semanas,
     *  preferimos perder los mas viejos antes que inflar las prefs. */
    private static final int MAX_PENDIENTES = 200;

    private SensorManager sensores;
    private Sensor acelerometro;
    private final DetectorCaida detector = new DetectorCaida();

    /**
     * Se apaga solo cuando vuelve el WiFi: estar conectada a una red
     * inalambrica es nuestra senal de "esta en un lugar fijo". Imperfecta
     * —en lo de una amiga tambien hay WiFi— pero cubre el caso que
     * importa, caminar por la calle y el colectivo, sin pedirle el
     * permiso de ubicacion que Android exige para saber a QUE red se
     * conecto.
     */
    private final BroadcastReceiver volvioElWifi = new BroadcastReceiver() {
        @Override public void onReceive(Context c, Intent i) {
            if (RedVigia.hayWifi(c)) stopSelf();
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        arrancarEnPrimerPlano();

        sensores = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        acelerometro = sensores != null
            ? sensores.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) : null;

        if (acelerometro == null) {
            // Sin acelerometro no hay nada que hacer, y mentirle a la
            // familia diciendo que esta cuidando es peor que no estar.
            stopSelf();
            return;
        }
        // SENSOR_DELAY_GAME ronda los 50 Hz. Mas lento se pierde el pico
        // del golpe, que dura poquisimo.
        sensores.registerListener(this, acelerometro, SensorManager.SENSOR_DELAY_GAME);

        registerReceiver(volvioElWifi, new IntentFilter(RedVigia.ACCION_RED_CAMBIO));
        prefs().edit().putBoolean(CLAVE_ACTIVO, true).apply();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (sensores != null) sensores.unregisterListener(this);
        try { unregisterReceiver(volvioElWifi); } catch (Throwable ignored) {}
        prefs().edit().putBoolean(CLAVE_ACTIVO, false).apply();
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override public void onAccuracyChanged(Sensor s, int a) { }

    @Override
    public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType() != Sensor.TYPE_ACCELEROMETER) return;

        final long ahora = SystemClock.elapsedRealtime();
        final DetectorCaida.Candidato c =
            detector.alimentar(e.values[0], e.values[1], e.values[2], ahora);
        if (c != null) guardarCandidato(c);
    }

    /**
     * Guarda el candidato en el telefono. NO avisa a nadie: estamos en
     * la fase de medir, no de alertar.
     */
    private void guardarCandidato(DetectorCaida.Candidato c) {
        try {
            final JSONObject fila = new JSONObject();
            fila.put("ocurrido", System.currentTimeMillis());
            fila.put("pico_g", Math.round(c.picoG * 100) / 100.0);
            fila.put("caida_libre_ms", c.caidaLibreMs);
            fila.put("quietud_ms", c.quietudMs);
            fila.put("giro_grados", Math.round(c.giroGrados));
            fila.put("en_la_calle", true);
            fila.put("bateria_pct", bateriaPct());

            final SharedPreferences p = prefs();
            final JSONArray lista = new JSONArray(p.getString(CLAVE_PENDIENTES, "[]"));
            lista.put(fila);

            final JSONArray podada = new JSONArray();
            final int desde = Math.max(0, lista.length() - MAX_PENDIENTES);
            for (int i = desde; i < lista.length(); i++) podada.put(lista.get(i));

            p.edit().putString(CLAVE_PENDIENTES, podada.toString()).apply();
        } catch (Throwable t) {
            // Un candidato perdido no justifica tirar abajo el servicio.
        }
    }

    private int bateriaPct() {
        try {
            BatteryManager bm = (BatteryManager) getSystemService(Context.BATTERY_SERVICE);
            return bm != null ? bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) : -1;
        } catch (Throwable t) { return -1; }
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private void arrancarEnPrimerPlano() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26 && nm != null) {
            NotificationChannel canal = new NotificationChannel(
                CANAL, "Cuidado en la calle", NotificationManager.IMPORTANCE_LOW);
            canal.setDescription("Avisa que Pensándote está atento mientras estás afuera");
            canal.setShowBadge(false);
            nm.createNotificationChannel(canal);
        }

        Intent abrir = new Intent(this, LauncherActivity.class);
        PendingIntent tap = PendingIntent.getActivity(this, 0, abrir,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder b = Build.VERSION.SDK_INT >= 26
            ? new Notification.Builder(this, CANAL)
            : new Notification.Builder(this);
        b.setSmallIcon(R.drawable.ic_notification_icon)
         .setContentTitle("Pensándote te acompaña")
         .setContentText("Estoy atenta por si te caés. Al volver a casa me apago sola.")
         .setOngoing(true)
         .setContentIntent(tap);

        startForeground(NOTIF_ID, b.build());
    }
}
