package com.bioconversion.marketplace;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.marketplace.dto.ChangerStatutCommandeRequest;
import com.bioconversion.marketplace.dto.CommandeDto;
import com.bioconversion.marketplace.dto.PasserCommandeRequest;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.marketplace.dto.ProduitRequest;
import com.bioconversion.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Contrôleur REST du Module B — Marketplace (catalogue et cycle de commande).
 *
 * <p>
 * Les réponses n'exposent que des DTO : les entités portent des associations
 * paresseuses qui ne sont plus accessibles une fois la transaction terminée.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    // ──────────────────────────────────────────────────────────────────────────
    // CATALOGUE
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/produits")
    public ResponseEntity<ApiResponse<Page<ProduitDto>>> listerProduits(Pageable pageable) {
        Page<ProduitDto> produits = marketplaceService.listerProduitsDisponiblesDto(pageable);
        return ResponseEntity.ok(ApiResponse.success(produits));
    }

    /** Catalogue complet du producteur connecté, produits retirés compris. */
    @GetMapping("/produits/mes-produits")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> listerMesProduits() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.success(marketplaceService.listerMesProduits(currentUserId)));
    }

    @GetMapping("/produits/{produitId}")
    public ResponseEntity<ApiResponse<ProduitDto>> obtenirProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(ApiResponse.success(marketplaceService.obtenirProduitDto(produitId)));
    }

    @PostMapping("/produits")
    public ResponseEntity<ApiResponse<ProduitDto>> publierProduit(@Valid @RequestBody ProduitRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProduitDto cree = marketplaceService.publierProduit(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(cree, "Produit publié"));
    }

    @PutMapping("/produits/{produitId}")
    public ResponseEntity<ApiResponse<ProduitDto>> modifierProduit(@PathVariable Long produitId,
                                                                   @Valid @RequestBody ProduitRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProduitDto maj = marketplaceService.modifierProduit(produitId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(maj, "Produit mis à jour"));
    }

    @PatchMapping("/produits/{produitId}/stock")
    @Transactional
    public ResponseEntity<ApiResponse<ProduitDto>> modifierStock(@PathVariable Long produitId,
                                                                 @RequestParam double nouvelleQuantite) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Produit maj = marketplaceService.modifierStock(produitId, nouvelleQuantite, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(marketplaceService.versDto(maj), "Stock mis à jour"));
    }

    @PatchMapping("/produits/{produitId}/prix")
    @Transactional
    public ResponseEntity<ApiResponse<ProduitDto>> modifierPrix(@PathVariable Long produitId,
                                                                @RequestParam double nouveauPrix) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Produit maj = marketplaceService.modifierPrix(produitId, nouveauPrix, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(marketplaceService.versDto(maj), "Prix mis à jour"));
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

    @PostMapping("/produits/{produitId}/republier")
    public ResponseEntity<ApiResponse<ProduitDto>> republierProduit(@PathVariable Long produitId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProduitDto maj = marketplaceService.republierProduit(produitId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(maj, "Produit remis en vente"));
    }

    @GetMapping("/produits/producteur/{producteurId}")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> consulterCatalogueProducteur(@PathVariable Long producteurId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ProduitDto> catalogue = marketplaceService.consulterCatalogueProducteurDto(producteurId);
        return ResponseEntity.ok(ApiResponse.success(catalogue));
    }

    @GetMapping("/produits/recherche")
    public ResponseEntity<ApiResponse<List<ProduitDto>>> rechercherParRayon(@RequestParam double latitude,
                                                                           @RequestParam double longitude,
                                                                           @RequestParam double rayonKm) {
        List<ProduitDto> resultats = marketplaceService.rechercherProduitsParRayonDto(latitude, longitude, rayonKm);
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
    @Transactional
    public ResponseEntity<ApiResponse<CommandeDto>> passerCommande(
            @Valid @RequestBody PasserCommandeRequest request,
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

    /**
     * Suivi de livraison : EXPEDIE (producteur) puis LIVRE (producteur ou éleveur).
     */
    @PatchMapping("/commandes/{commandeId}/statut")
    @Transactional
    public ResponseEntity<ApiResponse<CommandeDto>> changerStatutCommande(
            @PathVariable Long commandeId,
            @Valid @RequestBody ChangerStatutCommandeRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.changerStatutCommande(
                commandeId, request.getNouveauStatut(), currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Statut de la commande mis à jour"));
    }

    @PostMapping("/commandes/{commandeId}/confirmer")
    @Transactional
    public ResponseEntity<ApiResponse<CommandeDto>> confirmerCommande(
            @PathVariable Long commandeId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.confirmerCommande(commandeId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Commande confirmée avec succès"));
    }

    @PostMapping("/commandes/{commandeId}/refuser")
    @Transactional
    public ResponseEntity<ApiResponse<CommandeDto>> refuserCommande(@PathVariable Long commandeId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.refuserCommande(commandeId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande), "Commande refusée"));
    }

    @PostMapping("/commandes/{commandeId}/annuler")
    @Transactional
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
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<CommandeDto>> obtenirCommande(@PathVariable Long commandeId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Commande commande = marketplaceService.trouverCommandeParId(commandeId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(CommandeDto.fromEntity(commande)));
    }

    @GetMapping("/commandes/eleveur/{eleveurId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<CommandeDto>>> listerCommandesEleveur(
            @PathVariable Long eleveurId,
            @PageableDefault(size = 20, sort = "dateCommande", direction = Sort.Direction.DESC) Pageable pageable) {
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
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<CommandeDto>>> listerCommandesProducteur(
            @PathVariable Long producteurId,
            @PageableDefault(size = 20, sort = "dateCommande", direction = Sort.Direction.DESC) Pageable pageable) {
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
