package com.bioconversion.utilisateur.dto;

import com.bioconversion.common.validation.TelephoneBurkinabe;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO d'inscription spécifique pour un Producteur.
 */
@Getter
@Setter
public class ProducteurRegisterRequest {

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

    @NotBlank(message = "Le nom de l'exploitation est obligatoire")
    @Size(max = 200, message = "Le nom de l'exploitation ne peut dépasser 200 caractères")
    private String nomExploitation;

    @NotNull(message = "La capacité de production est obligatoire")
    @PositiveOrZero(message = "La capacité de production doit être positive ou nulle")
    private Double capaciteProduction;

    // Métadonnées géographiques
    private Double latitude;
    private Double longitude;
    @Size(max = 150, message = "La province ne peut dépasser 150 caractères")
    private String province;
    @Size(max = 150, message = "La ville ne peut dépasser 150 caractères")
    private String ville;
}
