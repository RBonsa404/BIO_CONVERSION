package com.bioconversion.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IotApiKeyFilterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void authenticatedProducerCanListSensorsWithoutDeviceApiKey() throws Exception {
        mockMvc.perform(get("/api/v1/iot/capteurs/producteur/1")
                        .with(user("1").roles("PRODUCTEUR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void telemetryIngestionStillRequiresDeviceApiKey() throws Exception {
        mockMvc.perform(post("/api/v1/iot/telemetrie")
                        .param("codeCapteur", "CAP-001")
                        .param("temperature", "25")
                        .param("humidite", "60")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isUnauthorized());
    }
}
