package com.bioconversion.commission.dto;

import java.math.BigDecimal;

/** Résumé pour l'administrateur : soldes des deux registres et commissions en attente de collecte. */
public record ResumeFondsDto(
        BigDecimal soldeFonds,
        BigDecimal soldeSequestre,
        BigDecimal totalACollecter,
        long nombreACollecter) {
}
