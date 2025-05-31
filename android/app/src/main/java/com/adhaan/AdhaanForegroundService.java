package com.adhaan;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class AdhaanForegroundService extends Service {
    private static final String CHANNEL_ID = "adhaan_channel_id";
    private static final int NOTIFICATION_ID = 1001;
    private static final String AUDIO_URL = "https://ucae64459c5c4bc90538a05aac23.dl.dropboxusercontent.com/cd/0/inline/Cqpf3rQYcQt0AwbEO5bKrqzmRoesglpZ1i7LmxJ6EM2pKEHcUkQvPqAcIFh4GS-C6xxrivFH-VtAxhx7uWqAh7F4pqnS7Hj92wNYXbDx54KarBwCAeBbMr9q75Ym8hcCy9tkF1lWGXOGQ8i1FmYEPyMZ/file#";
    private MediaPlayer mediaPlayer;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP_ADHAAN".equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
        Intent stopIntent = new Intent(this, AdhaanForegroundService.class);
        stopIntent.setAction("STOP_ADHAAN");
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 1, stopIntent, PendingIntent.FLAG_IMMUTABLE);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Adhaan Playing")
                .setContentText("The Adhaan is being played.")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .addAction(android.R.drawable.ic_media_pause, "Stop", stopPendingIntent)
                .setOngoing(false)
                .build();
        startForeground(NOTIFICATION_ID, notification);
        playAudio();
        return START_NOT_STICKY;
    }

    private void playAudio() {
        try {
            mediaPlayer = MediaPlayer.create(this, R.raw.adhaan);
            if (mediaPlayer == null) {
                stopSelf();
                return;
            }
            mediaPlayer.setOnCompletionListener(mp -> stopSelf());
            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                stopSelf();
                return true;
            });
            mediaPlayer.start();
        } catch (Exception e) {
            stopSelf();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Adhaan Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }
} 