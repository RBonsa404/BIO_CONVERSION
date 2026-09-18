package com.bioconversion.marketplace;

import com.bioconversion.geo.Localisation;
import com.bioconversion.utilisateur.Producteur;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test d'intégration JPA avec PostgreSQL pour l'entité Produit (Classe 6).
 *
 * <p>Vérifie la persistance des Larves et des Résidus de production (B-MUST-3 & B-MUST-5).</p>
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProduitRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProduitRepository produitRepository;

    @Test
    @DisplayName("Devrait persister et retrouver des Larves et des Résidus de production dans PostgreSQL")
    void enregistrerEtTrouverProduitsEtResidus() {
        // 1. Créer une Localisation et un Producteur dans PostgreSQL
        Localisation loc = entityManager.persistFlushFind(Localisation.builder()
                .latitude(12.3714).longitude(-1.5197).ville("Ouagadougou").province("Kadiogo").build());

        Producteur producteur = Producteur.builder()
                .nomExploitation("Ferme BSFL Ouaga")
                .capaciteProduction(1000.0)
                .compteValide(true)
                .localisation(loc)
                .nom("Ouedraogo")
                .prenom("Jean")
                .telephone("+22670000000")
                .motDePasse("hash123")
                .statut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF)
                .build();
        producteur = entityManager.persistFlushFind(producteur);



        // 2. Créer un produit LARVE (B-MUST-3 : prix fixé librement à 1500 FCFA)
        Produit larves = Produit.builder()
                .producteur(producteur)
                .nomProduit("Larves BSFL fraîches")
                .quantiteStock(500.0)
                .prix(1500.0)
                .typeProduit(TypeProduit.LARVE)
                .disponibilite(true)
                .build();

        // 3. Créer un produit RESIDU_PRODUCTION (B-MUST-5 : mise en vente des résidus/compost)
        Produit residus = Produit.builder()
                .producteur(producteur)
                .nomProduit("Compost Bio-résidu d'élevage")
                .quantiteStock(200.0)
                .prix(500.0)
                .typeProduit(TypeProduit.RESIDU_PRODUCTION)
                .disponibilite(true)
                .build();

        entityManager.persistAndFlush(larves);
        entityManager.persistAndFlush(residus);

        // When : On consulte le catalogue du producteur dans PostgreSQL
        List<Produit> catalogue = produitRepository.findByProducteurIdUtilisateur(producteur.getIdUtilisateur());

        // Then : Vérification que les 2 types de produits sont bien enregistrés dans PostgreSQL
        assertThat(catalogue).hasSize(2);
        assertThat(catalogue).extracting(Produit::getTypeProduit)
                .containsExactlyInAnyOrder(TypeProduit.LARVE, TypeProduit.RESIDU_PRODUCTION);
    }
}
