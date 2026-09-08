package com.bioconversion.marketplace;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Commande}.
 */
@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    Optional<Commande> findByNumeroCommande(String numeroCommande);

    Page<Commande> findByEleveurIdUtilisateur(Long eleveurId, Pageable pageable);

    Page<Commande> findByProducteurIdUtilisateur(Long producteurId, Pageable pageable);

    Page<Commande> findByStatut(StatutCommande statut, Pageable pageable);
}
