package com.bioconversion.paiement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Paiement}.
 */
@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReferenceTransaction(String referenceTransaction);

    Optional<Paiement> findByCommandeIdCommande(Long commandeId);
}
