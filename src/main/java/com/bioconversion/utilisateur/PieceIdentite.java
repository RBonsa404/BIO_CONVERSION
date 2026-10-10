package com.bioconversion.utilisateur;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Pièce d'identité (CNIB) déposée à l'inscription d'un producteur (CDC §2.2.4).
 *
 * <p>Table séparée de {@code utilisateur} : le fichier (jusqu'à 5 Mo) n'est chargé que
 * lorsqu'un administrateur le consulte, jamais lors des lectures courantes d'un compte.
 * Donnée personnelle : elle n'apparaît dans aucune réponse publique.</p>
 */
@Entity
@Table(name = "piece_identite")
@Getter
@Setter
@NoArgsConstructor
public class PieceIdentite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "utilisateur_id", nullable = false, unique = true)
    private Long utilisateurId;

    /** Type détecté à partir du contenu du fichier : image/jpeg, image/png ou application/pdf. */
    @Column(name = "type_contenu", nullable = false, length = 100)
    private String typeContenu;

    @Column(name = "nom_fichier", length = 255)
    private String nomFichier;

    @Column(name = "contenu", nullable = false, length = 6_000_000)
    private byte[] contenu;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}