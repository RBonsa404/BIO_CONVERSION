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
 *   commission:
 *     taux: 0.05
 *   entreprise:
 *     nom: "BIO CONVERSION"
 * </pre>
 * </p>
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(

                @NotNull @Valid JwtProperties jwt,

                SecurityProperties security,

                UploadProperties upload,

                @NotNull @Valid CommissionProperties commission,

                @NotNull @Valid EntrepriseProperties entreprise,

                PaiementProperties paiement

) {

        public record JwtProperties(
                        @NotBlank String secret,
                        @Positive long expirationMs) {
        }

        public record SecurityProperties(
                        String allowedOrigins) {
        }

        public record UploadProperties(
                        String identiteDir) {
        }

        /**
         * C-MUST-5 (CDC v1.1) : taux de commission perçu par la plateforme sur
         * chaque transaction. Paramétrable côté administration, jamais codé en dur
         * dans FactureService.
         */
        public record CommissionProperties(
                        @Positive double taux) {
        }

        /**
         * Informations légales de l'entreprise, affichées sur les factures.
         * Valeurs placeholder tant que les données fiscales réelles (IFU, RCCM,
         * coordonnées bancaires) ne sont pas fournies par la MOA — à remplacer
         * directement dans application.yml quand elles seront disponibles.
         */
        public record EntrepriseProperties(
                        @NotBlank String nom,
                        String ifu,
                        String rccm,
                        String adresse,
                        String telephone,
                        String email,
                        String banque,
                        String iban) {
        }

        /**
         * Configuration du module de paiement, notamment la sécurité du webhook.
         */
        public record PaiementProperties(
                        @NotBlank String webhookSecret) {
        }
}