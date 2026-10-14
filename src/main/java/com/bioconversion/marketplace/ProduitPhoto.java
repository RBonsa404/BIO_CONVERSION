package com.bioconversion.marketplace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Photo d'un produit du catalogue.
 *
 * <p>Table séparée de {@code produit} : l'image n'est chargée que lorsqu'on affiche la photo,
 * jamais lors des lectures courantes du catalogue. Une seule photo par produit
 * (la clé est l'identifiant du produit).</p>
 */
@Entity
@Table(name = "produit_photo")
@Getter
@Setter
@NoArgsConstructor
public class ProduitPhoto {

    @Id
    @Column(name = "produit_id")
    private Long produitId;

    /** Type détecté à partir du contenu du fichier : image/jpeg, image/png ou image/webp. */
    @Column(name = "type_contenu", nullable = false, length = 100)
    private String typeContenu;

    /** bytea : valide sur PostgreSQL et sur H2 (MODE=PostgreSQL), qui refuse le type BLOB. */
    @Column(name = "contenu", nullable = false, columnDefinition = "bytea")
    private byte[] contenu;
}
