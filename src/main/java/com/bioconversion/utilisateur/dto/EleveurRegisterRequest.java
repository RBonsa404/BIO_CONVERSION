package com.bioconversion.utilisateur.dto;

import com.bioconversion.common.validation.TelephoneBurkinabe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO d'inscription spécifique pour un Éleveur.
 */
@Getter
@Setter
public class EleveurRegisterRequest {

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

    @NotBlank(message = "Le type d'élevage est obligatoire")
    @Size(max = 150, message = "Le type d'élevage ne peut dépasser 150 caractères")
    private String typeElevage;

    @Size(max = 500, message = "L'adresse ne peut dépasser 500 caractères")
    private String adresse;

    // Métadonnées géographiques optionnelles
    private Double latitude;
    private Double longitude;
    @Size(max = 150, message = "La province ne peut dépasser 150 caractères")
    private String province;
    @Size(max = 150, message = "La ville ne peut dépasser 150 caractères")
    private String ville;
}
