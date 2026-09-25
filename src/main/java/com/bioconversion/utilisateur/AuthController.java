package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.utilisateur.dto.EleveurRegisterRequest;
import com.bioconversion.utilisateur.dto.ProducteurRegisterRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour l'authentification et l'inscription des utilisateurs.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Authentification réussie"));
    }

    @PostMapping("/register/producteur")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> registerProducteur(@Valid @RequestBody ProducteurRegisterRequest request) {
        UtilisateurResponse response = authService.registerProducteur(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compte producteur créé avec succès"));
    }

    @PostMapping("/register/eleveur")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> registerEleveur(@Valid @RequestBody EleveurRegisterRequest request) {
        UtilisateurResponse response = authService.registerEleveur(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compte éleveur créé avec succès"));
    }
}
