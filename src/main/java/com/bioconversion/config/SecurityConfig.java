package com.bioconversion.config;

import com.bioconversion.security.JwtAuthenticationFilter;
import com.bioconversion.security.IotApiKeyFilter;
import com.bioconversion.security.BioUserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Configuration Spring Security.
 *
 * <p>
 * <b>Architecture :</b> JWT stateless — aucune session HTTP côté serveur
 * (ADR-002).
 * Toutes les requêtes protégées exigent un header
 * {@code Authorization: Bearer <token>}.
 * </p>
 *
 * <p>
 * <b>Rôles :</b>
 * <ul>
 * <li>{@code ROLE_PRODUCTEUR} — accès aux endpoints IoT et catalogue</li>
 * <li>{@code ROLE_ELEVEUR} — accès aux endpoints marketplace / commandes</li>
 * <li>{@code ROLE_ADMINISTRATEUR} — accès aux endpoints d'administration</li>
 * <li>{@code ROLE_SUPER_ADMINISTRATEUR} — droits étendus (gestion admins, taux
 * commissions)</li>
 * </ul>
 * </p>
 *
 * <p>
 * Seules les routes {@code /api/**} sont protégées : tout le reste correspond au
 * frontend Angular (fichiers statiques et routes de l'application monopage).
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] ADMINS = { "ADMINISTRATEUR", "SUPER_ADMINISTRATEUR" };
    private static final String[] TOUS_LES_ROLES = { "PRODUCTEUR", "ELEVEUR", "ADMINISTRATEUR",
            "SUPER_ADMINISTRATEUR" };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final IotApiKeyFilter iotApiKeyFilter;
    private final BioUserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF désactivé : API REST stateless (ADR-002)
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Politique de session : STATELESS (JWT)
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 401 quand le token est absent/expiré, 403 quand le rôle ne suffit pas :
                // le frontend s'appuie sur cette distinction pour renvoyer vers la connexion.
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint((request, response, ex) -> ecrireErreur(response,
                                HttpStatus.UNAUTHORIZED, "Authentification requise"))
                        .accessDeniedHandler((request, response, ex) -> ecrireErreur(response,
                                HttpStatus.FORBIDDEN, "Accès refusé")))

                // Règles d'autorisation
                .authorizeHttpRequests(auth -> auth

                        // ── Endpoints publics ──────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/register/**",
                                "/api/v1/auth/login")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll()

                        // Webhook Orange Money (callbacks bancaires/opérateurs)
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/paiements/webhook/**")
                        .permitAll()

                        // Swagger / OpenAPI
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()

                        // ── Module A — IoT ─────────────────────────────────
                        // La télémétrie des capteurs est authentifiée par clé d'API (IotApiKeyFilter)
                        .requestMatchers(HttpMethod.POST, "/api/v1/iot/telemetrie").permitAll()
                        .requestMatchers("/api/v1/iot/**")
                        .hasAnyRole("PRODUCTEUR", "ADMINISTRATEUR", "SUPER_ADMINISTRATEUR")

                        // ── Module B — Marketplace ────────────────────────
                        .requestMatchers("/api/v1/marketplace/**")
                        .hasAnyRole(TOUS_LES_ROLES)

                        // ── Module C — Paiement ───────────────────────────
                        .requestMatchers("/api/v1/paiements/**")
                        .hasAnyRole(TOUS_LES_ROLES)
                        .requestMatchers("/api/v1/factures/**")
                        .hasAnyRole(TOUS_LES_ROLES)

                        // ── Module D — Réseau Producteurs ─────────────────
                        .requestMatchers("/api/v1/producteurs/**")
                        .hasAnyRole(TOUS_LES_ROLES)

                        // ── Administration ────────────────────────────────
                        .requestMatchers("/api/v1/admin/**").hasAnyRole(ADMINS)

                        // Toute autre route d'API exige une authentification
                        .requestMatchers("/api/**").authenticated()

                        // Frontend Angular : fichiers statiques et routes de l'application
                        .anyRequest().permitAll())

                // Fournisseur d'authentification DAO
                .authenticationProvider(authenticationProvider())

                // Filtre IoT API key pour les endpoints IoT (avant JWT)
                .addFilterBefore(iotApiKeyFilter, UsernamePasswordAuthenticationFilter.class)

                // Filtre JWT avant le filtre standard d'authentification
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void ecrireErreur(HttpServletResponse response, HttpStatus statut, String message)
            throws IOException {
        response.setStatus(statut.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"status\":" + statut.value()
                + ",\"error\":\"" + statut.getReasonPhrase()
                + "\",\"message\":\"" + message + "\"}");
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * BCrypt avec force 12 (recommandé CDC §4.2).
     * La force 12 offre ~300ms/hash sur hardware moderne — acceptable pour
     * l'inscription/connexion, négligeable pour les autres requêtes.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
