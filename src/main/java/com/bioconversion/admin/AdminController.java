package com.bioconversion.admin;

import com.bioconversion.admin.dto.StatistiquesPlateformeResponse;
import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints d'administration. L'accès est restreint aux rôles administrateurs
 * dans {@link com.bioconversion.config.SecurityConfig}.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/utilisateurs")
    public ResponseEntity<ApiResponse<Page<UtilisateurResponse>>> listerUtilisateurs(
            @RequestParam(required = false) StatutUtilisateur statut,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listerUtilisateurs(statut, pageable)));
    }

    @PutMapping("/utilisateurs/{id}/valider")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> valider(
            @PathVariable Long id,
            @RequestParam boolean approuve) {
        UtilisateurResponse utilisateur = adminService.validerInscription(id, approuve);
        return ResponseEntity.ok(ApiResponse.success(utilisateur,
                approuve ? "Compte validé" : "Inscription refusée"));
    }

    @PutMapping("/utilisateurs/{id}/suspendre")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> suspendre(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.suspendre(id), "Compte suspendu"));
    }

    @PutMapping("/utilisateurs/{id}/reactiver")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> reactiver(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.reactiver(id), "Compte réactivé"));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<ApiResponse<StatistiquesPlateformeResponse>> statistiques() {
        return ResponseEntity.ok(ApiResponse.success(adminService.statistiques()));
    }
}
