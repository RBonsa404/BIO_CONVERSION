package com.bioconversion.utilisateur;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("producteurSecurity")
@RequiredArgsConstructor
public class ProducteurSecurity {

    private final ProducteurRepository producteurRepository;

    public boolean estProprietaire(Long producteurId, Authentication authentication) {
        String telephoneConnecte = authentication.getName();
        return producteurRepository.findById(producteurId)
                .map(p -> p.getTelephone().equals(telephoneConnecte))
                .orElse(false);
    }
}