package com.bioconversion.marketplace;

import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Test unitaire pour MarketplaceService — Volet Recherche Géolocalisée.
 *
 * <p>Exigence du Document de Dispatch §2.1 (p. 4) : "Tests unitaires sur Produit et Localisation".</p>
 */
@ExtendWith(MockitoExtension.class)
class MarketplaceServiceTest {

    @Mock
    private ProducteurRepository producteurRepository;

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @InjectMocks
    private MarketplaceServiceImpl marketplaceService;

    @Test
    @DisplayName("Devrait inclure Koubri (< 50km) et exclure Bobo-Dioulasso (> 50km) pour une recherche depuis Ouaga")
    void rechercherProducteursParRayon_FiltreCorrectementParRayon() {
        // Given : Point de recherche à Ouagadougou (12.3714, -1.5197)
        double latOuaga = 12.3714;
        double lonOuaga = -1.5197;

        // Given : Producteur 1 à Koubri (~25 km de Ouaga) -> Doit être INCLUS
        Localisation locKoubri = Localisation.builder()
                .latitude(12.1813)
                .longitude(-1.3962)
                .ville("Koubri")
                .province("Kadiogo")
                .build();
        Producteur p1 = Producteur.builder()
                .idUtilisateur(1L)
                .nomExploitation("Ferme BSFL Koubri")
                .statut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF)
                .localisation(locKoubri)
                .build();

        // Given : Producteur 2 à Bobo-Dioulasso (~325 km de Ouaga) -> Doit être EXCLU
        Localisation locBobo = Localisation.builder()
                .latitude(11.1771)
                .longitude(-4.2979)
                .ville("Bobo-Dioulasso")
                .province("Houet")
                .build();
        Producteur p2 = Producteur.builder()
                .idUtilisateur(2L)
                .nomExploitation("Bio conversion Bobo")
                .statut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF)
                .localisation(locBobo)
                .build();

        // Simulation Mockito du Repository du Module D
        when(producteurRepository.findByStatut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF, any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p1, p2)));

        // When : Recherche dans un rayon de 50 km autour de Ouagadougou
        List<ProducteurLocaliseDto> resultats = marketplaceService.rechercherProducteursParRayon(latOuaga, lonOuaga, 50.0);

        // Then : Seul Koubri est conservé
        assertFalse(resultats.isEmpty(), "La liste de résultats ne doit pas être vide");
        assertEquals(1, resultats.size(), "Un seul producteur doit être retenu dans un rayon de 50 km");
        assertEquals("Ferme BSFL Koubri", resultats.get(0).getNomExploitation());
        assertEquals("Koubri", resultats.get(0).getVille());
    }
}
