package com.bioconversion;

import com.bioconversion.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entrée principal de la plateforme BioConversion.
 *
 * <p>
 * Plateforme de bioreconversion agricole — Burkina Faso.<br>
 * Voir {@code README.md} pour le démarrage rapide et la structure des modules.
 * </p>
 *
 * <p>
 * Modules fonctionnels (isolation par branches Git) :
 * <ul>
 * <li>Module A — IoT ({@code com.bioconversion.iot}) : branch
 * {@code module-A-iot}</li>
 * <li>Module B — Marketplace ({@code com.bioconversion.marketplace}) : branch
 * {@code module-B-marketplace}</li>
 * <li>Module C — Paiement ({@code com.bioconversion.paiement}) : branch
 * {@code module-C-paiement}</li>
 * <li>Module D — Réseau producteurs ({@code com.bioconversion.utilisateur}) :
 * branch {@code module-D-producteurs}</li>
 * </ul>
 * </p>
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties(AppProperties.class)
public class BioConversionApplication {

    public static void main(String[] args) {
        SpringApplication.run(BioConversionApplication.class, args);
    }
}
