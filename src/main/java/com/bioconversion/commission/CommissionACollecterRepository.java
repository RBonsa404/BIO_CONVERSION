package com.bioconversion.commission;

import com.bioconversion.commission.dto.CommissionACollecterDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CommissionACollecterRepository extends JpaRepository<CommissionACollecter, Long> {

    Optional<CommissionACollecter> findByCommandeId(Long commandeId);

    boolean existsByCommandeId(Long commandeId);

    long countByStatut(CommissionACollecter.Statut statut);

    @Query("select sum(c.montant) from CommissionACollecter c where c.statut = :statut")
    BigDecimal sommeParStatut(@Param("statut") CommissionACollecter.Statut statut);

    /** Commissions d'un statut donné, avec le producteur et le numéro de commande, triées par producteur. */
    @Query("""
            select new com.bioconversion.commission.dto.CommissionACollecterDto(
                c.id, cmd.idCommande, cmd.numeroCommande, p.idUtilisateur, p.nomExploitation,
                p.telephone, c.montant, c.createdAt)
            from CommissionACollecter c, Commande cmd join cmd.producteur p
            where cmd.idCommande = c.commandeId and c.statut = :statut
            order by p.nomExploitation, c.createdAt
            """)
    List<CommissionACollecterDto> listerParStatut(@Param("statut") CommissionACollecter.Statut statut);
}
