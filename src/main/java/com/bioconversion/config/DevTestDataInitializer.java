package com.bioconversion.config;

import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.Produit;
import com.bioconversion.marketplace.ProduitRepository;
import com.bioconversion.marketplace.TypeProduit;
import com.bioconversion.utilisateur.Administrateur;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.Utilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevTestDataInitializer implements CommandLineRunner {

    private static final String TEST_PASSWORD = "TestPass123!";
    private static final String PRODUCTEUR_PHONE = "+22670000001";
    private static final String PENDING_PRODUCTEUR_PHONE = "+22670000002";
    private static final String PISCICULTEUR_PHONE = "+22670000003";
    private static final String AVICULTEUR_PHONE = "+22670000004";
    private static final String ADMIN_PHONE = "+22670000005";

    private final UtilisateurRepository utilisateurRepository;
    private final ProducteurRepository producteurRepository;
    private final EleveurRepository eleveurRepository;
    private final ProduitRepository produitRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Producteur producteurActif = obtenirProducteur(
                PRODUCTEUR_PHONE, "Producteur", "Test", "Ferme BioConversion", StatutUtilisateur.ACTIF);
        obtenirProducteur(
                PENDING_PRODUCTEUR_PHONE, "Producteur", "En attente", "Ferme en attente", StatutUtilisateur.EN_ATTENTE_VALIDATION);
        obtenirEleveur(PISCICULTEUR_PHONE, "Eleveur", "Pisciculteur", "PISCICULTURE");
        obtenirEleveur(AVICULTEUR_PHONE, "Eleveur", "Aviculteur", "AVICULTURE");
        obtenirAdministrateur();
        ajouterProduitsSiAbsents(producteurActif);
    }

    private Producteur obtenirProducteur(
            String telephone,
            String nom,
            String prenom,
            String nomExploitation,
            StatutUtilisateur statut) {
        Optional<Utilisateur> existing = utilisateurRepository.findByTelephone(telephone);
        if (existing.isPresent()) {
            if (existing.get() instanceof Producteur producteur) {
                return producteur;
            }
            throw new IllegalStateException("Le téléphone de test " + telephone + " appartient à un autre type de compte.");
        }

        Producteur producteur = new Producteur();
        producteur.setNom(nom);
        producteur.setPrenom(prenom);
        producteur.setTelephone(telephone);
        producteur.setMotDePasse(passwordEncoder.encode(TEST_PASSWORD));
        producteur.setNomExploitation(nomExploitation);
        producteur.setCapaciteProduction(100);
        producteur.setStatut(statut);
        producteur.setLocalisation(Localisation.builder()
                .ville("Ouagadougou")
                .province("Kadiogo")
                .latitude(12.3714)
                .longitude(-1.5197)
                .build());
        return producteurRepository.save(producteur);
    }

    private void obtenirEleveur(String telephone, String nom, String prenom, String typeElevage) {
        Optional<Utilisateur> existing = utilisateurRepository.findByTelephone(telephone);
        if (existing.isPresent()) {
            if (existing.get() instanceof Eleveur) {
                return;
            }
            throw new IllegalStateException("Le téléphone de test " + telephone + " appartient à un autre type de compte.");
        }

        Eleveur eleveur = new Eleveur();
        eleveur.setNom(nom);
        eleveur.setPrenom(prenom);
        eleveur.setTelephone(telephone);
        eleveur.setMotDePasse(passwordEncoder.encode(TEST_PASSWORD));
        eleveur.setTypeElevage(typeElevage);
        eleveur.setAdresse("Ouagadougou, Burkina Faso");
        eleveur.setStatut(StatutUtilisateur.ACTIF);
        eleveurRepository.save(eleveur);
    }

    private void obtenirAdministrateur() {
        Optional<Utilisateur> existing = utilisateurRepository.findByTelephone(ADMIN_PHONE);
        if (existing.isPresent()) {
            if (existing.get() instanceof Administrateur) {
                return;
            }
            throw new IllegalStateException("Le téléphone de test " + ADMIN_PHONE + " appartient à un autre type de compte.");
        }

        Administrateur administrateur = new Administrateur();
        administrateur.setNom("Administrateur");
        administrateur.setPrenom("Test");
        administrateur.setTelephone(ADMIN_PHONE);
        administrateur.setMotDePasse(passwordEncoder.encode(TEST_PASSWORD));
        administrateur.setMatricule("DEV-ADMIN-001");
        administrateur.setStatut(StatutUtilisateur.ACTIF);
        administrateur.setSuperAdmin(false);
        utilisateurRepository.save(administrateur);
    }

    private void ajouterProduitsSiAbsents(Producteur producteur) {
        List<Produit> produits = produitRepository.findByProducteurIdUtilisateur(producteur.getIdUtilisateur());
        ajouterProduitSiAbsent(produits, producteur, "Larves fraîches", 450, 40);
        ajouterProduitSiAbsent(produits, producteur, "Larves séchées", 620, 25);
    }

    private void ajouterProduitSiAbsent(
            List<Produit> produits,
            Producteur producteur,
            String nom,
            int prix,
            int stock) {
        boolean exists = produits.stream().anyMatch(produit -> nom.equals(produit.getNomProduit()));
        if (!exists) {
            produitRepository.save(Produit.builder()
                    .producteur(producteur)
                    .nomProduit(nom)
                    .typeProduit(TypeProduit.LARVE)
                    .prix(BigDecimal.valueOf(prix))
                    .quantiteStock(stock)
                    .disponibilite(true)
                    .build());
        }
    }
}
