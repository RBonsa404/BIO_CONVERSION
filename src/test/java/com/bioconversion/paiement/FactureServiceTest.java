package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.config.AppProperties;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service de facturation")
class FactureServiceTest {

    @Mock
    private FactureRepository factureRepository;

    @Mock
    private AppProperties appProperties;

    @InjectMocks
    private FactureServiceImpl factureService;

    private Paiement paiement;
    private Facture facture;

    @BeforeEach
    void setUp() {
        Producteur producteur = Producteur.builder()
                .idUtilisateur(1L)
                .nom("Doe")
                .prenom("John")
                .telephone("+22670123456")
                .statut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF)
                .nomExploitation("Ferme Test")
                .build();

        Eleveur eleveur = Eleveur.builder()
                .idUtilisateur(2L)
                .nom("Smith")
                .prenom("Jane")
                .telephone("+22670987654")
                .statut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF)
                .typeElevage("Poules")
                .build();

        Commande commande = Commande.builder()
                .idCommande(100L)
                .numeroCommande("CMD-001")
                .producteur(producteur)
                .eleveur(eleveur)
                .dateCommande(OffsetDateTime.now())
                .build();

        paiement = Paiement.builder()
                .idPaiement(1L)
                .commande(commande)
                .operateur("ORANGE_MONEY")
                .montant(BigDecimal.valueOf(15000.0))
                .referenceTransaction("REF-12345")
                .datePaiement(OffsetDateTime.now())
                .statutPaiement(StatutPaiement.CONFIRME)
                .build();

        facture = Facture.builder()
                .idFacture(1L)
                .paiement(paiement)
                .dateFacture(OffsetDateTime.now())
                .montant(BigDecimal.valueOf(15000.0))
                .reference("FAC-001")
                .build();
    }

    @Test
    @DisplayName("Générer une facture pour un paiement confirmé")
    void genererPourPaiement_PaymentConfirmed_Success() {
        // Given
        when(factureRepository.findByPaiementIdPaiement(1L)).thenReturn(Optional.empty());
        when(factureRepository.save(any(Facture.class))).thenAnswer(inv -> inv.getArgument(0));
        when(appProperties.commission()).thenReturn(new AppProperties.CommissionProperties(0.05));
        when(appProperties.entreprise()).thenReturn(new AppProperties.EntrepriseProperties(
                "BIO CONVERSION", "IFU", "RCCM", "Adresse", "+226", "email", "bank", "IBAN"));
        when(appProperties.factures()).thenReturn(new AppProperties.FacturesProperties("./factures"));

        // When
        Facture result = factureService.genererPourPaiement(paiement);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(15000.0), result.getMontant());
        verify(factureRepository).findByPaiementIdPaiement(1L);
        verify(factureRepository, times(2)).save(any(Facture.class)); // Saved twice (create + update PDF path)
    }

    @Test
    @DisplayName("Générer une facture échoue pour paiement non confirmé")
    void genererPourPaiement_PaymentNotConfirmed_ThrowsException() {
        // Given
        paiement.setStatutPaiement(StatutPaiement.EN_ATTENTE);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> factureService.genererPourPaiement(paiement));
        assertTrue(exception.getMessage().contains("paiement non confirmé"));

        verify(factureRepository, never()).save(any());
    }

    @Test
    @DisplayName("Génération de facture idempotente - facture existe déjà")
    void genererPourPaiement_AlreadyExists_Idempotent() {
        // Given
        when(factureRepository.findByPaiementIdPaiement(1L)).thenReturn(Optional.of(facture));

        // When
        Facture result = factureService.genererPourPaiement(paiement);

        // Then
        assertNotNull(result);
        assertEquals(facture.getIdFacture(), result.getIdFacture());
        verify(factureRepository).findByPaiementIdPaiement(1L);
        verify(factureRepository, never()).save(any()); // Idempotent
    }

    @Test
    @DisplayName("Consulter une facture par référence")
    void consulterParReference_Success() {
        // Given
        when(factureRepository.findByReference("FAC-001")).thenReturn(Optional.of(facture));

        // When
        Facture result = factureService.consulterParReference("FAC-001");

        // Then
        assertNotNull(result);
        assertEquals("FAC-001", result.getReference());
        verify(factureRepository).findByReference("FAC-001");
    }

    @Test
    @DisplayName("Consulter une facture inexistante lance une exception")
    void consulterParReference_NotFound_ThrowsException() {
        // Given
        when(factureRepository.findByReference("FAC-UNKNOWN")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> factureService.consulterParReference("FAC-UNKNOWN"));

        verify(factureRepository).findByReference("FAC-UNKNOWN");
    }

    @Test
    @DisplayName("Échec de génération PDF n'annule pas le paiement")
    void genererPourPaiement_PdfGenerationFailure_DoesNotCancelPayment() {
        // Given
        when(factureRepository.findByPaiementIdPaiement(1L)).thenReturn(Optional.empty());
        when(factureRepository.save(any(Facture.class))).thenAnswer(inv -> inv.getArgument(0));
        when(appProperties.commission()).thenReturn(new AppProperties.CommissionProperties(0.05));
        when(appProperties.entreprise()).thenReturn(new AppProperties.EntrepriseProperties(
                "BIO CONVERSION", "IFU", "RCCM", "Adresse", "+226", "email", "bank", "IBAN"));
        when(appProperties.factures()).thenReturn(new AppProperties.FacturesProperties("/invalid/path"));

        // When & Then - Even if PDF generation fails, the payment should remain CONFIRME
        // The facture service should create the facture record but PDF generation may fail
        // This is tested by the fact that paiement.statut remains CONFIRME
        try {
            factureService.genererPourPaiement(paiement);
        } catch (Exception e) {
            // PDF generation might fail due to invalid path
        }

        // Verify payment status was not changed
        assertEquals(StatutPaiement.CONFIRME, paiement.getStatutPaiement());
        verify(factureRepository).findByPaiementIdPaiement(1L);
    }
}
