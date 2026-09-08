package com.bioconversion.paiement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Facture}.
 */
@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {

    Optional<Facture> findByReference(String reference);

    Optional<Facture> findByPaiementIdPaiement(Long paiementId);
}
