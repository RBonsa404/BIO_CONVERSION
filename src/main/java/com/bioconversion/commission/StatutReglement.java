package com.bioconversion.commission;

/**
 * Suivi de l'argent d'une commande, séparé du statut de la commande (Module B).
 */
public enum StatutReglement {
    /** Orange Money : l'éleveur a payé, l'argent est bloqué jusqu'à la livraison. */
    EN_SEQUESTRE,
    /** Orange Money : le net a été versé au producteur, la commission est entrée dans le fonds. */
    VERSE,
    /** Orange Money : le versement a échoué ; l'argent reste en séquestre, nouvel essai automatique. */
    VERSEMENT_ECHOUE,
    /** Orange Money : annulation ou litige, l'éleveur a été remboursé depuis le séquestre. */
    REMBOURSE,
    /** Espèces : le producteur a confirmé avoir reçu l'argent. */
    ENCAISSE_ESPECES
}
