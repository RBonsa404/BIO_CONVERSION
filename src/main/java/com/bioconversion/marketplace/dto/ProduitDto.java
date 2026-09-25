package com.bioconversion.marketplace.dto;

import com.bioconversion.marketplace.TypeProduit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO représentant un Produit du catalogue (Larves ou Résidus) pour la consultation et les commandes.
 *
 * <p>
 * <b>Contrat d'API inter-module (B-MUST-2 & Synchronisation Binôme) :</b>
 * Fournit les informations de prix et de stock au module Commande (BONSA Abdoul Rachid).
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitDto {

    private Long idProduit;
    private Long producteurId;
    private String nomExploitation;
    private String nomProduit;
    private double quantiteStock;
    private double prix;
    private TypeProduit typeProduit;
    private boolean disponibilite;
}
