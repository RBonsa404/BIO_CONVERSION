package com.bioconversion.paiement;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entité Facture — Module C.
 *
 * <p>Une facture est générée après confirmation d'un {@link Paiement} (0..1).
 * Elle peut être téléchargée en PDF par l'éleveur.</p>
 *
 * <p><b>Méthodes du diagramme de classes :</b>
 * <ul>
 *   <li>{@code genererPDF()} → TODO Module C — librairie iText ou JasperReports</li>
 *   <li>{@code telecharger()} → TODO Module C — endpoint download + stockage</li>
 *   <li>{@code imprimer()} → TODO Module C — génération format imprimable</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "facture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idFacture;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paiement_id", nullable = false, unique = true)
    private Paiement paiement;

    @Column(name = "date_facture", nullable = false)
    private OffsetDateTime dateFacture;

    @Positive(message = "Le montant de la facture doit être strictement positif")
    @Column(name = "montant", nullable = false)
    private double montant;

    @NotBlank
    @Column(name = "reference", nullable = false, unique = true, length = 255)
    private String reference;

    /**
     * Chemin vers le fichier PDF généré.
     * TODO Module C : renseigner après appel à genererPDF().
     * TODO Module C : brancher un service de stockage (FileSystem local ou S3-compatible).
     */
    @Column(name = "chemin_pdf", length = 500)
    private String cheminPdf;

    public Long getId() {
        return idFacture;
    }
}
