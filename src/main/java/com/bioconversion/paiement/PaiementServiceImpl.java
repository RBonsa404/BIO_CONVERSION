package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeRepository;
import com.bioconversion.marketplace.CommandeService;
import com.bioconversion.marketplace.StatutCommande;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Implémentation du service métier Module C — Paiement Intégré (Orange Money et espèces).
 * CDC v1.1, C-MUST-1 à C-MUST-4.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {

    /** Opérateurs acceptés (cf. Paiement.operateur). */
    public static final String ORANGE_MONEY = "ORANGE_MONEY";
    public static final String ESPECES = "ESPECES";

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

        BigDecimal montant = commande.calculerMontantTotal();
        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
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
        String operateurNormalise = normaliserOperateur(operateur);

        Commande commande = commandeRepository.findById(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Commande introuvable : " + idCommande));

        if (!commande.getEleveur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.ForbiddenException(
                    "Vous n'êtes pas autorisé à initier un paiement pour cette commande");
        }

        // Le règlement n'intervient qu'après la confirmation du producteur :
        // marquerCommandePayee refuse toute autre origine que CONFIRME.
        if (commande.getStatut() != StatutCommande.CONFIRME) {
            throw new BusinessException(commande.getStatut() == StatutCommande.EN_ATTENTE
                    ? "La commande doit d'abord être confirmée par le producteur avant le paiement"
                    : "Cette commande ne peut pas être payée (statut actuel : " + commande.getStatut() + ")");
        }

        BigDecimal montant = commande.calculerMontantTotal();
        if (montant == null || montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "Impossible d'initier un paiement pour un montant nul ou négatif");
        }

        Paiement existant = commande.getPaiement();
        if (existant != null) {
            return switch (existant.getStatutPaiement()) {
                case EN_ATTENTE -> {
                    // Même mode de paiement : la demande en cours est reprise telle quelle
                    if (operateurNormalise.equals(existant.getOperateur())) {
                        yield existant;
                    }
                    // Changement de mode (ex : espèces → Orange Money) : la demande repart avec le nouveau mode
                    existant.setOperateur(operateurNormalise);
                    existant.setMontant(montant);
                    existant.setReferenceTransaction(UUID.randomUUID().toString());
                    yield paiementRepository.save(existant);
                }
                // Après un échec opérateur, la même ligne repart avec une nouvelle référence
                case ECHOUE -> {
                    existant.setOperateur(operateurNormalise);
                    existant.setMontant(montant);
                    existant.setReferenceTransaction(UUID.randomUUID().toString());
                    existant.effectuerPaiement();
                    yield paiementRepository.save(existant);
                }
                default -> throw new BusinessException(
                        "Un paiement existe déjà pour la commande " + idCommande);
            };
        }

        Paiement paiement = Paiement.builder()
                .commande(commande)
                .operateur(operateurNormalise)
                .montant(montant)
                .referenceTransaction(UUID.randomUUID().toString())
                .datePaiement(OffsetDateTime.now())
                .statutPaiement(StatutPaiement.EN_ATTENTE)
                .build();

        return paiementRepository.save(paiement);
    }

    @Override
    @Transactional
    public Paiement confirmerParSimulation(Long idCommande, boolean succes, Long currentUserId) {
        Paiement paiement = paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));

        if (!paiement.getCommande().getEleveur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.ForbiddenException(
                    "Vous n'êtes pas autorisé à confirmer ce paiement");
        }
        // Un paiement en espèces n'est confirmé que par le producteur, à la remise de l'argent
        if (ESPECES.equals(paiement.getOperateur())) {
            throw new BusinessException("Un paiement en espèces est confirmé par le producteur à la réception de l'argent");
        }
        if (paiement.getStatutPaiement() != StatutPaiement.EN_ATTENTE) {
            throw new BusinessException("Ce paiement n'est plus en attente de confirmation");
        }

        // Même traitement que le webhook opérateur, déclenché depuis l'interface
        return succes
                ? traiterWebhookSucces(paiement.getReferenceTransaction())
                : traiterWebhookEchec(paiement.getReferenceTransaction());
    }

    @Override
    @Transactional
    public Paiement confirmerEncaissementEspeces(Long idCommande, Long currentUserId) {
        Paiement paiement = paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));

        // Seul le producteur de la commande peut confirmer avoir reçu l'argent
        if (!paiement.getCommande().getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.ForbiddenException(
                    "Seul le producteur de la commande peut confirmer l'encaissement");
        }
        if (!ESPECES.equals(paiement.getOperateur())) {
            throw new BusinessException("Ce paiement n'est pas un paiement en espèces");
        }
        if (paiement.getStatutPaiement() != StatutPaiement.EN_ATTENTE) {
            throw new BusinessException("Ce paiement n'est plus en attente de confirmation");
        }

        // Même traitement qu'une confirmation Orange Money : commande PAYE et facture générée
        return traiterWebhookSucces(paiement.getReferenceTransaction());
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
    public void genererFactureApresCommit(PaiementConfirmeEvent event) {
        try {
            // C-MUST-5 : génération automatique de la facture après confirmation
            // (diagramme de séquence "Validation et paiement", étape 7).
            // Le paiement est rechargé dans une transaction neuve : celui de l'événement
            // est détaché et ses associations ne sont plus lisibles.
            factureService.genererPourPaiementConfirme(event.getPaiement().getIdPaiement());
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
    @Transactional(readOnly = true)
    public Paiement consulterParCommande(Long idCommande, Long currentUserId) {
        Paiement paiement = paiementRepository.findByCommandeIdCommande(idCommande)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la commande " + idCommande));

        if (!paiement.getCommande().getEleveur().getIdUtilisateur().equals(currentUserId) 
                && !paiement.getCommande().getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.ForbiddenException(
                    "Vous n'êtes pas autorisé à consulter ce paiement");
        }

        return paiement;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal totalPaiementsConfirmesProducteur(Long producteurId, Long currentUserId) {
        if (producteurId == null || !producteurId.equals(currentUserId)) {
            throw new com.bioconversion.common.exception.ForbiddenException(
                    "Vous n'êtes pas autorisé à consulter ce solde");
        }
        return paiementRepository.sumConfirmedPaymentsByProducteurId(producteurId);
    }

    /** N'accepte que les deux modes de paiement prévus, quelle que soit la casse envoyée. */
    private String normaliserOperateur(String operateur) {
        String valeur = operateur == null ? "" : operateur.trim().toUpperCase();
        if (!ORANGE_MONEY.equals(valeur) && !ESPECES.equals(valeur)) {
            throw new BusinessException("Mode de paiement inconnu : choisissez Orange Money ou espèces");
        }
        return valeur;
    }

    private Paiement trouverParReference(String referenceTransaction) {
        return paiementRepository.findByReferenceTransaction(referenceTransaction)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun paiement pour la référence " + referenceTransaction));
    }
}