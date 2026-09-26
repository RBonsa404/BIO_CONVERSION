package com.bioconversion.utilisateur;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA pour {@link Producteur}.
 * TODO Module D : ajouter les requêtes de recherche géographique (proximité,
 * province, etc.)
 */
@Repository
public interface ProducteurRepository extends JpaRepository<Producteur, Long> {

    /**
     * Recherche les producteurs validés par province.
     * TODO Module D : implémenter la recherche géographique avancée.
     */
    Page<Producteur> findByStatut(StatutUtilisateur statut, Pageable pageable);

    Page<Producteur> findByLocalisationProvinceIgnoreCase(String province, Pageable pageable);
}
