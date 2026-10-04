package com.bioconversion.iot;

import java.util.List;

/**
 * Interface de service pour le Module A — Supervision IoT (Capteurs & Alertes).
 *
 * <p>
 * Ce squelette définit le contrat d'interface transverse pour la télémétrie,
 * le suivi de température/humidité et la levée d'alertes automatiques (CDC
 * §2.2.1).
 * </p>
 */
public interface IotService {

    /**
     * Enregistre une mesure de télémétrie reçue d'un capteur connecté.
     * TODO: Valider les seuils critiques (Temp > 35°C ou Humidité < 40%) et lever
     * une AlerteIoT si nécessaire.
     */
    void enregistrerTelemetrie(String codeCapteur, Double temperature, Double humidite);

    /**
     * Recherche les capteurs d'un producteur donné.
     */
    List<Capteur> obtenirCapteursProducteur(Long producteurId);

    /**
     * Active ou désactive un capteur IoT.
     */
    Capteur changerStatutCapteur(Long capteurId, boolean actif);
}
