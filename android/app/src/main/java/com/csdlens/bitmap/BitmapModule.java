package com.csdlens;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import android.os.Environment;

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
import java.io.FileOutputStream;
import java.io.File;

import static java.lang.Math.PI;
import static java.lang.Math.cos;
import static java.lang.Math.pow;
import static java.lang.Math.sin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.android.Utils;


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
            /*final Bitmap tmp = loadImage(imageName);

            final double MAX_WIDTH = 1000;

            double width = tmp.getWidth();
            double height = tmp.getHeight();

            if(width > height && width > MAX_WIDTH)
            {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
            }
            else if(height > MAX_WIDTH)
            {
                width = width * (MAX_WIDTH / height);
                height = MAX_WIDTH;
            }

            final Bitmap bitmap = Bitmap.createScaledBitmap(loadImage(imageName), (int)width, (int)height, false);
			
			final Bitmap bitmap = tmp;

            int[] pixels = new int[bitmap.getHeight() * bitmap.getWidth()];
            bitmap.getPixels(pixels, 0, (int)width, 0, 0, (int)width, (int)height);

            for(int i = 0; i < bitmap.getHeight() * bitmap.getWidth(); i++)
                res.pushInt(pixels[i]);*/
				
			Bitmap bitmap = loadImage(imageName);
			//bitmap.compress(Bitmap.CompressFormat.PNG, 0, bos);
			int[] pixels = new int[bitmap.getHeight() * bitmap.getWidth()];
            bitmap.getPixels(pixels, 0, (int)bitmap.getWidth(), 0, 0, (int)bitmap.getWidth(), (int)bitmap.getHeight());
			for(int i = 0; i < pixels.length; i++)
				res.pushInt(pixels[i]);
			bitmap.recycle();

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

    @ReactMethod
    public void getBase64OpenCVFromPixels(ReadableArray pixelsData, int width, int height, final Callback callback) {
        try {
			System.loadLibrary( Core.NATIVE_LIBRARY_NAME );
		
		
            int[] pixels = new int[width * height];
            for(int i = 0; i < width*height; i++)
                pixels[i] = pixelsData.getInt(i);
            Bitmap.Config conf = Bitmap.Config.ARGB_8888;
            Bitmap image = Bitmap.createBitmap(width, height, conf);
            image.setPixels(pixels, 0, width, 0, 0, width, height);
			
			Mat src1 = new Mat();
			Mat src = new Mat();
			Bitmap bmp32 = image.copy(Bitmap.Config.ARGB_8888, true);
            Utils.bitmapToMat(bmp32, src1);
			
			Imgproc.cvtColor(src1,src,Imgproc.COLOR_RGBA2RGB);
			
			Mat firstMask = new Mat();
			Mat foregroundModel = new Mat();
			Mat backgroundModel = new Mat();

			Mat mask;

			Mat source = new Mat(1, 1, CvType.CV_8U, new Scalar(3.0));
			Mat destination = new Mat();
			
			Point topLeft = new Point(40, 1);
			Point bottomRight = new Point(170, 140);

			Rect rect = new Rect(topLeft, bottomRight);

			Imgproc.grabCut(src, firstMask, rect, backgroundModel, foregroundModel, 1, 0);

			Core.compare(firstMask, source, firstMask, Core.CMP_EQ);

			Mat foreground = new Mat(src1.size(), CvType.CV_8UC3, new Scalar(255,255,255));
			src.copyTo(foreground, firstMask);
			
			Utils.matToBitmap(backgroundModel, image);

            /*Mat source = new Mat();
            Bitmap bmp32 = image.copy(Bitmap.Config.ARGB_8888, true);
            Utils.bitmapToMat(bmp32, source);

            Mat destination = new Mat(source.rows(),source.cols(),source.type());
            Imgproc.GaussianBlur(source, destination,new Size(45,45), 0);

            Utils.matToBitmap(destination, image);*/

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
	
	@ReactMethod
	private void saveImageToFile(final String imageName, ReadableArray pixelsData, int width, int height, final Callback callback) {
		try {
            int[] pixels = new int[width * height];
            for(int i = 0; i < width*height; i++)
                pixels[i] = pixelsData.getInt(i);
            Bitmap.Config conf = Bitmap.Config.ARGB_8888;
            Bitmap image = Bitmap.createBitmap(width, height, conf);
            image.setPixels(pixels, 0, width, 0, 0, width, height);
			File outputDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "LensEditor");   
            outputDir.mkdirs(); 
			File file = new File(outputDir, imageName + ".jpg");
			FileOutputStream out = new FileOutputStream(file.getAbsolutePath());   
            image.compress(Bitmap.CompressFormat.JPEG, 100, out);   
			out.flush();
            out.close();
            callback.invoke(null, imageName + ".jpg");
        } catch (Exception e) {
            callback.invoke(e.getMessage());
        }
	}
}