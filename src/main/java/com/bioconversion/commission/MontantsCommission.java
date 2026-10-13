package com.bioconversion.commission;

import java.math.BigDecimal;

/**
 * Résultat du calcul de commission d'une commande, en francs CFA entiers.
 *
 * @param montantTotal   montant payé par l'éleveur (jamais augmenté de la commission)
 * @param taux           taux appliqué, copié sur la commande à sa création
 * @param commission     part de la plateforme, payée par le producteur
 * @param netProducteur  ce que reçoit le producteur : montantTotal - commission
 */
public record MontantsCommission(
        BigDecimal montantTotal,
        BigDecimal taux,
        BigDecimal commission,
        BigDecimal netProducteur) {
}
