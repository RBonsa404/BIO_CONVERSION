package com.bioconversion.iot;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Entité AlerteIoT — Module A IoT.
 *
 * <p>Une alerte est générée par un {@link Capteur} lorsque les mesures dépassent
 * les seuils configurés (CDC §2.3.1 : température seuil [25 ; 39]°C).</p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code genererAlerte()} → TODO Module A — CapteurService.detecterAnomalie()</li>
 *   <li>{@code envoyerNotification()} → TODO Module A — brancher passerelle SMS (CDC §2.3.3)</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "alerte_iot",
        indexes = @Index(name = "idx_alerte_capteur", columnList = "capteur_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlerteIoT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idAlerte;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "capteur_id", nullable = false)
    private Capteur capteur;

    @NotBlank(message = "Le type d'alerte est obligatoire")
    @Size(max = 100)
    @Column(name = "type_alerte", nullable = false, length = 100)
    private String typeAlerte;

    @NotBlank(message = "Le message d'alerte est obligatoire")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @NotNull
    @Column(name = "date_alerte", nullable = false)
    private OffsetDateTime dateAlerte;

    /**
     * Valeur du seuil déclencheur (ex. 39.0 pour la température).
     * TODO Module A : lier au seuil configuré par le producteur (use case "Paramétrer un seuil d'alerte").
     */
    @Column(name = "seuil", nullable = false)
    private double seuil;
}
