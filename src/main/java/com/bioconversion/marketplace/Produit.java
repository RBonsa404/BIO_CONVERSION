package com.bioconversion.marketplace;

import com.bioconversion.utilisateur.Producteur;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entité Produit — Module B Marketplace.
 *
 * <p>Un produit est publié par un {@link Producteur} (1 → 0..*).
 * Il peut être référencé dans des {@link LigneCommande} par des éleveurs.</p>
 *
 * <p><b>Contraintes de validation (CDC §2.3.1) :</b>
 * <ul>
 *   <li>{@code quantiteStock} ≥ 0 (peut être à 0 si rupture)</li>
 *   <li>{@code prix} > 0</li>
 * </ul>
 * </p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code publier()} → TODO Module B — MarketplaceService.publierProduit()</li>
 *   <li>{@code modifierStock()} → TODO Module B — MarketplaceService.modifierStock()</li>
 *   <li>{@code modifierPrix()} → TODO Module B — MarketplaceService.modifierPrix()</li>
 *   <li>{@code retirer()} → TODO Module B — MarketplaceService.retirerProduit()</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "produit",
        indexes = {
                @Index(name = "idx_produit_producteur",    columnList = "producteur_id"),
                @Index(name = "idx_produit_disponibilite", columnList = "disponibilite")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idProduit;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producteur_id", nullable = false)
    private Producteur producteur;

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(max = 200)
    @Column(name = "nom_produit", nullable = false, length = 200)
    private String nomProduit;

    /**
     * Quantité en stock.
     * TODO Module B : vérifier quantiteStock >= quantite commandée avant validation commande.
     */
    @PositiveOrZero(message = "La quantité en stock ne peut pas être négative")
    @Column(name = "quantite_stock", nullable = false)
    private double quantiteStock;

    @Positive(message = "Le prix doit être strictement positif")
    @Column(name = "prix", nullable = false)
    private double prix;

    /**
     * Type de produit (Larve ou Résidu/Déchet de production) — CDC §2.2.2 & B-MUST-5.
     */
    @NotNull(message = "Le type de produit est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_produit", nullable = false, length = 50)
    @Builder.Default
    private TypeProduit typeProduit = TypeProduit.LARVE;

    @Column(name = "disponibilite", nullable = false)
    private boolean disponibilite = true;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() {
        return idProduit;
    }

    public boolean isEstDisponible() {
        return disponibilite;
    }
}
