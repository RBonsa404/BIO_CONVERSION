package com.bioconversion.paiement;

import com.bioconversion.marketplace.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Squelette d'implémentation du Module C — Integration Orange Money Burkina.
 */
@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    private final PaiementRepository paiementRepository;
    private final FactureRepository factureRepository;
    private final CommandeService commandeService;

    @Override
    public Paiement initierPaiement(Long commandeId, String telephonePayer) {
        // TODO: Contacter l'API Orange Money (WebPay API / OTP), générer la référence transaction
        return null;
    }

    @Override
    @Transactional
    public Paiement traiterCallbackOrangeMoney(String referenceTransaction, String statutApi) {
        // TODO: Valider la signature HMAC Webhook, mettre à jour le statut du paiement
        // Une fois le paiement confirmé avec succès :
        // Commande commandePayee = commandeService.marquerCommandePayee(commandeId);
        return null;
    }

    @Override
    public Facture genererFacture(Long paiementId) {
        // TODO: Générer le document PDF de facture et sauvegarder la référence
        return null;
    }
}
