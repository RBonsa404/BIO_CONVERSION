package com.bioconversion.commission;

import com.bioconversion.common.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Écritures dans les registres du séquestre et du fonds")
class RegistreServiceTest {

    private static final Long COMMANDE = 1L;
    private static final Long AUTEUR = 7L;

    @Mock
    private MouvementSequestreRepository sequestreRepository;

    @Mock
    private MouvementFondsRepository fondsRepository;

    @InjectMocks
    private RegistreService registreService;

    /** Commande de 50 000 F : commission 2 500 F, net 47 500 F. */
    private final MontantsCommission montants =
            CalculCommission.calculer(new BigDecimal("50000"), new BigDecimal("0.0500"));

    @Test
    @DisplayName("Paiement confirmé : le montant total entre dans le séquestre")
    void crediterSequestre() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(false);

        assertTrue(registreService.crediterSequestre(COMMANDE, new BigDecimal("50000"), "REF-1", AUTEUR));

        ArgumentCaptor<MouvementSequestre> ligne = ArgumentCaptor.forClass(MouvementSequestre.class);
        verify(sequestreRepository).save(ligne.capture());
        assertEquals(TypeMouvementSequestre.ENTREE, ligne.getValue().getTypeMouvement());
        assertEquals(new BigDecimal("50000"), ligne.getValue().getMontant());
        assertEquals("REF-1", ligne.getValue().getReferenceTransaction());
    }

    @Test
    @DisplayName("Webhook reçu deux fois : le séquestre n'est crédité qu'une fois")
    void crediterSequestreDeuxFois() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(true);

        assertFalse(registreService.crediterSequestre(COMMANDE, new BigDecimal("50000"), "REF-1", AUTEUR));

        verify(sequestreRepository, never()).save(any());
    }

    @Test
    @DisplayName("Versement : -50 000 au séquestre, +2 500 de commission et -475 de frais au fonds")
    void enregistrerVersement() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.SORTIE_VERSEMENT)).thenReturn(false);
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(true);
        when(sequestreRepository.sommeCommande(COMMANDE)).thenReturn(new BigDecimal("50000"));

        assertTrue(registreService.enregistrerVersement(COMMANDE, montants, new BigDecimal("475"), AUTEUR));

        ArgumentCaptor<MouvementSequestre> sortie = ArgumentCaptor.forClass(MouvementSequestre.class);
        verify(sequestreRepository).save(sortie.capture());
        assertEquals(TypeMouvementSequestre.SORTIE_VERSEMENT, sortie.getValue().getTypeMouvement());
        assertEquals(new BigDecimal("-50000"), sortie.getValue().getMontant());

        ArgumentCaptor<MouvementFonds> fonds = ArgumentCaptor.forClass(MouvementFonds.class);
        verify(fondsRepository, times(2)).save(fonds.capture());
        List<MouvementFonds> lignes = fonds.getAllValues();
        assertEquals(TypeMouvementFonds.COMMISSION, lignes.get(0).getTypeMouvement());
        assertEquals(new BigDecimal("2500"), lignes.get(0).getMontant());
        assertEquals(TypeMouvementFonds.FRAIS_VERSEMENT, lignes.get(1).getTypeMouvement());
        assertEquals(new BigDecimal("-475"), lignes.get(1).getMontant());
    }

    @Test
    @DisplayName("Versement déjà enregistré : rien n'est écrit une deuxième fois")
    void versementDeuxFois() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.SORTIE_VERSEMENT)).thenReturn(true);

        assertFalse(registreService.enregistrerVersement(COMMANDE, montants, new BigDecimal("475"), AUTEUR));

        verify(sequestreRepository, never()).save(any());
        verify(fondsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Pas de versement sans argent en séquestre")
    void versementSansSequestre() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.SORTIE_VERSEMENT)).thenReturn(false);
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(false);

        assertThrows(BusinessException.class,
                () -> registreService.enregistrerVersement(COMMANDE, montants, new BigDecimal("475"), AUTEUR));
        verify(fondsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Remboursement : l'éleveur récupère tout, aucune commission")
    void enregistrerRemboursement() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.SORTIE_REMBOURSEMENT)).thenReturn(false);
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(true);
        when(sequestreRepository.sommeCommande(COMMANDE)).thenReturn(new BigDecimal("50000"));

        assertTrue(registreService.enregistrerRemboursement(COMMANDE, new BigDecimal("50000"), AUTEUR));

        ArgumentCaptor<MouvementSequestre> sortie = ArgumentCaptor.forClass(MouvementSequestre.class);
        verify(sequestreRepository).save(sortie.capture());
        assertEquals(TypeMouvementSequestre.SORTIE_REMBOURSEMENT, sortie.getValue().getTypeMouvement());
        assertEquals(new BigDecimal("-50000"), sortie.getValue().getMontant());
        verify(fondsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Pas de remboursement d'une commande déjà versée au producteur")
    void remboursementApresVersement() {
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.SORTIE_REMBOURSEMENT)).thenReturn(false);
        when(sequestreRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementSequestre.ENTREE)).thenReturn(true);
        when(sequestreRepository.sommeCommande(COMMANDE)).thenReturn(BigDecimal.ZERO);

        assertThrows(BusinessException.class,
                () -> registreService.enregistrerRemboursement(COMMANDE, new BigDecimal("50000"), AUTEUR));
        verify(sequestreRepository, never()).save(any());
    }

    @Test
    @DisplayName("Commission espèces encaissée : elle entre dans le fonds, une seule fois")
    void commissionEspeces() {
        when(fondsRepository.existsByCommandeIdAndTypeMouvement(COMMANDE, TypeMouvementFonds.COMMISSION_ESPECES))
                .thenReturn(false, true);

        assertTrue(registreService.crediterCommissionEspeces(COMMANDE, new BigDecimal("500"), AUTEUR));
        assertFalse(registreService.crediterCommissionEspeces(COMMANDE, new BigDecimal("500"), AUTEUR));

        ArgumentCaptor<MouvementFonds> ligne = ArgumentCaptor.forClass(MouvementFonds.class);
        verify(fondsRepository, times(1)).save(ligne.capture());
        assertEquals(new BigDecimal("500"), ligne.getValue().getMontant());
    }

    @Test
    @DisplayName("Les soldes sont la somme des lignes, zéro pour un registre vide")
    void soldes() {
        when(sequestreRepository.sommeTotale()).thenReturn(null);
        when(fondsRepository.sommeTotale()).thenReturn(new BigDecimal("2025"));

        assertEquals(BigDecimal.ZERO, registreService.soldeSequestre());
        assertEquals(new BigDecimal("2025"), registreService.soldeFonds());
    }

    @Test
    @DisplayName("Montant nul ou négatif refusé")
    void montantInvalide() {
        assertThrows(IllegalArgumentException.class,
                () -> registreService.crediterSequestre(COMMANDE, BigDecimal.ZERO, "REF-1", AUTEUR));
        assertThrows(IllegalArgumentException.class,
                () -> registreService.crediterCommissionEspeces(COMMANDE, new BigDecimal("-5"), AUTEUR));
    }
}