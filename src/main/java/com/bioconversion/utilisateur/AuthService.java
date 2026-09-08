package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.config.AppProperties;
import com.bioconversion.geo.Localisation;
import com.bioconversion.security.JwtTokenProvider;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.utilisateur.dto.RegisterRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service d'authentification et d'inscription d'utilisateurs.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final ProducteurRepository producteurRepository;
    private final EleveurRepository eleveurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AppProperties appProperties;

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        Utilisateur user = utilisateurRepository.findByTelephone(request.getTelephone())
                .orElseThrow(() -> new BusinessException("Numéro de téléphone ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new BusinessException("Numéro de téléphone ou mot de passe incorrect");
        }

        if (user.getStatut() == StatutUtilisateur.SUSPENDU) {
            throw new BusinessException("Compte suspendu. Veuillez contacter l'administrateur.");
        }

        String token = tokenProvider.generateToken(user.getTelephone(), user.getRole(), user.getId());
        long expiration = appProperties.jwt().expirationMs();

        return AuthResponse.of(token, expiration, UtilisateurResponse.from(user));
    }

    @Transactional
    public UtilisateurResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByTelephone(request.getTelephone())) {
            throw new BusinessException("Un compte existe déjà avec ce numéro de téléphone");
        }

        String hashedPwd = passwordEncoder.encode(request.getMotDePasse());

        if (request.getTypeRole() == RegisterRequest.TypeRole.PRODUCTEUR) {
            Producteur p = new Producteur();
            p.setNom(request.getNom());
            p.setPrenom(request.getPrenom());
            p.setTelephone(request.getTelephone());
            p.setMotDePasse(hashedPwd);
            p.setEstValide(false); // CDC §2.2.3 — Validation par l'Admin requise

            if (request.getLatitude() != null && request.getLongitude() != null) {
                Localisation loc = new Localisation();
                loc.setLatitude(request.getLatitude());
                loc.setLongitude(request.getLongitude());
                loc.setProvince(request.getProvince());
                loc.setVille(request.getVille());
                p.setLocalisation(loc);
            } else {
                // Localisation minimale par défaut si non spécifiée à la création
                Localisation loc = new Localisation();
                loc.setLatitude(12.3714); // Ouagadougou par défaut
                loc.setLongitude(-1.5197);
                p.setLocalisation(loc);
            }

            Producteur saved = producteurRepository.save(p);
            return UtilisateurResponse.from(saved);
        } else {
            Eleveur e = new Eleveur();
            e.setNom(request.getNom());
            e.setPrenom(request.getPrenom());
            e.setTelephone(request.getTelephone());
            e.setMotDePasse(hashedPwd);

            if (request.getLatitude() != null && request.getLongitude() != null) {
                Localisation loc = new Localisation();
                loc.setLatitude(request.getLatitude());
                loc.setLongitude(request.getLongitude());
                loc.setProvince(request.getProvince());
                loc.setVille(request.getVille());
                e.setLocalisation(loc);
            }

            Eleveur saved = eleveurRepository.save(e);
            return UtilisateurResponse.from(saved);
        }
    }
}
