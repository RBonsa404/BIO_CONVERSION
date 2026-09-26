package com.bioconversion.paiement;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.paiement.dto.FactureResponse;
import com.bioconversion.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Module C — Facturation (dispatch §3.2, KABORE Caliste Elie).
 * C-MUST-5 du CDC v1.1.
 */
@RestController
@RequestMapping("/api/v1/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;

    /**
     * Consultation des métadonnées d'une facture.
     */
    @GetMapping("/{reference}")
    public ResponseEntity<ApiResponse<FactureResponse>> consulter(
            @PathVariable String reference) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Facture facture = factureService.consulterParReference(reference, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(FactureResponse.from(facture)));
    }

    /**
     * telecharger() du diagramme de classes — force le téléchargement du PDF.
     */
    @GetMapping("/{reference}/telecharger")
    public ResponseEntity<byte[]> telecharger(@PathVariable String reference) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] pdf = factureService.telechargerPdf(reference, currentUserId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + reference + ".pdf\"")
                .body(pdf);
    }

    /**
     * imprimer() du diagramme de classes — même PDF, affiché en ligne (inline)
     * pour que le navigateur l'ouvre directement (l'utilisateur imprime depuis
     * sa visionneuse PDF plutôt qu'un rendu serveur dédié à l'impression).
     */
    @GetMapping("/{reference}/imprimer")
    public ResponseEntity<byte[]> imprimer(@PathVariable String reference) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] pdf = factureService.telechargerPdf(reference, currentUserId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + reference + ".pdf\"")
                .body(pdf);
    }
}