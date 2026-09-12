package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    // Lecture seule de Commande (Module B) — on ne modifie jamais leurs fichiers source,
    // seulement l'état via les setters déjà exposés par leur entité.
    private final CommandeRepository commandeRepository;
    private final PaiementRepository paiementRepository;

    @Override
    @Transactional
    public Paiement initierPaiement(Long idCommande, String operateur) {
        Commande commande = commandeRepository.findById(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Commande introuvable : " + idCommande));

        if (commande.getPaiement() != null) {
            throw new BusinessException(
                    "Un paiement existe déjà pour la commande " + idCommande);
        }

        double montant = commande.calculerMontantTotal();
        if (montant <= 0) {
            throw new BusinessException(
                    "Impossible d'initier un paiement pour un montant nul ou négatif");
        }

        Paiement paiement = Paiement.builder()
                .commande(commande)
                .operateur(operateur)
                .montant(montant)
                .referenceTransaction(UUID.randomUUID().toString())
                .datePaiement(OffsetDateTime.now())
                .statutPaiement(StatutPaiement.EN_ATTENTE)
                .build();

        // C-MUST-1 : intégration réelle Orange Money SIMULÉE pour l'instant (cf. dispatch 3.1).
        // La confirmation/échec arrive de façon asynchrone via POST /paiements/webhook.

        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional
    public Paiement traiterWebhookSucces(String referenceTransaction) {
        Paiement paiement = trouverParReference(referenceTransaction);

        // Idempotence : un webhook déjà traité ne doit pas re-déclencher les effets de bord.
        if (paiement.getStatutPaiement() == StatutPaiement.CONFIRME) {
            return paiement;
        }

        paiement.confirmerPaiement(referenceTransaction);
        paiement = paiementRepository.save(paiement);

        // TODO C-MUST-2 : notifier éleveur + producteur < 10s. Canal (SMS/WhatsApp) et
        // responsabilité exacte à clarifier avec Module D (dispatch §6 point 1 — AlerteIoT
        // reste dédiée aux capteurs d'après ZAREI Seybou). Non implémenté ici tant que ce
        // n'est pas tranché.

        // TODO : mise à jour Commande.statut = PAYÉ (diagramme de séquence, étape 7).
        // BLOQUANT : StatutCommande (Module B) n'a pas de valeur PAYE — nécessite l'accord
        // inter-binômes sur le contrat de statut commun (dispatch §6 point 4) avant
        // d'écrire commande.setStatut(...). Ne pas deviner un mapping ici.

        return paiement;
    }

    @Override
    @Transactional
    public Paiement traiterWebhookEchec(String referenceTransaction) {
        Paiement paiement = trouverParReference(referenceTransaction);

        if (paiement.getStatutPaiement() == StatutPaiement.ECHOUE) {
            return paiement;
        }

        // Cas limite CDC 2.3.2 : la commande NE DOIT PAS être confirmée. On ne touche donc
        // pas à Commande.statut ici, uniquement à Paiement.
        paiement.annulerPaiement();

        return paiementRepository.save(paiement);
    }

    @Override
    public Paiement consulterParCommande(Long idCommande) {
        return paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));
    }

    private Paiement trouverParReference(String referenceTransaction) {
        return paiementRepository.findByReferenceTransaction(referenceTransaction)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la référence " + referenceTransaction));
    }
}