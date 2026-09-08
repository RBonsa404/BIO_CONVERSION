package com.bioconversion.utilisateur;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.utilisateur.dto.RegisterRequest;
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UtilisateurResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compte créé avec succès"));
    }
}
