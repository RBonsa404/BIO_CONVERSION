package com.bioconversion.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO (Data Transfer Object) pour l'affichage géolocalisé des producteurs sur la carte.
 *
 * <p>
 * <b>Justification d'architecture (CDC §3.4.1 & §4.1) :</b>
 * <ul>
 *   <li><b>Sécurité & CIL :</b> Exclut les données sensibles du producteur (mot de passe, pièce d'identité).</li>
 *   <li><b>Performance 3G (< 2s) :</b> Transport ultra-léger sur le réseau sans charger tout l'arbre d'objets JPA.</li>
 * </ul>
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProducteurLocaliseDto {

    private Long producteurId;
    private String nomExploitation;
    private String ville;
    private String province;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
}
