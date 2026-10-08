package com.bioconversion.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Traduit la variable {@code DATABASE_URL} fournie par les hébergeurs (Railway,
 * Render, Heroku) — {@code postgresql://user:motdepasse@hote:5432/base} — en
 * propriétés {@code spring.datasource.*}, que le pilote JDBC ne sait pas lire
 * sous cette forme.
 *
 * <p>
 * Une valeur explicite de {@code SPRING_DATASOURCE_URL} reste prioritaire.
 * </p>
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    static final String SOURCE = "databaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()
                || environment.getProperty("SPRING_DATASOURCE_URL") != null) {
            return;
        }
        Map<String, Object> proprietes = convertir(databaseUrl.trim());
        if (!proprietes.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(SOURCE, proprietes));
        }
    }

    static Map<String, Object> convertir(String databaseUrl) {
        Map<String, Object> proprietes = new HashMap<>();
        if (databaseUrl.startsWith("jdbc:")) {
            proprietes.put("spring.datasource.url", databaseUrl);
            return proprietes;
        }
        if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
            return proprietes;
        }

        URI uri = URI.create(databaseUrl);
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(uri.getHost());
        if (uri.getPort() > 0) {
            jdbcUrl.append(':').append(uri.getPort());
        }
        jdbcUrl.append(uri.getRawPath() != null ? uri.getRawPath() : "");
        if (uri.getRawQuery() != null) {
            jdbcUrl.append('?').append(uri.getRawQuery());
        }
        proprietes.put("spring.datasource.url", jdbcUrl.toString());

        String userInfo = uri.getRawUserInfo();
        if (userInfo != null) {
            int separateur = userInfo.indexOf(':');
            String utilisateur = separateur >= 0 ? userInfo.substring(0, separateur) : userInfo;
            proprietes.put("spring.datasource.username", URLDecoder.decode(utilisateur, StandardCharsets.UTF_8));
            if (separateur >= 0) {
                proprietes.put("spring.datasource.password",
                        URLDecoder.decode(userInfo.substring(separateur + 1), StandardCharsets.UTF_8));
            }
        }
        return proprietes;
    }
}
