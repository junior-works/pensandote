package com.juniorworks.pensandote;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/** Muestra los avisos de datos FCM incluso con la interfaz web cerrada. */
public class NativeFirebaseMessagingService extends FirebaseMessagingService {
    private static final String CHANNEL_ID = "pensandote_family_v1";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        TokenFcm.guardar(this, token);
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        Map<String, String> data = message.getData();
        String title = data.getOrDefault("title", "Pensándote");
        String body = data.getOrDefault("body", "Tenés un aviso de tu familia.");
        // Al tocar el aviso abrimos el TWA directo, que es la app.
        Intent open = new Intent(this, LauncherActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        open.putExtra("push_url", data.getOrDefault("url", "#/inicio"));
        int id = (int) (System.currentTimeMillis() & 0x7fffffff);
        PendingIntent tap = PendingIntent.getActivity(this, id, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                    "Avisos de Pensándote", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Mensajes y recordatorios de tu círculo familiar");
            manager.createNotificationChannel(channel);
        }
        Notification.Builder notification = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);
        notification.setSmallIcon(R.drawable.ic_notification_icon)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(tap)
                .setDefaults(Notification.DEFAULT_ALL);
        if (Build.VERSION.SDK_INT < 26) notification.setPriority(Notification.PRIORITY_HIGH);
        manager.notify(id, notification.build());
    }
}
