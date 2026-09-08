package com.bioconversion.utilisateur;

import com.bioconversion.common.validation.TelephoneBurkinabe;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entité racine de la hiérarchie d'utilisateurs — BioConversion.
 *
 * <p>
 * <b>Stratégie d'héritage :</b> {@link InheritanceType#JOINED} — une table
 * {@code utilisateur}
 * pour les champs communs, une table par sous-type ({@code producteur},
 * {@code eleveur},
 * {@code administrateur}). Voir ADR-001.
 * </p>
 *
 * <p>
 * <b>Identifiant :</b> le numéro de téléphone est unique et sert d'identifiant
 * fonctionnel
 * pour l'authentification JWT (cf. CDC §2.3.1).
 * </p>
 *
 * <p>
 * <b>Sécurité :</b> le champ {@code motDePasse} stocke UNIQUEMENT le hash
 * BCrypt.
 * La valeur en clair ne doit jamais être persistée (CDC §4.2).
 * </p>
 *
 * <p>
 * <b>Méthodes du diagramme de classes :</b>
 * <ul>
 * <li>{@code sInscrire()} →
 * {@link com.bioconversion.utilisateur.AuthService#inscrire}</li>
 * <li>{@code seConnecter()} →
 * {@link com.bioconversion.utilisateur.AuthService#connecter}</li>
 * <li>{@code seDeconnecter()} → côté client (JWT stateless, pas de invalidation
 * serveur)</li>
 * <li>{@code modifierProfil()} →
 * {@link com.bioconversion.utilisateur.AuthService#modifierProfil}</li>
 * <li>{@code recupererMotDePasse()} → TODO: implémenter envoi SMS OTP (CDC
 * §2.2.5)</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "utilisateur")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING, length = 32)
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public abstract class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idUtilisateur;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    /**
     * Numéro de téléphone burkinabè — identifiant fonctionnel unique.
     * Format : +226 XX XX XX XX (cf. CDC §2.3.1 et validator
     * {@link TelephoneBurkinabe}).
     */
    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @TelephoneBurkinabe
    @Column(name = "telephone", nullable = false, unique = true, length = 20)
    private String telephone;

    /**
     * Mot de passe haché BCrypt (force 12).
     * NE JAMAIS exposer ce champ dans une réponse HTTP.
     * CDC §4.2 — obligation de hachage irreversible.
     */
    @NotBlank
    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 30)
    private StatutUtilisateur statut = StatutUtilisateur.EN_ATTENTE_VALIDATION;

    /**
     * Chemin vers la pièce d'identité (CNIB) uploadée lors de l'inscription.
     * TODO: brancher un service de stockage sécurisé + OCR (CDC §2.2.4).
     * L'endpoint d'upload est défini dans
     * {@link AuthController#uploadPieceIdentite}.
     */
    @Column(name = "chemin_piece_identite", length = 500)
    private String cheminPieceIdentite;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public Long getId() {
        return idUtilisateur;
    }

    public OffsetDateTime getDateCreation() {
        return createdAt;
    }

    // ─── Méthodes abstraites / utilitaires ─────────────────────────────────

    /**
     * Retourne le rôle Spring Security de cet utilisateur.
     * Implémenté par chaque sous-type pour retourner le nom du rôle
     * sans le préfixe "ROLE_".
     *
     * @return ex. "PRODUCTEUR", "ELEVEUR", "ADMINISTRATEUR"
     */
    public abstract String getRole();
}
