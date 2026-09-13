package com.bioconversion.paiement.dto;

import com.bioconversion.paiement.Facture;

import java.time.OffsetDateTime;

public record FactureResponse(
        Long idFacture,
        String reference,
        Double montant,
        OffsetDateTime dateFacture,
        boolean pdfDisponible
) {
    public static FactureResponse from(Facture facture) {
        return new FactureResponse(
                facture.getIdFacture(),
                facture.getReference(),
                facture.getMontant(),
                facture.getDateFacture(),
                facture.getCheminPdf() != null
        );
    }
}