package com.bioconversion.paiement.dto;

import com.bioconversion.paiement.Paiement;
import com.bioconversion.paiement.StatutPaiement;

import java.time.OffsetDateTime;

public record PaiementResponse(
        Long idPaiement,
        Long idCommande,
        Double montant,
        String operateur,
        String referenceTransaction,
        OffsetDateTime datePaiement,
        StatutPaiement statutPaiement
) {
    public static PaiementResponse from(Paiement paiement) {
        return new PaiementResponse(
                paiement.getIdPaiement(),
                paiement.getCommande().getIdCommande(),
                paiement.getMontant(),
                paiement.getOperateur(),
                paiement.getReferenceTransaction(),
                paiement.getDatePaiement(),
                paiement.getStatutPaiement()
        );
    }
}