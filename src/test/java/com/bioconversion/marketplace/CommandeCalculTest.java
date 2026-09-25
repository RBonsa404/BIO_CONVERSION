package com.bioconversion.marketplace;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests unitaires pour les calculs de montants sur Commande et LigneCommande.
 */
class CommandeCalculTest {

    @Test
    @DisplayName("Devrait calculer le sous-total d'une ligne de commande avec prix unitaire figé")
    void calculerSousTotal_CalculExact() {
        // Given : Ligne avec 15.5 kg à 1200 FCFA/kg
        LigneCommande ligne = LigneCommande.builder()
                .quantite(15.5)
                .prixUnitaireFige(1200.0)
                .build();

        // When
        double sousTotal = ligne.calculerSousTotal();

        // Then
        assertEquals(18600.0, sousTotal, 0.001, "Le sous-total doit être 15.5 * 1200 = 18600 FCFA");
    }

    @Test
    @DisplayName("Devrait calculer le montant total d'une commande avec plusieurs lignes")
    void calculerMontantTotal_SommeDesLignes() {
        // Given : Commande avec deux lignes
        LigneCommande ligne1 = LigneCommande.builder()
                .quantite(10.0)
                .prixUnitaireFige(1500.0) // 15000
                .build();

        LigneCommande ligne2 = LigneCommande.builder()
                .quantite(2.5)
                .prixUnitaireFige(2000.0) // 5000
                .build();

        Commande commande = Commande.builder()
                .lignes(new ArrayList<>())
                .build();
        commande.ajouterLigne(ligne1);
        commande.ajouterLigne(ligne2);

        // When
        double total = commande.calculerMontantTotal();

        // Then
        assertEquals(20000.0, total, 0.001, "Le montant total doit être de 20 000 FCFA");
    }

    @Test
    @DisplayName("Devrait retourner 0 si la commande ne contient aucune ligne")
    void calculerMontantTotal_SansLigne_RetourneZero() {
        Commande commande = Commande.builder()
                .lignes(new ArrayList<>())
                .build();

        assertEquals(0.0, commande.calculerMontantTotal(), 0.001);
    }
}
