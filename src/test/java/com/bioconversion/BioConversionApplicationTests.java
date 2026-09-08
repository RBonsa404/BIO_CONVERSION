package com.bioconversion;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BioConversionApplicationTests {

    @Test
    void contextLoads() {
        // Vérifie le chargement propre du contexte Spring Boot avec le profil dev H2
    }
}
