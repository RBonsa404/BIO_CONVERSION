package com.bioconversion.iot;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.iot.dto.AlerteResponse;
import com.bioconversion.iot.dto.CapteurRequest;
import com.bioconversion.iot.dto.CapteurResponse;
import com.bioconversion.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST du Module A — Supervision IoT.
 *
 * <p>
 * {@code POST /telemetrie} est appelé par les capteurs (clé d'API, voir
 * {@link com.bioconversion.security.IotApiKeyFilter}) ; les autres routes servent
 * le tableau de bord du producteur connecté.
 * </p>
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

    @GetMapping("/capteurs")
    @PreAuthorize("hasRole('PRODUCTEUR')")
    public ResponseEntity<ApiResponse<List<CapteurResponse>>> listerMesCapteurs() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(iotService.listerCapteurs(currentUserId)));
    }

    @PostMapping("/capteurs")
    @PreAuthorize("hasRole('PRODUCTEUR')")
    public ResponseEntity<ApiResponse<CapteurResponse>> enregistrerCapteur(@Valid @RequestBody CapteurRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CapteurResponse capteur = iotService.enregistrerCapteur(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(capteur, "Capteur enregistré"));
    }

    @PatchMapping("/capteurs/{capteurId}/statut")
    @PreAuthorize("hasRole('PRODUCTEUR')")
    public ResponseEntity<ApiResponse<CapteurResponse>> changerStatut(@PathVariable Long capteurId,
                                                                     @RequestParam boolean actif) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CapteurResponse capteur = iotService.changerStatutCapteur(capteurId, actif, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(capteur, actif ? "Capteur activé" : "Capteur désactivé"));
    }

    @GetMapping("/alertes")
    @PreAuthorize("hasRole('PRODUCTEUR')")
    public ResponseEntity<ApiResponse<List<AlerteResponse>>> listerMesAlertes(
            @RequestParam(defaultValue = "20") int limite) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(iotService.listerAlertes(currentUserId, limite)));
    }

    /**
     * Capteurs d'un producteur : réservé à ce producteur et aux administrateurs.
     */
    @GetMapping("/capteurs/producteur/{producteurId}")
    @PreAuthorize("hasAnyRole('PRODUCTEUR', 'ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR')")
    public ResponseEntity<ApiResponse<List<CapteurResponse>>> listerCapteurs(@PathVariable Long producteurId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean estProducteur = "ROLE_PRODUCTEUR".equals(SecurityUtils.getCurrentUserRole());
        if (estProducteur && !producteurId.equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(ApiResponse.success(iotService.listerCapteurs(producteurId)));
    }
}
