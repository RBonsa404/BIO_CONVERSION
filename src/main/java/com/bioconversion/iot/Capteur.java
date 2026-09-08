package com.bioconversion.iot;

import com.bioconversion.utilisateur.Producteur;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité Capteur — Module A IoT.
 *
 * <p>Un capteur est rattaché à un {@link Producteur} (cardinalité 1 → 1..*).
 * Il mesure la température et l'humidité de la serre et peut générer des {@link AlerteIoT}.</p>
 *
 * <p><b>Contraintes de validation (CDC §2.3.1) :</b>
 * <ul>
 *   <li>Température : [-10 ; 60]°C — seuil d'alerte : [25 ; 39]°C (vérification métier Module A)</li>
 *   <li>Humidité : [0 ; 100]%</li>
 * </ul>
 * </p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code mesurerTemperature()} → TODO Module A — CapteurService</li>
 *   <li>{@code mesurerHumidite()} → TODO Module A — CapteurService</li>
 *   <li>{@code envoyerDonnees()} → TODO Module A — CapteurService (endpoint IoT push)</li>
 *   <li>{@code detecterAnomalie()} → TODO Module A — CapteurService (logique seuil d'alerte)</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "capteur",
        indexes = @Index(name = "idx_capteur_producteur", columnList = "producteur_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Capteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idCapteur;

    @NotNull(message = "Le producteur propriétaire est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producteur_id", nullable = false)
    private Producteur producteur;

    @NotBlank(message = "Le code identifiant du capteur est obligatoire")
    @Column(name = "code_identifiant", nullable = false, unique = true, length = 100)
    private String codeIdentifiant;

    @NotBlank(message = "Le type de capteur est obligatoire")
    @Size(max = 100)
    @Column(name = "type_capteur", nullable = false, length = 100)
    private String typeCapteur;

    @Column(name = "est_actif", nullable = false)
    private boolean estActif = true;

    /**
     * Température mesurée en °C.
     * Contrainte Bean Validation : [-10 ; 60].
     * Seuil d'alerte [25 ; 39] géré par logique métier dans le service (TODO Module A).
     */
    @DecimalMin(value = "-10.0", message = "Température hors limite inférieure (-10°C)")
    @DecimalMax(value = "60.0",  message = "Température hors limite supérieure (60°C)")
    @Column(name = "temperature")
    private Double temperature;

    /**
     * Humidité relative en %.
     * Contrainte Bean Validation : [0 ; 100].
     */
    @DecimalMin(value = "0.0",   message = "Humidité ne peut pas être négative")
    @DecimalMax(value = "100.0", message = "Humidité ne peut pas dépasser 100%")
    @Column(name = "humidite")
    private Double humidite;

    @Column(name = "date_mesure")
    private OffsetDateTime dateMesure;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Alertes générées par ce capteur (1 → 0..*).
     * TODO Module A : implémenter détection d'anomalie et génération d'alerte.
     */
    public Long getId() {
        return idCapteur;
    }
}
