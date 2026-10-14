package com.bioconversion.commission.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Ligne de l'écran admin « Commissions à collecter ». */
public record CommissionACollecterDto(
        Long id,
        Long commandeId,
        String numeroCommande,
        Long producteurId,
        String nomExploitation,
        String telephoneProducteur,
        BigDecimal montant,
        OffsetDateTime dateVente) {
}
