package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.utilisateur.dto.CommandeValideeNotification;
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
    public Page<Producteur> listerProducteursEnAttente(Pageable pageable) {
        return producteurRepository.findByStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Producteur trouverProducteur(Long producteurId) {
        return producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur non trouvé avec l'id : " + producteurId));
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
            p.setStatut(StatutUtilisateur.REFUSE);
        }
        
        return producteurRepository.save(p);
    }

    @Override
    @Transactional
    public Producteur mettreAJourCapaciteProduction(Long producteurId, double nouvelleCapacite) {
        Producteur p = producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur non trouvé avec l'id : " + producteurId));
        p.setCapaciteProduction(nouvelleCapacite);
        p.setCapaciteDerniereMaj(java.time.OffsetDateTime.now());
        return producteurRepository.save(p);
    }

    @Override
    public void notifierProducteurCommandeValidee(CommandeValideeNotification notification) {
        Producteur p = producteurRepository.findById(notification.getProducteurId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producteur non trouvé avec l'id : " + notification.getProducteurId()));

        // SIMULATION POUR L'INSTANT : envoi reel (SMS/push) a brancher plus tard
        System.out.println("Notification envoyee au producteur " + p.getNomExploitation()
                + " : commande n°" + notification.getNumeroCommande() + " validee.");
    }

    @Override
    @Transactional
    public Producteur consulterProducteur(Long id) {
        Producteur p = producteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur non trouvé avec l'id : " + id));
        p.setNombreConsultations(p.getNombreConsultations() + 1);
        return producteurRepository.save(p);
    }

    @Override
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