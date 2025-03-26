package com.example.blogapp.util;

import java.security.SecureRandom;
import java.util.Base64;

public class TestKeyGenerator {
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder encoder = Base64.getEncoder();

    public static String generateTestKey(int length) {
        byte[] randomBytes = new byte[length];
        secureRandom.nextBytes(randomBytes);
        return encoder.encodeToString(randomBytes);
    }

    public static String generateJwtTestKey() {
        // Generate a 32-byte (256-bit) key for JWT
        return generateTestKey(32);
    }
}