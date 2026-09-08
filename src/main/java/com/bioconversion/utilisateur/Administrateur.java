package com.bioconversion.utilisateur;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Sous-type Administrateur — hérite de {@link Utilisateur} (stratégie JOINED).
 *
 * <p>
 * Table JPA : {@code administrateur}.
 * </p>
 *
 * <p>
 * <b>Note sur SuperAdministrateur :</b> le diagramme de cas d'utilisation
 * introduit
 * un acteur {@code SuperAdministrateur} absent du diagramme de classes. Choix
 * technique
 * documenté : modélisé comme un booléen {@code superAdmin} sur cette entité
 * plutôt que
 * comme une sous-classe, pour éviter un niveau d'héritage supplémentaire.
 * Le rôle Spring Security retourné est conditionné par ce booléen.
 * </p>
 *
 * <p>
 * <b>Règle métier :</b> l'administrateur n'est PAS auto-inscriptible (CDC
 * §2.2.3).
 * L'endpoint d'inscription ne doit pas accepter le type "ADMINISTRATEUR".
 * Les comptes admins sont créés manuellement ou via le SuperAdministrateur.
 * </p>
 *
 * <p>
 * <b>Méthodes du diagramme de classes :</b>
 * <ul>
 * <li>{@code validerProducteur()} → TODO Module D — réseau producteurs</li>
 * <li>{@code suspendreCompte()} → TODO Module D — gestion comptes</li>
 * <li>{@code debloquerCompte()} → TODO Module D — gestion comptes</li>
 * <li>{@code consulterStatistiques()} → TODO Module D — dashboard admin</li>
 * <li>{@code traiterLitige()} → TODO Module B — gestion litiges</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "administrateur")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("Administrateur")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Administrateur extends Utilisateur {

    @NotBlank(message = "Le matricule est obligatoire")
    @Size(max = 50)
    @Column(name = "matricule", nullable = false, unique = true, length = 50)
    private String matricule;

    /**
     * Indique si cet administrateur dispose des droits Super-Administrateur.
     * Le SuperAdmin peut gérer d'autres administrateurs et définir les taux de
     * commission.
     */
    @Column(name = "super_admin", nullable = false)
    private boolean superAdmin = false;

    /**
     * Retourne "SUPER_ADMINISTRATEUR" si superAdmin, sinon "ADMINISTRATEUR".
     */
    @Override
    public String getRole() {
        return superAdmin ? "SUPER_ADMINISTRATEUR" : "ADMINISTRATEUR";
    }
}
