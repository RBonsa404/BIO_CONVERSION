package com.bioconversion.commission;

import java.math.BigDecimal;

/**
 * Envoi de l'argent au producteur (Orange Money). Simulé pour l'instant
 * ({@link VersementProducteurSimule}) ; la vraie API de l'opérateur viendra le remplacer.
 */
public interface VersementProducteur {

    /** Résultat d'une tentative de versement. */
    record ResultatVersement(boolean reussi, String reference, String motif) {

        public static ResultatVersement succes(String reference) {
            return new ResultatVersement(true, reference, null);
        }

        public static ResultatVersement echec(String motif) {
            return new ResultatVersement(false, null, motif);
        }
    }

    /**
     * Envoie {@code montant} F au numéro du producteur.
     *
     * @param commandeId  commande concernée (sert de référence chez l'opérateur)
     * @param telephone   numéro Orange Money du producteur
     * @param montant     montant net à verser, en F CFA entiers
     */
    ResultatVersement verser(Long commandeId, String telephone, BigDecimal montant);
}
