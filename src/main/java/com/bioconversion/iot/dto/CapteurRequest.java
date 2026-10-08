package com.bioconversion.iot.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO d'enregistrement d'un capteur par le producteur.
 */
@Getter
@Setter
public class CapteurRequest {

    @NotBlank(message = "Le code identifiant du capteur est obligatoire")
    @Size(max = 100, message = "Le code ne peut dépasser 100 caractères")
    private String codeIdentifiant;

    @NotBlank(message = "Le type de capteur est obligatoire")
    @Size(max = 100, message = "Le type ne peut dépasser 100 caractères")
    private String typeCapteur;

    @DecimalMin(value = "-10.0", message = "Seuil de température trop bas (-10 °C minimum)")
    @DecimalMax(value = "60.0", message = "Seuil de température trop haut (60 °C maximum)")
    private Double seuilTemperatureMax;

    @DecimalMin(value = "0.0", message = "Le seuil d'humidité ne peut pas être négatif")
    @DecimalMax(value = "100.0", message = "Le seuil d'humidité ne peut pas dépasser 100 %")
    private Double seuilHumiditeMax;
}
