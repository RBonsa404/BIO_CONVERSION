package com.bioconversion.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Annotation de validation pour s'assurer qu'un numéro de téléphone est un format burkinabè valide
 * (ex: +22670123456, +226 60 12 34 56, ou 8 chiffres locaux 70123456).
 */
@Documented
@Constraint(validatedBy = TelephoneBurkinabeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface TelephoneBurkinabe {

    String message() default "Format de numéro de téléphone burkinabè invalide (ex: +22670123456 ou 70123456)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
