package com.bioconversion.marketplace;

/**
 * Énumération représentant le type de produit mis en vente sur la Marketplace (CDC §2.2.2).
 *
 * <p>
 * Permet de valoriser l'intégralité de la production (User Story B-MUST-5) :
 * <ul>
 *   <li>{@link #LARVE} : Larves de mouches soldats noires (BSFL) pour l'alimentation animale.</li>
 *   <li>{@link #RESIDU_PRODUCTION} : Résidus/déchets de production (compost, engrais organique).</li>
 * </ul>
 * </p>
 */
public enum TypeProduit {
    LARVE,
    RESIDU_PRODUCTION
}
