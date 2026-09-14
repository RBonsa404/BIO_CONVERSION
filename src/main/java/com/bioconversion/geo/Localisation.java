package com.bioconversion.geo;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entité Localisation — référentiel géographique partagé.
 *
 * <p>
 * Utilisée par :
 * <ul>
 * <li>{@link com.bioconversion.utilisateur.Producteur} : relation 1..1
 * (OBLIGATOIRE)</li>
 * <li>{@link com.bioconversion.utilisateur.Eleveur} : relation 0..1
 * (OPTIONNELLE)</li>
 * </ul>
 * </p>
 *
 * <p>
 * <b>Modélisation :</b> une seule table {@code localisation} avec les colonnes
 * {@code ville} et {@code province} nullable (utilisées uniquement pour les
 * producteurs).
 * Voir ADR-001 et {@code docs/DIAGRAMME_CLASSES.md} — entités 10a / 10b.
 * </p>
 *
 * <p>
 * <b>Méthodes du diagramme de classes :</b>
 * <ul>
 * <li>{@code obtenirPosition()} → accessible via les getters
 * latitude/longitude</li>
 * <li>{@code calculerDistance()} → TODO Module D : implémenter formule
 * Haversine</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "localisation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Localisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idLocalisation;

    @NotNull(message = "La latitude est obligatoire")
    @DecimalMin(value = "-90.0", message = "Latitude invalide (min -90)")
    @DecimalMax(value = "90.0", message = "Latitude invalide (max 90)")
    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @NotNull(message = "La longitude est obligatoire")
    @DecimalMin(value = "-180.0", message = "Longitude invalide (min -180)")
    @DecimalMax(value = "180.0", message = "Longitude invalide (max 180)")
    @Column(name = "longitude", nullable = false)
    private Double longitude;

    /**
     * Ville — fourni pour les localisations de Producteur (entité 10a du
     * diagramme).
     * Null acceptable pour les localisations d'Eleveur (entité 10b).
     */
    @Size(max = 150)
    @Column(name = "ville", length = 150)
    private String ville;

    /**
     * Province — fourni pour les localisations de Producteur (entité 10a du
     * diagramme).
     * Null acceptable pour les localisations d'Eleveur (entité 10b).
     */
    @Size(max = 150)
    @Column(name = "province", length = 150)
    private String province;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    // ─── Méthode utilitaire ────────────────────────────────────────────────

    /**
     * Calcule la distance en kilomètres entre deux localisations (formule
     * Haversine).
     * TODO Module D : implémenter et tester cette méthode.
     *
     * @param autre l'autre localisation
     * @return distance en km
     */
    /**
 * Calcule la distance en kilomètres entre deux localisations (formule Haversine).
 * Implémentation Module B — OUATTARA Chaïda (cf. document de dispatch §2.1).
 *
 * @param autre l'autre localisation
 * @return distance en kilomètres
 */
public double calculerDistance(Localisation autre) {
        final double RAYON_TERRE_KM = 6371.0;

        double lat1 = Math.toRadians(this.latitude);
        double lat2 = Math.toRadians(autre.latitude);
        double deltaLat = Math.toRadians(autre.latitude - this.latitude);
        double deltaLon = Math.toRadians(autre.longitude - this.longitude);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return RAYON_TERRE_KM * c;
    }

    final double RAYON_TERRE_KM = 6371.0;

    double lat1Rad = Math.toRadians(this.latitude);
    double lat2Rad = Math.toRadians(autre.latitude);
    double deltaLat = Math.toRadians(autre.latitude - this.latitude);
    double deltaLon = Math.toRadians(autre.longitude - this.longitude);

    double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
            + Math.cos(lat1Rad) * Math.cos(lat2Rad)
            * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RAYON_TERRE_KM * c;

    }
}
