package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.config.AppProperties;
import com.bioconversion.geo.Localisation;
import com.bioconversion.security.JwtTokenProvider;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.utilisateur.dto.EleveurRegisterRequest;
import com.bioconversion.utilisateur.dto.ProducteurRegisterRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
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
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getTelephone(),
                            request.getMotDePasse()
                    )
            );

            Utilisateur user = utilisateurRepository.findByTelephone(request.getTelephone())
                    .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));

            String token = tokenProvider.generateToken(user.getTelephone(), user.getRole(), user.getId());
            long expiration = appProperties.jwt().expirationMs();

            return AuthResponse.of(token, expiration, UtilisateurResponse.from(user));
        } catch (AuthenticationException e) {
            throw new BusinessException("Numéro de téléphone ou mot de passe incorrect");
        }
    }

    @Transactional
    public UtilisateurResponse registerProducteur(ProducteurRegisterRequest request) {
        if (utilisateurRepository.existsByTelephone(request.getTelephone())) {
            throw new BusinessException("Un compte existe déjà avec ce numéro de téléphone");
        }

        String hashedPwd = passwordEncoder.encode(request.getMotDePasse());

        Producteur p = new Producteur();
        p.setNom(request.getNom());
        p.setPrenom(request.getPrenom());
        p.setTelephone(request.getTelephone());
        p.setMotDePasse(hashedPwd);
        p.setNomExploitation(request.getNomExploitation());
        p.setCapaciteProduction(request.getCapaciteProduction() != null ? request.getCapaciteProduction() : 0.0);
        p.setStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION); // CDC §2.2.3 — Validation par l'Admin requise

        Localisation loc = new Localisation();
        loc.setProvince(request.getProvince());
        loc.setVille(request.getVille());
        
        if (request.getLatitude() != null && request.getLongitude() != null) {
            loc.setLatitude(request.getLatitude());
            loc.setLongitude(request.getLongitude());
        } else {
            // Localisation minimale par défaut si non spécifiée à la création
            loc.setLatitude(12.3714); // Ouagadougou par défaut
            loc.setLongitude(-1.5197);
        }
        p.setLocalisation(loc);

        Producteur saved = producteurRepository.save(p);
        return UtilisateurResponse.from(saved);
    }

    @Transactional
    public UtilisateurResponse registerEleveur(EleveurRegisterRequest request) {
        if (utilisateurRepository.existsByTelephone(request.getTelephone())) {
            throw new BusinessException("Un compte existe déjà avec ce numéro de téléphone");
        }

        String hashedPwd = passwordEncoder.encode(request.getMotDePasse());

        Eleveur e = new Eleveur();
        e.setNom(request.getNom());
        e.setPrenom(request.getPrenom());
        e.setTelephone(request.getTelephone());
        e.setMotDePasse(hashedPwd);
        e.setTypeElevage(request.getTypeElevage());
        e.setAdresse(request.getAdresse());

        if (request.getLatitude() != null && request.getLongitude() != null) {
            Localisation loc = new Localisation();
            loc.setProvince(request.getProvince());
            loc.setVille(request.getVille());
            loc.setLatitude(request.getLatitude());
            loc.setLongitude(request.getLongitude());
            e.setLocalisation(loc);
        }

        Eleveur saved = eleveurRepository.save(e);
        return UtilisateurResponse.from(saved);
    }
}
