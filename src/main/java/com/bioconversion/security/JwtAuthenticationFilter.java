package com.bioconversion.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre Spring Security exécuté une seule fois par requête.
 *
 * <p>
 * Extrait le token JWT de l'en-tête {@code Authorization: Bearer <token>},
 * le valide, charge les détails utilisateur et peuple le
 * {@link SecurityContextHolder}.
 * </p>
 *
 * <p>
 * En cas de token absent ou invalide, la requête continue sans authentification
 * (le contrôle d'accès sur l'endpoint protégé retournera alors 401).
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final BioUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractToken(request);

            if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
                String telephone = tokenProvider.getTelephoneFromToken(token);

                UserDetails userDetails = userDetailsService.loadUserByUsername(telephone);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("Utilisateur authentifié via JWT : {}", telephone);
            }

        } catch (Exception e) {
            log.error("Impossible de définir l'authentification depuis le JWT : {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrait le token Bearer de l'en-tête Authorization.
     *
     * @param request la requête HTTP
     * @return le token sans le préfixe "Bearer ", ou {@code null} si absent
     */
    private String extractToken(HttpServletRequest request) {
        String headerValue = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(headerValue) && headerValue.startsWith(BEARER_PREFIX)) {
            return headerValue.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
