package com.bioconversion.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration OpenAPI 3 / Swagger UI.
 *
 * <p>Documentation accessible à : {@code /swagger-ui.html} (profil dev uniquement).</p>
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI bioConversionOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BioConversion API")
                        .version("0.1.0-SNAPSHOT")
                        .description("""
                                **Plateforme de bioreconversion agricole — Burkina Faso**
                                
                                Backend Spring Boot servant de fondation aux modules :
                                - **Module A** — IoT (capteurs de serre, alertes)
                                - **Module B** — Marketplace (produits, commandes)
                                - **Module C** — Paiement Orange Money
                                - **Module D** — Réseau producteurs
                                
                                Authentification : JWT Bearer Token (header `Authorization: Bearer <token>`).
                                """)
                        .contact(new Contact()
                                .name("Club Informatique BioConversion")
                                .email("contact@bioconversion.bf"))
                        .license(new License()
                                .name("Propriétaire — usage interne uniquement")))

                // Schéma de sécurité JWT
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH,
                                new SecurityScheme()
                                        .name(BEARER_AUTH)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Saisir le token JWT obtenu via POST /api/auth/connexion")));
    }
}
