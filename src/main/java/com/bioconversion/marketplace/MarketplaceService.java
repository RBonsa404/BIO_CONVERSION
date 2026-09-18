package com.bioconversion.marketplace;

import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.marketplace.dto.ProduitDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Interface de service pour le Module B — Marketplace d'Engrais & Larves.
 *
 * <p>Définit le contrat d'interface pour le catalogue produits et la gestion des commandes (CDC §2.2.2).</p>
 */
public interface MarketplaceService extends CommandeService {

    Page<Produit> listerProduitsDisponibles(Pageable pageable);

    Produit ajouterProduit(Produit produit, Long producteurId);

    Commande passerCommande(Long eleveurId, Long produitId, Double quantite);

    Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut);

    Produit publierProduit(Produit produit, Long producteurId);
    Produit modifierStock(Long produitId, double nouvelleQuantite);
    Produit modifierPrix(Long produitId, double nouveauPrix);
    void retirerProduit(Long produitId);
    List<Produit> consulterCatalogueProducteur(Long producteurId);

    List<Produit> rechercherProduitsParRayon(double latitude, double longitude, double rayonKm);

    /**
     * Recherche géolocalisée des producteurs validés situés dans un rayon paramétrable en kilomètres.
     * (CDC §2.2.2 & User Story B-MUST-1)
     */
    List<ProducteurLocaliseDto> rechercherProducteursParRayon(double latitude, double longitude, double rayonKm);

    /**
     * Consultation du catalogue d'un producteur sous forme de DTO (B-MUST-2 & Contrat Binôme).
     */
    List<ProduitDto> consulterCatalogueProducteurDto(Long producteurId);

}
