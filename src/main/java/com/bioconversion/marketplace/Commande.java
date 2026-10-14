package com.bioconversion.marketplace;

import com.bioconversion.commission.StatutReglement;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.math.BigDecimal;
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
 *
 * <p><b>Module commission :</b> le taux et les montants (commission, net producteur) sont figés
 * à la création ; un changement de paramètre ne touche jamais une commande existante. Les
 * changements de statut sont publiés comme événements ({@link StatutCommandeChangeEvent}) lors
 * de l'enregistrement par le repository, dans la même transaction.</p>
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
public class Commande extends AbstractAggregateRoot<Commande> {

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

    /** Taux de commission en vigueur à la création de la commande (ex. 0.0500). */
    @Column(name = "taux_commission", precision = 5, scale = 4)
    private BigDecimal tauxCommission;

    /** Commission de la plateforme, payée par le producteur (F CFA entiers). */
    @Column(name = "montant_commission", precision = 19, scale = 0)
    private BigDecimal montantCommission;

    /** Ce que reçoit le producteur : montant total - commission (F CFA entiers). */
    @Column(name = "montant_net_producteur", precision = 19, scale = 0)
    private BigDecimal montantNetProducteur;

    /** Suivi de l'argent, séparé du statut de la commande (null tant qu'aucun paiement n'est confirmé). */
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_reglement", length = 30)
    private StatutReglement statutReglement;

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
        // Publié par le repository après l'insertion : le module commission fige alors les montants
        registerEvent(new CommandeCreeeEvent(this));
    }

    /**
     * Change le statut et publie l'événement correspondant (au prochain enregistrement par le repository).
     * Remplace le setter généré par Lombok.
     */
    public void setStatut(StatutCommande nouveauStatut) {
        StatutCommande ancien = this.statut;
        this.statut = nouveauStatut;
        if (idCommande != null && ancien != null && ancien != nouveauStatut) {
            registerEvent(new StatutCommandeChangeEvent(this, ancien, nouveauStatut));
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
    public BigDecimal calculerMontantTotal() {
        if (lignes == null || lignes.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return lignes.stream()
                .map(LigneCommande::calculerSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
