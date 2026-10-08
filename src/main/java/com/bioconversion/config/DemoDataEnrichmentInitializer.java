package com.bioconversion.config;

import com.bioconversion.geo.Localisation;
import com.bioconversion.iot.AlerteIoT;
import com.bioconversion.iot.AlerteIoTRepository;
import com.bioconversion.iot.Capteur;
import com.bioconversion.iot.CapteurRepository;
import com.bioconversion.marketplace.Produit;
import com.bioconversion.marketplace.ProduitRepository;
import com.bioconversion.marketplace.TypeProduit;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Complète le jeu de démonstration de {@link DevTestDataInitializer} pour que chaque
 * écran ait de quoi s'afficher : un second producteur hors de Ouagadougou (recherche
 * par rayon), un éleveur à valider et les capteurs de la ferme principale.
 */
@Component
@Order(2)
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DemoDataEnrichmentInitializer implements CommandLineRunner {

    private static final String TEST_PASSWORD = "TestPass123!";
    private static final String PRODUCTEUR_PHONE = "+22670000001";
    private static final String PRODUCTEUR_KOUBRI_PHONE = "+22670000006";
    private static final String ELEVEUR_EN_ATTENTE_PHONE = "+22670000007";

    private final UtilisateurRepository utilisateurRepository;
    private final ProducteurRepository producteurRepository;
    private final EleveurRepository eleveurRepository;
    private final ProduitRepository produitRepository;
    private final CapteurRepository capteurRepository;
    private final AlerteIoTRepository alerteIoTRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        creerProducteurKoubri();
        creerEleveurEnAttente();
        utilisateurRepository.findByTelephone(PRODUCTEUR_PHONE)
                .filter(Producteur.class::isInstance)
                .map(Producteur.class::cast)
                .ifPresent(this::creerCapteurs);
    }

    private void creerProducteurKoubri() {
        if (utilisateurRepository.existsByTelephone(PRODUCTEUR_KOUBRI_PHONE)) {
            return;
        }
        Producteur producteur = new Producteur();
        producteur.setNom("Sawadogo");
        producteur.setPrenom("Issa");
        producteur.setTelephone(PRODUCTEUR_KOUBRI_PHONE);
        producteur.setMotDePasse(passwordEncoder.encode(TEST_PASSWORD));
        producteur.setNomExploitation("Ferme BSF de Koubri");
        producteur.setCapaciteProduction(250);
        producteur.setStatut(StatutUtilisateur.ACTIF);
        producteur.setLocalisation(Localisation.builder()
                .ville("Koubri")
                .province("Kadiogo")
                .latitude(12.1813)
                .longitude(-1.3962)
                .build());
        producteur = producteurRepository.save(producteur);

        produitRepository.save(Produit.builder()
                .producteur(producteur)
                .nomProduit("Larves vivantes")
                .typeProduit(TypeProduit.LARVE)
                .prix(BigDecimal.valueOf(400))
                .quantiteStock(120)
                .disponibilite(true)
                .build());
        produitRepository.save(Produit.builder()
                .producteur(producteur)
                .nomProduit("Frass (résidu fertilisant)")
                .typeProduit(TypeProduit.RESIDU_PRODUCTION)
                .prix(BigDecimal.valueOf(150))
                .quantiteStock(300)
                .disponibilite(true)
                .build());
    }

    private void creerEleveurEnAttente() {
        if (utilisateurRepository.existsByTelephone(ELEVEUR_EN_ATTENTE_PHONE)) {
            return;
        }
        Eleveur eleveur = new Eleveur();
        eleveur.setNom("Ouédraogo");
        eleveur.setPrenom("Aminata");
        eleveur.setTelephone(ELEVEUR_EN_ATTENTE_PHONE);
        eleveur.setMotDePasse(passwordEncoder.encode(TEST_PASSWORD));
        eleveur.setTypeElevage("AVICULTURE");
        eleveur.setAdresse("Saaba, Burkina Faso");
        eleveur.setStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION);
        eleveurRepository.save(eleveur);
    }

    private void creerCapteurs(Producteur producteur) {
        if (!capteurRepository.findByProducteurIdUtilisateur(producteur.getIdUtilisateur()).isEmpty()) {
            return;
        }
        OffsetDateTime maintenant = OffsetDateTime.now();
        capteurRepository.save(Capteur.builder()
                .producteur(producteur)
                .codeIdentifiant("SERRE-01")
                .typeCapteur("Température / humidité — bacs de larves")
                .estActif(true)
                .temperature(28.4)
                .humidite(62.0)
                .dateMesure(maintenant.minusMinutes(4))
                .seuilTemperatureMax(35.0)
                .seuilHumiditeMax(80.0)
                .build());
        Capteur voliere = capteurRepository.save(Capteur.builder()
                .producteur(producteur)
                .codeIdentifiant("VOLIERE-01")
                .typeCapteur("Température / humidité — volière de ponte")
                .estActif(true)
                .temperature(36.2)
                .humidite(71.0)
                .dateMesure(maintenant.minusMinutes(9))
                .seuilTemperatureMax(34.0)
                .seuilHumiditeMax(85.0)
                .build());
        alerteIoTRepository.save(AlerteIoT.builder()
                .capteur(voliere)
                .typeAlerte("TEMPERATURE_HIGH")
                .message("Température 36.2°C dépasse le seuil 34.0°C")
                .dateAlerte(maintenant.minusMinutes(9))
                .seuil(34.0)
                .build());
    }
}
