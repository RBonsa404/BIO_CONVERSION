package com.bioconversion.marketplace;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

/**
 * Entité LigneCommande — Module B Marketplace.
 *
 * <p>Représente une ligne d'une {@link Commande}, référençant un {@link Produit}.</p>
 *
 * <p><b>Point clé — prixUnitaireFige :</b> le prix est capturé au moment de la commande.
 * Un changement de prix du produit ne modifie plus l'historique des commandes passées.
 * (Note explicative du diagramme de classes v2.)</p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code calculerSousTotal()} → implémentée ici</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "ligne_commande",
        indexes = {
                @Index(name = "idx_ligne_commande_commande", columnList = "commande_id"),
                @Index(name = "idx_ligne_commande_produit",  columnList = "produit_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idLigne;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    /**
     * Produit commandé (0..* LigneCommande → 1 Produit).
     * TODO Module B : vérifier que produit.quantiteStock >= quantite avant validation.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Positive(message = "La quantité doit être strictement positive")
    @Column(name = "quantite", nullable = false)
    private double quantite;

    /**
     * Prix unitaire figé au moment de la commande.
     * Copié depuis {@link Produit#getPrix()} lors de la création de la ligne.
     * NE PAS le modifier après création.
     */
    @Positive(message = "Le prix unitaire figé doit être strictement positif")
    @Column(name = "prix_unitaire_fige", nullable = false)
    private double prixUnitaireFige;

    /**
     * Calcule le sous-total de cette ligne (quantité × prix figé).
     *
     * @return sous-total en FCFA
     */
    public double calculerSousTotal() {
        return quantite * prixUnitaireFige;
    }
}
