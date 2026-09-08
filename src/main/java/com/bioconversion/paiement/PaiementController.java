package com.bioconversion.paiement;

import com.bioconversion.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Squelette de contrôleur REST pour le Module C — Paiement Orange Money.
 */
@RestController
@RequestMapping("/api/v1/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping("/initier")
    public ResponseEntity<ApiResponse<Paiement>> initierPaiement(
            @RequestParam Long commandeId,
            @RequestParam String telephone) {
        Paiement p = paiementService.initierPaiement(commandeId, telephone);
        return ResponseEntity.ok(ApiResponse.success(p, "Demande de paiement Orange Money initiée"));
    }

    @PostMapping("/webhook/orange-money")
    public ResponseEntity<ApiResponse<String>> callbackOrangeMoney(
            @RequestParam String reference,
            @RequestParam String status) {
        paiementService.traiterCallbackOrangeMoney(reference, status);
        return ResponseEntity.ok(ApiResponse.success("Webhook traité avec succès"));
    }
}
