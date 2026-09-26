package com.bioconversion.marketplace;

import com.bioconversion.geo.Localisation;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.StatutUtilisateur;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test d'intégration JPA pour CommandeRepository.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class CommandeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CommandeRepository commandeRepository;

    @Test
    @DisplayName("Devrait persister et retrouver une Commande avec ses Lignes dans la base de données")
    void enregistrerEtTrouverCommande() {
        // 1. Données de base
        Localisation loc = entityManager.persistFlushFind(Localisation.builder()
                .latitude(12.37).longitude(-1.52).ville("Ouagadougou").province("Kadiogo").build());

        Producteur producteur = entityManager.persistFlushFind(Producteur.builder()
                .nomExploitation("Ferme BSFL Ouaga")
                .capaciteProduction(1000.0)
                .localisation(loc)
                .nom("Ouedraogo")
                .prenom("Jean")
                .telephone("+22670000001")
                .motDePasse("hash123")
                .statut(StatutUtilisateur.ACTIF)
                .build());

        Eleveur eleveur = entityManager.persistFlushFind(Eleveur.builder()
                .typeElevage("Aviculture")
                .nom("Traore")
                .prenom("Moussa")
                .telephone("+22670000002")
                .motDePasse("hash123")
                .statut(StatutUtilisateur.ACTIF)
                .build());

        Produit produit = entityManager.persistFlushFind(Produit.builder()
                .producteur(producteur)
                .nomProduit("Larves séchées")
                .quantiteStock(200.0)
                .prix(2000.0)
                .typeProduit(TypeProduit.LARVE)
                .disponibilite(true)
                .build());

        // 2. Commande
        Commande commande = Commande.builder()
                .producteur(producteur)
                .eleveur(eleveur)
                .dateCommande(OffsetDateTime.now())
                .statut(StatutCommande.EN_ATTENTE)
                .numeroCommande("CMD-TEST-001")
                .build();

        LigneCommande ligne = LigneCommande.builder()
                .produit(produit)
                .quantite(10.0)
                .prixUnitaireFige(2000.0)
                .build();

        commande.ajouterLigne(ligne);

        Commande saved = commandeRepository.saveAndFlush(commande);

        // When : Recherche
        Commande trouvee = commandeRepository.findById(saved.getIdCommande()).orElse(null);

        // Then
        assertThat(trouvee).isNotNull();
        assertThat(trouvee.getNumeroCommande()).isEqualTo("CMD-TEST-001");
        assertThat(trouvee.getLignes()).hasSize(1);
        assertThat(trouvee.calculerMontantTotal()).isEqualTo(20000.0);
    }

    @Test
    @DisplayName("Devrait retrouver les commandes EN_ATTENTE antérieures à une date limite (pour le scheduler 12h)")
    void findByStatutAndDateCommandeBefore_TrouveCommandesExpirees() {
        Localisation loc = entityManager.persistFlushFind(Localisation.builder()
                .latitude(12.37).longitude(-1.52).ville("Ouagadougou").province("Kadiogo").build());

        Producteur producteur = entityManager.persistFlushFind(Producteur.builder()
                .nomExploitation("Ferme BSFL Ouaga")
                .capaciteProduction(1000.0)
                .localisation(loc)
                .nom("Ouedraogo")
                .prenom("Jean")
                .telephone("+22670000003")
                .motDePasse("hash123")
                .statut(StatutUtilisateur.ACTIF)
                .build());

        Eleveur eleveur = entityManager.persistFlushFind(Eleveur.builder()
                .typeElevage("Aviculture")
                .nom("Traore")
                .prenom("Moussa")
                .telephone("+22670000004")
                .motDePasse("hash123")
                .statut(StatutUtilisateur.ACTIF)
                .build());

        // Commande ancienne (> 12h)
        Commande cmdAncienne = Commande.builder()
                .producteur(producteur)
                .eleveur(eleveur)
                .dateCommande(OffsetDateTime.now().minusHours(15))
                .statut(StatutCommande.EN_ATTENTE)
                .numeroCommande("CMD-ANCIENNE")
                .build();

        // Commande récente (< 12h)
        Commande cmdRecente = Commande.builder()
                .producteur(producteur)
                .eleveur(eleveur)
                .dateCommande(OffsetDateTime.now().minusHours(2))
                .statut(StatutCommande.EN_ATTENTE)
                .numeroCommande("CMD-RECENTE")
                .build();

        entityManager.persistAndFlush(cmdAncienne);
        entityManager.persistAndFlush(cmdRecente);

        // When
        OffsetDateTime limite = OffsetDateTime.now().minusHours(12);
        List<Commande> expirees = commandeRepository.findByStatutAndDateCommandeBefore(StatutCommande.EN_ATTENTE, limite);

        // Then
        assertThat(expirees).hasSize(1);
        assertThat(expirees.get(0).getNumeroCommande()).isEqualTo("CMD-ANCIENNE");
    }
}
