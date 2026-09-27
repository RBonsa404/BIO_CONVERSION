package com.bioconversion.config;

import com.bioconversion.security.JwtAuthenticationFilter;
import com.bioconversion.security.IotApiKeyFilter;
import com.bioconversion.security.BioUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final IotApiKeyFilter iotApiKeyFilter;
    private final BioUserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF désactivé : API REST stateless (ADR-002)
                .csrf(AbstractHttpConfigurer::disable)

                // CORS activé avec configuration source
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Politique de session : STATELESS (JWT)
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Règles d'autorisation
                .authorizeHttpRequests(auth -> auth

                        // ── Endpoints publics ──────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/register/**",
                                "/api/v1/auth/login")
                        .permitAll()

                        // ── Endpoints protégés par authentification ────────
                        .requestMatchers("/api/v1/auth/**").authenticated()

                        // ── Endpoints IoT (producteurs + API key) ───────────
                        .requestMatchers("/api/v1/iot/**").hasRole("PRODUCTEUR")

                        // ── Endpoints marketplace ( éleveurs) ───────────────
                        .requestMatchers("/api/v1/marketplace/**").hasRole("ELEVEUR")
                        .requestMatchers("/api/v1/commandes/**").hasRole("ELEVEUR")

                        // ── Endpoints producteurs (produits, commandes) ──────
                        .requestMatchers("/api/v1/producteurs/**").hasRole("PRODUCTEUR")

                        // ── Endpoints paiement ──────────────────────────────
                        .requestMatchers("/api/v1/paiements/**").hasRole("ELEVEUR")

                        // ── Endpoints admin ──────────────────────────────────
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRATEUR")

                        // ── Tout le reste : authentification requise ───────────
                        .anyRequest().authenticated())

                // Fournisseur d'authentification DAO
                .authenticationProvider(authenticationProvider())

                // Filtre IoT API key pour les endpoints IoT (avant JWT)
                .addFilterBefore(iotApiKeyFilter, UsernamePasswordAuthenticationFilter.class)

                // Filtre JWT avant le filtre standard d'authentification
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
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
