package com.bioconversion.common.validation;

import com.bioconversion.common.util.PhoneUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validateur effectif du format de numéro de téléphone burkinabè.
 * Uses PhoneUtils for consistent normalization and validation.
 */
public class TelephoneBurkinabeValidator implements ConstraintValidator<TelephoneBurkinabe, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Géré par @NotBlank / @NotNull séparément
        }

        try {
            // Try to normalize - if it succeeds, the format is valid
            PhoneUtils.normalizeToE164(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
