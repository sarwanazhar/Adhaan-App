package com.adhaan;

import android.content.Intent;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AdhaanModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "AdhaanModule";

    public AdhaanModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startAdhaanService() {
        Context context = getReactApplicationContext();
        Intent intent = new Intent(context, AdhaanServiceStarterReceiver.class);
        context.sendBroadcast(intent);
    }
} 