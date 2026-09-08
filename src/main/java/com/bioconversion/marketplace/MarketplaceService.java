package com.bioconversion.marketplace;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface de service pour le Module B — Marketplace d'Engrais & Larves.
 *
 * <p>Définit le contrat d'interface pour le catalogue produits et la gestion des commandes (CDC §2.2.2).</p>
 */
public interface MarketplaceService {

    Page<Produit> listerProduitsDisponibles(Pageable pageable);

    Produit ajouterProduit(Produit produit, Long producteurId);

    Commande passerCommande(Long eleveurId, Long produitId, Integer quantite);

    Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut);
}
