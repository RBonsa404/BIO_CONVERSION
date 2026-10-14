package com.bioconversion.marketplace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA pour {@link ProduitPhoto} (clé : identifiant du produit).
 */
@Repository
public interface ProduitPhotoRepository extends JpaRepository<ProduitPhoto, Long> {
}
