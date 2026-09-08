package com.bioconversion.utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Eleveur}.
 */
@Repository
public interface EleveurRepository extends JpaRepository<Eleveur, Long> {

    Optional<Eleveur> findByTelephone(String telephone);

    boolean existsByTelephone(String telephone);
}
