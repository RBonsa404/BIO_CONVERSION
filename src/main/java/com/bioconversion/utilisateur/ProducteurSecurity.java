package com.bioconversion.utilisateur;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Vérifie qu'un producteur n'agit que sur sa propre fiche.
 *
 * <p>
 * Depuis la mise à jour du filtre JWT, le « nom » de l'utilisateur connecté
 * ({@code authentication.getName()}) est son identifiant, et non plus son téléphone.
 * </p>
 */
@Component("producteurSecurity")
@RequiredArgsConstructor
public class ProducteurSecurity {

    private final ProducteurRepository producteurRepository;

    public boolean estProprietaire(Long producteurId, Authentication authentication) {
        if (producteurId == null || authentication == null) {
            return false;
        }
        String idConnecte = authentication.getName();
        return String.valueOf(producteurId).equals(idConnecte)
                && producteurRepository.existsById(producteurId);
    }
}