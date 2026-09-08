package com.bioconversion.utilisateur.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * DTO de réponse d'authentification contenant le token JWT et la durée de validité.
 */
@Getter
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private long expiresInMs;
    private UtilisateurResponse user;

    public static AuthResponse of(String token, long expiresInMs, UtilisateurResponse user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInMs(expiresInMs)
                .user(user)
                .build();
    }
}
