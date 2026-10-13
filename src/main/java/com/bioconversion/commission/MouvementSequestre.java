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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Ligne du registre du séquestre. Une ligne n'est jamais modifiée ni supprimée
 * (@Immutable côté Java, déclencheur côté base) : une erreur se corrige par une ligne inverse.
 */
@Entity
@Immutable
@Table(name = "registre_sequestre")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MouvementSequestre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "commande_id", nullable = false)
    private Long commandeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_mouvement", nullable = false, length = 30)
    private TypeMouvementSequestre typeMouvement;

    /** Positif pour une entrée, négatif pour une sortie. */
    @Column(name = "montant", nullable = false, precision = 19, scale = 0)
    private BigDecimal montant;

    @Column(name = "libelle", length = 255)
    private String libelle;

    @Column(name = "reference_transaction", length = 255)
    private String referenceTransaction;

    @Column(name = "auteur_id")
    private Long auteurId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}