package com.bioconversion.marketplace;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
/**
 * Squelette de contrôleur REST pour le Module B — Marketplace.
 */
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/produits")
    public ResponseEntity<ApiResponse<Page<Produit>>> listerProduits(Pageable pageable) {
        Page<Produit> produits = marketplaceService.listerProduitsDisponibles(pageable);
        return ResponseEntity.ok(ApiResponse.success(produits));
    }

    @PostMapping("/produits")
    public ResponseEntity<ApiResponse<Produit>> publierProduit(@RequestBody Produit produit,
                                                                 @RequestParam Long producteurId) {
        Produit cree = marketplaceService.publierProduit(produit, producteurId);
        return ResponseEntity.ok(ApiResponse.success(cree, "Produit publié"));
    }

    @PatchMapping("/produits/{produitId}/stock")
    public ResponseEntity<ApiResponse<Produit>> modifierStock(@PathVariable Long produitId,
                                                                @RequestParam double nouvelleQuantite) {
        Produit maj = marketplaceService.modifierStock(produitId, nouvelleQuantite);
        return ResponseEntity.ok(ApiResponse.success(maj, "Stock mis à jour"));
    }

    @PatchMapping("/produits/{produitId}/prix")
    public ResponseEntity<ApiResponse<Produit>> modifierPrix(@PathVariable Long produitId,
                                                               @RequestParam double nouveauPrix) {
        Produit maj = marketplaceService.modifierPrix(produitId, nouveauPrix);
        return ResponseEntity.ok(ApiResponse.success(maj, "Prix mis à jour"));
    }

    @DeleteMapping("/produits/{produitId}")
    public ResponseEntity<ApiResponse<Void>> retirerProduit(@PathVariable Long produitId) {
        marketplaceService.retirerProduit(produitId);
        return ResponseEntity.ok(ApiResponse.success(null, "Produit retiré"));
    }

    @GetMapping("/produits/producteur/{producteurId}")
    public ResponseEntity<ApiResponse<List<Produit>>> consulterCatalogueProducteur(@PathVariable Long producteurId) {
        List<Produit> catalogue = marketplaceService.consulterCatalogueProducteur(producteurId);
        return ResponseEntity.ok(ApiResponse.success(catalogue));
    }

    @GetMapping("/produits/recherche")
    public ResponseEntity<ApiResponse<List<Produit>>> rechercherParRayon(@RequestParam double latitude,
                                                                          @RequestParam double longitude,
                                                                          @RequestParam double rayonKm) {
        List<Produit> resultats = marketplaceService.rechercherProduitsParRayon(latitude, longitude, rayonKm);
        return ResponseEntity.ok(ApiResponse.success(resultats));
    }

    /**
     * Recherche géolocalisée de producteurs validés par rayon (CDC §2.2.2 & B-MUST-1).
     */
    @GetMapping("/producteurs/recherche-geolocalisee")
    public ResponseEntity<ApiResponse<List<ProducteurLocaliseDto>>> rechercherProducteursParRayon(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "50.0") double rayonKm) {
        List<ProducteurLocaliseDto> producteurs = marketplaceService.rechercherProducteursParRayon(latitude, longitude, rayonKm);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

}

