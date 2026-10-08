package com.bioconversion.utilisateur.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO de modification du profil de l'utilisateur connecté.
 * Les champs propres à un autre rôle que le sien sont ignorés.
 */
@Getter
@Setter
public class ProfilUpdateRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut dépasser 100 caractères")
    private String prenom;

    // Producteur
    @Size(max = 200, message = "Le nom de l'exploitation ne peut dépasser 200 caractères")
    private String nomExploitation;

    @PositiveOrZero(message = "La capacité de production doit être positive ou nulle")
    private Double capaciteProduction;

    // Éleveur
    @Size(max = 150, message = "Le type d'élevage ne peut dépasser 150 caractères")
    private String typeElevage;

    @Size(max = 500, message = "L'adresse ne peut dépasser 500 caractères")
    private String adresse;

    // Localisation
    @Size(max = 150, message = "La ville ne peut dépasser 150 caractères")
    private String ville;

    @Size(max = 150, message = "La province ne peut dépasser 150 caractères")
    private String province;

    @DecimalMin(value = "-90.0", message = "Latitude invalide")
    @DecimalMax(value = "90.0", message = "Latitude invalide")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude invalide")
    @DecimalMax(value = "180.0", message = "Longitude invalide")
    private Double longitude;
}
