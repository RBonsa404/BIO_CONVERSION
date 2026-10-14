package com.bioconversion.commission;

import com.bioconversion.commission.dto.CommissionACollecterDto;
import com.bioconversion.commission.dto.EncaissementRequest;
import com.bioconversion.commission.dto.ResumeFondsDto;
import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

/** Écran administrateur : soldes, commissions espèces à collecter, déclaration d'encaissement. */
@Service
@RequiredArgsConstructor
public class AdminCommissionService {

    private static final ZoneId FUSEAU = ZoneId.of("Africa/Ouagadougou");

    private final RegistreService registreService;
    private final CommissionACollecterRepository commissionRepository;

    @Transactional(readOnly = true)
    public ResumeFondsDto resume() {
        BigDecimal aCollecter = commissionRepository.sommeParStatut(CommissionACollecter.Statut.A_COLLECTER);
        return new ResumeFondsDto(
                registreService.soldeFonds(),
                registreService.soldeSequestre(),
                aCollecter != null ? aCollecter : BigDecimal.ZERO,
                commissionRepository.countByStatut(CommissionACollecter.Statut.A_COLLECTER));
    }

    @Transactional(readOnly = true)
    public List<CommissionACollecterDto> aCollecter() {
        return commissionRepository.listerParStatut(CommissionACollecter.Statut.A_COLLECTER);
    }

    /**
     * Le collecteur a récupéré la commission chez le producteur : elle entre dans le fonds.
     * Le montant déclaré doit être exactement celui attendu.
     */
    @Transactional
    public CommissionACollecter encaisser(Long id, EncaissementRequest requete, Long adminId) {
        CommissionACollecter commission = commissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commission introuvable : " + id));

        if (commission.getStatut() != CommissionACollecter.Statut.A_COLLECTER) {
            throw new BusinessException("Cette commission n'est plus à collecter (statut : "
                    + commission.getStatut() + ")");
        }
        if (requete.montant().compareTo(commission.getMontant()) != 0) {
            throw new BusinessException("Le montant encaissé (" + requete.montant().toPlainString()
                    + " F) ne correspond pas à la commission attendue ("
                    + commission.getMontant().toPlainString() + " F)");
        }

        LocalDate jour = requete.dateEncaissement() != null ? requete.dateEncaissement() : LocalDate.now(FUSEAU);
        commission.setStatut(CommissionACollecter.Statut.ENCAISSEE);
        commission.setCollecteur(requete.collecteur().trim());
        commission.setDateEncaissement(OffsetDateTime.of(jour, LocalTime.NOON, FUSEAU.getRules().getOffset(jour.atTime(LocalTime.NOON))));
        commission.setEncaisseePar(adminId);

        registreService.crediterCommissionEspeces(commission.getCommandeId(), commission.getMontant(), adminId);
        return commissionRepository.save(commission);
    }
}
