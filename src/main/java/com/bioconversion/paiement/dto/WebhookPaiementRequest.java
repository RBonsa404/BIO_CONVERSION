package com.bioconversion.paiement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload simulé du webhook opérateur (Orange Money). C-MUST-1 : intégration réelle simulée
 * pour l'instant — ce DTO représente ce que l'opérateur enverrait en callback.
 */
public record WebhookPaiementRequest(

        @NotBlank(message = "La référence de transaction est obligatoire")
        String referenceTransaction,

        @NotNull(message = "Le statut du webhook est obligatoire")
        StatutWebhook statut
) {
    public enum StatutWebhook {
        SUCCES,
        ECHEC
    }
}