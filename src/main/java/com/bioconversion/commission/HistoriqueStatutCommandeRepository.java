package com.bioconversion.commission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueStatutCommandeRepository extends JpaRepository<HistoriqueStatutCommande, Long> {

    List<HistoriqueStatutCommande> findByCommandeIdOrderByCreatedAtAsc(Long commandeId);
}
