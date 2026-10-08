package com.bioconversion.utilisateur.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de changement de mot de passe par l'utilisateur connecté.
 */
@Getter
@Setter
public class MotDePasseUpdateRequest {

    @NotBlank(message = "Le mot de passe actuel est obligatoire")
    private String ancienMotDePasse;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String nouveauMotDePasse;
}
