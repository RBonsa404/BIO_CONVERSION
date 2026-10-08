package com.bioconversion.admin.dto;

import com.bioconversion.marketplace.StatutCommande;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Indicateurs globaux affichés sur le tableau de bord d'administration.
 */
public record StatistiquesPlateformeResponse(
        long producteurs,
        long eleveurs,
        long comptesEnAttente,
        long produitsDisponibles,
        long commandes,
        Map<StatutCommande, Long> commandesParStatut,
        BigDecimal volumePaiementsConfirmes,
        double tauxCommission,
        BigDecimal commissionPlateforme
) {
}
