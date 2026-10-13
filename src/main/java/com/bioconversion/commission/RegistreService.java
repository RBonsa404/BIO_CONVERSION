package com.bioconversion.commission;

import com.bioconversion.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Écritures dans les deux registres : le séquestre (argent des éleveurs bloqué jusqu'à la
 * livraison) et le fonds (argent de la plateforme).
 *
 * <p>Règles :</p>
 * <ul>
 *   <li>Les écritures se font dans la transaction de la transition de statut qui les provoque
 *       (propagation MANDATORY) : tout passe ou rien ne passe.</li>
 *   <li>Une même opération n'est écrite qu'une fois par commande (webhook reçu deux fois) :
 *       les méthodes renvoient {@code false} quand l'écriture existe déjà. La base le garantit
 *       aussi par un index unique.</li>
 *   <li>Les lignes ne sont jamais modifiées ni supprimées ; le solde est la somme des lignes.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class RegistreService {

    private final MouvementSequestreRepository sequestreRepository;
    private final MouvementFondsRepository fondsRepository;

    /**
     * Paiement Orange Money confirmé : le montant total payé par l'éleveur entre dans le séquestre.
     *
     * @return false si la commande était déjà créditée (webhook reçu deux fois)
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public boolean crediterSequestre(Long commandeId, BigDecimal montantTotal,
                                     String referenceTransaction, Long auteurId) {
        verifierPositif(montantTotal);
        if (sequestreRepository.existsByCommandeIdAndTypeMouvement(commandeId, TypeMouvementSequestre.ENTREE)) {
            return false;
        }
        sequestreRepository.save(MouvementSequestre.builder()
                .commandeId(commandeId)
                .typeMouvement(TypeMouvementSequestre.ENTREE)
                .montant(montantTotal)
                .libelle("Paiement de l'éleveur mis en séquestre")
                .referenceTransaction(referenceTransaction)
                .auteurId(auteurId)
                .build());
        return true;
    }

    /**
     * Versement réussi au producteur. Dans la même transaction : sortie du montant total du
     * séquestre, entrée de la commission dans le fonds, frais de versement à la charge du fonds.
     * À n'appeler qu'une fois le versement confirmé : rien n'est écrit si le versement échoue.
     *
     * @return false si le versement était déjà enregistré
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public boolean enregistrerVersement(Long commandeId, MontantsCommission montants,
                                        BigDecimal fraisVersement, Long auteurId) {
        Objects.requireNonNull(montants, "Les montants de la commande sont obligatoires");
        verifierPositif(montants.montantTotal());
        if (sequestreRepository.existsByCommandeIdAndTypeMouvement(commandeId, TypeMouvementSequestre.SORTIE_VERSEMENT)) {
            return false;
        }
        exigerEnSequestre(commandeId);

        sequestreRepository.save(MouvementSequestre.builder()
                .commandeId(commandeId)
                .typeMouvement(TypeMouvementSequestre.SORTIE_VERSEMENT)
                .montant(montants.montantTotal().negate())
                .libelle("Versement de " + montants.netProducteur() + " F au producteur")
                .auteurId(auteurId)
                .build());

        if (montants.commission().signum() > 0) {
            fondsRepository.save(MouvementFonds.builder()
                    .commandeId(commandeId)
                    .typeMouvement(TypeMouvementFonds.COMMISSION)
                    .montant(montants.commission())
                    .libelle("Commission retenue sur la vente Orange Money")
                    .auteurId(auteurId)
                    .build());
        }
        if (fraisVersement != null && fraisVersement.signum() > 0) {
            fondsRepository.save(MouvementFonds.builder()
                    .commandeId(commandeId)
                    .typeMouvement(TypeMouvementFonds.FRAIS_VERSEMENT)
                    .montant(fraisVersement.negate())
                    .libelle("Frais Orange Money du versement au producteur")
                    .auteurId(auteurId)
                    .build());
        }
        return true;
    }

    /**
     * Litige ou annulation : l'éleveur est remboursé depuis le séquestre, sans commission.
     *
     * @return false si le remboursement était déjà enregistré
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public boolean enregistrerRemboursement(Long commandeId, BigDecimal montantTotal, Long auteurId) {
        verifierPositif(montantTotal);
        if (sequestreRepository.existsByCommandeIdAndTypeMouvement(commandeId, TypeMouvementSequestre.SORTIE_REMBOURSEMENT)) {
            return false;
        }
        exigerEnSequestre(commandeId);
        sequestreRepository.save(MouvementSequestre.builder()
                .commandeId(commandeId)
                .typeMouvement(TypeMouvementSequestre.SORTIE_REMBOURSEMENT)
                .montant(montantTotal.negate())
                .libelle("Remboursement de l'éleveur")
                .auteurId(auteurId)
                .build());
        return true;
    }

    /**
     * Commission d'une vente en espèces, déclarée encaissée par l'administrateur
     * (le collecteur l'a récupérée auprès du producteur, hors de l'appli).
     *
     * @return false si elle était déjà enregistrée
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public boolean crediterCommissionEspeces(Long commandeId, BigDecimal commission, Long auteurId) {
        verifierPositif(commission);
        if (fondsRepository.existsByCommandeIdAndTypeMouvement(commandeId, TypeMouvementFonds.COMMISSION_ESPECES)) {
            return false;
        }
        fondsRepository.save(MouvementFonds.builder()
                .commandeId(commandeId)
                .typeMouvement(TypeMouvementFonds.COMMISSION_ESPECES)
                .montant(commission)
                .libelle("Commission d'une vente en espèces, encaissée par un collecteur")
                .auteurId(auteurId)
                .build());
        return true;
    }

    /** Solde du séquestre : somme de toutes ses lignes. */
    @Transactional(readOnly = true)
    public BigDecimal soldeSequestre() {
        return Objects.requireNonNullElse(sequestreRepository.sommeTotale(), BigDecimal.ZERO);
    }

    /** Ce qui reste en séquestre pour une commande. */
    @Transactional(readOnly = true)
    public BigDecimal soldeSequestre(Long commandeId) {
        return Objects.requireNonNullElse(sequestreRepository.sommeCommande(commandeId), BigDecimal.ZERO);
    }

    /** Solde du fonds de la plateforme : somme de toutes ses lignes. */
    @Transactional(readOnly = true)
    public BigDecimal soldeFonds() {
        return Objects.requireNonNullElse(fondsRepository.sommeTotale(), BigDecimal.ZERO);
    }

    /** Un versement ou un remboursement n'est possible que pour un argent réellement en séquestre. */
    private void exigerEnSequestre(Long commandeId) {
        if (!sequestreRepository.existsByCommandeIdAndTypeMouvement(commandeId, TypeMouvementSequestre.ENTREE)) {
            throw new BusinessException("Aucun paiement en séquestre pour la commande " + commandeId);
        }
        if (soldeSequestre(commandeId).signum() <= 0) {
            throw new BusinessException("L'argent de la commande " + commandeId + " a déjà quitté le séquestre");
        }
    }

    private void verifierPositif(BigDecimal montant) {
        if (montant == null || montant.signum() <= 0) {
            throw new IllegalArgumentException("Le montant doit être strictement positif");
        }
    }
}