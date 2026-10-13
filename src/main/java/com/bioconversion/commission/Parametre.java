package com.bioconversion.commission;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Paramètre de la plateforme stocké en base (taux de commission, seuil espèces, frais). */
@Entity
@Table(name = "parametre")
@Getter
@Setter
@NoArgsConstructor
public class Parametre {

    @Id
    @Column(name = "cle", length = 50)
    private String cle;

    @Column(name = "valeur", nullable = false, precision = 19, scale = 4)
    private BigDecimal valeur;

    @Column(name = "description", length = 255)
    private String description;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}