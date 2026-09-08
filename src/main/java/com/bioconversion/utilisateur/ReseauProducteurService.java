package com.bioconversion.utilisateur;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface de service pour le Module D — Réseau des Producteurs &
 * Cartographie.
 *
 * <p>
 * Définit le contrat d'interface pour la validation administrative des
 * producteurs et la recherche par géolocalisation (CDC §2.2.3).
 * </p>
 */
public interface ReseauProducteurService {

    Page<Producteur> listerProducteursValides(Pageable pageable);

    Page<Producteur> listerProducteursParProvince(String province, Pageable pageable);

    Producteur validerProducteur(Long producteurId, boolean approuve);

    Producteur suspendreCompte(Long utilisateurId);
}
