package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.geo.Localisation;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires Mockito pour la gestion des commandes (Module B — Abdoul Rachid).
 * Couvre B-MUST-4, B-MUST-6, B-MUST-7, B-MUST-8 et la protection anti double-soumission.
 */
@ExtendWith(MockitoExtension.class)
class MarketplaceServiceCommandeTest {

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private ProducteurRepository producteurRepository;

    @Mock
    private EleveurRepository eleveurRepository;

    @Spy
    private IdempotencyService idempotencyService = new IdempotencyService();

    @InjectMocks
    private MarketplaceServiceImpl marketplaceService;

    private Eleveur eleveur;
    private Producteur producteur;
    private Produit produit;

    @BeforeEach
    void setUp() {
        Localisation loc = Localisation.builder()
                .idLocalisation(10L)
                .latitude(12.37)
                .longitude(-1.52)
                .ville("Ouagadougou")
                .province("Kadiogo")
                .build();

        producteur = Producteur.builder()
                .idUtilisateur(1L)
                .nomExploitation("Ferme BSFL Faso")
                .localisation(loc)
                .nom("Sawadogo")
                .prenom("Paul")
                .telephone("+22670112233")
                .build();

        eleveur = Eleveur.builder()
                .idUtilisateur(2L)
                .typeElevage("Volaille locale")
                .nom("Diallo")
                .prenom("Amadou")
                .telephone("+22676554433")
                .build();

        produit = Produit.builder()
                .idProduit(100L)
                .nomProduit("Larves BSFL fraîches")
                .prix(1500.0)
                .quantiteStock(50.0)
                .disponibilite(true)
                .typeProduit(TypeProduit.LARVE)
                .producteur(producteur)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. PASSER COMMANDE (B-MUST-4, B-MUST-6)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Devrait passer une commande avec succès, décrémenter le stock et figer le prix unitaire")
    void passerCommande_Succes() {
        when(eleveurRepository.findById(2L)).thenReturn(Optional.of(eleveur));
        when(produitRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> {
            Commande c = inv.getArgument(0);
            c.setIdCommande(500L);
            return c;
        });

        // When : L'éleveur commande 20 kg
        Commande commande = marketplaceService.passerCommande(2L, 100L, 20.0);

        // Then
        assertNotNull(commande);
        assertEquals(500L, commande.getIdCommande());
        assertEquals(StatutCommande.EN_ATTENTE, commande.getStatut());
        assertNotNull(commande.getNumeroCommande());
        assertEquals(1, commande.getLignes().size());

        LigneCommande ligne = commande.getLignes().get(0);
        assertEquals(20.0, ligne.getQuantite());
        assertEquals(1500.0, ligne.getPrixUnitaireFige(), "Le prix unitaire doit être figé à 1500 FCFA");
        assertEquals(30000.0, ligne.calculerSousTotal());

        // Vérification de la décrémentation du stock (50 - 20 = 30)
        assertEquals(30.0, produit.getQuantiteStock());
        verify(produitRepository, times(1)).save(produit);
        verify(commandeRepository, times(1)).save(any(Commande.class));
    }

    @Test
    @DisplayName("Devrait refuser la commande si la quantité demandée dépasse le stock disponible")
    void passerCommande_StockInsuffisant_LeveException() {
        when(eleveurRepository.findById(2L)).thenReturn(Optional.of(eleveur));
        when(produitRepository.findById(100L)).thenReturn(Optional.of(produit));

        // When & Then : Commande de 100 kg alors que stock = 50 kg
        BusinessException ex = assertThrows(BusinessException.class, () ->
                marketplaceService.passerCommande(2L, 100L, 100.0));

        assertTrue(ex.getMessage().contains("Stock insuffisant"));
        verify(commandeRepository, never()).save(any(Commande.class));
    }

    @Test
    @DisplayName("Devrait lever une exception si la quantité est négative ou nulle")
    void passerCommande_QuantiteInvalide_LeveException() {
        assertThrows(BusinessException.class, () ->
                marketplaceService.passerCommande(2L, 100L, -5.0));

        assertThrows(BusinessException.class, () ->
                marketplaceService.passerCommande(2L, 100L, 0.0));
    }

    @Test
    @DisplayName("Devrait refuser la commande si le produit n'est pas disponible")
    void passerCommande_ProduitIndisponible_LeveException() {
        produit.setDisponibilite(false);
        when(eleveurRepository.findById(2L)).thenReturn(Optional.of(eleveur));
        when(produitRepository.findById(100L)).thenReturn(Optional.of(produit));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                marketplaceService.passerCommande(2L, 100L, 10.0));

        assertTrue(ex.getMessage().contains("n'est plus disponible"));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. CAS LIMITE — DOUBLE SOUMISSION (3.3)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Devrait protéger contre la double soumission sur une fenêtre de 30 secondes")
    void passerCommande_DoubleSoumission_IdempotenceGarantie() {
        when(eleveurRepository.findById(2L)).thenReturn(Optional.of(eleveur));
        when(produitRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> {
            Commande c = inv.getArgument(0);
            c.setIdCommande(777L);
            return c;
        });

        String idempotencyKey = "REQ-12345-ABC";

        // Première soumission
        Commande cmd1 = marketplaceService.passerCommande(2L, 100L, 10.0, idempotencyKey);
        assertNotNull(cmd1);
        assertEquals(777L, cmd1.getIdCommande());

        // Deuxième soumission rapide avec la même clé (dans les 30s)
        Commande cmd2 = marketplaceService.passerCommande(2L, 100L, 10.0, idempotencyKey);
        assertNotNull(cmd2);
        assertEquals(777L, cmd2.getIdCommande());

        // Le stock ne doit être décrémenté qu'une seule fois (50 - 10 = 40)
        assertEquals(40.0, produit.getQuantiteStock());
        verify(commandeRepository, times(1)).save(any(Commande.class));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. MACHINE À ÉTATS & CYCLE DE VIE (B-MUST-7, B-MUST-8)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Devrait autoriser les transitions nominales du cycle de commande")
    void changerStatut_TransitionsValides() {
        Commande commande = Commande.builder()
                .idCommande(10L)
                .statut(StatutCommande.EN_ATTENTE)
                .lignes(new ArrayList<>())
                .build();

        when(commandeRepository.findById(10L)).thenReturn(Optional.of(commande));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));

        // EN_ATTENTE -> CONFIRME
        Commande maj1 = marketplaceService.changerStatutCommande(10L, StatutCommande.CONFIRME);
        assertEquals(StatutCommande.CONFIRME, maj1.getStatut());

        // Simuler passage à PAYE (via marquerCommandePayee)
        commande.setStatut(StatutCommande.PAYE);

        // PAYE -> EXPEDIE
        Commande maj2 = marketplaceService.changerStatutCommande(10L, StatutCommande.EXPEDIE);
        assertEquals(StatutCommande.EXPEDIE, maj2.getStatut());

        // EXPEDIE -> LIVRE
        Commande maj3 = marketplaceService.changerStatutCommande(10L, StatutCommande.LIVRE);
        assertEquals(StatutCommande.LIVRE, maj3.getStatut());
    }

    @Test
    @DisplayName("Devrait interdire la transition directe vers PAYE via changerStatutCommande")
    void changerStatut_VersPayeDirectInterdit_LeveException() {
        Commande commande = Commande.builder()
                .idCommande(10L)
                .statut(StatutCommande.CONFIRME)
                .build();

        when(commandeRepository.findById(10L)).thenReturn(Optional.of(commande));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                marketplaceService.changerStatutCommande(10L, StatutCommande.PAYE));

        assertTrue(ex.getMessage().contains("marquerCommandePayee"));
    }

    @Test
    @DisplayName("Devrait interdire les transitions invalides (ex: LIVRE -> CONFIRME)")
    void changerStatut_TransitionInvalide_LeveException() {
        Commande commande = Commande.builder()
                .idCommande(10L)
                .statut(StatutCommande.LIVRE)
                .build();

        when(commandeRepository.findById(10L)).thenReturn(Optional.of(commande));

        assertThrows(BusinessException.class, () ->
                marketplaceService.changerStatutCommande(10L, StatutCommande.CONFIRME));
    }

    @Test
    @DisplayName("Devrait restituer le stock lors du refus, de l'annulation ou de l'expiration")
    void changerStatut_Annulation_RestitueStock() {
        Produit p = Produit.builder().idProduit(100L).quantiteStock(30.0).build();
        LigneCommande ligne = LigneCommande.builder().produit(p).quantite(20.0).build();

        Commande commande = Commande.builder()
                .idCommande(10L)
                .statut(StatutCommande.EN_ATTENTE)
                .lignes(List.of(ligne))
                .build();

        when(commandeRepository.findById(10L)).thenReturn(Optional.of(commande));
        when(produitRepository.findById(100L)).thenReturn(Optional.of(p));
        when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));

        // When : Annulation de la commande
        marketplaceService.changerStatutCommande(10L, StatutCommande.ANNULE);

        // Then : Le stock est restitué (30 + 20 = 50)
        assertEquals(50.0, p.getQuantiteStock());
        verify(produitRepository, times(1)).save(p);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. GESTION DES DÉLAIS 12H (CONFIRMATION & ANNULATION)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Devrait autoriser l'annulation dans le délai de 12h")
    void annulerCommande_DansDelai_Succes() {
        Commande commande = Commande.builder()
                .idCommande(15L)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(2)) // 2h après création
                .lignes(new ArrayList<>())
                .build();

        when(commandeRepository.findById(15L)).thenReturn(Optional.of(commande));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));

        Commande annulee = marketplaceService.annulerCommande(15L, "Changement d'avis");

        assertEquals(StatutCommande.ANNULE, annulee.getStatut());
    }

    @Test
    @DisplayName("Devrait orienter vers un traitement manuel si l'annulation intervient au-delà de 12h")
    void annulerCommande_DelaiDepasse_OrienteTraitementManuel() {
        Commande commande = Commande.builder()
                .idCommande(15L)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(14)) // 14h après création
                .build();

        when(commandeRepository.findById(15L)).thenReturn(Optional.of(commande));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                marketplaceService.annulerCommande(15L, "Délai dépassé"));

        assertTrue(ex.getMessage().contains("traitement manuel"));
    }

    @Test
    @DisplayName("Devrait confirmer la commande si le producteur est autorisé et dans le délai de 12h")
    void confirmerCommande_Succes() {
        Commande commande = Commande.builder()
                .idCommande(20L)
                .producteur(producteur)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(5))
                .lignes(new ArrayList<>())
                .build();

        when(commandeRepository.findById(20L)).thenReturn(Optional.of(commande));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));

        Commande confirmee = marketplaceService.confirmerCommande(20L, 1L);

        assertEquals(StatutCommande.CONFIRME, confirmee.getStatut());
    }

    @Test
    @DisplayName("Devrait rejeter la confirmation par un producteur non assigné")
    void confirmerCommande_ProducteurNonAssigne_LeveException() {
        Commande commande = Commande.builder()
                .idCommande(20L)
                .producteur(producteur)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(1))
                .build();

        when(commandeRepository.findById(20L)).thenReturn(Optional.of(commande));

        assertThrows(BusinessException.class, () ->
                marketplaceService.confirmerCommande(20L, 999L));
    }

    @Test
    @DisplayName("Devrait faire expirer la commande vers NON_CONFIRMEE si confirmation tentée après 12h")
    void confirmerCommande_Apres12h_PasseEnNonConfirmee() {
        Commande commande = Commande.builder()
                .idCommande(20L)
                .producteur(producteur)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(13))
                .lignes(new ArrayList<>())
                .build();

        when(commandeRepository.findById(20L)).thenReturn(Optional.of(commande));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));
        when(producteurRepository.findByCompteValideTrue(any(Pageable.class))).thenReturn(Page.empty());

        assertThrows(BusinessException.class, () ->
                marketplaceService.confirmerCommande(20L, 1L));

        assertEquals(StatutCommande.NON_CONFIRMEE, commande.getStatut());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. EXPIRATION PLANIFIÉE (JOB SCHEDULER)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Devrait faire expirer toutes les commandes EN_ATTENTE de plus de 12h")
    void expirerCommandesNonConfirmees_ScanJob() {
        Commande cmd1 = Commande.builder()
                .idCommande(101L)
                .producteur(producteur)
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now().minusHours(15))
                .lignes(new ArrayList<>())
                .build();

        when(commandeRepository.findByStatutAndDateCommandeBefore(eq(StatutCommande.EN_ATTENTE), any(OffsetDateTime.class)))
                .thenReturn(List.of(cmd1));
        when(commandeRepository.findById(101L)).thenReturn(Optional.of(cmd1));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));
        when(producteurRepository.findByCompteValideTrue(any(Pageable.class))).thenReturn(Page.empty());

        List<Commande> expirees = marketplaceService.expirerCommandesNonConfirmees();

        assertEquals(1, expirees.size());
        assertEquals(StatutCommande.NON_CONFIRMEE, cmd1.getStatut());
    }
}
