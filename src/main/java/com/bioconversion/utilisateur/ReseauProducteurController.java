package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.dto.ProducteurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST du Module D — Réseau des Producteurs.
 *
 * <p>
 * Toutes les réponses passent par {@link ProducteurResponse} : l'entité
 * {@link Producteur} porte le hash du mot de passe et des associations
 * paresseuses, elle ne doit jamais être sérialisée telle quelle.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/producteurs")
@RequiredArgsConstructor
public class ReseauProducteurController {

    private final ReseauProducteurService reseauProducteurService;

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<ProducteurResponse>>> listerProducteursEnAttente(Pageable pageable) {
        Page<ProducteurResponse> producteurs = reseauProducteurService.listerProducteursEnAttente(pageable)
                .map(ProducteurResponse::from);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProducteurResponse>> obtenirProducteur(@PathVariable Long id) {
        Producteur producteur = reseauProducteurService.trouverProducteur(id);
        return ResponseEntity.ok(ApiResponse.success(ProducteurResponse.from(producteur)));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<ProducteurResponse>>> listerProducteurs(Pageable pageable) {
        Page<ProducteurResponse> producteurs = reseauProducteurService.listerProducteursValides(pageable)
                .map(ProducteurResponse::from);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @GetMapping("/province/{province}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<ProducteurResponse>>> listerParProvince(
            @PathVariable String province,
            Pageable pageable) {
        Page<ProducteurResponse> producteurs = reseauProducteurService.listerProducteursParProvince(province, pageable)
                .map(ProducteurResponse::from);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<ApiResponse<ProducteurResponse>> validerProducteur(
            @PathVariable Long id,
            @RequestParam boolean approuve) {
        Producteur producteur = reseauProducteurService.validerProducteur(id, approuve);
        return ResponseEntity.ok(ApiResponse.success(
                ProducteurResponse.from(producteur), "Statut de validation du producteur mis à jour"));
    }
}
