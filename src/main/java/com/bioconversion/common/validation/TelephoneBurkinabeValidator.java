package com.bioconversion.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validateur effectif du format de numéro de téléphone burkinabè.
 */
public class TelephoneBurkinabeValidator implements ConstraintValidator<TelephoneBurkinabe, String> {

    // Regexp autorisant +226 avec 8 chiffres ou directement 8 chiffres commençant par 0, 5, 6, 7 (operateurs local Orange, Moov, Telecel)
    private static final Pattern PATTERN = Pattern.compile("^(\\+226|00226)?[567]\\d{7}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Géré par @NotBlank / @NotNull séparément
        }

        String cleaned = value.replaceAll("\\s+", "");
        return PATTERN.matcher(cleaned).matches();
    }
}
