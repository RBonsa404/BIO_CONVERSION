package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.paiement.StatutPaiement;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Suivi de livraison par les parties de la commande et sort du paiement à l'annulation.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Suivi de livraison et annulation d'une commande")
class MarketplaceServiceSuiviLivraisonTest {

    private static final long PRODUCTEUR_ID = 1L;
    private static final long ELEVEUR_ID = 2L;
    private static final long AUTRE_UTILISATEUR_ID = 99L;

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

    private Commande commande;
    private Produit produit;

    @BeforeEach
    void setUp() {
        Producteur producteur = Producteur.builder().idUtilisateur(PRODUCTEUR_ID).nomExploitation("Ferme Test").build();
        Eleveur eleveur = Eleveur.builder().idUtilisateur(ELEVEUR_ID).typeElevage("AVICULTURE").build();
        produit = Produit.builder()
                .idProduit(100L)
                .nomProduit("Larves fraîches")
                .prix(BigDecimal.valueOf(450))
                .quantiteStock(30.0)
                .disponibilite(true)
                .producteur(producteur)
                .build();

        commande = Commande.builder()
                .idCommande(50L)
                .numeroCommande("CMD-TEST")
                .producteur(producteur)
                .eleveur(eleveur)
                .statut(StatutCommande.PAYE)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();
        commande.ajouterLigne(LigneCommande.builder()
                .produit(produit)
                .quantite(10.0)
                .prixUnitaireFige(BigDecimal.valueOf(450))
                .build());

        when(commandeRepository.findById(50L)).thenReturn(Optional.of(commande));
        lenient().when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(produitRepository.findById(100L)).thenReturn(Optional.of(produit));
        lenient().when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("Le producteur déclare l'expédition d'une commande payée")
    void producteurExpedie() {
        Commande resultat = marketplaceService.changerStatutCommande(50L, StatutCommande.EXPEDIE, PRODUCTEUR_ID);

        assertEquals(StatutCommande.EXPEDIE, resultat.getStatut());
    }

    @Test
    @DisplayName("L'éleveur ne peut pas déclarer l'expédition à la place du producteur")
    void eleveurNePeutPasExpedier() {
        assertThrows(ForbiddenException.class,
                () -> marketplaceService.changerStatutCommande(50L, StatutCommande.EXPEDIE, ELEVEUR_ID));

        assertEquals(StatutCommande.PAYE, commande.getStatut());
    }

    @Test
    @DisplayName("L'éleveur confirme la réception d'une commande expédiée")
    void eleveurConfirmeLaReception() {
        commande.setStatut(StatutCommande.EXPEDIE);

        Commande resultat = marketplaceService.changerStatutCommande(50L, StatutCommande.LIVRE, ELEVEUR_ID);

        assertEquals(StatutCommande.LIVRE, resultat.getStatut());
    }

    @Test
    @DisplayName("Une commande payée ne peut pas être déclarée livrée sans avoir été expédiée")
    void livraisonSansExpeditionRefusee() {
        assertThrows(BusinessException.class,
                () -> marketplaceService.changerStatutCommande(50L, StatutCommande.LIVRE, ELEVEUR_ID));
    }

    @Test
    @DisplayName("Un utilisateur étranger à la commande ne peut pas en changer le statut")
    void tiersRefuse() {
        assertThrows(ForbiddenException.class,
                () -> marketplaceService.changerStatutCommande(50L, StatutCommande.EXPEDIE, AUTRE_UTILISATEUR_ID));

        verify(commandeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Le statut PAYE ne s'obtient pas par cette voie, même pour une partie de la commande")
    void statutPayeReserveAuPaiement() {
        commande.setStatut(StatutCommande.CONFIRME);

        assertThrows(BusinessException.class,
                () -> marketplaceService.changerStatutCommande(50L, StatutCommande.PAYE, ELEVEUR_ID));

        assertEquals(StatutCommande.CONFIRME, commande.getStatut());
    }

    @Test
    @DisplayName("Annuler une commande payée rend le stock et passe le paiement à rembourser")
    void annulationCommandePayee() {
        Paiement paiement = Paiement.builder()
                .commande(commande)
                .montant(BigDecimal.valueOf(4500))
                .operateur("ORANGE_MONEY")
                .referenceTransaction("REF-1")
                .statutPaiement(StatutPaiement.CONFIRME)
                .build();
        commande.setPaiement(paiement);

        Commande resultat = marketplaceService.annulerCommande(50L, "Changement d'avis", ELEVEUR_ID);

        assertEquals(StatutCommande.ANNULE, resultat.getStatut());
        assertEquals(StatutPaiement.REMBOURSE, paiement.getStatutPaiement());
        assertEquals(40.0, produit.getQuantiteStock());
    }

    @Test
    @DisplayName("Annuler une commande dont le paiement est en attente abandonne ce paiement")
    void annulationAvecPaiementEnAttente() {
        commande.setStatut(StatutCommande.CONFIRME);
        Paiement paiement = Paiement.builder()
                .commande(commande)
                .montant(BigDecimal.valueOf(4500))
                .operateur("ORANGE_MONEY")
                .referenceTransaction("REF-2")
                .statutPaiement(StatutPaiement.EN_ATTENTE)
                .build();
        commande.setPaiement(paiement);

        marketplaceService.annulerCommande(50L, null, ELEVEUR_ID);

        assertEquals(StatutPaiement.ECHOUE, paiement.getStatutPaiement());
    }
}
