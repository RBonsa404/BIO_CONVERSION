package com.bioconversion.marketplace;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA pour l'entité {@link Produit}.
 */
@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    Page<Produit> findByDisponibiliteTrue(Pageable pageable);

    List<Produit> findByProducteurIdUtilisateur(Long producteurId);

    Page<Produit> findByProducteurLocalisationProvinceIgnoreCase(String province, Pageable pageable);
}
