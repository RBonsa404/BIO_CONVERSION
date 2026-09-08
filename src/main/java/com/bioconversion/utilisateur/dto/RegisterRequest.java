package com.bioconversion.utilisateur.dto;

import com.bioconversion.common.validation.TelephoneBurkinabe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO d'inscription utilisateur unifié (Producteur / Éleveur).
 */
@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut dépasser 100 caractères")
    private String prenom;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @TelephoneBurkinabe
    private String telephone;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motDePasse;

    @NotNull(message = "Le type de rôle est obligatoire (PRODUCTEUR ou ELEVEUR)")
    private TypeRole typeRole;

    // Métadonnées géographiques optionnelles pour Producteur ou Éleveur
    private Double latitude;
    private Double longitude;
    private String province;
    private String ville;

    public enum TypeRole {
        PRODUCTEUR,
        ELEVEUR
    }
}
