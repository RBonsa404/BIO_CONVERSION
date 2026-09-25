package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReseauProducteurServiceImplTest {

    @Mock
    private ProducteurRepository producteurRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private ReseauProducteurServiceImpl service;

    @Test
    void mettreAJourCapaciteProduction_doitMettreAJourEtHorodater() {
    // ARRANGE : préparer un faux producteur et dire au mock quoi répondre
    Producteur producteur = Producteur.builder()
        .idUtilisateur(1L)
        .capaciteProduction(10.0)
        .build();

    when(producteurRepository.findById(1L)).thenReturn(java.util.Optional.of(producteur));
    when(producteurRepository.save(any(Producteur.class))).thenAnswer(inv -> inv.getArgument(0));

    // ACT : appeler la methode qu'on teste
    Producteur resultat = service.mettreAJourCapaciteProduction(1L, 25.0);

    // ASSERT : verifier que le resultat est correct
    assertThat(resultat.getCapaciteProduction()).isEqualTo(25.0);
    assertThat(resultat.getCapaciteDerniereMaj()).isNotNull();
}

}