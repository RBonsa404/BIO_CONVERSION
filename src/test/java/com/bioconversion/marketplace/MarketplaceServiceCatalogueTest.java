package com.bioconversion.marketplace;

import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.utilisateur.Producteur;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.when;

/**
 * Test unitaire Mockito pour la consultation du catalogue (B-MUST-2, B-MUST-3, B-MUST-5).
 */
@ExtendWith(MockitoExtension.class)
class MarketplaceServiceCatalogueTest {

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private com.bioconversion.utilisateur.ProducteurRepository producteurRepository;

    @InjectMocks
    private MarketplaceServiceImpl marketplaceService;

    @Test
    @DisplayName("Devrait retourner le catalogue sous forme de ProduitDto (Larves et Résidus de production)")
    void consulterCatalogueProducteurDto_RetourneLarvesEtResidus() {
        // Given : Un producteur à Ouagadougou
        Localisation loc = Localisation.builder().ville("Ouagadougou").province("Kadiogo").build();
        Producteur producteur = Producteur.builder()
                .idUtilisateur(1L)
                .nomExploitation("Ferme BSFL Ouaga")
                .localisation(loc)
                .build();

        // Given : Produit 1 (Larves BSFL - B-MUST-3)
        Produit larves = Produit.builder()
                .idProduit(10L)
                .producteur(producteur)
                .nomProduit("Larves BSFL fraîches")
                .quantiteStock(500.0)
                .prix(1500.0)
                .typeProduit(TypeProduit.LARVE)
                .disponibilite(true)
                .build();

        // Given : Produit 2 (Résidus / Compost - B-MUST-5)
        Produit residus = Produit.builder()
                .idProduit(11L)
                .producteur(producteur)
                .nomProduit("Compost Bio-résidu d'élevage")
                .quantiteStock(200.0)
                .prix(500.0)
                .typeProduit(TypeProduit.RESIDU_PRODUCTION)
                .disponibilite(true)
                .build();

        when(produitRepository.findByProducteurIdUtilisateur(1L))
                .thenReturn(List.of(larves, residus));

        // When : Appel de la méthode de consultation du catalogue
        List<ProduitDto> catalogue = marketplaceService.consulterCatalogueProducteurDto(1L);

        // Then : Vérification que les 2 DTOs sont correctement générés
        assertFalse(catalogue.isEmpty(), "Le catalogue ne doit pas être vide");
        assertEquals(2, catalogue.size(), "Le catalogue doit contenir 2 produits");
        assertEquals("Larves BSFL fraîches", catalogue.get(0).getNomProduit());
        assertEquals(TypeProduit.LARVE, catalogue.get(0).getTypeProduit());
        assertEquals(TypeProduit.RESIDU_PRODUCTION, catalogue.get(1).getTypeProduit());
    }
}
