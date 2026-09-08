package com.bioconversion.security;

import com.bioconversion.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * Composant responsable de la génération, de la validation et de l'extraction
 * des informations d'un token JWT.
 *
 * <p>
 * <b>Algorithme :</b> HS256 (HMAC-SHA-256). Le secret doit avoir au moins
 * 256 bits (32 caractères ASCII). Voir {@code app.jwt.secret} dans
 * {@code application.yml}.
 * </p>
 *
 * <p>
 * <b>Payload du token :</b>
 * <ul>
 * <li>{@code sub} — numéro de téléphone (identifiant unique de
 * l'utilisateur)</li>
 * <li>{@code roles} — liste des rôles Spring Security</li>
 * <li>{@code iat} / {@code exp} — dates d'émission / expiration</li>
 * </ul>
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final AppProperties appProperties;

    /**
     * Génère un token JWT signé pour l'utilisateur authentifié.
     *
     * @param authentication l'objet Authentication Spring Security après connexion
     *                       réussie
     * @return le token JWT sous forme de chaîne
     */
    public String generateToken(Authentication authentication) {
        String telephone = authentication.getName();

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        Date now = new Date();
        Date expiry = new Date(now.getTime() + appProperties.jwt().expirationMs());

        return Jwts.builder()
                .subject(telephone)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Génère un token JWT signé avec téléphone, rôle et userId.
     */
    public String generateToken(String telephone, String role, Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + appProperties.jwt().expirationMs());

        return Jwts.builder()
                .subject(telephone)
                .claim("roles", role)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrait le numéro de téléphone (subject) du token.
     *
     * @param token le token JWT
     * @return le numéro de téléphone
     */
    public String getTelephoneFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Valide un token JWT.
     *
     * @param token le token à valider
     * @return {@code true} si le token est valide et non expiré
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Token JWT invalide : {}", e.getMessage());
            return false;
        }
    }

    // ── Méthodes privées ──────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = appProperties.jwt().secret()
                .getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
