package com.bioconversion.iot;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA pour l'entité {@link AlerteIoT}.
 */
@Repository
public interface AlerteIoTRepository extends JpaRepository<AlerteIoT, Long> {

    List<AlerteIoT> findByCapteur_IdCapteurOrderByDateAlerteDesc(Long capteurId);

    Page<AlerteIoT> findByCapteurProducteurIdUtilisateur(Long producteurId, Pageable pageable);
}
