package com.bioconversion.paiement;

/**
 * Service métier du Module C — Paiement Intégré (Orange Money).
 */
public interface PaiementService {

    /**
     * C-MUST-1 : initie le paiement d'une commande auprès de l'opérateur choisi.
     * Le montant est calculé à partir de Commande.calculerMontantTotal() (point de vigilance
     * diagramme de classes : pas de saisie libre du montant).
     *
     * @param idCommande identifiant de la commande à payer
     * @param operateur  nom de l'opérateur mobile money choisi (ex. "Orange Money")
     * @return le Paiement créé, en statut EN_ATTENTE
     */
    Paiement initierPaiement(Long idCommande, String operateur);

    /**
     * C-MUST-2 / C-MUST-3 : traite la confirmation asynchrone reçue via webhook opérateur.
     * Idempotent : un paiement déjà CONFIRME n'est pas re-traité.
     *
     * @param referenceTransaction référence de transaction (générée à l'initiation, échoée par
     *                             l'opérateur dans le webhook)
     * @return le Paiement mis à jour en statut CONFIRME
     */
    Paiement traiterWebhookSucces(String referenceTransaction);

    /**
     * Cas limite CDC 2.3.2 : échec ou expiration de la transaction côté opérateur.
     * Ne DOIT PAS confirmer la commande.
     *
     * @param referenceTransaction référence de transaction concernée
     * @return le Paiement mis à jour en statut ECHOUE
     */
    Paiement traiterWebhookEchec(String referenceTransaction);

    /**
     * C-MUST-4 : consultation du paiement d'une commande, nécessaire pour vérifier que le
     * paiement est confirmé avant tout retrait.
     */
    Paiement consulterParCommande(Long idCommande);
}