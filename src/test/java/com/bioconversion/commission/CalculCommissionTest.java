package com.bioconversion.commission;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Calcul de la commission (5 % payés par le producteur)")
class CalculCommissionTest {

    /** Le taux tel qu'il est lu en base : NUMERIC(19,4). */
    private static final BigDecimal TAUX = new BigDecimal("0.0500");
    private static final BigDecimal SEUIL = new BigDecimal("10000");

    @Test
    @DisplayName("Exemple de la consigne : 50 000 F -> commission 2 500 F, net 47 500 F")
    void exempleDeLaConsigne() {
        MontantsCommission m = CalculCommission.calculer(new BigDecimal("50000"), TAUX);

        assertEquals(new BigDecimal("50000"), m.montantTotal());
        assertEquals(new BigDecimal("2500"), m.commission());
        assertEquals(new BigDecimal("47500"), m.netProducteur());
    }

    @ParameterizedTest(name = "Orange Money {0} F -> commission {1} F, net {2} F")
    @CsvSource({
            "50000, 2500, 47500",
            "10000,  500,  9500",
            "9999,   500,  9499",   // 499,95 arrondi à 500 (HALF_UP)
            "12345,  617, 11728",   // 617,25 arrondi à 617
            "33333, 1667, 31666",   // 1 666,65 arrondi à 1 667
            "10,       1,     9",   // 0,5 arrondi à 1
            "1,        0,     1",   // 0,05 arrondi à 0
            "0,        0,     0"
    })
    void venteOrangeMoney(String total, String commission, String net) {
        MontantsCommission m = CalculCommission.calculer(new BigDecimal(total), TAUX);

        assertEquals(new BigDecimal(commission), m.commission());
        assertEquals(new BigDecimal(net), m.netProducteur());
        // Le prix de l'éleveur n'est jamais augmenté : commission + net = total payé
        assertEquals(m.montantTotal(), m.commission().add(m.netProducteur()));
    }

    @ParameterizedTest(name = "Espèces {0} F -> commission {1} F, net {2} F")
    @CsvSource({
            "9999,     0,  9999",   // en dessous du seuil : aucune commission
            "10000,  500,  9500",   // à partir du seuil : 5 %
            "10001,  500,  9501",   // 500,05 arrondi à 500
            "50000, 2500, 47500"
    })
    void venteEnEspeces(String total, String commission, String net) {
        MontantsCommission m = CalculCommission.calculerEspeces(new BigDecimal(total), TAUX, SEUIL);

        assertEquals(new BigDecimal(commission), m.commission());
        assertEquals(new BigDecimal(net), m.netProducteur());
    }

    @Test
    @DisplayName("Frais de versement : 1 % du montant versé, supportés par la plateforme")
    void fraisDeVersement() {
        assertEquals(new BigDecimal("475"), CalculCommission.fraisVersement(new BigDecimal("47500"), new BigDecimal("0.0100")));
        assertEquals(new BigDecimal("117"), CalculCommission.fraisVersement(new BigDecimal("11728"), new BigDecimal("0.0100")));
    }

    @Test
    @DisplayName("Un montant avec des décimales est ramené au franc près")
    void montantRameneAuFranc() {
        MontantsCommission m = CalculCommission.calculer(new BigDecimal("1999.50"), TAUX);

        assertEquals(new BigDecimal("2000"), m.montantTotal());
        assertEquals(new BigDecimal("100"), m.commission());
        assertEquals(new BigDecimal("1900"), m.netProducteur());
    }

    @Test
    @DisplayName("Montant négatif ou taux invalide refusés")
    void valeursInvalides() {
        assertThrows(IllegalArgumentException.class,
                () -> CalculCommission.calculer(new BigDecimal("-1"), TAUX));
        assertThrows(IllegalArgumentException.class,
                () -> CalculCommission.calculer(null, TAUX));
        assertThrows(IllegalArgumentException.class,
                () -> CalculCommission.calculer(new BigDecimal("1000"), new BigDecimal("5")));
        assertThrows(IllegalArgumentException.class,
                () -> CalculCommission.calculer(new BigDecimal("1000"), null));
    }
}
