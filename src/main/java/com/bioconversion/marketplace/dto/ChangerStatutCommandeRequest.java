package com.bioconversion.marketplace.dto;

import com.bioconversion.marketplace.StatutCommande;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de requête pour modifier le statut d'une commande (B-MUST-7).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangerStatutCommandeRequest {

    @NotNull(message = "Le nouveau statut est obligatoire")
    private StatutCommande nouveauStatut;

    private String motif;
}
