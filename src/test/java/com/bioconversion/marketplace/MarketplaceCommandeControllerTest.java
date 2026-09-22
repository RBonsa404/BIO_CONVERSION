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

import java.time.OffsetDateTime;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests fonctionnels REST pour les endpoints de commande de MarketplaceController.
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
    @DisplayName("Devrait créer une commande via POST /api/v1/marketplace/commandes")
    void passerCommande_RetourneHttp200() throws Exception {
        PasserCommandeRequest request = PasserCommandeRequest.builder()
                .eleveurId(2L)
                .produitId(100L)
                .quantite(15.0)
                .idempotencyKey("KEY-12345")
                .build();

        Commande commande = Commande.builder()
                .idCommande(50L)
                .numeroCommande("CMD-20260922-12345678")
                .statut(StatutCommande.EN_ATTENTE)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();

        given(marketplaceService.passerCommande(eq(2L), eq(100L), eq(15.0), anyString()))
                .willReturn(commande);

        mockMvc.perform(post("/api/v1/marketplace/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("X-Idempotency-Key", "KEY-12345")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.idCommande").value(50))
                .andExpect(jsonPath("$.data.numeroCommande").value("CMD-20260922-12345678"))
                .andExpect(jsonPath("$.data.statut").value("EN_ATTENTE"));
    }

    @Test
    @DisplayName("Devrait modifier le statut via PATCH /api/v1/marketplace/commandes/{id}/statut")
    void changerStatut_RetourneHttp200() throws Exception {
        ChangerStatutCommandeRequest request = ChangerStatutCommandeRequest.builder()
                .nouveauStatut(StatutCommande.CONFIRME)
                .build();

        Commande commande = Commande.builder()
                .idCommande(50L)
                .numeroCommande("CMD-20260922-12345678")
                .statut(StatutCommande.CONFIRME)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();

        given(marketplaceService.changerStatutCommande(eq(50L), eq(StatutCommande.CONFIRME)))
                .willReturn(commande);

        mockMvc.perform(patch("/api/v1/marketplace/commandes/50/statut")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("CONFIRME"));
    }

    @Test
    @DisplayName("Devrait annuler la commande via POST /api/v1/marketplace/commandes/{id}/annuler")
    void annulerCommande_RetourneHttp200() throws Exception {
        Commande commande = Commande.builder()
                .idCommande(50L)
                .numeroCommande("CMD-20260922-12345678")
                .statut(StatutCommande.ANNULE)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();

        given(marketplaceService.annulerCommande(eq(50L), any()))
                .willReturn(commande);

        mockMvc.perform(post("/api/v1/marketplace/commandes/50/annuler")
                        .param("motif", "Annulation client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("ANNULE"));
    }

    @Test
    @DisplayName("Devrait confirmer la commande via POST /api/v1/marketplace/commandes/{id}/confirmer")
    void confirmerCommande_RetourneHttp200() throws Exception {
        Commande commande = Commande.builder()
                .idCommande(50L)
                .numeroCommande("CMD-20260922-12345678")
                .statut(StatutCommande.CONFIRME)
                .dateCommande(OffsetDateTime.now())
                .lignes(new ArrayList<>())
                .build();

        given(marketplaceService.confirmerCommande(eq(50L), eq(1L)))
                .willReturn(commande);

        mockMvc.perform(post("/api/v1/marketplace/commandes/50/confirmer")
                        .param("producteurId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statut").value("CONFIRME"));
    }
}
