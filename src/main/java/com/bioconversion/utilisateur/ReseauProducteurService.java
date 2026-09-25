package com.bioconversion.utilisateur;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.bioconversion.utilisateur.dto.CommandeValideeNotification;

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
    
    Producteur mettreAJourCapaciteProduction(Long producteurId, double nouvelleCapacite);
    
    void notifierProducteurCommandeValidee(CommandeValideeNotification notification);
    
    Producteur consulterProducteur(Long id);

    
}
