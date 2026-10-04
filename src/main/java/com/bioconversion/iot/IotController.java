package com.bioconversion.iot;

import com.bioconversion.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Squelette de contrôleur REST pour le Module A — Supervision IoT.
 */
@RestController
@RequestMapping("/api/v1/iot")
@RequiredArgsConstructor
public class IotController {

    private final IotService iotService;

    @PostMapping("/telemetrie")
    public ResponseEntity<ApiResponse<String>> recevoirTelemetrie(
            @RequestParam String codeCapteur,
            @RequestParam Double temperature,
            @RequestParam Double humidite) {
        iotService.enregistrerTelemetrie(codeCapteur, temperature, humidite);
        return ResponseEntity.ok(ApiResponse.success("Télémétrie reçue avec succès"));
    }

    @GetMapping("/capteurs/producteur/{producteurId}")
    @PreAuthorize("hasAnyRole('PRODUCTEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<ApiResponse<List<Capteur>>> listerCapteurs(@PathVariable Long producteurId) {
        List<Capteur> capteurs = iotService.obtenirCapteursProducteur(producteurId);
        return ResponseEntity.ok(ApiResponse.success(capteurs));
    }
}
