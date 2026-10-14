package com.bioconversion.commission;

import com.bioconversion.commission.dto.CommissionACollecterDto;
import com.bioconversion.commission.dto.EncaissementRequest;
import com.bioconversion.commission.dto.ResumeFondsDto;
import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Fonds de la plateforme et commissions espèces. Réservé aux administrateurs
 * (la règle /api/v1/admin/** de SecurityConfig, doublée ici par @PreAuthorize).
 */
@RestController
@RequestMapping("/api/v1/admin/commissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR')")
public class AdminCommissionController {

    private final AdminCommissionService adminCommissionService;

    @GetMapping("/resume")
    public ResponseEntity<ApiResponse<ResumeFondsDto>> resume() {
        return ResponseEntity.ok(ApiResponse.success(adminCommissionService.resume()));
    }

    @GetMapping("/a-collecter")
    public ResponseEntity<ApiResponse<List<CommissionACollecterDto>>> aCollecter() {
        return ResponseEntity.ok(ApiResponse.success(adminCommissionService.aCollecter()));
    }

    @PostMapping("/{id}/encaisser")
    public ResponseEntity<ApiResponse<Void>> encaisser(@PathVariable Long id,
                                                       @Valid @RequestBody EncaissementRequest requete) {
        adminCommissionService.encaisser(id, requete, SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Commission encaissée et ajoutée au fonds"));
    }
}
