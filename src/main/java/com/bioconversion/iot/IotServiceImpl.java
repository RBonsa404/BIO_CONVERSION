package com.bioconversion.iot;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.iot.dto.AlerteResponse;
import com.bioconversion.iot.dto.CapteurRequest;
import com.bioconversion.iot.dto.CapteurResponse;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Implémentation du Module A — Supervision IoT.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IotServiceImpl implements IotService {

    private final CapteurRepository capteurRepository;
    private final AlerteIoTRepository alerteIoTRepository;
    private final ProducteurRepository producteurRepository;

    @Override
    @Transactional
    public void enregistrerTelemetrie(String codeCapteur, Double temperature, Double humidite) {
        Capteur capteur = capteurRepository.findByCodeIdentifiant(codeCapteur)
                .orElseThrow(() -> new ResourceNotFoundException("Capteur introuvable avec le code : " + codeCapteur));

        if (!capteur.isEstActif()) {
            throw new BusinessException("Le capteur n'est pas actif");
        }
        // Mêmes bornes que les contraintes de la table capteur
        if (temperature != null && (temperature < -10 || temperature > 60)) {
            throw new BusinessException("Température hors plage (-10 °C à 60 °C) : " + temperature);
        }
        if (humidite != null && (humidite < 0 || humidite > 100)) {
            throw new BusinessException("Humidité hors plage (0 % à 100 %) : " + humidite);
        }

        capteur.setTemperature(temperature);
        capteur.setHumidite(humidite);
        capteur.setDateMesure(OffsetDateTime.now());
        capteurRepository.save(capteur);

        // Vérifier les seuils et créer une alerte si nécessaire
        if (temperature != null && capteur.getSeuilTemperatureMax() != null
                && temperature > capteur.getSeuilTemperatureMax()) {
            creerAlerte(capteur, "TEMPERATURE_HIGH", capteur.getSeuilTemperatureMax(),
                    "Température " + temperature + "°C dépasse le seuil " + capteur.getSeuilTemperatureMax() + "°C");
        }

        if (humidite != null && capteur.getSeuilHumiditeMax() != null
                && humidite > capteur.getSeuilHumiditeMax()) {
            creerAlerte(capteur, "HUMIDITE_HIGH", capteur.getSeuilHumiditeMax(),
                    "Humidité " + humidite + "% dépasse le seuil " + capteur.getSeuilHumiditeMax() + "%");
        }

        log.info("Télémétrie enregistrée pour le capteur {} - Temp: {}, Hum: {}", codeCapteur, temperature, humidite);
    }

    private void creerAlerte(Capteur capteur, String typeAlerte, double seuil, String message) {
        AlerteIoT alerte = AlerteIoT.builder()
                .capteur(capteur)
                .typeAlerte(typeAlerte)
                .message(message)
                .dateAlerte(OffsetDateTime.now())
                .seuil(seuil)
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

    @Override
    @Transactional(readOnly = true)
    public List<CapteurResponse> listerCapteurs(Long producteurId) {
        return capteurRepository.findByProducteurIdUtilisateur(producteurId).stream()
                .map(CapteurResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CapteurResponse enregistrerCapteur(CapteurRequest request, Long producteurId) {
        Producteur producteur = producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ForbiddenException("Seul un producteur peut enregistrer un capteur"));

        String code = request.getCodeIdentifiant().trim();
        if (capteurRepository.findByCodeIdentifiant(code).isPresent()) {
            throw new BusinessException("Un capteur porte déjà le code " + code);
        }

        Capteur capteur = Capteur.builder()
                .producteur(producteur)
                .codeIdentifiant(code)
                .typeCapteur(request.getTypeCapteur().trim())
                .estActif(true)
                .seuilTemperatureMax(request.getSeuilTemperatureMax())
                .seuilHumiditeMax(request.getSeuilHumiditeMax())
                .build();
        return CapteurResponse.from(capteurRepository.save(capteur));
    }

    @Override
    @Transactional
    public CapteurResponse changerStatutCapteur(Long capteurId, boolean actif, Long producteurId) {
        Capteur capteur = capteurRepository.findById(capteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Capteur introuvable avec l'ID : " + capteurId));
        if (!capteur.getProducteur().getIdUtilisateur().equals(producteurId)) {
            throw new ForbiddenException("Ce capteur n'appartient pas à votre exploitation");
        }
        capteur.setEstActif(actif);
        return CapteurResponse.from(capteurRepository.save(capteur));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlerteResponse> listerAlertes(Long producteurId, int limite) {
        PageRequest page = PageRequest.of(0, Math.max(1, Math.min(limite, 100)),
                Sort.by(Sort.Direction.DESC, "dateAlerte"));
        return alerteIoTRepository.findByCapteurProducteurIdUtilisateur(producteurId, page).stream()
                .map(AlerteResponse::from)
                .toList();
    }
}
