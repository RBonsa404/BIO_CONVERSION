package com.bioconversion.paiement;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.paiement.dto.InitierPaiementRequest;
import com.bioconversion.paiement.dto.PaiementResponse;
import com.bioconversion.paiement.dto.WebhookPaiementRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Module C — Paiement Intégré (Orange Money).
 * C-MUST-1 à C-MUST-4 du CDC v1.1.
 */
@RestController
@RequestMapping("/api/v1/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    /**
     * C-MUST-1 : initie le règlement d'une commande.
     * Étape 2 du diagramme de séquence "Validation et paiement" (POST /paiements).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaiementResponse>> initierPaiement(
            @Valid @RequestBody InitierPaiementRequest request) {

        Paiement paiement = paiementService.initierPaiement(
                request.idCommande(), request.operateur());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        PaiementResponse.from(paiement),
                        "Paiement initié, en attente de confirmation opérateur"));
    }

    /**
     * C-MUST-2 / C-MUST-3 : réception du webhook opérateur (succès ou échec).
     * Étapes 6/11 du diagramme de séquence. Appel asynchrone déclenché par l'opérateur,
     * pas par l'éleveur — pas d'authentification utilisateur classique attendue ici
     * (TODO sécurité : à durcir avec une vérification de signature/secret partagé avant
     * la mise en production réelle — hors périmètre de la simulation C-MUST-1 actuelle).
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<PaiementResponse>> recevoirWebhook(
            @Valid @RequestBody WebhookPaiementRequest request) {

        Paiement paiement = switch (request.statut()) {
            case SUCCES -> paiementService.traiterWebhookSucces(request.referenceTransaction());
            case ECHEC -> paiementService.traiterWebhookEchec(request.referenceTransaction());
        };

        String message = request.statut() == WebhookPaiementRequest.StatutWebhook.SUCCES
                ? "Paiement confirmé"
                : "Échec du paiement enregistré";

        return ResponseEntity.ok(
                ApiResponse.success(PaiementResponse.from(paiement), message));
    }

    /**
     * C-MUST-4 : consultation du paiement d'une commande, pour vérifier la confirmation
     * avant tout retrait physique.
     */
    @GetMapping("/commande/{idCommande}")
    public ResponseEntity<ApiResponse<PaiementResponse>> consulterParCommande(
            @PathVariable Long idCommande) {

        Paiement paiement = paiementService.consulterParCommande(idCommande);

        return ResponseEntity.ok(ApiResponse.success(PaiementResponse.from(paiement)));
    }
}