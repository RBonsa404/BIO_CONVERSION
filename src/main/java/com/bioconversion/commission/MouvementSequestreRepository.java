package com.bioconversion.commission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface MouvementSequestreRepository extends JpaRepository<MouvementSequestre, Long> {

    boolean existsByCommandeIdAndTypeMouvement(Long commandeId, TypeMouvementSequestre typeMouvement);

    /** Somme de toutes les lignes (null si le registre est vide). */
    @Query("select sum(m.montant) from MouvementSequestre m")
    BigDecimal sommeTotale();

    @Query("select sum(m.montant) from MouvementSequestre m where m.commandeId = :commandeId")
    BigDecimal sommeCommande(@Param("commandeId") Long commandeId);
}