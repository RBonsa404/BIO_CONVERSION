package com.bioconversion.marketplace;

/**
 * Événement publié à l'enregistrement d'une nouvelle commande (après son insertion en base).
 * Le module commission l'écoute pour figer le taux et les montants sur la commande.
 */
public record CommandeCreeeEvent(Commande commande) {
}
