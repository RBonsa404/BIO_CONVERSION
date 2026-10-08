package com.bioconversion.marketplace;

import com.bioconversion.marketplace.dto.ChangerStatutCommandeRequest;
import com.bioconversion.marketplace.dto.PasserCommandeRequest;
import com.bioconversion.security.BioUserDetailsService;
import com.bioconversion.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.OffsetDateTime;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests fonctionnels REST pour les endpoints de commande de MarketplaceController.
 * Les tests authentifiés utilisent un nom d'utilisateur numérique, comme le principal JWT,
 * afin que SecurityUtils.getCurrentUserId() puisse retrouver l'identifiant courant.
 */
@WebMvcTest(MarketplaceController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MarketplaceCommandeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MarketplaceService marketplaceService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private BioUserDetailsService bioUserDetailsService;

    @Test
    @WithMockUser(username = "7")
    @DisplayName("Devrait créer une commande avec l'identifiant de l'éleveur authentifié")
    void passerCommande_RetourneHttp200() throws Exception {
        PasserCommandeRequest request = PasserCommandeRequest.builder()
                .eleveurId(7L)
                .produitId(100L)
                .quantite(5.0)
                .idempotencyKey("REQ-12345")
                .build();
        Commande commande = commande(50L, StatutCommande.EN_ATTENTE);
        given(marketplaceService.passerCommande(7L, 100L, 5.0, "REQ-12345"))
                .willReturn(commande);

        mockMvc.perform(post("/api/v1/marketplace/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.idCommande").value(50))
                .andExpect(jsonPath("$.data.statut").value("EN_ATTENTE"));

        verify(marketplaceService).passerCommande(7L, 100L, 5.0, "REQ-12345");
    }

    @Test
    @WithMockUser(username = "7")
    @DisplayName("Devrait confirmer une commande pour l'utilisateur authentifié")
    void confirmerCommande_RetourneHttp200() throws Exception {
        given(marketplaceService.confirmerCommande(50L, 7L))
                .willReturn(commande(50L, StatutCommande.CONFIRME));

        mockMvc.perform(post("/api/v1/marketplace/commandes/50/confirmer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("CONFIRME"));

        verify(marketplaceService).confirmerCommande(50L, 7L);
    }

    @Test
    @WithMockUser(username = "7")
    @DisplayName("Devrait annuler une commande pour l'utilisateur authentifié")
    void annulerCommande_RetourneHttp200() throws Exception {
        given(marketplaceService.annulerCommande(50L, "Changement d'avis", 7L))
                .willReturn(commande(50L, StatutCommande.ANNULE));

        mockMvc.perform(post("/api/v1/marketplace/commandes/50/annuler")
                        .param("motif", "Changement d'avis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("ANNULE"));

        verify(marketplaceService).annulerCommande(50L, "Changement d'avis", 7L);
    }

    @Test
    @WithMockUser(username = "7")
    @DisplayName("Devrait déclarer l'expédition via PATCH /api/v1/marketplace/commandes/{id}/statut")
    void changerStatut_RetourneHttp200() throws Exception {
        ChangerStatutCommandeRequest request = ChangerStatutCommandeRequest.builder()
                .nouveauStatut(StatutCommande.EXPEDIE)
                .build();

        given(marketplaceService.changerStatutCommande(eq(50L), eq(StatutCommande.EXPEDIE), eq(7L)))
                .willReturn(commande(50L, StatutCommande.EXPEDIE));

        mockMvc.perform(patch("/api/v1/marketplace/commandes/50/statut")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("EXPEDIE"));

        verify(marketplaceService).changerStatutCommande(50L, StatutCommande.EXPEDIE, 7L);
    }

    @Test
    @DisplayName("Devrait refuser un changement de statut sans authentification")
    void changerStatut_SansAuthentification_RetourneHttp401() throws Exception {
        ChangerStatutCommandeRequest request = ChangerStatutCommandeRequest.builder()
                .nouveauStatut(StatutCommande.EXPEDIE)
                .build();

        mockMvc.perform(patch("/api/v1/marketplace/commandes/50/statut")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    private Commande commande(Long id, StatutCommande statut) {
        return Commande.builder()
                .idCommande(id)
                .numeroCommande("CMD-20260922-12345678")
                .statut(statut)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();
    }
}
