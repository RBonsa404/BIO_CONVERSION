package com.bioconversion.marketplace;

/**
 * Interface pour la gestion des commandes — Module B Marketplace.
 *
 * <p>Contrat officiel inter-modules : permet notamment au Module C (Paiement) de notifier
 * le changement de statut d'une commande suite à la confirmation d'un paiement.</p>
 */
public interface CommandeService {

    /**
     * Marque une commande comme payée après confirmation du paiement.
     * Point de contrat officiel appelé par le Module C (PaiementService).
     *
     * @param commandeId l'identifiant de la commande
     * @return la commande mise à jour avec le statut PAYE
     */
    Commande marquerCommandePayee(Long commandeId);
}
