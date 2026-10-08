package com.bioconversion.paiement;

/**
 * Contrat du service métier Module C — Facturation (dispatch §3.2).
 * C-MUST-5 du CDC v1.1.
 */
public interface FactureService {

    /**
     * Génère (ou retrouve) la facture d'un paiement confirmé. Idempotent.
     */
    Facture genererPourPaiement(Paiement paiement);

    /**
     * Variante par identifiant, exécutée dans sa propre transaction : utilisée
     * après le commit de la confirmation de paiement.
     */
    Facture genererPourPaiementConfirme(Long paiementId);

    Facture consulterParReference(String reference);

    Facture consulterParReference(String reference, Long currentUserId);

    byte[] telechargerPdf(String reference);

    byte[] telechargerPdf(String reference, Long currentUserId);

    /**
     * Facture de la commande, pour l'une de ses deux parties. Créée à la volée
     * si le paiement est confirmé et qu'elle n'existe pas encore.
     */
    Facture obtenirPourCommande(Long idCommande, Long currentUserId);

    byte[] telechargerPdfPourCommande(Long idCommande, Long currentUserId);
}
