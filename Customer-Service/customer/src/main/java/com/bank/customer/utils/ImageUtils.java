package com.bank.customer.utils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Deflater;

public class ImageUtils {

    private static final int BYTE_SIZE = 4 * 1024; // 4Kb

    public static byte[] compressImage(byte[] data) throws IOException {

//        create Deflator object and set compression level
        Deflater deflater = new Deflater();
        deflater.setLevel(Deflater.DEFAULT_COMPRESSION);

//        pass input data(image byte array) to the Deflator
        deflater.setInput(data);

//        Indicate compression finish after input is processed
        deflater.finish();

        try(ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length)){
            byte[] temp = new byte[BYTE_SIZE];

            while(!deflater.finished()){
                int size = deflater.deflate(temp);
                outputStream.write(temp, 0, size);
            }

            return outputStream.toByteArray();
        }catch (IOException e){
            throw new RuntimeException("Failed to compress image", e);
        }
    }
}
