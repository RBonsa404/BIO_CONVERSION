package com.bioconversion.commission;

/** Lignes du registre du fonds de la plateforme. */
public enum TypeMouvementFonds {
    /** Commission retenue sur une vente Orange Money (positive). */
    COMMISSION,
    /** Frais Orange Money du versement au producteur, supportés par la plateforme (négatifs). */
    FRAIS_VERSEMENT,
    /** Commission d'une vente en espèces, encaissée par un collecteur (positive). */
    COMMISSION_ESPECES,
    /** Correction d'une erreur par une ligne inverse. */
    CORRECTION
}