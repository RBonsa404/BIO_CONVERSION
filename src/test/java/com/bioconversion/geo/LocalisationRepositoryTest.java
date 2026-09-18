package com.bioconversion.geo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test d'intégration JPA avec PostgreSQL pour l'entité Localisation (Classe 10a).
 *
 * <p>Vérifie l'interaction réelle avec la base de données PostgreSQL (colonne violette des diagrammes de séquence).</p>
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class LocalisationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LocalisationRepository localisationRepository;

    @Test
    @DisplayName("Devrait enregistrer et retrouver une localisation dans la table PostgreSQL localisation")
    void enregistrerEtTrouverLocalisationDansPostgres() {
        // Given : Une nouvelle instance de Localisation pour Ouagadougou
        Localisation loc = Localisation.builder()
                .latitude(12.3714)
                .longitude(-1.5197)
                .ville("Ouagadougou")
                .province("Kadiogo")
                .build();

        // When : On sauvegarde l'entité dans PostgreSQL via le TestEntityManager
        Localisation sauvegardee = entityManager.persistAndFlush(loc);

        // Then : On vérifie que PostgreSQL a attribué un ID et qu'on la retrouve en base
        assertThat(sauvegardee.getIdLocalisation()).isNotNull();

        Localisation trouvee = localisationRepository.findById(sauvegardee.getIdLocalisation()).orElse(null);
        assertThat(trouvee).isNotNull();
        assertThat(trouvee.getVille()).isEqualTo("Ouagadougou");
        assertThat(trouvee.getProvince()).isEqualTo("Kadiogo");
        assertThat(trouvee.getLatitude()).isEqualTo(12.3714);
        assertThat(trouvee.getLongitude()).isEqualTo(-1.5197);
    }
}
