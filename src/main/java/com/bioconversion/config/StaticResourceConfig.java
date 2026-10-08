package com.bioconversion.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * Mise en cache navigateur des fichiers du frontend.
 *
 * <p>
 * Par défaut Spring Security interdit tout cache, ce qui ferait retélécharger
 * scripts et photos à chaque page sur des connexions lentes. Les fichiers dont le
 * nom porte une empreinte de contenu (scripts et styles Angular) sont immuables ;
 * les images sont gardées une semaine. {@code index.html} reste hors cache pour
 * que chaque déploiement soit pris en compte immédiatement.
 * </p>
 */
@Configuration
@RequiredArgsConstructor
public class StaticResourceConfig implements WebMvcConfigurer {

    private static final CacheControl IMMUABLE = CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable();
    private static final CacheControl UNE_SEMAINE = CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic();

    /** Sous-dossiers d'images et de polices du build Angular. */
    private static final String[] DOSSIERS = { "carousel", "icons", "media" };

    private final WebProperties webProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String[] racines = webProperties.getResources().getStaticLocations();

        registry.addResourceHandler("/*.js", "/*.css")
                .addResourceLocations(racines)
                .setCacheControl(IMMUABLE);

        registry.addResourceHandler("/*.webp", "/*.png", "/*.ico", "/*.svg")
                .addResourceLocations(racines)
                .setCacheControl(UNE_SEMAINE);

        // Un motif « /dossier/** » ne transmet que la fin du chemin : l'emplacement
        // doit donc pointer sur le sous-dossier lui-même.
        for (String dossier : DOSSIERS) {
            String[] emplacements = Arrays.stream(racines)
                    .map(racine -> (racine.endsWith("/") ? racine : racine + "/") + dossier + "/")
                    .toArray(String[]::new);
            registry.addResourceHandler("/" + dossier + "/**")
                    .addResourceLocations(emplacements)
                    .setCacheControl(UNE_SEMAINE);
        }
    }
}
