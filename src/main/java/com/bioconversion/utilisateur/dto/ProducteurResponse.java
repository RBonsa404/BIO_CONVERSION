package com.bioconversion.utilisateur.dto;

import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.StatutUtilisateur;

import java.time.OffsetDateTime;

public record ProducteurResponse(
        Long id,
        String nom,
        String prenom,
        String nomExploitation,
        double capaciteProduction,
        StatutUtilisateur statut,
        String ville,
        String province,
        OffsetDateTime capaciteDerniereMaj,
        long nombreConsultations
) {
    public static ProducteurResponse from(Producteur producteur) {
        return new ProducteurResponse(
                producteur.getIdUtilisateur(),
                producteur.getNom(),
                producteur.getPrenom(),
                producteur.getNomExploitation(),
                producteur.getCapaciteProduction(),
                producteur.getStatut(),
                producteur.getLocalisation() != null ? producteur.getLocalisation().getVille() : null,
                producteur.getLocalisation() != null ? producteur.getLocalisation().getProvince() : null,
                producteur.getCapaciteDerniereMaj(),
                producteur.getNombreConsultations());
    }
}