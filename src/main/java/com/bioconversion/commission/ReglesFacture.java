package com.bioconversion.commission;

import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.paiement.StatutPaiement;

/**
 * Règle unique de disponibilité de la facture, appliquée côté serveur (route de facture)
 * et transmise au front (champ factureDisponible de la commande).
 */
public final class ReglesFacture {

    public static final String ESPECES = "ESPECES";

    private ReglesFacture() {
    }

    /**
     * Espèces : disponible dès que le producteur a validé la réception de l'argent.
     * Orange Money : disponible seulement après la réception de la commande (statut LIVRE).
     */
    public static boolean factureDisponible(Commande commande) {
        if (commande == null || commande.getPaiement() == null) {
            return false;
        }
        Paiement paiement = commande.getPaiement();
        if (ESPECES.equals(paiement.getOperateur())) {
            return paiement.getStatutPaiement() == StatutPaiement.CONFIRME
                    || paiement.getStatutPaiement() == StatutPaiement.REMBOURSE;
        }
        return paiement.getStatutPaiement() == StatutPaiement.CONFIRME
                && commande.getStatut() == StatutCommande.LIVRE;
    }
}
