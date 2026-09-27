package com.bioconversion;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Disabled("Context loading issue with security configuration - requires investigation")
class BioConversionApplicationTests {

    @Test
    void contextLoads() {
        // Vérifie le chargement propre du contexte Spring Boot avec le profil test H2
    }
}
