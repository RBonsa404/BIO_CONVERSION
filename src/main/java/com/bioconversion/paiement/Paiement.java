package com.bioconversion.paiement;

import com.bioconversion.marketplace.Commande;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entité Paiement — Module C.
 *
 * <p>Un paiement est associé à exactement une {@link Commande} (1 → 1).
 * Il peut générer une {@link Facture} optionnelle (1 → 0..1).</p>
 *
 * <p><b>Point de vigilance (note diagramme de classes) :</b>
 * Le montant du paiement doit être aligné sur {@link Commande#calculerMontantTotal()}.
 * TODO Module C : recalculer systématiquement plutôt qu'autoriser une saisie libre.</p>
 *
 * <p><b>Opérateurs supportés (use case CDC) :</b> Orange Money, espèces.</p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code effectuerPaiement()} → TODO Module C — PaiementService + OrangeMoneyClientStub</li>
 *   <li>{@code confirmerPaiement()} → TODO Module C — callback webhook Orange Money</li>
 *   <li>{@code annulerPaiement()} → TODO Module C — PaiementService</li>
 *   <li>{@code retirerSolde()} → TODO Module C — use case "Demander un retrait de solde"</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "paiement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idPaiement;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commande_id", nullable = false, unique = true)
    private Commande commande;

    /**
     * Montant en FCFA.
     * TODO Module C : forcer montant = commande.calculerMontantTotal() — ne pas permettre saisie libre.
     */
    @Positive(message = "Le montant du paiement doit être strictement positif")
    @Column(name = "montant", nullable = false)
    private double montant;

    /**
     * Opérateur de paiement : "ORANGE_MONEY" ou "ESPECES".
     * TODO Module C : utiliser un enum OperateurPaiement à la place du String.
     */
    @NotBlank
    @Column(name = "operateur", nullable = false, length = 100)
    private String operateur;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    /** Référence de transaction retournée par l'API Orange Money. */
    @Column(name = "reference_transaction", length = 255)
    private String referenceTransaction;

    @Column(name = "date_paiement", nullable = false)
    private OffsetDateTime datePaiement;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_paiement", nullable = false, length = 20)
    private StatutPaiement statutPaiement = StatutPaiement.EN_ATTENTE;

    /**
     * Facture générée après confirmation du paiement (0..1).
     * TODO Module C : générer automatiquement lors du passage à CONFIRME.
     */
    @OneToOne(mappedBy = "paiement", cascade = CascadeType.ALL, orphanRemoval = true)
    private Facture facture;
        /**
     * C-MUST-1 : initie la transaction auprès de l'opérateur avant validation de la commande.
     * TODO Module C : intégration API Orange Money — SIMULÉE pour l'instant.
     */
    public void effectuerPaiement() {
        this.datePaiement = OffsetDateTime.now();
        this.statutPaiement = StatutPaiement.EN_ATTENTE;
    }

    /**
     * C-MUST-2/C-MUST-3 : appelée par le webhook de confirmation de l'opérateur.
     */
    public void confirmerPaiement(String referenceTransactionOperateur) {
        this.referenceTransaction = referenceTransactionOperateur;
        this.datePaiement = OffsetDateTime.now();
        this.statutPaiement = StatutPaiement.CONFIRME;
    }

    /**
     * Cas limite CDC 2.3.2 : échec ou expiration de la transaction Orange Money.
     */
    public void annulerPaiement() {
        this.statutPaiement = StatutPaiement.ECHOUE;
    }

    public Long getId() {
        return idPaiement;
    }
}
