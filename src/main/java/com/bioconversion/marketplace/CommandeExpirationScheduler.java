package com.bioconversion.marketplace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Job planifié de surveillance des délais de 12h (B-MUST-8 & Section 3.4).
 *
 * <p>
 * Scanne périodiquement les commandes ayant le statut {@link StatutCommande#EN_ATTENTE} dont la
 * date de création dépasse 12h, les fait transiter vers {@link StatutCommande#NON_CONFIRMEE},
 * restitue le stock réservé et déclenche la proposition de producteurs alternatifs.
 * </p>
 *
 * <p>
 * Ce job est strictement idempotent et persistant en base de données PostgreSQL, sans dépendance
 * à un état en mémoire volatile (résistant aux redémarrages de l'application).
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CommandeExpirationScheduler {

    private final MarketplaceService marketplaceService;

    /**
     * Exécution toutes les 60 secondes (60000 ms) avec délai initial de 10 secondes.
     */
    @Scheduled(fixedRateString = "${app.scheduling.commande-expiration-rate:60000}", initialDelay = 10000)
    public void verifierEtExpirerCommandesEnAttente() {
        try {
            List<Commande> expirees = marketplaceService.expirerCommandesNonConfirmees();
            if (!expirees.isEmpty()) {
                log.info("{} commande(s) expirée(s) traitée(s) avec succès par le job planifié.", expirees.size());
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'exécution du job d'expiration des commandes : {}", e.getMessage(), e);
        }
    }
}
