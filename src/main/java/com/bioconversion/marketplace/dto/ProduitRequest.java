package com.bioconversion.marketplace.dto;

import com.bioconversion.marketplace.TypeProduit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de création / modification d'un produit du catalogue par son producteur.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(max = 200, message = "Le nom du produit ne peut dépasser 200 caractères")
    private String nomProduit;

    private TypeProduit typeProduit;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être strictement positif")
    private BigDecimal prix;

    @PositiveOrZero(message = "La quantité en stock ne peut pas être négative")
    private double quantiteStock;
}
