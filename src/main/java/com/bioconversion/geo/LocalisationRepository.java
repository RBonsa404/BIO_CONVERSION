package com.bioconversion.geo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA pour l'entité {@link Localisation}.
 */
@Repository
public interface LocalisationRepository extends JpaRepository<Localisation, Long> {

    List<Localisation> findByProvinceIgnoreCase(String province);

    List<Localisation> findByVilleIgnoreCase(String ville);
}
