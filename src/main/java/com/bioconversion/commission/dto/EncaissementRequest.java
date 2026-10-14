package com.bioconversion.commission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Déclaration par l'administrateur d'une commission espèces récupérée par un collecteur. */
public record EncaissementRequest(
        @NotBlank(message = "Le nom du collecteur est obligatoire")
        @Size(max = 150, message = "Le nom du collecteur ne peut dépasser 150 caractères")
        String collecteur,

        @NotNull(message = "Le montant encaissé est obligatoire")
        @Positive(message = "Le montant encaissé doit être positif")
        BigDecimal montant,

        @PastOrPresent(message = "La date d'encaissement ne peut pas être dans le futur")
        LocalDate dateEncaissement) {
}
