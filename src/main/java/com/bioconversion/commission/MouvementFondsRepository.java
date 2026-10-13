package com.bioconversion.commission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface MouvementFondsRepository extends JpaRepository<MouvementFonds, Long> {

    boolean existsByCommandeIdAndTypeMouvement(Long commandeId, TypeMouvementFonds typeMouvement);

    /** Somme de toutes les lignes (null si le registre est vide). */
    @Query("select sum(m.montant) from MouvementFonds m")
    BigDecimal sommeTotale();
}
