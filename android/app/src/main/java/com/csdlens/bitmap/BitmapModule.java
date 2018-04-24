package com.csdlens;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import java.io.IOException;
import java.io.InputStream;

import static java.lang.Math.PI;
import static java.lang.Math.cos;
import static java.lang.Math.pow;
import static java.lang.Math.sin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;


class BitmapModule extends ReactContextBaseJavaModule {
    private final Context context;
    private static final double rotation =  PI / 2;

    public BitmapModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "Bitmap";
    }

    @ReactMethod
    public void getPixelRGBAofImage(final String imageName, final int x, final int y, final Callback callback) {
        try {
            final Bitmap bitmap = loadImage(imageName);
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            int[] pixels = new int[height * width];
            bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
            JSONArray jsonData = new JSONArray(Arrays.asList(pixels));
            callback.invoke(null, jsonData.toString());
        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
    }

    private Bitmap loadImage(final String imageName) throws IOException {
        Bitmap bitmap = BitmapFactory.decodeFile(imageName);
        return bitmap;
    }
}