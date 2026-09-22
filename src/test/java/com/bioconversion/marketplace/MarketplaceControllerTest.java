package com.bioconversion.marketplace;

import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.security.BioUserDetailsService;
import com.bioconversion.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test fonctionnel REST pour MarketplaceController.
 *
 * <p>Exigence du CDC §4.1 (Temps de réponse < 2s) et Document de Dispatch §2.1 ("Tests fonctionnels").</p>
 */
@WebMvcTest(MarketplaceController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MarketplaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketplaceService marketplaceService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private BioUserDetailsService bioUserDetailsService;

    @Test
    @DisplayName("Devrait retourner HTTP 200 OK et le JSON des producteurs proches")
    void rechercherProducteursParRayon_RetourneJsonHttp200() throws Exception {
        // Given : DTO simulé pour Koubri
        ProducteurLocaliseDto dto = ProducteurLocaliseDto.builder()
                .producteurId(1L)
                .nomExploitation("Ferme BSFL Koubri")
                .ville("Koubri")
                .province("Kadiogo")
                .latitude(12.1813)
                .longitude(-1.3962)
                .distanceKm(24.85)
                .build();

        given(marketplaceService.rechercherProducteursParRayon(12.3714, -1.5197, 50.0))
                .willReturn(List.of(dto));

        // When & Then : Simulation de l'appel HTTP GET par l'application mobile
        mockMvc.perform(get("/api/v1/marketplace/producteurs/recherche-geolocalisee")
                        .param("latitude", "12.3714")
                        .param("longitude", "-1.5197")
                        .param("rayonKm", "50.0")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].nomExploitation").value("Ferme BSFL Koubri"))
                .andExpect(jsonPath("$.data[0].ville").value("Koubri"))
                .andExpect(jsonPath("$.data[0].distanceKm").value(24.85));
    }
}

