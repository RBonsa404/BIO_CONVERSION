package com.bioconversion.marketplace.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de requête pour passer une nouvelle commande (B-MUST-4, B-MUST-6).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasserCommandeRequest {

    /**
     * Conservé pour compatibilité : l'éleveur est toujours celui du jeton JWT,
     * jamais celui transmis par le client.
     */
    private Long eleveurId;

    @NotNull(message = "L'identifiant du produit est obligatoire")
    private Long produitId;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être strictement positive")
    private Double quantite;

    /**
     * Clé d'idempotence optionnelle (fournie par l'en-tête X-Idempotency-Key ou dans le corps).
     */
    private String idempotencyKey;
}
