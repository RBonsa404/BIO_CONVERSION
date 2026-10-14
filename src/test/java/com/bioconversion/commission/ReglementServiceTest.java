package com.bioconversion.commission;

import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeCreeeEvent;
import com.bioconversion.marketplace.LigneCommande;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.marketplace.StatutCommandeChangeEvent;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.paiement.StatutPaiement;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Suivi de l'argent d'une commande (séquestre, versement, commission)")
class ReglementServiceTest {

    private static final Long PRODUCTEUR = 1L;
    private static final Long ELEVEUR = 2L;
    private static final Long COMMANDE = 10L;
    private static final BigDecimal TAUX = new BigDecimal("0.0500");

    @Mock private ParametreService parametreService;
    @Mock private RegistreService registreService;
    @Mock private CommissionACollecterRepository commissionRepository;
    @Mock private HistoriqueStatutCommandeRepository historiqueRepository;
    @Mock private CommandeReglementRepository commandeRepository;
    @Mock private VersementProducteur versementProducteur;

    @InjectMocks
    private ReglementService reglementService;

    private Producteur producteur;
    private Eleveur eleveur;

    @BeforeEach
    void setUp() {
        producteur = Producteur.builder().idUtilisateur(PRODUCTEUR).nom("Sawadogo").prenom("Paul")
                .telephone("+22670000001").nomExploitation("Ferme Test").build();
        eleveur = Eleveur.builder().idUtilisateur(ELEVEUR).nom("Diallo").prenom("Amadou")
                .telephone("+22670000002").build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ------------------------------------------------------------------ création

    @Test
    @DisplayName("Création : le taux en vigueur est copié et les montants calculés")
    void creationFigeLaCommission() {
        when(parametreService.tauxCommission()).thenReturn(TAUX);
        Commande commande = commande("2500", StatutCommande.EN_ATTENTE, null);

        reglementService.surCreation(new CommandeCreeeEvent(commande));

        assertEquals(TAUX, commande.getTauxCommission());
        assertEquals(new BigDecimal("2500"), commande.getMontantCommission());
        assertEquals(new BigDecimal("47500"), commande.getMontantNetProducteur());
        verify(historiqueRepository).save(any(HistoriqueStatutCommande.class));
    }

    // ------------------------------------------------------------------ paiement

    @Test
    @DisplayName("Orange Money confirmé : le montant total entre en séquestre")
    void paiementOrangeMoneyEnSequestre() {
        connecte(ELEVEUR);
        Commande commande = commandeFigee("2500", StatutCommande.PAYE, "ORANGE_MONEY");

        reglementService.surChangementStatut(event(commande, StatutCommande.CONFIRME, StatutCommande.PAYE));

        verify(registreService).crediterSequestre(COMMANDE, new BigDecimal("50000"), "REF-OM", ELEVEUR);
        assertEquals(StatutReglement.EN_SEQUESTRE, commande.getStatutReglement());
        verify(historiqueRepository, times(2)).save(any(HistoriqueStatutCommande.class));
    }

    @Test
    @DisplayName("Espèces sous le seuil : aucune commission")
    void especesSousLeSeuil() {
        when(parametreService.seuilCommissionEspeces()).thenReturn(new BigDecimal("10000"));
        Commande commande = commandeFigee("400", StatutCommande.PAYE, "ESPECES"); // 8 000 F

        reglementService.surChangementStatut(event(commande, StatutCommande.CONFIRME, StatutCommande.PAYE));

        assertEquals(0, commande.getMontantCommission().signum());
        assertEquals(new BigDecimal("8000"), commande.getMontantNetProducteur());
        assertEquals(StatutReglement.ENCAISSE_ESPECES, commande.getStatutReglement());
        verify(commissionRepository, never()).save(any());
        verifyNoInteractions(registreService);
    }

    @Test
    @DisplayName("Espèces à partir du seuil : commission « à collecter » créée")
    void especesAuDessusDuSeuil() {
        when(parametreService.seuilCommissionEspeces()).thenReturn(new BigDecimal("10000"));
        when(commissionRepository.existsByCommandeId(COMMANDE)).thenReturn(false);
        Commande commande = commandeFigee("2500", StatutCommande.PAYE, "ESPECES"); // 50 000 F

        reglementService.surChangementStatut(event(commande, StatutCommande.CONFIRME, StatutCommande.PAYE));

        ArgumentCaptor<CommissionACollecter> captor = ArgumentCaptor.forClass(CommissionACollecter.class);
        verify(commissionRepository).save(captor.capture());
        assertEquals(new BigDecimal("2500"), captor.getValue().getMontant());
        assertEquals(PRODUCTEUR, captor.getValue().getProducteurId());
        assertEquals(CommissionACollecter.Statut.A_COLLECTER, captor.getValue().getStatut());
        verifyNoInteractions(registreService);
    }

    @Test
    @DisplayName("Commande créée avant le module : la commission est calculée au paiement")
    void ancienneCommandeSansCommission() {
        when(parametreService.tauxCommission()).thenReturn(TAUX);
        Commande commande = commande("2500", StatutCommande.PAYE, "ORANGE_MONEY");

        reglementService.surChangementStatut(event(commande, StatutCommande.CONFIRME, StatutCommande.PAYE));

        assertEquals(new BigDecimal("2500"), commande.getMontantCommission());
        assertEquals(StatutReglement.EN_SEQUESTRE, commande.getStatutReglement());
    }

    // ------------------------------------------------------------------ livraison

    @Test
    @DisplayName("Réception confirmée par l'éleveur : versement du net, registres écrits, VERSE")
    void livraisonVersement() {
        connecte(ELEVEUR);
        when(parametreService.tauxFraisVersement()).thenReturn(new BigDecimal("0.01"));
        when(versementProducteur.verser(COMMANDE, "+22670000001", new BigDecimal("47500")))
                .thenReturn(VersementProducteur.ResultatVersement.succes("VERS-1"));
        Commande commande = commandeEnSequestre();

        reglementService.surChangementStatut(event(commande, StatutCommande.EXPEDIE, StatutCommande.LIVRE));

        ArgumentCaptor<MontantsCommission> montants = ArgumentCaptor.forClass(MontantsCommission.class);
        verify(registreService).enregistrerVersement(eq(COMMANDE), montants.capture(),
                eq(new BigDecimal("475")), eq(ELEVEUR));
        assertEquals(new BigDecimal("50000"), montants.getValue().montantTotal());
        assertEquals(new BigDecimal("2500"), montants.getValue().commission());
        assertEquals(StatutReglement.VERSE, commande.getStatutReglement());
    }

    @Test
    @DisplayName("Versement échoué : VERSEMENT_ECHOUE et rien dans les registres")
    void versementEchoue() {
        connecte(ELEVEUR);
        when(versementProducteur.verser(anyLong(), anyString(), any()))
                .thenReturn(VersementProducteur.ResultatVersement.echec("Réseau indisponible"));
        Commande commande = commandeEnSequestre();

        reglementService.surChangementStatut(event(commande, StatutCommande.EXPEDIE, StatutCommande.LIVRE));

        assertEquals(StatutReglement.VERSEMENT_ECHOUE, commande.getStatutReglement());
        verify(registreService, never()).enregistrerVersement(anyLong(), any(), any(), any());
    }

    @Test
    @DisplayName("Le producteur ne peut pas confirmer lui-même la réception d'une commande en séquestre")
    void producteurNePeutPasSeVerser() {
        connecte(PRODUCTEUR);
        Commande commande = commandeEnSequestre();

        assertThrows(ForbiddenException.class, () -> reglementService.surChangementStatut(
                event(commande, StatutCommande.EXPEDIE, StatutCommande.LIVRE)));
        verifyNoInteractions(versementProducteur);
        assertEquals(StatutReglement.EN_SEQUESTRE, commande.getStatutReglement());
    }

    @Test
    @DisplayName("Confirmation automatique (sans utilisateur connecté) : versement effectué")
    void confirmationAutomatique() {
        when(parametreService.tauxFraisVersement()).thenReturn(new BigDecimal("0.01"));
        when(versementProducteur.verser(anyLong(), anyString(), any()))
                .thenReturn(VersementProducteur.ResultatVersement.succes("VERS-2"));
        Commande commande = commandeEnSequestre();

        reglementService.surChangementStatut(event(commande, StatutCommande.EXPEDIE, StatutCommande.LIVRE));

        verify(registreService).enregistrerVersement(eq(COMMANDE), any(), eq(new BigDecimal("475")), isNull());
        assertEquals(StatutReglement.VERSE, commande.getStatutReglement());
    }

    @Test
    @DisplayName("Relance d'un versement échoué qui réussit")
    void relanceVersement() {
        when(parametreService.tauxFraisVersement()).thenReturn(new BigDecimal("0.01"));
        when(versementProducteur.verser(anyLong(), anyString(), any()))
                .thenReturn(VersementProducteur.ResultatVersement.succes("VERS-3"));
        Commande commande = commandeEnSequestre();
        commande.setStatutReglement(StatutReglement.VERSEMENT_ECHOUE);
        when(commandeRepository.findById(COMMANDE)).thenReturn(Optional.of(commande));

        assertTrue(reglementService.reessayerVersement(COMMANDE));
        assertEquals(StatutReglement.VERSE, commande.getStatutReglement());
    }

    @Test
    @DisplayName("Relance ignorée si la commande n'est pas en échec de versement")
    void relanceIgnoree() {
        Commande commande = commandeEnSequestre();
        when(commandeRepository.findById(COMMANDE)).thenReturn(Optional.of(commande));

        assertFalse(reglementService.reessayerVersement(COMMANDE));
        verifyNoInteractions(versementProducteur);
    }

    // ------------------------------------------------------------------ annulation

    @Test
    @DisplayName("Annulation en séquestre : éleveur remboursé, aucune commission")
    void annulationEnSequestre() {
        connecte(ELEVEUR);
        Commande commande = commandeEnSequestre();

        reglementService.surChangementStatut(event(commande, StatutCommande.PAYE, StatutCommande.ANNULE));

        verify(registreService).enregistrerRemboursement(COMMANDE, new BigDecimal("50000"), ELEVEUR);
        assertEquals(StatutReglement.REMBOURSE, commande.getStatutReglement());
        assertEquals(0, commande.getMontantCommission().signum());
    }

    @Test
    @DisplayName("Annulation d'une vente en espèces : la commission à collecter est annulée")
    void annulationEspeces() {
        Commande commande = commandeFigee("2500", StatutCommande.ANNULE, "ESPECES");
        commande.setStatutReglement(StatutReglement.ENCAISSE_ESPECES);
        CommissionACollecter aCollecter = CommissionACollecter.builder()
                .commandeId(COMMANDE).producteurId(PRODUCTEUR).montant(new BigDecimal("2500")).build();
        when(commissionRepository.findByCommandeId(COMMANDE)).thenReturn(Optional.of(aCollecter));

        reglementService.surChangementStatut(event(commande, StatutCommande.PAYE, StatutCommande.ANNULE));

        assertEquals(CommissionACollecter.Statut.ANNULEE, aCollecter.getStatut());
        assertEquals(StatutReglement.REMBOURSE, commande.getStatutReglement());
        verifyNoInteractions(registreService);
    }

    // ------------------------------------------------------------------ outils

    /** Commande de 20 unités au prix donné, avec un paiement confirmé si l'opérateur est donné. */
    private Commande commande(String prixUnitaire, StatutCommande statut, String operateur) {
        Commande commande = Commande.builder()
                .idCommande(COMMANDE)
                .numeroCommande("CMD-TEST")
                .producteur(producteur)
                .eleveur(eleveur)
                .statut(statut)
                .build();
        commande.ajouterLigne(LigneCommande.builder()
                .quantite(20.0)
                .prixUnitaireFige(new BigDecimal(prixUnitaire))
                .build());
        if (operateur != null) {
            commande.setPaiement(Paiement.builder()
                    .commande(commande)
                    .operateur(operateur)
                    .referenceTransaction("REF-OM")
                    .statutPaiement(StatutPaiement.CONFIRME)
                    .build());
        }
        return commande;
    }

    /** Commande dont la commission a été figée à la création (5 %). */
    private Commande commandeFigee(String prixUnitaire, StatutCommande statut, String operateur) {
        Commande commande = commande(prixUnitaire, statut, operateur);
        MontantsCommission m = CalculCommission.calculer(commande.calculerMontantTotal(), TAUX);
        commande.setTauxCommission(TAUX);
        commande.setMontantCommission(m.commission());
        commande.setMontantNetProducteur(m.netProducteur());
        return commande;
    }

    /** Commande Orange Money de 50 000 F dont l'argent est en séquestre. */
    private Commande commandeEnSequestre() {
        Commande commande = commandeFigee("2500", StatutCommande.EXPEDIE, "ORANGE_MONEY");
        commande.setStatutReglement(StatutReglement.EN_SEQUESTRE);
        return commande;
    }

    private StatutCommandeChangeEvent event(Commande commande, StatutCommande ancien, StatutCommande nouveau) {
        return new StatutCommandeChangeEvent(commande, ancien, nouveau);
    }

    private void connecte(Long idUtilisateur) {
        User principal = new User(String.valueOf(idUtilisateur), "x", List.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, List.of()));
    }
}
