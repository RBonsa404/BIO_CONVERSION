package com.bioconversion.paiement;

/**
 * Interface de service pour le Module C — Intégration Orange Money Burkina.
 *
 * <p>Définit le contrat d'interface pour l'initiation du paiement USSD/API, la confirmation Webhook
 * et la génération de facture PDF (CDC §2.2.4).</p>
 */
public interface PaiementService {

    Paiement initierPaiement(Long commandeId, String telephonePayer);

    Paiement traiterCallbackOrangeMoney(String referenceTransaction, String statutApi);

    Facture genererFacture(Long paiementId);
}
