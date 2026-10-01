package com.juniorworks.pensandote;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.widget.TextView;

import androidx.browser.customtabs.CustomTabsClient;

import com.google.firebase.messaging.FirebaseMessaging;

/** Obtiene el token nativo antes de abrir la web, sin depender de Chrome Push. */
public class NativeBootstrapActivity extends Activity {
    private static final int NOTIFICATION_PERMISSION = 1201;
    private boolean launched = false;
    /**
     * true cuando otra ventana nos saco el foco, que es la senal de que el
     * TWA aparecio. No sirve onStop(): la LauncherActivity del TWA es
     * translucida y una pantalla translucida no detiene la de atras, asi que
     * onStop() no se llama aunque el TWA haya arrancado perfecto.
     */
    private boolean perdioFoco = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView waiting = new TextView(this);
        waiting.setText("Preparando Pensándote…");
        waiting.setTextSize(20);
        waiting.setGravity(Gravity.CENTER);
        waiting.setBackgroundColor(0xFFFAF5E9);
        setContentView(waiting);

        if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION);
        } else {
            openWithToken();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean tieneFoco) {
        super.onWindowFocusChanged(tieneFoco);
        if (!tieneFoco) perdioFoco = true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == NOTIFICATION_PERMISSION) openWithToken();
    }

    private void openWithToken() {
        // Si Firebase no contesta en 15s, seguimos igual pero avisando. Sin
        // esto la app se abre como si todo estuviera bien y el token nunca
        // llega al servidor, que es un fallo mudo: no hay forma de saber si el
        // problema es Firebase, la red o el registro en la web.
        Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(() -> mostrarEstado(null, "Firebase no contesto en 15 segundos"), 15000);
        try {
            FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
                if (task.isSuccessful() && task.getResult() != null && !task.getResult().isEmpty()) {
                    mostrarEstado(task.getResult(), null);
                } else {
                    Exception e = task.getException();
                    mostrarEstado(null, e != null ? e.getClass().getSimpleName() + ": " + e.getMessage()
                                                  : "getToken fallo sin detalle");
                }
            });
        } catch (Throwable e) {
            mostrarEstado(null, "No pude pedir el token: " + e.getClass().getSimpleName() + " " + e.getMessage());
        }
    }

    /**
     * Muestra en pantalla si consiguio el token o por que no.
     *
     * Con token sigue sola a los 2 segundos. Sin token se queda quieta: el
     * motivo del fallo es el unico dato que sirve para arreglarlo, y si la app
     * siguiera de largo ese motivo se perderia para siempre. Tocar la pantalla
     * continua igual.
     */
    private void mostrarEstado(String token, String error) {
        if (launched || isFinishing()) return;
        final TextView tv = new TextView(this);
        tv.setTextSize(16);
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(40, 40, 40, 40);
        tv.setBackgroundColor(0xFFFAF5E9);
        tv.setTextColor(0xFF2B2B2B);
        if (token != null) {
            tv.setText("Token de Firebase OK\n\n" + token.substring(0, Math.min(16, token.length()))
                       + "...\n\nAbriendo Pensandote...");
            setContentView(tv);
            new Handler(Looper.getMainLooper()).postDelayed(() -> launch(token), 2000);
        } else {
            tv.setText("NO se pudo obtener el token de Firebase\n\n" + error
                       + "\n\nSacale una foto a esta pantalla.\nTocá para continuar igual.");
            tv.setOnClickListener(v -> launch(null));
            setContentView(tv);
        }
    }

    private void launch(String token) {
        if (launched || isFinishing()) return;
        launched = true;

        String destination = getIntent().getStringExtra("push_url");
        Uri destino = destination != null ? safeDestination(destination) : null;

        // El TWA es lo que abre la app a pantalla completa, sin barra de
        // direcciones. Necesita un navegador con soporte de Custom Tabs; si
        // no hay ninguno no tiene sentido ni intentarlo, y preguntarlo es un
        // dato concreto en vez de adivinar por cuanto tarda.
        if (CustomTabsClient.getPackageName(this, null) == null) {
            abrirEnNavegador(token, destino);
            return;
        }

        try {
            Intent twa = new Intent(this, LauncherActivity.class);
            if (destino != null) twa.setData(destino);
            if (token != null && !token.isEmpty()) twa.putExtra("native_fcm_token", token);
            // El dialogo de permisos pudo habernos sacado el foco antes;
            // desde aca lo que cuenta es si el TWA aparece.
            perdioFoco = false;
            startActivity(twa);
            final String tokenFinal = token;
            final Uri destinoFinal = destino;
            // Ultima red: si en 12 segundos ni siquiera nos saco el foco, el
            // TWA no llego a dibujarse. Mejor la web con barra fea que una
            // pantalla muerta.
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (perdioFoco) finish();
                else abrirEnNavegador(tokenFinal, destinoFinal);
            }, 12000);
            return;
        } catch (Throwable e) {
            // El TWA ni arranco. Seguimos por navegador.
        }
        abrirEnNavegador(token, destino);
    }

    private void abrirEnNavegador(String token, Uri destino) {
        String url = destino != null
            ? destino.toString()
            : "https://junior-works.github.io/pensandote/";
        if (token != null && !token.isEmpty() && !url.contains("native_fcm=")) {
            url = url + (url.contains("#") ? "&" : "#/inicio?") + "native_fcm=" + Uri.encode(token);
        }
        try {
            Intent web = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            web.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(web);
        } catch (Throwable e) {
            // Nada mas que hacer, pero que no quede una pantalla negra muda.
        }
        finish();
    }

    private Uri safeDestination(String destination) {
        String base = "https://junior-works.github.io/pensandote/";
        String full = destination.startsWith("#/") ? base + destination
            : destination.startsWith("./#/") ? base + destination.substring(2)
            : destination.startsWith("/pensandote/#/") ? "https://junior-works.github.io" + destination
            : destination;
        Uri uri = Uri.parse(full);
        return "https".equals(uri.getScheme())
            && "junior-works.github.io".equals(uri.getHost())
            && uri.getPath() != null && uri.getPath().startsWith("/pensandote/")
            ? uri : null;
    }
}
