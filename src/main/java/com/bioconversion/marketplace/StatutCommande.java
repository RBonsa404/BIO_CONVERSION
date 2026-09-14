package com.bioconversion.marketplace;

/**
 * Cycle de vie d'une commande.
 *
 * <ul>
 *   <li>{@link #EN_ATTENTE} — créée par l'éleveur, en attente de validation producteur</li>
 *   <li>{@link #CONFIRME} — validée par le producteur</li>
 *   <li>{@link #PAYE} — paiement confirmé par l'éleveur via Orange Money (Module C)</li>
 *   <li>{@link #REFUSE} — refusée par le producteur</li>
 *   <li>{@link #EXPEDIE} — expédiée par le producteur</li>
 *   <li>{@link #LIVRE} — reçue par l'éleveur</li>
 *   <li>{@link #ANNULE} — annulée (délai 12h après passage — use case CDC)</li>
 * </ul>
 *
 * Ordre logique du cycle de vie nominal : EN_ATTENTE -> CONFIRME -> PAYE -> LIVRE
 * (avec REFUSE/ANNULE possibles à différentes étapes).
 */
public enum StatutCommande {
    EN_ATTENTE,
    CONFIRME,
    PAYE,
    REFUSE,
    EXPEDIE,
    LIVRE,
    ANNULE
}
