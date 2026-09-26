package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeRepository;
import com.bioconversion.marketplace.CommandeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Implémentation du service métier Module C — Paiement Intégré (Orange Money).
 * CDC v1.1, C-MUST-1 à C-MUST-4.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    // Lecture seule de Commande (Module B) — on ne modifie jamais leurs fichiers
    // source, seulement l'état via les setters déjà exposés par leur entité.
    private final CommandeRepository commandeRepository;
    private final PaiementRepository paiementRepository;
    private final FactureService factureService;
    private final CommandeService commandeService;
    private final ApplicationEventPublisher eventPublisher;

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

        // C-MUST-1 : intégration réelle Orange Money SIMULÉE pour l'instant
        // (cf. dispatch §3.1). La confirmation/échec arrive de façon asynchrone
        // via POST /api/v1/paiements/webhook.

        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional
    public Paiement initierPaiement(Long idCommande, String operateur, Long currentUserId) {
        Commande commande = commandeRepository.findById(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Commande introuvable : " + idCommande));

        if (!commande.getEleveur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException(
                    "Vous n'êtes pas autorisé à initier un paiement pour cette commande");
        }

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

        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional
    public Paiement traiterWebhookSucces(String referenceTransaction) {
        Paiement paiement = trouverParReference(referenceTransaction);

        // Idempotence : un webhook déjà traité ne doit pas re-déclencher les
        // effets de bord (notification, génération de facture en double).
        if (paiement.getStatutPaiement() == StatutPaiement.CONFIRME) {
            return paiement;
        }

        paiement.confirmerPaiement(referenceTransaction);
        paiement = paiementRepository.save(paiement);

        // Contrat officiel inter-modules (Module B — CommandeService) : notifie
        // le passage au statut PAYE, étape 7 du diagramme de séquence.
        commandeService.marquerCommandePayee(paiement.getCommande().getIdCommande());

        // Publish event to trigger PDF generation after transaction commit
        eventPublisher.publishEvent(new PaiementConfirmeEvent(this, paiement));

        return paiement;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void genererFactureApresCommit(PaiementConfirmeEvent event) {
        try {
            // C-MUST-5 : génération automatique de la facture après confirmation
            // (diagramme de séquence "Validation et paiement", étape 7).
            factureService.genererPourPaiement(event.getPaiement());
            log.info("Facture générée avec succès pour le paiement {}", event.getPaiement().getIdPaiement());
        } catch (Exception e) {
            log.error("Échec de la génération de la facture pour le paiement {} - le paiement reste confirmé", 
                    event.getPaiement().getIdPaiement(), e);
            // PDF generation failure should not rollback the payment confirmation
        }
    }

    @Override
    @Transactional
    public Paiement traiterWebhookEchec(String referenceTransaction) {
        Paiement paiement = trouverParReference(referenceTransaction);

        if (paiement.getStatutPaiement() == StatutPaiement.ECHOUE) {
            return paiement;
        }

        // Cas limite CDC 2.3.2 : la commande NE DOIT PAS être confirmée. On ne
        // touche donc pas à Commande.statut ici, uniquement à Paiement.
        paiement.annulerPaiement();

        return paiementRepository.save(paiement);
    }

    @Override
    public Paiement consulterParCommande(Long idCommande) {
        return paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));
    }

    @Override
    public Paiement consulterParCommande(Long idCommande, Long currentUserId) {
        Paiement paiement = paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));

        if (!paiement.getCommande().getEleveur().getIdUtilisateur().equals(currentUserId) 
                && !paiement.getCommande().getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException(
                    "Vous n'êtes pas autorisé à consulter ce paiement");
        }

        return paiement;
    }

    private Paiement trouverParReference(String referenceTransaction) {
        return paiementRepository.findByReferenceTransaction(referenceTransaction)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la référence " + referenceTransaction));
    }
}
