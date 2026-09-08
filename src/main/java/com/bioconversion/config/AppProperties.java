package com.bioconversion.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

/**
 * Propriétés applicatives personnalisées, bindées depuis
 * {@code application.yml}
 * sous le préfixe {@code app}.
 *
 * <p>
 * Exemple dans {@code application.yml} :
 * 
 * <pre>
 * app:
 *   jwt:
 *     secret: mon-secret-256-bits
 *     expiration-ms: 86400000
 *   security:
 *     allowed-origins:
 *       - http://localhost:3000
 * </pre>
 * </p>
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(

                @NotNull @Valid JwtProperties jwt,

                SecurityProperties security,

                UploadProperties upload

) {

        public record JwtProperties(
                        @NotBlank String secret,
                        @Positive long expirationMs) {
        }

        public record SecurityProperties(
                        List<String> allowedOrigins) {
        }

        public record UploadProperties(
                        String identiteDir) {
        }
}
