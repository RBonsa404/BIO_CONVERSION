package com.bioconversion.iot;

import com.bioconversion.iot.dto.AlerteResponse;
import com.bioconversion.iot.dto.CapteurRequest;
import com.bioconversion.iot.dto.CapteurResponse;

import java.util.List;

/**
 * Interface de service pour le Module A — Supervision IoT (Capteurs & Alertes).
 *
 * <p>
 * Contrat de la télémétrie, du suivi de température/humidité et de la levée
 * d'alertes automatiques (CDC §2.2.1).
 * </p>
 */
public interface IotService {

    /**
     * Enregistre une mesure de télémétrie reçue d'un capteur connecté : la dernière
     * mesure est conservée sur le capteur et une alerte est levée si un seuil est dépassé.
     */
    void enregistrerTelemetrie(String codeCapteur, Double temperature, Double humidite);

    /**
     * Recherche les capteurs d'un producteur donné.
     */
    List<Capteur> obtenirCapteursProducteur(Long producteurId);

    /**
     * Active ou désactive un capteur.
     */
    Capteur changerStatutCapteur(Long capteurId, boolean actif);

    // ── Opérations exposées au producteur connecté ──────────────────────────

    List<CapteurResponse> listerCapteurs(Long producteurId);

    CapteurResponse enregistrerCapteur(CapteurRequest request, Long producteurId);

    CapteurResponse changerStatutCapteur(Long capteurId, boolean actif, Long producteurId);

    /** Dernières alertes des capteurs du producteur, de la plus récente à la plus ancienne. */
    List<AlerteResponse> listerAlertes(Long producteurId, int limite);
}
