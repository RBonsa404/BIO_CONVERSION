package com.bioconversion.paiement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InitierPaiementRequest(

        @NotNull(message = "L'identifiant de la commande est obligatoire")
        Long idCommande,

        @NotBlank(message = "L'opérateur (ex: Orange Money) est obligatoire")
        String operateur
) {}