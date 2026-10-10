package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.security.SecurityUtils;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.utilisateur.dto.EleveurRegisterRequest;
import com.bioconversion.utilisateur.dto.MotDePasseUpdateRequest;
import com.bioconversion.utilisateur.dto.ProducteurRegisterRequest;
import com.bioconversion.utilisateur.dto.ProfilUpdateRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Contrôleur REST pour l'authentification, l'inscription et le profil des utilisateurs.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PieceIdentiteService pieceIdentiteService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Authentification réussie"));
    }

    /**
     * Inscription producteur (CDC §2.2.4) : requête multipart avec les informations du compte
     * (partie « donnees », en JSON) et la photo ou le scan de la CNIB (partie « cnib »).
     */
    @PostMapping(value = "/register/producteur", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UtilisateurResponse>> registerProducteur(
            @Valid @RequestPart("donnees") ProducteurRegisterRequest request,
            @RequestPart(value = "cnib", required = false) MultipartFile cnib) {
        UtilisateurResponse response = pieceIdentiteService.inscrireProducteur(request, cnib);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compte producteur créé avec succès"));
    }

    @PostMapping("/register/eleveur")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> registerEleveur(@Valid @RequestBody EleveurRegisterRequest request) {
        UtilisateurResponse response = authService.registerEleveur(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compte éleveur créé avec succès"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> profil() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.success(authService.obtenirProfil(currentUserId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> modifierProfil(@Valid @RequestBody ProfilUpdateRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UtilisateurResponse response = authService.modifierProfil(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profil mis à jour"));
    }

    @PutMapping("/me/mot-de-passe")
    public ResponseEntity<ApiResponse<Void>> changerMotDePasse(@Valid @RequestBody MotDePasseUpdateRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.changerMotDePasse(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mot de passe mis à jour"));
    }
}