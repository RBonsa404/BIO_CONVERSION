package com.bioconversion.commission;

/** Lignes du registre du séquestre. ENTREE est positive, les sorties sont négatives. */
public enum TypeMouvementSequestre {
    /** Paiement Orange Money confirmé : le montant total entre dans le séquestre. */
    ENTREE,
    /** Versement au producteur réussi : le montant total sort du séquestre. */
    SORTIE_VERSEMENT,
    /** Litige ou annulation : l'éleveur est remboursé. */
    SORTIE_REMBOURSEMENT,
    /** Correction d'une erreur par une ligne inverse. */
    CORRECTION
}