package com.bioconversion.commission;

import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.StatutCommande;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Lectures des commandes propres au module commission (sans modifier le repository du Module B).
 */
public interface CommandeReglementRepository extends Repository<Commande, Long> {

    Optional<Commande> findById(Long id);

    @Query("select c.idCommande from Commande c where c.statutReglement = :statut")
    List<Long> idsParStatutReglement(@Param("statut") StatutReglement statut);

    /**
     * Commandes Orange Money expédiées depuis avant la date limite (72 h) dont l'argent est
     * encore en séquestre : leur réception est confirmée automatiquement.
     */
    @Query("""
            select c.idCommande from Commande c
            where c.statut = :statut and c.statutReglement = :reglement and c.updatedAt < :limite
            """)
    List<Long> idsParStatutDepuisAvant(@Param("statut") StatutCommande statut,
                                       @Param("reglement") StatutReglement reglement,
                                       @Param("limite") OffsetDateTime limite);
}
