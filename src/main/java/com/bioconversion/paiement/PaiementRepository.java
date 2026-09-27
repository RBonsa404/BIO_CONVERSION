package com.bioconversion.paiement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Repository JPA pour l'entité {@link Paiement}.
 */
@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReferenceTransaction(String referenceTransaction);

    Optional<Paiement> findByCommandeIdCommande(Long commandeId);

    @Query("select coalesce(sum(p.montant), 0) from Paiement p " +
            "where p.commande.producteur.idUtilisateur = :producteurId " +
            "and p.statutPaiement = com.bioconversion.paiement.StatutPaiement.CONFIRME")
    BigDecimal sumConfirmedPaymentsByProducteurId(@Param("producteurId") Long producteurId);
}
