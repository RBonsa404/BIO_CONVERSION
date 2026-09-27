package com.bioconversion.security;

import com.bioconversion.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for API key authentication on IoT endpoints.
 * Distinct from JWT authentication used for human users.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IotApiKeyFilter extends OncePerRequestFilter {

    private final AppProperties appProperties;

    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String TELEMETRIE_PATH = "/api/v1/iot/telemetrie";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !"POST".equals(request.getMethod()) || !TELEMETRIE_PATH.equals(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI().substring(request.getContextPath().length());

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("IoT request without API key: {}", path);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\":\"API key is required\"}");
            return;
        }

        String expectedApiKey = appProperties.iot().apiKey();

        if (!apiKey.equals(expectedApiKey)) {
            log.warn("IoT request with invalid API key: {}", path);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\":\"Invalid API key\"}");
            return;
        }

        log.debug("IoT request authenticated with API key: {}", path);
        filterChain.doFilter(request, response);
    }
}
