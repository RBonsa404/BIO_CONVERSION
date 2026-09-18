package com.bioconversion.utilisateur;

import com.bioconversion.geo.Localisation;
import com.bioconversion.iot.Capteur;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.Produit;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * Sous-type Producteur — hérite de {@link Utilisateur} (stratégie JOINED).
 *
 * <p>
 * Table JPA : {@code producteur}.
 * </p>
 *
 * <p>
 * <b>Relations :</b>
 * <ul>
 * <li>1 → 1..* {@link Capteur} (au moins un capteur par exploitation)</li>
 * <li>1 → 1 {@link Localisation} (obligatoire — null interdit)</li>
 * <li>1 → 0..* {@link Produit}</li>
 * <li>1 → 0..* {@link Commande}</li>
 * </ul>
 * </p>
 *
 * <p>
 * <b>Méthodes du diagramme de classes :</b>
 * <ul>
 * <li>{@code ajouterProduit()} → TODO Module B — MarketplaceService</li>
 * <li>{@code modifierProduit()} → TODO Module B — MarketplaceService</li>
 * <li>{@code supprimerProduit()} → TODO Module B — MarketplaceService</li>
 * <li>{@code validerCommande()} → TODO Module B — MarketplaceService</li>
 * <li>{@code refuserCommande()} → TODO Module B — MarketplaceService</li>
 * <li>{@code consulterAlertes()} → TODO Module A — CapteurService</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "producteur")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("Producteur")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Producteur extends Utilisateur {

    @NotBlank(message = "Le nom de l'exploitation est obligatoire")
    @Size(max = 200)
    @Column(name = "nom_exploitation", nullable = false, length = 200)
    private String nomExploitation;

    @PositiveOrZero(message = "La capacité de production doit être positive ou nulle")
    @Column(name = "capacite_production", nullable = false)
    private double capaciteProduction;

    /**
     * Indique si le compte producteur a été validé par un administrateur (CDC
     * §2.2.1).
     * Un compte non validé ne peut pas publier de produits.
     */
    @Column(name = "compte_valide", nullable = false)
    private boolean compteValide = false;

    /**
     * Localisation de l'exploitation — OBLIGATOIRE (cardinalité 1..1 du diagramme).
     * Contrôle côté DB : colonne {@code localisation_id NOT NULL} dans
     * {@code producteur}.
     */
    @NotNull(message = "La localisation du producteur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "localisation_id", nullable = false)
    private Localisation localisation;

    /**
     * Capteurs IoT de l'exploitation (1 → 1..*).
     * TODO Module A : s'assurer qu'au moins un capteur existe avant activation IoT.
     */
    @OneToMany(mappedBy = "producteur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Capteur> capteurs = new ArrayList<>();

    /**
     * Catalogue de produits du producteur (1 → 0..*).
     * TODO Module B : gérer la publication/retrait.
     */
    @OneToMany(mappedBy = "producteur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produit> produits = new ArrayList<>();

    /**
     * Commandes reçues par ce producteur (1 → 0..*).
     * TODO Module B : gérer validation/refus.
     */
    @OneToMany(mappedBy = "producteur")
    private List<Commande> commandes = new ArrayList<>();

    public Boolean getEstValide() {
        return compteValide;
    }

    public void setEstValide(boolean estValide) {
        this.compteValide = estValide;
    }

    @Override
    public String getRole() {
        return "PRODUCTEUR";
    }
}
