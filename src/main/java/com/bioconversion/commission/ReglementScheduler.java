package com.bioconversion.commission;

import com.bioconversion.marketplace.MarketplaceService;
import com.bioconversion.marketplace.StatutCommande;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Tâches automatiques du module commission :
 * <ul>
 *   <li>relance des versements échoués (toutes les 15 min par défaut) ;</li>
 *   <li>confirmation automatique de la réception 72 h après l'expédition, si l'éleveur ne l'a pas fait.</li>
 * </ul>
 * Chaque commande est traitée dans sa propre transaction : un échec n'empêche pas les autres.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReglementScheduler {

    private final ReglementService reglementService;
    private final CommandeReglementRepository commandeRepository;
    private final MarketplaceService marketplaceService;

    @Value("${app.commission.delai-confirmation-heures:72}")
    private long delaiConfirmationHeures;

    @Scheduled(fixedDelayString = "${app.commission.relance-versement-ms:900000}", initialDelay = 60_000)
    public void relancerVersementsEchoues() {
        List<Long> ids = commandeRepository.idsParStatutReglement(StatutReglement.VERSEMENT_ECHOUE);
        for (Long id : ids) {
            try {
                if (reglementService.reessayerVersement(id)) {
                    log.info("Versement de la commande {} réussi à la relance", id);
                }
            } catch (Exception e) {
                log.error("Relance du versement de la commande {} impossible : {}", id, e.getMessage());
            }
        }
    }

    @Scheduled(fixedDelayString = "${app.commission.confirmation-auto-ms:3600000}", initialDelay = 120_000)
    public void confirmerReceptionsAutomatiquement() {
        OffsetDateTime limite = OffsetDateTime.now().minusHours(delaiConfirmationHeures);
        List<Long> ids = commandeRepository.idsParStatutDepuisAvant(
                StatutCommande.EXPEDIE, StatutReglement.EN_SEQUESTRE, limite);
        for (Long id : ids) {
            try {
                marketplaceService.changerStatutCommande(id, StatutCommande.LIVRE);
                log.info("Réception de la commande {} confirmée automatiquement après {} h", id, delaiConfirmationHeures);
            } catch (Exception e) {
                log.error("Confirmation automatique de la commande {} impossible : {}", id, e.getMessage());
            }
        }
    }
}
