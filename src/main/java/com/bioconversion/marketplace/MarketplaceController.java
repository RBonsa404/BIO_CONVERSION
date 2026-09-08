package com.bioconversion.marketplace;

import com.bioconversion.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
