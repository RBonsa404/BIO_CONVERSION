package com.bioconversion.utilisateur.dto;

import com.bioconversion.geo.Localisation;
import com.bioconversion.utilisateur.*;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

/**
 * DTO de réponse présentant le profil utilisateur sans mot de passe ni données sensibles.
 */
@Getter
@Builder
public class UtilisateurResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String telephone;
    private String role;
    private StatutUtilisateur statut;
    private OffsetDateTime dateCreation;

    // Champs spécifiques optionnels
    private String matricule;        // Administrateur
    private Double latitude;
    private Double longitude;
    private String nomExploitation;  // Producteur
    private Double capaciteProduction;
    private String typeElevage;      // Éleveur
    private String adresse;
    private String ville;
    private String province;

    public static UtilisateurResponse from(Utilisateur utilisateur) {
        UtilisateurResponseBuilder builder = UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .telephone(utilisateur.getTelephone())
                .role(utilisateur.getRole())
                .statut(utilisateur.getStatut())
                .dateCreation(utilisateur.getDateCreation());

        if (utilisateur instanceof Producteur p) {
            builder.nomExploitation(p.getNomExploitation())
                    .capaciteProduction(p.getCapaciteProduction());
            localiser(builder, p.getLocalisation());
        } else if (utilisateur instanceof Eleveur e) {
            builder.typeElevage(e.getTypeElevage())
                    .adresse(e.getAdresse());
            localiser(builder, e.getLocalisation());
        } else if (utilisateur instanceof Administrateur a) {
            builder.matricule(a.getMatricule());
        }

        return builder.build();
    }

    private static void localiser(UtilisateurResponseBuilder builder, Localisation localisation) {
        if (localisation == null) {
            return;
        }
        builder.latitude(localisation.getLatitude())
                .longitude(localisation.getLongitude())
                .ville(localisation.getVille())
                .province(localisation.getProvince());
    }
}
