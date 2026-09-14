package com.bioconversion.marketplace;

import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Squelette d'implémentation du Module B — Marketplace.
 */
@Service
@RequiredArgsConstructor
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    private final ProducteurRepository producteurRepository;

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
    public Commande passerCommande(Long eleveurId, Long produitId, Integer quantite) {
        // TODO: Vérifier le stock disponible et générer la commande avec son numéro unique
        return null;
    }

    @Override
    public Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut) {
        // TODO: Gérer la transition d'état du cycle de vie de la commande
        return null;
    }
    
    @Override
    public Produit publierProduit(Produit produit, Long producteurId) {
        Producteur producteur = producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur introuvable"));
        produit.setProducteur(producteur);
        produit.setDisponibilite(true);
        return produitRepository.save(produit);
    }

    @Override
    public Produit modifierStock(Long produitId, double nouvelleQuantite) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        produit.setQuantiteStock(nouvelleQuantite);
        return produitRepository.save(produit);
    }

    @Override
    public Produit modifierPrix(Long produitId, double nouveauPrix) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        produit.setPrix(nouveauPrix);
        return produitRepository.save(produit);
    }

    @Override
    public void retirerProduit(Long produitId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        produit.setDisponibilite(false);
        produitRepository.save(produit);
    }

    @Override
    public List<Produit> consulterCatalogueProducteur(Long producteurId) {
        return produitRepository.findByProducteurIdUtilisateur(producteurId);
    }

}
