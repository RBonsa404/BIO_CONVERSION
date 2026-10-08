package com.bioconversion.admin;

import com.bioconversion.admin.dto.StatistiquesPlateformeResponse;
import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.config.AppProperties;
import com.bioconversion.marketplace.CommandeRepository;
import com.bioconversion.marketplace.ProduitRepository;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.paiement.PaiementRepository;
import com.bioconversion.utilisateur.Administrateur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.ProducteurRepository;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.Utilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.Map;

/**
 * Administration de la plateforme : validation des inscriptions (producteurs et
 * éleveurs, CDC §2.2.3), suspension des comptes et indicateurs globaux.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final ProducteurRepository producteurRepository;
    private final EleveurRepository eleveurRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    private final PaiementRepository paiementRepository;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public Page<UtilisateurResponse> listerUtilisateurs(StatutUtilisateur statut, Pageable pageable) {
        Page<Utilisateur> page = statut != null
                ? utilisateurRepository.findByStatut(statut, pageable)
                : utilisateurRepository.findAll(pageable);
        return page.map(UtilisateurResponse::from);
    }

    @Transactional
    public UtilisateurResponse validerInscription(Long utilisateurId, boolean approuve) {
        Utilisateur utilisateur = trouverCompteGerable(utilisateurId);
        if (utilisateur.getStatut() != StatutUtilisateur.EN_ATTENTE_VALIDATION) {
            throw new BusinessException("Ce compte n'est pas en attente de validation");
        }
        utilisateur.setStatut(approuve ? StatutUtilisateur.ACTIF : StatutUtilisateur.REFUSE);
        return UtilisateurResponse.from(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse suspendre(Long utilisateurId) {
        Utilisateur utilisateur = trouverCompteGerable(utilisateurId);
        if (utilisateur.getStatut() != StatutUtilisateur.ACTIF) {
            throw new BusinessException("Seul un compte actif peut être suspendu");
        }
        utilisateur.setStatut(StatutUtilisateur.SUSPENDU);
        return UtilisateurResponse.from(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse reactiver(Long utilisateurId) {
        Utilisateur utilisateur = trouverCompteGerable(utilisateurId);
        if (utilisateur.getStatut() != StatutUtilisateur.SUSPENDU
                && utilisateur.getStatut() != StatutUtilisateur.REFUSE) {
            throw new BusinessException("Seul un compte suspendu ou refusé peut être réactivé");
        }
        utilisateur.setStatut(StatutUtilisateur.ACTIF);
        return UtilisateurResponse.from(utilisateurRepository.save(utilisateur));
    }

    @Transactional(readOnly = true)
    public StatistiquesPlateformeResponse statistiques() {
        Map<StatutCommande, Long> commandesParStatut = new EnumMap<>(StatutCommande.class);
        for (StatutCommande statut : StatutCommande.values()) {
            commandesParStatut.put(statut, commandeRepository.countByStatut(statut));
        }
        BigDecimal volume = paiementRepository.sumConfirmedPayments();
        double taux = appProperties.commission().taux();
        BigDecimal commission = volume.multiply(BigDecimal.valueOf(taux)).setScale(2, RoundingMode.HALF_UP);

        return new StatistiquesPlateformeResponse(
                producteurRepository.count(),
                eleveurRepository.count(),
                utilisateurRepository.countByStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION),
                produitRepository.countByDisponibiliteTrue(),
                commandeRepository.count(),
                commandesParStatut,
                volume,
                taux,
                commission);
    }

    /** Les comptes administrateurs ne se gèrent pas depuis l'interface (pas d'auto-blocage). */
    private Utilisateur trouverCompteGerable(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur non trouvé avec l'id : " + utilisateurId));
        if (utilisateur instanceof Administrateur) {
            throw new ForbiddenException("Un compte administrateur ne peut pas être modifié ici");
        }
        return utilisateur;
    }
}
