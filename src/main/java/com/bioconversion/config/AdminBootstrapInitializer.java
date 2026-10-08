package com.bioconversion.config;

import com.bioconversion.common.util.PhoneUtils;
import com.bioconversion.utilisateur.Administrateur;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crée le premier compte administrateur à partir de la configuration
 * ({@code ADMIN_TELEPHONE} / {@code ADMIN_MOT_DE_PASSE}).
 *
 * <p>
 * Sans lui, une installation neuve n'aurait personne pour valider les inscriptions.
 * Un compte déjà présent pour ce numéro n'est jamais modifié.
 * </p>
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AdminBootstrapInitializer implements CommandLineRunner {

    private final AppProperties appProperties;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        AppProperties.AdminProperties admin = appProperties.admin();
        if (admin == null || estVide(admin.telephone()) || estVide(admin.motDePasse())) {
            return;
        }

        String telephone;
        try {
            telephone = PhoneUtils.normalizeToE164(admin.telephone());
        } catch (IllegalArgumentException e) {
            log.error("ADMIN_TELEPHONE invalide, aucun compte administrateur créé : {}", e.getMessage());
            return;
        }
        if (admin.motDePasse().length() < 8) {
            log.error("ADMIN_MOT_DE_PASSE trop court (8 caractères minimum), aucun compte administrateur créé");
            return;
        }
        if (utilisateurRepository.existsByTelephone(telephone)) {
            return;
        }

        Administrateur administrateur = new Administrateur();
        administrateur.setNom("BioConversion");
        administrateur.setPrenom("Administrateur");
        administrateur.setTelephone(telephone);
        administrateur.setMotDePasse(passwordEncoder.encode(admin.motDePasse()));
        administrateur.setMatricule("ADMIN-" + telephone.substring(telephone.length() - 8));
        administrateur.setStatut(StatutUtilisateur.ACTIF);
        administrateur.setSuperAdmin(false);
        utilisateurRepository.save(administrateur);
        log.info("Compte administrateur initial créé pour {}", telephone);
    }

    private static boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }
}
