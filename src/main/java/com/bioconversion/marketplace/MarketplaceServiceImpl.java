package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Squelette d'implémentation du Module B — Marketplace.
 */
@Service
@RequiredArgsConstructor
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;

    @Override
    public Page<Produit> listerProduitsDisponibles(Pageable pageable) {
        return produitRepository.findByDisponibiliteTrue(pageable);
    }

    @Override
    public Produit ajouterProduit(Produit produit, Long producteurId) {
        // TODO: Associer le produit au producteur et valider le prix/stock
        return null;
    }

    @Override
    public Commande passerCommande(Long eleveurId, Long produitId, Double quantite) {
        // TODO: Vérifier le stock disponible et générer la commande avec son numéro unique
        return null;
    }

    @Override
    public Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut) {
        // TODO: Gérer la transition d'état du cycle de vie de la commande
        return null;
    }

    @Override
    @Transactional
    public Commande marquerCommandePayee(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new BusinessException("Commande introuvable avec l'ID : " + commandeId));

        commande.setStatut(StatutCommande.PAYE);
        return commandeRepository.save(commande);
    }
}
