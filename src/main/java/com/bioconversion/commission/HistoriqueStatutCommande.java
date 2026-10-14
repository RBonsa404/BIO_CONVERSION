package com.bioconversion.commission;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Trace d'un changement de statut : date, auteur, montant. Jamais modifiée ni supprimée.
 */
@Entity
@Immutable
@Table(name = "historique_statut_commande")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueStatutCommande {

    public static final String TYPE_COMMANDE = "COMMANDE";
    public static final String TYPE_REGLEMENT = "REGLEMENT";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "commande_id", nullable = false)
    private Long commandeId;

    /** COMMANDE (statut de la commande) ou REGLEMENT (suivi de l'argent). */
    @Column(name = "type_statut", nullable = false, length = 20)
    private String typeStatut;

    @Column(name = "ancien_statut", length = 30)
    private String ancienStatut;

    @Column(name = "nouveau_statut", nullable = false, length = 30)
    private String nouveauStatut;

    @Column(name = "montant", precision = 19, scale = 0)
    private BigDecimal montant;

    /** Utilisateur à l'origine du changement ; vide pour une action automatique. */
    @Column(name = "auteur_id")
    private Long auteurId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
