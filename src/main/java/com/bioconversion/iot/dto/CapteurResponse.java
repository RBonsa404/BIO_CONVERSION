package com.bioconversion.iot.dto;

import com.bioconversion.iot.Capteur;

import java.time.OffsetDateTime;

/**
 * Vue d'un capteur et de sa dernière mesure.
 */
public record CapteurResponse(
        Long idCapteur,
        String codeIdentifiant,
        String typeCapteur,
        boolean estActif,
        Double temperature,
        Double humidite,
        OffsetDateTime dateMesure,
        Double seuilTemperatureMax,
        Double seuilHumiditeMax,
        boolean enAlerte
) {
    public static CapteurResponse from(Capteur capteur) {
        boolean temperatureHaute = capteur.getTemperature() != null && capteur.getSeuilTemperatureMax() != null
                && capteur.getTemperature() > capteur.getSeuilTemperatureMax();
        boolean humiditeHaute = capteur.getHumidite() != null && capteur.getSeuilHumiditeMax() != null
                && capteur.getHumidite() > capteur.getSeuilHumiditeMax();
        return new CapteurResponse(
                capteur.getIdCapteur(),
                capteur.getCodeIdentifiant(),
                capteur.getTypeCapteur(),
                capteur.isEstActif(),
                capteur.getTemperature(),
                capteur.getHumidite(),
                capteur.getDateMesure(),
                capteur.getSeuilTemperatureMax(),
                capteur.getSeuilHumiditeMax(),
                temperatureHaute || humiditeHaute);
    }
}
