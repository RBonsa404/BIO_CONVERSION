package com.bioconversion.iot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Capteur}.
 */
@Repository
public interface CapteurRepository extends JpaRepository<Capteur, Long> {

    Optional<Capteur> findByCodeIdentifiant(String codeIdentifiant);

    List<Capteur> findByProducteurIdUtilisateur(Long producteurId);

    List<Capteur> findByEstActifTrue();
}
