package com.bioconversion.iot;

import com.bioconversion.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Implémentation du Module A — Télémétrie & Alertes IoT.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IotServiceImpl implements IotService {

    private final CapteurRepository capteurRepository;
    private final AlerteIoTRepository alerteIoTRepository;

    @Override
    @Transactional
    public void enregistrerTelemetrie(String codeCapteur, Double temperature, Double humidite) {
        Capteur capteur = capteurRepository.findByCodeIdentifiant(codeCapteur)
                .orElseThrow(() -> new ResourceNotFoundException("Capteur introuvable avec le code : " + codeCapteur));

        if (!capteur.isEstActif()) {
            throw new com.bioconversion.common.exception.BusinessException("Le capteur n'est pas actif");
        }

        // Vérifier les seuils et créer une alerte si nécessaire
        if (temperature != null && capteur.getSeuilTemperatureMax() != null 
                && temperature > capteur.getSeuilTemperatureMax()) {
            creerAlerte(capteur, "TEMPERATURE_HIGH", "Température " + temperature + "°C dépasse le seuil " + capteur.getSeuilTemperatureMax() + "°C");
        }

        if (humidite != null && capteur.getSeuilHumiditeMax() != null 
                && humidite > capteur.getSeuilHumiditeMax()) {
            creerAlerte(capteur, "HUMIDITE_HIGH", "Humidité " + humidite + "% dépasse le seuil " + capteur.getSeuilHumiditeMax() + "%");
        }

        log.info("Télémétrie enregistrée pour le capteur {} - Temp: {}, Hum: {}", codeCapteur, temperature, humidite);
    }

    private void creerAlerte(Capteur capteur, String typeAlerte, String message) {
        AlerteIoT alerte = AlerteIoT.builder()
                .capteur(capteur)
                .typeAlerte(typeAlerte)
                .message(message)
                .dateAlerte(OffsetDateTime.now())
                .seuil(capteur.getSeuilTemperatureMax() != null ? capteur.getSeuilTemperatureMax() : 0.0)
                .build();
        alerteIoTRepository.save(alerte);
        log.warn("Alerte IoT créée pour le capteur {}: {}", capteur.getCode(), message);
    }

    @Override
    public List<Capteur> obtenirCapteursProducteur(Long producteurId) {
        return capteurRepository.findByProducteurIdUtilisateur(producteurId);
    }

    @Override
    @Transactional
    public Capteur changerStatutCapteur(Long capteurId, boolean actif) {
        Capteur capteur = capteurRepository.findById(capteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Capteur introuvable avec l'ID : " + capteurId));
        
        capteur.setEstActif(actif);
        return capteurRepository.save(capteur);
    }
}
