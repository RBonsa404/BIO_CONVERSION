package com.bioconversion.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Conversion de DATABASE_URL en propriétés de source de données")
class DatabaseUrlEnvironmentPostProcessorTest {

    @Test
    @DisplayName("Convertit une URL postgresql:// d'hébergeur en URL JDBC et identifiants")
    void convertitUneUrlHebergeur() {
        Map<String, Object> proprietes = DatabaseUrlEnvironmentPostProcessor.convertir(
                "postgresql://postgres:s3cr%40t@postgres.railway.internal:5432/railway");

        assertEquals("jdbc:postgresql://postgres.railway.internal:5432/railway",
                proprietes.get("spring.datasource.url"));
        assertEquals("postgres", proprietes.get("spring.datasource.username"));
        assertEquals("s3cr@t", proprietes.get("spring.datasource.password"));
    }

    @Test
    @DisplayName("Accepte le préfixe postgres:// et conserve les paramètres de connexion")
    void conserveLesParametres() {
        Map<String, Object> proprietes = DatabaseUrlEnvironmentPostProcessor.convertir(
                "postgres://user:pass@db.example.com/base?sslmode=require");

        assertEquals("jdbc:postgresql://db.example.com/base?sslmode=require",
                proprietes.get("spring.datasource.url"));
        assertEquals("user", proprietes.get("spring.datasource.username"));
        assertEquals("pass", proprietes.get("spring.datasource.password"));
    }

    @Test
    @DisplayName("Laisse passer une URL déjà au format JDBC")
    void laissePasserUneUrlJdbc() {
        Map<String, Object> proprietes = DatabaseUrlEnvironmentPostProcessor.convertir(
                "jdbc:postgresql://localhost:5432/bioconversion_db");

        assertEquals(Map.of("spring.datasource.url", "jdbc:postgresql://localhost:5432/bioconversion_db"),
                proprietes);
    }

    @Test
    @DisplayName("Ignore une valeur qui n'est pas une URL PostgreSQL")
    void ignoreUneValeurInconnue() {
        assertTrue(DatabaseUrlEnvironmentPostProcessor.convertir("mysql://user:pass@host/db").isEmpty());
    }
}
