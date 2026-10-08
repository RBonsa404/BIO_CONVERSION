package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeRepository;
import com.bioconversion.marketplace.CommandeService;
import com.bioconversion.marketplace.LigneCommande;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.Producteur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Enchaînement commande → confirmation producteur → paiement de l'éleveur.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Flux de paiement d'une commande par l'éleveur")
class PaiementFluxTest {

    private static final long ELEVEUR_ID = 2L;
    private static final long AUTRE_UTILISATEUR_ID = 99L;

    @Mock
    private PaiementRepository paiementRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private CommandeService commandeService;

    @Mock
    private FactureService factureService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PaiementServiceImpl paiementService;

    private Commande commande;

    @BeforeEach
    void setUp() {
        Producteur producteur = Producteur.builder().idUtilisateur(1L).nomExploitation("Ferme Test").build();
        Eleveur eleveur = Eleveur.builder().idUtilisateur(ELEVEUR_ID).typeElevage("AVICULTURE").build();

        commande = Commande.builder()
                .idCommande(100L)
                .numeroCommande("CMD-001")
                .producteur(producteur)
                .eleveur(eleveur)
                .statut(StatutCommande.CONFIRME)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();
        commande.ajouterLigne(LigneCommande.builder()
                .quantite(10.0)
                .prixUnitaireFige(BigDecimal.valueOf(1500))
                .build());
    }

    private Paiement paiementExistant(StatutPaiement statut) {
        Paiement paiement = Paiement.builder()
                .idPaiement(1L)
                .commande(commande)
                .operateur("ORANGE_MONEY")
                .montant(BigDecimal.valueOf(15000))
                .referenceTransaction("REF-INITIALE")
                .datePaiement(OffsetDateTime.now())
                .statutPaiement(statut)
                .build();
        commande.setPaiement(paiement);
        return paiement;
    }

    @Test
    @DisplayName("Refuse le paiement tant que le producteur n'a pas confirmé la commande")
    void initierPaiement_CommandeNonConfirmee_Refuse() {
        commande.setStatut(StatutCommande.EN_ATTENTE);
        when(commandeRepository.findById(100L)).thenReturn(Optional.of(commande));

        assertThrows(BusinessException.class,
                () -> paiementService.initierPaiement(100L, "ORANGE_MONEY", ELEVEUR_ID));

        verify(paiementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Refuse le paiement d'une commande par un autre utilisateur que son éleveur")
    void initierPaiement_AutreUtilisateur_Refuse() {
        when(commandeRepository.findById(100L)).thenReturn(Optional.of(commande));

        assertThrows(ForbiddenException.class,
                () -> paiementService.initierPaiement(100L, "ORANGE_MONEY", AUTRE_UTILISATEUR_ID));
    }

    @Test
    @DisplayName("Reprend le paiement en attente au lieu d'en créer un second")
    void initierPaiement_PaiementEnAttente_Repris() {
        Paiement enAttente = paiementExistant(StatutPaiement.EN_ATTENTE);
        when(commandeRepository.findById(100L)).thenReturn(Optional.of(commande));

        Paiement resultat = paiementService.initierPaiement(100L, "ORANGE_MONEY", ELEVEUR_ID);

        assertSame(enAttente, resultat);
        verify(paiementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Relance un paiement échoué avec une nouvelle référence de transaction")
    void initierPaiement_PaiementEchoue_Relance() {
        Paiement echoue = paiementExistant(StatutPaiement.ECHOUE);
        when(commandeRepository.findById(100L)).thenReturn(Optional.of(commande));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(inv -> inv.getArgument(0));

        Paiement resultat = paiementService.initierPaiement(100L, "ORANGE_MONEY", ELEVEUR_ID);

        assertSame(echoue, resultat);
        assertEquals(StatutPaiement.EN_ATTENTE, resultat.getStatutPaiement());
        assertNotEquals("REF-INITIALE", resultat.getReferenceTransaction());
    }

    @Test
    @DisplayName("Refuse un second paiement quand le premier est déjà confirmé")
    void initierPaiement_PaiementConfirme_Refuse() {
        paiementExistant(StatutPaiement.CONFIRME);
        when(commandeRepository.findById(100L)).thenReturn(Optional.of(commande));

        assertThrows(BusinessException.class,
                () -> paiementService.initierPaiement(100L, "ORANGE_MONEY", ELEVEUR_ID));
    }

    @Test
    @DisplayName("La confirmation simulée applique le traitement du webhook et marque la commande payée")
    void confirmerParSimulation_Succes() {
        Paiement enAttente = paiementExistant(StatutPaiement.EN_ATTENTE);
        when(paiementRepository.findByCommandeIdCommande(100L)).thenReturn(Optional.of(enAttente));
        when(paiementRepository.findByReferenceTransaction("REF-INITIALE")).thenReturn(Optional.of(enAttente));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(inv -> inv.getArgument(0));

        Paiement resultat = paiementService.confirmerParSimulation(100L, true, ELEVEUR_ID);

        assertEquals(StatutPaiement.CONFIRME, resultat.getStatutPaiement());
        verify(commandeService).marquerCommandePayee(100L);
        verify(eventPublisher).publishEvent(any(PaiementConfirmeEvent.class));
    }

    @Test
    @DisplayName("L'échec simulé ne touche pas au statut de la commande")
    void confirmerParSimulation_Echec() {
        Paiement enAttente = paiementExistant(StatutPaiement.EN_ATTENTE);
        when(paiementRepository.findByCommandeIdCommande(100L)).thenReturn(Optional.of(enAttente));
        when(paiementRepository.findByReferenceTransaction("REF-INITIALE")).thenReturn(Optional.of(enAttente));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(inv -> inv.getArgument(0));

        Paiement resultat = paiementService.confirmerParSimulation(100L, false, ELEVEUR_ID);

        assertEquals(StatutPaiement.ECHOUE, resultat.getStatutPaiement());
        verify(commandeService, never()).marquerCommandePayee(any());
    }

    @Test
    @DisplayName("Seul l'éleveur de la commande peut déclencher la confirmation simulée")
    void confirmerParSimulation_AutreUtilisateur_Refuse() {
        Paiement enAttente = paiementExistant(StatutPaiement.EN_ATTENTE);
        when(paiementRepository.findByCommandeIdCommande(100L)).thenReturn(Optional.of(enAttente));

        assertThrows(ForbiddenException.class,
                () -> paiementService.confirmerParSimulation(100L, true, AUTRE_UTILISATEUR_ID));

        verify(commandeService, never()).marquerCommandePayee(any());
    }

    @Test
    @DisplayName("Un paiement déjà traité ne peut pas être confirmé une seconde fois")
    void confirmerParSimulation_PaiementDejaTraite_Refuse() {
        Paiement confirme = paiementExistant(StatutPaiement.CONFIRME);
        when(paiementRepository.findByCommandeIdCommande(100L)).thenReturn(Optional.of(confirme));

        assertThrows(BusinessException.class,
                () -> paiementService.confirmerParSimulation(100L, true, ELEVEUR_ID));
    }
}
