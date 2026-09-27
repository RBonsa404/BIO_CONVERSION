package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service réseau producteurs")
class ReseauProducteurServiceTest {

    @Mock
    private ProducteurRepository producteurRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private ReseauProducteurServiceImpl reseauProducteurService;

    private Producteur producteur;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        producteur = Producteur.builder()
                .idUtilisateur(1L)
                .nom("Doe")
                .prenom("John")
                .telephone("+22670123456")
                .statut(StatutUtilisateur.EN_ATTENTE_VALIDATION)
                .nomExploitation("Ferme Test")
                .capaciteProduction(100.0)
                .build();

        pageable = Pageable.ofSize(10);
    }

    @Test
    @DisplayName("Lister les producteurs validés")
    void listerProducteursValides_Success() {
        // Given
        Page<Producteur> expectedPage = new PageImpl<>(List.of(producteur));
        when(producteurRepository.findByStatut(StatutUtilisateur.ACTIF, pageable))
                .thenReturn(expectedPage);

        // When
        Page<Producteur> result = reseauProducteurService.listerProducteursValides(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(producteurRepository).findByStatut(StatutUtilisateur.ACTIF, pageable);
    }

    @Test
    @DisplayName("Valider un producteur change le statut à ACTIF")
    void validerProducteur_Approve_ChangesStatusToActif() {
        // Given
        when(producteurRepository.findById(1L)).thenReturn(Optional.of(producteur));
        when(producteurRepository.save(any(Producteur.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        Producteur result = reseauProducteurService.validerProducteur(1L, true);

        // Then
        assertNotNull(result);
        assertEquals(StatutUtilisateur.ACTIF, result.getStatut());
        verify(producteurRepository).findById(1L);
        verify(producteurRepository).save(any(Producteur.class));
    }

    @Test
    @DisplayName("Refuser un producteur garde le statut EN_ATTENTE_VALIDATION")
    void validerProducteur_Reject_KeepsStatusEnAttente() {
        // Given
        when(producteurRepository.findById(1L)).thenReturn(Optional.of(producteur));
        when(producteurRepository.save(any(Producteur.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        Producteur result = reseauProducteurService.validerProducteur(1L, false);

        // Then
        assertNotNull(result);
        assertEquals(StatutUtilisateur.EN_ATTENTE_VALIDATION, result.getStatut());
        verify(producteurRepository).findById(1L);
        verify(producteurRepository).save(any(Producteur.class));
    }

    @Test
    @DisplayName("Valider un producteur inexistant lance une exception")
    void validerProducteur_NotFound_ThrowsException() {
        // Given
        when(producteurRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> reseauProducteurService.validerProducteur(1L, true));
        assertTrue(exception.getMessage().contains("Producteur non trouvé"));

        verify(producteurRepository).findById(1L);
        verify(producteurRepository, never()).save(any());
    }

    @Test
    @DisplayName("Suspendre un compte producteur")
    void suspendreCompte_Producteur_Success() {
        // Given
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(producteur));
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        Producteur result = reseauProducteurService.suspendreCompte(1L);

        // Then
        assertNotNull(result);
        assertEquals(StatutUtilisateur.SUSPENDU, result.getStatut());
        verify(utilisateurRepository).findById(1L);
        verify(utilisateurRepository).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("Suspendre un utilisateur inexistant lance une exception")
    void suspendreCompte_NotFound_ThrowsException() {
        // Given
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> reseauProducteurService.suspendreCompte(1L));
        assertTrue(exception.getMessage().contains("Utilisateur non trouvé"));

        verify(utilisateurRepository).findById(1L);
        verify(utilisateurRepository, never()).save(any());
    }

    @Test
    @DisplayName("Lister les producteurs par province")
    void listerProducteursParProvince_Success() {
        // Given
        Page<Producteur> expectedPage = new PageImpl<>(List.of(producteur));
        when(producteurRepository.findByLocalisationProvinceIgnoreCase("Centre", pageable))
                .thenReturn(expectedPage);

        // When
        Page<Producteur> result = reseauProducteurService.listerProducteursParProvince("Centre", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(producteurRepository).findByLocalisationProvinceIgnoreCase("Centre", pageable);
    }
}
