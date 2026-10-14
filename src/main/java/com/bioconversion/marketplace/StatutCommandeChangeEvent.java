package com.bioconversion.marketplace;

/**
 * Événement publié à chaque changement de statut d'une commande, dans la même transaction.
 * Le module commission l'écoute pour le séquestre, le versement au producteur et l'historique.
 */
public record StatutCommandeChangeEvent(Commande commande, StatutCommande ancien, StatutCommande nouveau) {
}
