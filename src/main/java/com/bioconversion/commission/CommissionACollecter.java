package com.bioconversion.commission;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Commission d'une vente en espèces (à partir de 10 000 F), récupérée par un collecteur
 * de la plateforme auprès du producteur, hors de l'appli.
 */
@Entity
@Table(name = "commission_a_collecter")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionACollecter {

    public enum Statut {
        /** En attente du passage du collecteur. */
        A_COLLECTER,
        /** Récupérée par le collecteur : la commission est entrée dans le fonds. */
        ENCAISSEE,
        /** Commande annulée avant la collecte : rien à récupérer. */
        ANNULEE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "commande_id", nullable = false, unique = true)
    private Long commandeId;

    @Column(name = "producteur_id", nullable = false)
    private Long producteurId;

    @Column(name = "montant", nullable = false, precision = 19, scale = 0)
    private BigDecimal montant;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private Statut statut = Statut.A_COLLECTER;

    @Column(name = "collecteur", length = 150)
    private String collecteur;

    @Column(name = "date_encaissement")
    private OffsetDateTime dateEncaissement;

    /** Administrateur qui a déclaré l'encaissement. */
    @Column(name = "encaissee_par")
    private Long encaisseePar;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
