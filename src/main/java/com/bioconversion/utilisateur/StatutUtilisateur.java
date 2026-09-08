package com.bioconversion.utilisateur;

/**
 * Statuts possibles d'un compte utilisateur.
 *
 * <ul>
 * <li>{@link #ACTIF} — compte validé, accès normal</li>
 * <li>{@link #SUSPENDU} — compte suspendu par un administrateur (CDC
 * §2.2.3)</li>
 * <li>{@link #EN_ATTENTE_VALIDATION} — compte créé, en attente de validation
 * CNIB (CDC §2.2.4)</li>
 * </ul>
 */
public enum StatutUtilisateur {

    ACTIF,
    SUSPENDU,
    EN_ATTENTE_VALIDATION;

    /** @return {@code true} si le statut autorise la connexion */
    public boolean isActif() {
        return this == ACTIF;
    }

    /** @return {@code true} si le compte est suspendu */
    public boolean isSuspendu() {
        return this == SUSPENDU;
    }
}
