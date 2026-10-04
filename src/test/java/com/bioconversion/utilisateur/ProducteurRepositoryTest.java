package com.bioconversion.utilisateur;

import com.bioconversion.geo.Localisation;
import com.bioconversion.utilisateur.dto.ProducteurResponse;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ProducteurRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProducteurRepository producteurRepository;

    @Test
    @DisplayName("Charge la localisation pour mapper le profil après la fermeture de la session")
    void findByIdLoadsLocalisationForDetachedProfileMapping() {
        Localisation localisation = entityManager.persistFlushFind(Localisation.builder()
                .latitude(12.3714)
                .longitude(-1.5197)
                .ville("Ouagadougou")
                .province("Kadiogo")
                .build());
        Producteur producteur = entityManager.persistFlushFind(Producteur.builder()
                .nomExploitation("Ferme de test")
                .capaciteProduction(100)
                .localisation(localisation)
                .nom("Producteur")
                .prenom("Test")
                .telephone("+22670000001")
                .motDePasse("hash")
                .statut(StatutUtilisateur.ACTIF)
                .build());
        Long producteurId = producteur.getIdUtilisateur();

        entityManager.clear();
        Producteur trouve = producteurRepository.findById(producteurId).orElseThrow();
        entityManager.clear();

        assertThat(Hibernate.isInitialized(trouve.getLocalisation())).isTrue();
        assertThat(ProducteurResponse.from(trouve).ville()).isEqualTo("Ouagadougou");
        assertThat(ProducteurResponse.from(trouve).province()).isEqualTo("Kadiogo");
    }
}
