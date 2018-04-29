package com.csdlens;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

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
    public void getPixelRGBAofImage(final String imageName, final Callback callback) {
        try {

            WritableArray res = new WritableNativeArray();
            final Bitmap tmp = loadImage(imageName);

            final double MAX_WIDTH = 1000;

            double width = tmp.getWidth();
            double height = tmp.getHeight();

           /* if(width > height && width > MAX_WIDTH)
            {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
            }
            else if(height > MAX_WIDTH)
            {
                width = width * (MAX_WIDTH / height);
                height = MAX_WIDTH;
            }

            final Bitmap bitmap = Bitmap.createScaledBitmap(loadImage(imageName), (int)width, (int)height, false);*/
			
			final Bitmap bitmap = tmp;

            int[] pixels = new int[bitmap.getHeight() * bitmap.getWidth()];
            bitmap.getPixels(pixels, 0, (int)width, 0, 0, (int)width, (int)height);

            for(int i = 0; i < bitmap.getHeight() * bitmap.getWidth(); i++)
                res.pushInt(pixels[i]);

            callback.invoke(null, res, bitmap.getWidth(), bitmap.getHeight());
        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void getBase64FromPixels(ReadableArray pixelsData, int width, int height, final Callback callback) {
        try {
            int[] pixels = new int[width * height];
            for(int i = 0; i < width*height; i++)
                pixels[i] = pixelsData.getInt(i);
            Bitmap.Config conf = Bitmap.Config.ARGB_8888;
            Bitmap image = Bitmap.createBitmap(width, height, conf);
            image.setPixels(pixels, 0, width, 0, 0, width, height);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            image.compress(Bitmap.CompressFormat.PNG, 100, baos);
            byte[] b = baos.toByteArray();
            String imageEncoded = Base64.encodeToString(b, Base64.DEFAULT);
            callback.invoke(null, imageEncoded);
        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
    }
	
	private int calculateInSampleSize(
            BitmapFactory.Options options, int reqWidth, int reqHeight) {

		final int height = options.outHeight;
		final int width = options.outWidth;
		int inSampleSize = 1;

		if (height > reqHeight || width > reqWidth) {

			final int halfHeight = height / 2;
			final int halfWidth = width / 2;

			while ((halfHeight / inSampleSize) >= reqHeight
					&& (halfWidth / inSampleSize) >= reqWidth) {
				inSampleSize *= 2;
			}
		}

		return inSampleSize;
	}

    private Bitmap loadImage(final String imageName) throws IOException {
		
		final BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeFile(imageName, options);
		
		options.inSampleSize = calculateInSampleSize(options, 500, 500);

		options.inJustDecodeBounds = false;
        Bitmap bitmap = BitmapFactory.decodeFile(imageName, options);

        return bitmap;
    }
}