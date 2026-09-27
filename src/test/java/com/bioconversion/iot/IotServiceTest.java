package com.bioconversion.iot;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import com.bioconversion.utilisateur.StatutUtilisateur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service IoT")
class IotServiceTest {

    @Mock
    private CapteurRepository capteurRepository;

    @Mock
    private AlerteIoTRepository alerteIoTRepository;

    @Mock
    private ProducteurRepository producteurRepository;

    @InjectMocks
    private IotServiceImpl iotService;

    private Capteur capteur;
    private Producteur producteur;

    @BeforeEach
    void setUp() {
        producteur = Producteur.builder()
                .idUtilisateur(1L)
                .nom("Doe")
                .prenom("John")
                .telephone("+22670123456")
                .statut(StatutUtilisateur.ACTIF)
                .nomExploitation("Ferme Test")
                .build();

        capteur = Capteur.builder()
                .idCapteur(1L)
                .producteur(producteur)
                .codeIdentifiant("CAP-001")
                .typeCapteur("TEMPERATURE")
                .estActif(true)
                .seuilTemperatureMax(39.0)
                .seuilHumiditeMax(90.0)
                .build();
    }

    @Test
    @DisplayName("Enregistrer télémesure avec succès")
    void enregistrerTelemetrie_Success() {
        // Given
        when(capteurRepository.findByCodeIdentifiant("CAP-001")).thenReturn(Optional.of(capteur));

        // When
        iotService.enregistrerTelemetrie("CAP-001", 25.0, 60.0);

        // Then
        verify(capteurRepository).findByCodeIdentifiant("CAP-001");
        verify(alerteIoTRepository, never()).save(any(AlerteIoT.class)); // No alert - within thresholds
    }

    @Test
    @DisplayName("Enregistrer télémesure génère alerte si température haute")
    void enregistrerTelemetrie_HighTemperature_GeneratesAlert() {
        // Given
        when(capteurRepository.findByCodeIdentifiant("CAP-001")).thenReturn(Optional.of(capteur));
        when(alerteIoTRepository.save(any(AlerteIoT.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        iotService.enregistrerTelemetrie("CAP-001", 42.0, 60.0);

        // Then
        verify(capteurRepository).findByCodeIdentifiant("CAP-001");
        verify(alerteIoTRepository).save(any(AlerteIoT.class)); // Alert created for high temperature
    }

    @Test
    @DisplayName("Enregistrer télémesure génère alerte si humidité haute")
    void enregistrerTelemetrie_HighHumidity_GeneratesAlert() {
        // Given
        when(capteurRepository.findByCodeIdentifiant("CAP-001")).thenReturn(Optional.of(capteur));
        when(alerteIoTRepository.save(any(AlerteIoT.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        iotService.enregistrerTelemetrie("CAP-001", 25.0, 95.0);

        // Then
        verify(capteurRepository).findByCodeIdentifiant("CAP-001");
        verify(alerteIoTRepository).save(any(AlerteIoT.class)); // Alert created for high humidity
    }

    @Test
    @DisplayName("Enregistrer télémesure échoue pour capteur inconnu")
    void enregistrerTelemetrie_SensorNotFound_ThrowsException() {
        // Given
        when(capteurRepository.findByCodeIdentifiant("CAP-UNKNOWN")).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> iotService.enregistrerTelemetrie("CAP-UNKNOWN", 25.0, 60.0));
        assertNotNull(exception);

        verify(capteurRepository).findByCodeIdentifiant("CAP-UNKNOWN");
        verify(alerteIoTRepository, never()).save(any());
    }

    @Test
    @DisplayName("Enregistrer télémesure échoue pour capteur inactif")
    void enregistrerTelemetrie_InactiveSensor_ThrowsException() {
        // Given
        capteur.setEstActif(false);
        when(capteurRepository.findByCodeIdentifiant("CAP-001")).thenReturn(Optional.of(capteur));

        // When & Then
        assertThrows(BusinessException.class,
                () -> iotService.enregistrerTelemetrie("CAP-001", 25.0, 60.0));

        verify(capteurRepository).findByCodeIdentifiant("CAP-001");
        verify(alerteIoTRepository, never()).save(any());
    }

    @Test
    @DisplayName("Changer statut capteur à actif")
    void changerStatutCapteur_Activate_Success() {
        // Given
        capteur.setEstActif(false);
        when(capteurRepository.findById(1L)).thenReturn(Optional.of(capteur));
        when(capteurRepository.save(any(Capteur.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        iotService.changerStatutCapteur(1L, true);

        // Then
        verify(capteurRepository).findById(1L);
        verify(capteurRepository).save(argThat(c -> c.isEstActif()));
    }

    @Test
    @DisplayName("Changer statut capteur à inactif")
    void changerStatutCapteur_Deactivate_Success() {
        // Given
        when(capteurRepository.findById(1L)).thenReturn(Optional.of(capteur));
        when(capteurRepository.save(any(Capteur.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        iotService.changerStatutCapteur(1L, false);

        // Then
        verify(capteurRepository).findById(1L);
        verify(capteurRepository).save(argThat(c -> !c.isEstActif()));
    }

    @Test
    @DisplayName("Changer statut capteur échoue pour capteur inconnu")
    void changerStatutCapteur_NotFound_ThrowsException() {
        // Given
        when(capteurRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> iotService.changerStatutCapteur(1L, true));
        assertTrue(exception.getMessage().contains("Capteur introuvable"));

        verify(capteurRepository).findById(1L);
        verify(capteurRepository, never()).save(any());
    }

    @Test
    @DisplayName("Obtenir capteurs du producteur")
    void obtenirCapteursProducteur_Success() {
        // Given
        when(capteurRepository.findByProducteurIdUtilisateur(1L)).thenReturn(java.util.List.of(capteur));

        // When
        var result = iotService.obtenirCapteursProducteur(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(capteurRepository).findByProducteurIdUtilisateur(1L);
    }

}
