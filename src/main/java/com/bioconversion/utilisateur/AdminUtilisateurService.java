package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Validation des comptes par l'administrateur, pour tous les types d'utilisateurs
 * (producteurs et éleveurs).
 */
@Service
@RequiredArgsConstructor
public class AdminUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    /** Liste tous les comptes en attente de validation, quel que soit leur type. */
    @Transactional(readOnly = true)
    public Page<Utilisateur> listerComptesEnAttente(Pageable pageable) {
        return utilisateurRepository.findByStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION, pageable);
    }

    /** Valide (ACTIF) ou refuse (REFUSE) un compte en attente. */
    @Transactional
    public Utilisateur validerCompte(Long utilisateurId, boolean approuve) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur non trouvé avec l'id : " + utilisateurId));

        if (utilisateur.getStatut() != StatutUtilisateur.EN_ATTENTE_VALIDATION) {
            throw new BusinessException("Ce compte n'est pas en attente de validation");
        }

        utilisateur.setStatut(approuve ? StatutUtilisateur.ACTIF : StatutUtilisateur.REFUSE);
        return utilisateurRepository.save(utilisateur);
    }
}