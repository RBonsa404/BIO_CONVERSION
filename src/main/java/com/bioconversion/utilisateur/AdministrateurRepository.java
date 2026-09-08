package com.bioconversion.utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Administrateur}.
 */
@Repository
public interface AdministrateurRepository extends JpaRepository<Administrateur, Long> {

    Optional<Administrateur> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);
}
