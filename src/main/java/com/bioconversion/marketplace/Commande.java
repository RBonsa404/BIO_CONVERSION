package com.bioconversion.marketplace;

import com.bioconversion.paiement.Paiement;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité Commande — Module B Marketplace.
 *
 * <p>Une commande est passée par un {@link Eleveur} auprès d'un {@link Producteur}.
 * Elle contient une ou plusieurs {@link LigneCommande} et est associée à un {@link Paiement}.</p>
 *
 * <p><b>Cardinalités :</b>
 * <ul>
 *   <li>Producteur 1 → 0..* Commande</li>
 *   <li>Eleveur 1 → 0..* Commande</li>
 *   <li>Commande 1 → 1..* LigneCommande</li>
 *   <li>Commande 1 → 1 Paiement</li>
 * </ul>
 * </p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code creerCommande()} → TODO Module B — MarketplaceService.passerCommande()</li>
 *   <li>{@code annulerCommande()} → TODO Module B — délai 12h (use case CDC)</li>
 *   <li>{@code confirmerCommande()} → TODO Module B — par le producteur</li>
 *   <li>{@code calculerMontantTotal()} → TODO Module B — somme des sous-totaux LigneCommande</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "commande",
        indexes = {
                @Index(name = "idx_commande_producteur", columnList = "producteur_id"),
                @Index(name = "idx_commande_eleveur",    columnList = "eleveur_id"),
                @Index(name = "idx_commande_statut",     columnList = "statut")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idCommande;

    @Column(name = "numero_commande", unique = true, length = 50)
    private String numeroCommande;

    public Long getId() {
        return idCommande;
    }

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producteur_id", nullable = false)
    private Producteur producteur;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "eleveur_id", nullable = false)
    private Eleveur eleveur;

    @Column(name = "date_commande", nullable = false)
    private OffsetDateTime dateCommande;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;

    /**
     * Lignes de la commande (1 → 1..*).
     * Constraint : au moins une ligne requise — validation métier dans MarketplaceService.
     * TODO Module B : vérifier stock disponible par ligne avant confirmation.
     */
    @Builder.Default
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneCommande> lignes = new ArrayList<>();

    /**
     * Paiement associé (1 → 1).
     * Le paiement est créé lors de la confirmation ou du passage à la caisse.
     * TODO Module C — lier au PaiementService.
     */
    @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL)
    private Paiement paiement;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (dateCommande == null) {
            dateCommande = OffsetDateTime.now();
        }
        if (numeroCommande == null || numeroCommande.trim().isEmpty()) {
            numeroCommande = genererNumeroCommande();
        }
        if (statut == null) {
            statut = StatutCommande.EN_ATTENTE;
        }
    }

    public static String genererNumeroCommande() {
        return "CMD-" + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE) + "-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public void ajouterLigne(LigneCommande ligne) {
        if (lignes == null) {
            lignes = new ArrayList<>();
        }
        lignes.add(ligne);
        ligne.setCommande(this);
    }

    /**
     * Calcule le montant total de la commande (somme des sous-totaux des lignes).
     * TODO Module B : appeler cette méthode lors de la confirmation pour alimenter Paiement.montant.
     * (Point de vigilance diagramme de classes : éviter saisie libre du montant dans Paiement.)
     *
     * @return montant total en FCFA
     */
    public double calculerMontantTotal() {
        if (lignes == null || lignes.isEmpty()) {
            return 0.0;
        }
        return lignes.stream()
                .mapToDouble(LigneCommande::calculerSousTotal)
                .sum();
    }
}
