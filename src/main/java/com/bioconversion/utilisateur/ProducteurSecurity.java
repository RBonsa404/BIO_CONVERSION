package com.bioconversion.utilisateur;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

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