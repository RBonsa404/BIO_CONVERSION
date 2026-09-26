package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Squelette d'implémentation du Module D — Réseau des Producteurs.
 */
@Service
@RequiredArgsConstructor
public class ReseauProducteurServiceImpl implements ReseauProducteurService {

    private final ProducteurRepository producteurRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public Page<Producteur> listerProducteursValides(Pageable pageable) {
        return producteurRepository.findByStatut(StatutUtilisateur.ACTIF, pageable);
    }

    @Override
    public Page<Producteur> listerProducteursParProvince(String province, Pageable pageable) {
        return producteurRepository.findByLocalisationProvinceIgnoreCase(province, pageable);
    }

    @Override
    @Transactional
    public Producteur validerProducteur(Long producteurId, boolean approuve) {
        Producteur p = producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur non trouvé avec l'id : " + producteurId));
        
        // Use Utilisateur.statut as single source of truth instead of Producteur.compteValide
        if (approuve) {
            p.setStatut(StatutUtilisateur.ACTIF);
        } else {
            p.setStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION);
        }
        
        return producteurRepository.save(p);
    }

    @Override
    @Transactional
    public Producteur suspendreCompte(Long utilisateurId) {
        Utilisateur u = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id : " + utilisateurId));
        u.setStatut(StatutUtilisateur.SUSPENDU);
        utilisateurRepository.save(u);
        if (u instanceof Producteur p) {
            return p;
        }
        return null;
    }
}
