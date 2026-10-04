package com.bioconversion.paiement.dto;

import com.bioconversion.paiement.Facture;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FactureResponse(
        Long idFacture,
        String reference,
        BigDecimal montant,
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