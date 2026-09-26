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

    Commande passerCommande(Long eleveurId, Long produitId, Double quantite, String idempotencyKey);

    Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut);

    Commande confirmerCommande(Long commandeId, Long producteurId);

    Commande annulerCommande(Long commandeId, String motif);

    Commande annulerCommande(Long commandeId, String motif, Long currentUserId);

    Commande trouverCommandeParId(Long commandeId);

    Commande trouverCommandeParId(Long commandeId, Long currentUserId);

    Page<Commande> listerCommandesEleveur(Long eleveurId, Pageable pageable);

    Page<Commande> listerCommandesProducteur(Long producteurId, Pageable pageable);

    List<Commande> expirerCommandesNonConfirmees();

    List<ProducteurLocaliseDto> proposerProducteursAlternatifs(Commande commande);

    Produit publierProduit(Produit produit, Long producteurId);
    Produit modifierStock(Long produitId, double nouvelleQuantite);
    Produit modifierStock(Long produitId, double nouvelleQuantite, Long currentUserId);
    Produit modifierPrix(Long produitId, double nouveauPrix);
    Produit modifierPrix(Long produitId, double nouveauPrix, Long currentUserId);
    void retirerProduit(Long produitId);
    void retirerProduit(Long produitId, Long currentUserId);
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
