package com.bioconversion.commission;

import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.CommandeCreeeEvent;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.marketplace.StatutCommandeChangeEvent;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Suivi de l'argent d'une commande (séquestre, versement, commission), déclenché par les
 * changements de statut de la commande.
 *
 * <p>Les écouteurs sont synchrones : ils s'exécutent dans la transaction qui a changé le statut.
 * Si une écriture échoue, tout est annulé (commande comprise).</p>
 *
 * <ul>
 *   <li>Création : le taux de commission est copié sur la commande.</li>
 *   <li>PAYE (Orange Money) : le montant entre dans le séquestre → EN_SEQUESTRE.</li>
 *   <li>PAYE (espèces) : commission « à collecter » à partir du seuil → ENCAISSE_ESPECES.</li>
 *   <li>LIVRE : versement du net au producteur → VERSE (ou VERSEMENT_ECHOUE, relancé plus tard).</li>
 *   <li>ANNULE / REFUSE / NON_CONFIRMEE : remboursement de l'éleveur, aucune commission.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReglementService {

    private final ParametreService parametreService;
    private final RegistreService registreService;
    private final CommissionACollecterRepository commissionRepository;
    private final HistoriqueStatutCommandeRepository historiqueRepository;
    private final CommandeReglementRepository commandeRepository;
    private final VersementProducteur versementProducteur;

    // ------------------------------------------------------------------ événements

    @EventListener
    public void surCreation(CommandeCreeeEvent event) {
        Commande commande = event.commande();
        figerCommission(commande);
        tracer(commande, HistoriqueStatutCommande.TYPE_COMMANDE, null,
                commande.getStatut().name(), commande.calculerMontantTotal(), auteurCourant());
    }

    @EventListener
    public void surChangementStatut(StatutCommandeChangeEvent event) {
        Commande commande = event.commande();
        Long auteur = auteurCourant();

        switch (event.nouveau()) {
            case PAYE -> surPaiement(commande, auteur);
            case LIVRE -> surLivraison(commande, auteur);
            case ANNULE, REFUSE, NON_CONFIRMEE -> surAnnulation(commande, auteur);
            default -> {
                // CONFIRME, EXPEDIE : pas de mouvement d'argent
            }
        }

        tracer(commande, HistoriqueStatutCommande.TYPE_COMMANDE, event.ancien().name(),
                event.nouveau().name(), commande.calculerMontantTotal(), auteur);
    }

    // ------------------------------------------------------------------ relance

    /**
     * Nouvelle tentative de versement pour une commande en VERSEMENT_ECHOUE.
     *
     * @return true si le versement a réussi cette fois
     */
    @Transactional
    public boolean reessayerVersement(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable : " + commandeId));
        if (commande.getStatutReglement() != StatutReglement.VERSEMENT_ECHOUE) {
            return false;
        }
        tenterVersement(commande, null);
        return commande.getStatutReglement() == StatutReglement.VERSE;
    }

    // ------------------------------------------------------------------ transitions

    /** Copie le taux en vigueur sur la commande et calcule commission et net producteur. */
    void figerCommission(Commande commande) {
        BigDecimal taux = commande.getTauxCommission() != null
                ? commande.getTauxCommission()
                : parametreService.tauxCommission();
        MontantsCommission montants = CalculCommission.calculer(commande.calculerMontantTotal(), taux);
        commande.setTauxCommission(taux);
        commande.setMontantCommission(montants.commission());
        commande.setMontantNetProducteur(montants.netProducteur());
    }

    private void surPaiement(Commande commande, Long auteur) {
        Paiement paiement = commande.getPaiement();
        if (paiement == null) {
            log.warn("Commande {} payée sans paiement associé : aucun mouvement d'argent", commande.getIdCommande());
            return;
        }
        // Commandes créées avant le module commission : montants calculés maintenant
        if (commande.getMontantCommission() == null) {
            figerCommission(commande);
        }
        BigDecimal total = montantTotal(commande);

        if (ReglesFacture.ESPECES.equals(paiement.getOperateur())) {
            MontantsCommission montants = CalculCommission.calculerEspeces(
                    total, commande.getTauxCommission(), parametreService.seuilCommissionEspeces());
            commande.setMontantCommission(montants.commission());
            commande.setMontantNetProducteur(montants.netProducteur());
            changerReglement(commande, StatutReglement.ENCAISSE_ESPECES, total, auteur);

            if (montants.commission().signum() > 0 && !commissionRepository.existsByCommandeId(commande.getIdCommande())) {
                commissionRepository.save(CommissionACollecter.builder()
                        .commandeId(commande.getIdCommande())
                        .producteurId(commande.getProducteur().getIdUtilisateur())
                        .montant(montants.commission())
                        .build());
            }
            return;
        }

        // Orange Money : l'argent de l'éleveur est bloqué jusqu'à la réception
        registreService.crediterSequestre(commande.getIdCommande(), total,
                paiement.getReferenceTransaction(), auteur);
        changerReglement(commande, StatutReglement.EN_SEQUESTRE, total, auteur);
    }

    private void surLivraison(Commande commande, Long auteur) {
        if (commande.getStatutReglement() != StatutReglement.EN_SEQUESTRE) {
            return; // espèces : l'argent est déjà chez le producteur
        }
        // Le producteur ne peut pas déclencher son propre versement : c'est l'éleveur
        // (ou la confirmation automatique après 72 h) qui confirme la réception.
        if (auteur != null && auteur.equals(commande.getProducteur().getIdUtilisateur())) {
            throw new ForbiddenException(
                    "La réception d'une commande payée par Orange Money est confirmée par l'éleveur");
        }
        tenterVersement(commande, auteur);
    }

    private void surAnnulation(Commande commande, Long auteur) {
        StatutReglement reglement = commande.getStatutReglement();
        if (reglement == StatutReglement.EN_SEQUESTRE) {
            BigDecimal total = montantTotal(commande);
            registreService.enregistrerRemboursement(commande.getIdCommande(), total, auteur);
            changerReglement(commande, StatutReglement.REMBOURSE, total, auteur);
        } else if (reglement == StatutReglement.ENCAISSE_ESPECES) {
            commissionRepository.findByCommandeId(commande.getIdCommande()).ifPresent(c -> {
                if (c.getStatut() == CommissionACollecter.Statut.A_COLLECTER) {
                    c.setStatut(CommissionACollecter.Statut.ANNULEE);
                    commissionRepository.save(c);
                } else {
                    log.warn("Commande {} annulée alors que sa commission espèces est déjà encaissée : "
                            + "correction manuelle du fonds nécessaire", commande.getIdCommande());
                }
            });
            changerReglement(commande, StatutReglement.REMBOURSE, montantTotal(commande), auteur);
        }
        // Aucun commission sur une commande annulée
        commande.setMontantCommission(BigDecimal.ZERO);
        commande.setMontantNetProducteur(BigDecimal.ZERO);
    }

    /**
     * Envoie le net au producteur. Réussite : registres écrits et VERSE.
     * Échec : rien n'est écrit dans les registres, VERSEMENT_ECHOUE (relance automatique).
     */
    private void tenterVersement(Commande commande, Long auteur) {
        MontantsCommission montants = montants(commande);
        VersementProducteur.ResultatVersement resultat = versementProducteur.verser(
                commande.getIdCommande(), commande.getProducteur().getTelephone(), montants.netProducteur());

        if (resultat.reussi()) {
            BigDecimal frais = CalculCommission.fraisVersement(
                    montants.netProducteur(), parametreService.tauxFraisVersement());
            registreService.enregistrerVersement(commande.getIdCommande(), montants, frais, auteur);
            changerReglement(commande, StatutReglement.VERSE, montants.netProducteur(), auteur);
        } else {
            log.warn("Versement de la commande {} échoué : {}", commande.getIdCommande(), resultat.motif());
            changerReglement(commande, StatutReglement.VERSEMENT_ECHOUE, montants.netProducteur(), auteur);
        }
    }

    // ------------------------------------------------------------------ outils

    private void changerReglement(Commande commande, StatutReglement nouveau, BigDecimal montant, Long auteur) {
        StatutReglement ancien = commande.getStatutReglement();
        if (ancien == nouveau) {
            return;
        }
        commande.setStatutReglement(nouveau);
        tracer(commande, HistoriqueStatutCommande.TYPE_REGLEMENT,
                ancien != null ? ancien.name() : null, nouveau.name(), montant, auteur);
    }

    private void tracer(Commande commande, String type, String ancien, String nouveau,
                        BigDecimal montant, Long auteur) {
        historiqueRepository.save(HistoriqueStatutCommande.builder()
                .commandeId(commande.getIdCommande())
                .typeStatut(type)
                .ancienStatut(ancien)
                .nouveauStatut(nouveau)
                .montant(montant)
                .auteurId(auteur)
                .build());
    }

    /** Montants figés de la commande : total = commission + net. */
    private MontantsCommission montants(Commande commande) {
        Objects.requireNonNull(commande.getMontantCommission(), "Commission non calculée");
        return new MontantsCommission(
                commande.getMontantCommission().add(commande.getMontantNetProducteur()),
                commande.getTauxCommission(),
                commande.getMontantCommission(),
                commande.getMontantNetProducteur());
    }

    private BigDecimal montantTotal(Commande commande) {
        return commande.calculerMontantTotal().setScale(0, java.math.RoundingMode.HALF_UP);
    }

    /** Utilisateur connecté ; null pour une action automatique (tâche planifiée, webhook). */
    private Long auteurCourant() {
        try {
            return SecurityUtils.getCurrentUserId();
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
