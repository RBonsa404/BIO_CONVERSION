package com.bioconversion.commission;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculs de la commission, sans dépendance à Spring ni à la base : on peut les tester seuls.
 *
 * <p>Règle unique : commission = arrondi(montant_total x taux), arrondi HALF_UP au franc près ;
 * net_producteur = montant_total - commission. Les montants sont en francs CFA entiers
 * (BigDecimal d'échelle 0), jamais en double.</p>
 */
public final class CalculCommission {

    private CalculCommission() {
    }

    /** Commission d'une vente Orange Money : elle s'applique quel que soit le montant. */
    public static MontantsCommission calculer(BigDecimal montantTotal, BigDecimal taux) {
        BigDecimal total = enFrancs(montantTotal);
        verifierTaux(taux);
        BigDecimal commission = total.multiply(taux).setScale(0, RoundingMode.HALF_UP);
        return new MontantsCommission(total, taux, commission, total.subtract(commission));
    }

    /**
     * Commission d'une vente en espèces : aucune commission en dessous du seuil
     * (10 000 F par défaut), la règle normale à partir du seuil.
     */
    public static MontantsCommission calculerEspeces(BigDecimal montantTotal, BigDecimal taux, BigDecimal seuil) {
        BigDecimal total = enFrancs(montantTotal);
        verifierTaux(taux);
        if (seuil == null || seuil.signum() < 0) {
            throw new IllegalArgumentException("Le seuil de commission doit être positif");
        }
        if (total.compareTo(seuil) < 0) {
            return new MontantsCommission(total, taux, BigDecimal.ZERO, total);
        }
        return calculer(total, taux);
    }

    /**
     * Frais Orange Money du versement au producteur, supportés par la plateforme :
     * arrondi(montant versé x taux de frais).
     */
    public static BigDecimal fraisVersement(BigDecimal montantVerse, BigDecimal tauxFrais) {
        BigDecimal verse = enFrancs(montantVerse);
        verifierTaux(tauxFrais);
        return verse.multiply(tauxFrais).setScale(0, RoundingMode.HALF_UP);
    }

    /** Ramène un montant au franc près (les prix sont en francs entiers). */
    private static BigDecimal enFrancs(BigDecimal montant) {
        if (montant == null) {
            throw new IllegalArgumentException("Le montant est obligatoire");
        }
        if (montant.signum() < 0) {
            throw new IllegalArgumentException("Le montant ne peut pas être négatif");
        }
        return montant.setScale(0, RoundingMode.HALF_UP);
    }

    private static void verifierTaux(BigDecimal taux) {
        if (taux == null || taux.signum() < 0 || taux.compareTo(BigDecimal.ONE) >= 0) {
            throw new IllegalArgumentException("Le taux doit être compris entre 0 et 1 (ex. 0.05 pour 5 %)");
        }
    }
}