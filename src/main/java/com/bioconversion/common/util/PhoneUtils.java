package com.bioconversion.common.util;

import java.util.regex.Pattern;

/**
 * Utility class for phone number normalization and validation.
 * Supports E.164 format with Burkina Faso country code (+226).
 */
public final class PhoneUtils {

    private static final Pattern BURKINA_FASO_PATTERN = Pattern.compile("^\\+226\\d{8}$");
    private static final Pattern DIGITS_ONLY = Pattern.compile("\\D");

    private PhoneUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Normalizes a phone number to E.164 format for Burkina Faso (+226).
     * Accepts formats:
     * - 70 12 34 56
     * - 70123456
     * - +226 70 12 34 56
     * - 00226 70 12 34 56
     *
     * @param phone the phone number to normalize
     * @return normalized phone number in E.164 format (+226XXXXXXXX)
     * @throws IllegalArgumentException if the phone number is invalid
     */
    public static String normalizeToE164(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Le numéro de téléphone ne peut pas être vide");
        }

        // Remove all non-digit characters
        String digits = DIGITS_ONLY.matcher(phone).replaceAll("");

        // Check if it already has the country code (226 at the start)
        if (digits.startsWith("226")) {
            digits = digits.substring(3);
        }

        // Burkina Faso phone numbers should be 8 digits after country code
        if (digits.length() != 8) {
            throw new IllegalArgumentException(
                "Numéro de téléphone invalide pour le Burkina Faso. Doit contenir 8 chiffres après l'indicatif +226");
        }

        // Reconstruct in E.164 format
        return "+226" + digits;
    }

    /**
     * Validates if a phone number is in valid E.164 format for Burkina Faso.
     *
     * @param phone the phone number to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidBurkinaFasoNumber(String phone) {
        if (phone == null) {
            return false;
        }
        return BURKINA_FASO_PATTERN.matcher(phone).matches();
    }
}
