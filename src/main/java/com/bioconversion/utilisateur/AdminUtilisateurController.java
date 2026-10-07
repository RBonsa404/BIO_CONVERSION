package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints réservés à l'administrateur pour valider les comptes
 * de tous les utilisateurs (producteurs et éleveurs).
 */
@RestController
@RequestMapping("/api/v1/admin/utilisateurs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATEUR')")
public class AdminUtilisateurController {

    private final AdminUtilisateurService adminUtilisateurService;

    @GetMapping("/en-attente")
    public ResponseEntity<ApiResponse<Page<UtilisateurResponse>>> listerComptesEnAttente(Pageable pageable) {
        Page<UtilisateurResponse> comptes = adminUtilisateurService.listerComptesEnAttente(pageable)
                .map(UtilisateurResponse::from);
        return ResponseEntity.ok(ApiResponse.success(comptes));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> validerCompte(
            @PathVariable Long id,
            @RequestParam boolean approuve) {
        Utilisateur utilisateur = adminUtilisateurService.validerCompte(id, approuve);
        return ResponseEntity.ok(ApiResponse.success(
                UtilisateurResponse.from(utilisateur), "Statut du compte mis à jour"));
    }
}