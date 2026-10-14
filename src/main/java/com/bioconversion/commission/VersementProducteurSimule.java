package com.bioconversion.commission;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Versement simulé : réussit toujours, sauf si
 * {@code app.paiement.simulation-echec-versement=true} (pour tester l'échec et la relance).
 */
@Slf4j
@Component
public class VersementProducteurSimule implements VersementProducteur {

    private final boolean simulerEchec;

    public VersementProducteurSimule(
            @Value("${app.paiement.simulation-echec-versement:false}") boolean simulerEchec) {
        this.simulerEchec = simulerEchec;
    }

    @Override
    public ResultatVersement verser(Long commandeId, String telephone, BigDecimal montant) {
        if (telephone == null || telephone.isBlank()) {
            return ResultatVersement.echec("Le producteur n'a pas de numéro de téléphone");
        }
        if (simulerEchec) {
            log.warn("[SIMULATION] Échec du versement de {} F pour la commande {}", montant, commandeId);
            return ResultatVersement.echec("Échec simulé du versement Orange Money");
        }
        String reference = "VERS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[SIMULATION] Versement de {} F au {} pour la commande {} (réf. {})",
                montant, telephone, commandeId, reference);
        return ResultatVersement.succes(reference);
    }
}
