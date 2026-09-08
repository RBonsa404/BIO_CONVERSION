package com.bioconversion.paiement;

/**
 * Cycle de vie d'un paiement.
 *
 * <ul>
 *   <li>{@link #EN_ATTENTE} — paiement initié, en attente de confirmation Orange Money</li>
 *   <li>{@link #CONFIRME} — paiement confirmé par l'opérateur</li>
 *   <li>{@link #ECHOUE} — paiement échoué (solde insuffisant, timeout, etc.)</li>
 *   <li>{@link #ANNULE} — paiement annulé avant confirmation</li>
 *   <li>{@link #REMBOURSE} — remboursement effectué suite à un litige</li>
 * </ul>
 *
 * TODO Module C : implémenter les transitions d'état dans PaiementService.
 */
public enum StatutPaiement {
    EN_ATTENTE,
    CONFIRME,
    ECHOUE,
    ANNULE,
    REMBOURSE
}
