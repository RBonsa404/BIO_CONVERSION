package com.bioconversion.paiement;

import java.math.BigDecimal;

/**
 * Contrat du service métier Module C — Paiement Intégré (Orange Money).
 * C-MUST-1 à C-MUST-4 du CDC v1.1.
 */
public interface PaiementService {

    Paiement initierPaiement(Long idCommande, String operateur);

    /**
     * Initie le règlement d'une commande confirmée par le producteur. Reprend un
     * paiement en attente et relance un paiement échoué plutôt que d'en créer un second.
     */
    Paiement initierPaiement(Long idCommande, String operateur, Long currentUserId);

    Paiement traiterWebhookSucces(String referenceTransaction);

    Paiement traiterWebhookEchec(String referenceTransaction);

    /**
     * Tient lieu de réponse de l'opérateur tant que l'agrégateur n'est pas branché
     * ({@code app.paiement.simulation}). Applique exactement le traitement du webhook.
     */
    Paiement confirmerParSimulation(Long idCommande, boolean succes, Long currentUserId);

    Paiement consulterParCommande(Long idCommande);

    Paiement consulterParCommande(Long idCommande, Long currentUserId);

    BigDecimal totalPaiementsConfirmesProducteur(Long producteurId, Long currentUserId);
}
