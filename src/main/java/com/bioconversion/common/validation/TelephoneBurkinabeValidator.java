package com.bioconversion.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validateur effectif du format de numéro de téléphone burkinabè.
 */
public class TelephoneBurkinabeValidator implements ConstraintValidator<TelephoneBurkinabe, String> {

    // Regexp autorisant l'indicatif optionnel (+226 ou 00226) suivi de 8 chiffres (les espaces sont retirés avant validation)
    private static final Pattern PATTERN = Pattern.compile("^(\\+226|00226)?\\d{8}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Géré par @NotBlank / @NotNull séparément
        }

        String cleaned = value.replaceAll("\\s+", "");
        return PATTERN.matcher(cleaned).matches();
    }
}
