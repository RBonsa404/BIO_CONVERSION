package com.bioconversion.utilisateur.dto;

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
    private Boolean estValide;       // Producteur
    private String matricule;        // Administrateur
    private Double latitude;
    private Double longitude;

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
            builder.estValide(p.getEstValide());
            if (p.getLocalisation() != null) {
                builder.latitude(p.getLocalisation().getLatitude());
                builder.longitude(p.getLocalisation().getLongitude());
            }
        } else if (utilisateur instanceof Eleveur e && e.getLocalisation() != null) {
            builder.latitude(e.getLocalisation().getLatitude());
            builder.longitude(e.getLocalisation().getLongitude());
        } else if (utilisateur instanceof Administrateur a) {
            builder.matricule(a.getMatricule());
        }

        return builder.build();
    }
}
