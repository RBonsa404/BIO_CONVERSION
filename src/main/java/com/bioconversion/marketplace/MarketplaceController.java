package com.bioconversion.marketplace;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.common.exception.UnauthorizedException;
import com.bioconversion.marketplace.dto.CommandeDto;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ApiResponse<Produit>> publierProduit(@RequestBody Produit produit) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Produit cree = marketplaceService.publierProduit(produit, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(cree, "Produit publié"));
    }

    @PatchMapping("/produits/{produitId}/stock")
    public ResponseEntity<ApiResponse<Produit>> modifierStock(@PathVariable Long produitId,
                                                                @RequestParam double nouvelleQuantite) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Produit maj = marketplaceService.modifierStock(produitId, nouvelleQuantite, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(maj, "Stock mis à jour"));
    }

    @PatchMapping("/produits/{produitId}/prix")
    public ResponseEntity<ApiResponse<Produit>> modifierPrix(@PathVariable Long produitId,
                                                               @RequestParam double nouveauPrix) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Produit maj = marketplaceService.modifierPrix(produitId, nouveauPrix, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(maj, "Prix mis à jour"));
    }

    @DeleteMapping("/produits/{produitId}")
    public ResponseEntity<ApiResponse<Void>> retirerProduit(@PathVariable Long produitId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        marketplaceService.retirerProduit(produitId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "Produit retiré"));
    }

    @GetMapping("/produits/producteur/{producteurId}")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> consulterCatalogueProducteur(@PathVariable Long producteurId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!currentUserId.equals(producteurId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<ProduitDto> catalogue = marketplaceService.consulterCatalogueProducteurDto(producteurId);
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

    // ──────────────────────────────────────────────────────────────────────────
    // ENDPOINTS CYCLE DE COMMANDE (B-MUST-4, B-MUST-6, B-MUST-7, B-MUST-8)
    // ──────────────────────────────────────────────────────────────────────────

    @PostMapping("/commandes")
    public ResponseEntity<ApiResponse<CommandeDto>> passerCommande(
            @jakarta.validation.Valid @RequestBody com.bioconversion.marketplace.dto.PasserCommandeRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyHeader) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String key = idempotencyHeader != null ? idempotencyHeader : request.getIdempotencyKey();
        Commande commande = marketplaceService.passerCommande(
                currentUserId,
                request.getProduitId(),
                request.getQuantite(),
                key);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Commande passée avec succès"));
    }

    @PatchMapping("/commandes/{commandeId}/statut")
    public ResponseEntity<ApiResponse<CommandeDto>> changerStatutCommande(
            @PathVariable Long commandeId,
            @jakarta.validation.Valid @RequestBody com.bioconversion.marketplace.dto.ChangerStatutCommandeRequest request) {
        Commande commande = marketplaceService.changerStatutCommande(commandeId, request.getNouveauStatut());
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Statut de la commande mis à jour"));
    }

    @PostMapping("/commandes/{commandeId}/confirmer")
    public ResponseEntity<ApiResponse<CommandeDto>> confirmerCommande(
            @PathVariable Long commandeId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.confirmerCommande(commandeId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Commande confirmée avec succès"));
    }

    @PostMapping("/commandes/{commandeId}/annuler")
    public ResponseEntity<ApiResponse<CommandeDto>> annulerCommande(
            @PathVariable Long commandeId,
            @RequestParam(required = false) String motif) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.annulerCommande(commandeId, motif, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Commande annulée avec succès"));
    }

    @GetMapping("/commandes/{commandeId}")
    public ResponseEntity<ApiResponse<CommandeDto>> obtenirCommande(@PathVariable Long commandeId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.trouverCommandeParId(commandeId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande)));
    }

    @GetMapping("/commandes/eleveur/{eleveurId}")
    public ResponseEntity<ApiResponse<Page<CommandeDto>>> listerCommandesEleveur(
            @PathVariable Long eleveurId,
            Pageable pageable) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!currentUserId.equals(eleveurId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Page<Commande> page = marketplaceService.listerCommandesEleveur(eleveurId, pageable);
        Page<CommandeDto> dtoPage = page.map(CommandeDto::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtoPage));
    }

    @GetMapping("/commandes/producteur/{producteurId}")
    public ResponseEntity<ApiResponse<Page<CommandeDto>>> listerCommandesProducteur(
            @PathVariable Long producteurId,
            Pageable pageable) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!currentUserId.equals(producteurId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Page<Commande> page = marketplaceService.listerCommandesProducteur(producteurId, pageable);
        Page<CommandeDto> dtoPage = page.map(CommandeDto::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtoPage));
    }
}

