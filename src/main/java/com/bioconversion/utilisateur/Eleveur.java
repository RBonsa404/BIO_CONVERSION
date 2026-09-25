package com.bioconversion.utilisateur;

import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.Commande;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * Sous-type Eleveur — hérite de {@link Utilisateur} (stratégie JOINED).
 *
 * <p>
 * Table JPA : {@code eleveur}.
 * </p>
 *
 * <p>
 * <b>Relations :</b>
 * <ul>
 * <li>1 → 0..1 {@link Localisation} (OPTIONNELLE — l'éleveur peut consentir
 * au partage de localisation, CDC §2.2.2 + use case "Consentir au
 * partage")</li>
 * <li>1 → 0..* {@link Commande}</li>
 * </ul>
 * </p>
 *
 * <p>
 * <b>Méthodes du diagramme de classes :</b>
 * <ul>
 * <li>{@code rechercherProducteur()} → TODO Module D — réseau producteurs</li>
 * <li>{@code passerCommande()} → TODO Module B — MarketplaceService</li>
 * <li>{@code effectuerPaiement()} → TODO Module C — PaiementService</li>
 * <li>{@code consulterFacture()} → TODO Module C — PaiementService</li>
 * <li>{@code suivreCommande()} → TODO Module B — MarketplaceService</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "eleveur")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("Eleveur")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Eleveur extends Utilisateur {

    @NotBlank(message = "Le type d'élevage est obligatoire")
    @Size(max = 150)
    @Column(name = "type_elevage", nullable = false, length = 150)
    private String typeElevage;

    @Size(max = 500)
    @Column(name = "adresse", length = 500)
    private String adresse;

    /**
     * Localisation GPS de l'éleveur — OPTIONNELLE (cardinalité 0..1 du diagramme).
     * L'éleveur peut consentir au partage via le use case "Consentir au partage de
     * localisation"
     * et le révoquer à tout moment (use case "Révoquer le partage").
     * Null si l'éleveur n'a pas partagé sa localisation.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "localisation_id", nullable = true)
    private Localisation localisation;

    /**
     * Commandes passées par cet éleveur (1 → 0..*).
     * TODO Module B : gérer le cycle de vie des commandes.
     */
    @OneToMany(mappedBy = "eleveur")
    private List<Commande> commandes = new ArrayList<>();

    @Override
    public String getRole() {
        return "ELEVEUR";
    }
}
