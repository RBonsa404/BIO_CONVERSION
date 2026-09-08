package com.bioconversion.utilisateur.dto;

import com.bioconversion.common.validation.TelephoneBurkinabe;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de requête d'authentification (connexion par téléphone + mot de passe).
 */
@Getter
@Setter
public class AuthRequest {

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @TelephoneBurkinabe
    private String telephone;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
