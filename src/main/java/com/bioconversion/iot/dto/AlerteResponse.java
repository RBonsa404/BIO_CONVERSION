package com.bioconversion.iot.dto;

import com.bioconversion.iot.AlerteIoT;

import java.time.OffsetDateTime;

/**
 * Vue d'une alerte levée par un capteur.
 */
public record AlerteResponse(
        Long idAlerte,
        String codeCapteur,
        String typeAlerte,
        String message,
        OffsetDateTime dateAlerte,
        double seuil
) {
    public static AlerteResponse from(AlerteIoT alerte) {
        return new AlerteResponse(
                alerte.getIdAlerte(),
                alerte.getCapteur().getCodeIdentifiant(),
                alerte.getTypeAlerte(),
                alerte.getMessage(),
                alerte.getDateAlerte(),
                alerte.getSeuil());
    }
}
