package com.bioconversion.marketplace;

import com.bioconversion.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Test unitaire Mockito pour la modification de stock et de prix en temps réel (B-SHOULD-1 & B-MUST-3).
 */
@ExtendWith(MockitoExtension.class)
class MarketplaceServiceStockTest {

    @Mock
    private ProduitRepository produitRepository;

    @InjectMocks
    private MarketplaceServiceImpl marketplaceService;

    @Test
    @DisplayName("Devrait mettre à jour la quantité en stock en temps réel (B-SHOULD-1)")
    void modifierStock_MetAJourQuantiteEnTempsReel() {
        // Given : Un produit avec un stock initial de 100 kg
        Produit produitInitial = Produit.builder()
                .idProduit(5L)
                .nomProduit("Larves BSFL fraîches")
                .quantiteStock(100.0)
                .prix(1500.0)
                .typeProduit(TypeProduit.LARVE)
                .disponibilite(true)
                .build();

        when(produitRepository.findById(5L)).thenReturn(Optional.of(produitInitial));
        when(produitRepository.save(any(Produit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When : Mise à jour du stock à 450 kg (nouvelle récolte)
        Produit produitMaj = marketplaceService.modifierStock(5L, 450.0);

        // Then : Vérification que la nouvelle quantité est enregistrée
        assertNotNull(produitMaj, "Le produit mis à jour ne doit pas être null");
        assertEquals(450.0, produitMaj.getQuantiteStock(), "La quantité en stock doit être de 450 kg");
    }

    @Test
    @DisplayName("Devrait modifier le prix librement sans plafond (B-MUST-3)")
    void modifierPrix_MetAJourPrixLibrement() {
        // Given : Un produit avec un prix initial de 1500 FCFA
        Produit produit = Produit.builder()
                .idProduit(5L)
                .nomProduit("Larves BSFL fraîches")
                .quantiteStock(100.0)
                .prix(1500.0)
                .typeProduit(TypeProduit.LARVE)
                .disponibilite(true)
                .build();

        when(produitRepository.findById(5L)).thenReturn(Optional.of(produit));
        when(produitRepository.save(any(Produit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When : Le producteur ajuste son prix librement à 1800 FCFA
        Produit produitPrixMaj = marketplaceService.modifierPrix(5L, 1800.0);

        // Then : Le nouveau prix doit être pris en compte
        assertEquals(1800.0, produitPrixMaj.getPrix(), "Le nouveau prix doit être de 1800 FCFA");
    }

    @Test
    @DisplayName("Devrait lever une exception ResourceNotFoundException si le produit n'existe pas")
    void modifierStock_ProduitInexistant_LeveException() {
        when(produitRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> marketplaceService.modifierStock(99L, 500.0));
    }
}
