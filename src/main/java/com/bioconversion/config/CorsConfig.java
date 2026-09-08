package com.bioconversion.config;

import com.bioconversion.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration CORS.
 *
 * <p>
 * Les origines autorisées sont définies dans {@code application.yml} sous
 * {@code app.security.allowed-origins}.
 * </p>
 *
 * <p>
 * <b>TODO :</b> En production, restreindre les méthodes et headers autorisés
 * selon les besoins réels de l'application mobile/frontend.
 * </p>
 */
@Configuration
@RequiredArgsConstructor
public class CorsConfig {

    private final AppProperties appProperties;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origines autorisées depuis la configuration
        List<String> allowedOrigins = appProperties.security() != null
                && appProperties.security().allowedOrigins() != null
                        ? appProperties.security().allowedOrigins()
                        : List.of("http://localhost:3000");

        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
