package com.bioconversion.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO représentant une ligne de commande.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneCommandeDto {

    private Long idLigne;
    private Long produitId;
    private String nomProduit;
    private double quantite;
    private BigDecimal prixUnitaireFige;
    private BigDecimal sousTotal;
}
