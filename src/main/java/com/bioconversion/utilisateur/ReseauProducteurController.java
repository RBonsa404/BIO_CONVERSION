package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.dto.CommandeValideeNotification;
import com.bioconversion.utilisateur.dto.ProducteurResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Squelette de contrôleur REST pour le Module D — Réseau des Producteurs &
 * Administration.
 */
@RestController
@RequestMapping("/api/v1/producteurs")
@RequiredArgsConstructor
public class ReseauProducteurController {

    private final ReseauProducteurService reseauProducteurService;

    @GetMapping("/en-attente")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<ProducteurResponse>>> listerProducteursEnAttente(Pageable pageable) {
        Page<ProducteurResponse> producteurs = reseauProducteurService.listerProducteursEnAttente(pageable)
                .map(ProducteurResponse::from);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProducteurResponse>> consulterProducteur(@PathVariable Long id) {
        Producteur producteur = reseauProducteurService.consulterProducteur(id);
        return ResponseEntity.ok(ApiResponse.success(ProducteurResponse.from(producteur)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Producteur>>> listerProducteurs(Pageable pageable) {
        Page<Producteur> producteurs = reseauProducteurService.listerProducteursValides(pageable);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @GetMapping("/province/{province}")
    public ResponseEntity<ApiResponse<Page<Producteur>>> listerParProvince(
            @PathVariable String province,
            Pageable pageable) {
        Page<Producteur> producteurs = reseauProducteurService.listerProducteursParProvince(province, pageable);
        return ResponseEntity.ok(ApiResponse.success(producteurs));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<ApiResponse<ProducteurResponse>> validerProducteur(
            @PathVariable Long id,
            @RequestParam boolean approuve) {
        Producteur producteur = reseauProducteurService.validerProducteur(id, approuve);
        return ResponseEntity.ok(ApiResponse.success(
                ProducteurResponse.from(producteur), "Statut de validation du producteur mis à jour"));
    }

    @PatchMapping("/{id}/capacite")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @producteurSecurity.estProprietaire(#id, authentication)")
    public ResponseEntity<ApiResponse<Producteur>> mettreAJourCapacite(
            @PathVariable Long id,
            @RequestParam double nouvelleCapacite) {
        Producteur producteur = reseauProducteurService.mettreAJourCapaciteProduction(id, nouvelleCapacite);
        return ResponseEntity.ok(ApiResponse.success(producteur, "Capacité de production mise à jour"));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/commande-validee")
    public ResponseEntity<ApiResponse<Void>> notifierCommandeValidee(
            @Valid @RequestBody CommandeValideeNotification notification) {
        reseauProducteurService.notifierProducteurCommandeValidee(notification);
        return ResponseEntity.ok(ApiResponse.success(null, "Producteur notifié"));
    }
}