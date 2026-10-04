package com.bioconversion.paiement;

/**
 * Service métier — génération et consultation des factures (Module C,
 * sous-responsabilité KABORE Caliste Elie, dispatch §3.2).
 */
public interface FactureService {

    /**
     * C-MUST-5 : génère la facture d'un paiement confirmé, avec calcul de la
     * commission plateforme (taux configurable, cf. AppProperties.commission).
     * Idempotent : si une facture existe déjà pour ce paiement, elle est retournée
     * telle quelle plutôt que dupliquée (cohérent avec la cardinalité
     * Paiement 1 → 0..1 Facture).
     *
     * @param paiement le paiement confirmé (statutPaiement == CONFIRME attendu)
     * @return la facture générée ou déjà existante
     */
    Facture genererPourPaiement(Paiement paiement);

    /**
     * Consultation d'une facture par référence, nécessaire pour le
     * téléchargement/impression.
     */
    Facture consulterParReference(String reference);

    Facture consulterParReference(String reference, Long currentUserId);

    /**
     * Retourne les octets du PDF déjà généré sur disque pour cette facture.
     */
    byte[] telechargerPdf(String reference);

    byte[] telechargerPdf(String reference, Long currentUserId);
}
