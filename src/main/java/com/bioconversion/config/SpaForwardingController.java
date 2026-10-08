package com.bioconversion.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Renvoie les routes de l'application Angular (ex. {@code /marketplace},
 * {@code /producteur/12}) vers {@code index.html} : sans cela, un rechargement de
 * page ou un lien direct répondrait 404 puisque ces chemins n'existent que côté
 * navigateur.
 *
 * <p>
 * Seuls les chemins sans extension sont concernés, pour ne pas masquer un fichier
 * statique manquant. Les routes {@code /api}, Swagger et OpenAPI gardent leurs
 * propres contrôleurs.
 * </p>
 */
@Controller
public class SpaForwardingController {

    @GetMapping({
            "/{a:^(?!api$|v3$|swagger-ui$)[^.]*$}",
            "/{a:^(?!api$|v3$|swagger-ui$)[^.]*$}/{b:[^.]*}",
            "/{a:^(?!api$|v3$|swagger-ui$)[^.]*$}/{b:[^.]*}/{c:[^.]*}"
    })
    public String versApplication() {
        return "forward:/index.html";
    }
}
