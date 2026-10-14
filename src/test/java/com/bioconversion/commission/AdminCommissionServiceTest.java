package com.bioconversion.commission;

import com.bioconversion.commission.dto.EncaissementRequest;
import com.bioconversion.commission.dto.ResumeFondsDto;
import com.bioconversion.common.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Écran admin : commissions espèces et fonds")
class AdminCommissionServiceTest {

    private static final Long ADMIN = 99L;

    @Mock private RegistreService registreService;
    @Mock private CommissionACollecterRepository commissionRepository;

    @InjectMocks
    private AdminCommissionService service;

    private CommissionACollecter commission() {
        return CommissionACollecter.builder()
                .id(5L).commandeId(10L).producteurId(1L).montant(new BigDecimal("2500")).build();
    }

    @Test
    @DisplayName("Encaissement : la commission entre dans le fonds et passe à ENCAISSEE")
    void encaisser() {
        CommissionACollecter c = commission();
        when(commissionRepository.findById(5L)).thenReturn(Optional.of(c));
        when(commissionRepository.save(c)).thenReturn(c);

        service.encaisser(5L, new EncaissementRequest(" Issa ", new BigDecimal("2500"), LocalDate.now()), ADMIN);

        verify(registreService).crediterCommissionEspeces(10L, new BigDecimal("2500"), ADMIN);
        assertEquals(CommissionACollecter.Statut.ENCAISSEE, c.getStatut());
        assertEquals("Issa", c.getCollecteur());
        assertEquals(ADMIN, c.getEncaisseePar());
        assertNotNull(c.getDateEncaissement());
    }

    @Test
    @DisplayName("Montant différent de la commission attendue : refusé")
    void montantIncorrect() {
        when(commissionRepository.findById(5L)).thenReturn(Optional.of(commission()));

        assertThrows(BusinessException.class, () -> service.encaisser(5L,
                new EncaissementRequest("Issa", new BigDecimal("2000"), null), ADMIN));
        verify(registreService, never()).crediterCommissionEspeces(anyLong(), any(), any());
    }

    @Test
    @DisplayName("Commission déjà encaissée : refusée (pas de double entrée dans le fonds)")
    void dejaEncaissee() {
        CommissionACollecter c = commission();
        c.setStatut(CommissionACollecter.Statut.ENCAISSEE);
        when(commissionRepository.findById(5L)).thenReturn(Optional.of(c));

        assertThrows(BusinessException.class, () -> service.encaisser(5L,
                new EncaissementRequest("Issa", new BigDecimal("2500"), null), ADMIN));
        verifyNoInteractions(registreService);
    }

    @Test
    @DisplayName("Résumé : soldes des registres et total à collecter (0 si rien)")
    void resume() {
        when(registreService.soldeFonds()).thenReturn(new BigDecimal("2025"));
        when(registreService.soldeSequestre()).thenReturn(new BigDecimal("50000"));
        when(commissionRepository.sommeParStatut(CommissionACollecter.Statut.A_COLLECTER)).thenReturn(null);
        when(commissionRepository.countByStatut(CommissionACollecter.Statut.A_COLLECTER)).thenReturn(0L);

        ResumeFondsDto resume = service.resume();

        assertEquals(new BigDecimal("2025"), resume.soldeFonds());
        assertEquals(new BigDecimal("50000"), resume.soldeSequestre());
        assertEquals(BigDecimal.ZERO, resume.totalACollecter());
        assertEquals(0L, resume.nombreACollecter());
    }
}
