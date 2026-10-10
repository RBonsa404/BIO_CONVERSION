package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.util.PhoneUtils;
import com.bioconversion.config.AppProperties;
import com.bioconversion.geo.Localisation;
import com.bioconversion.security.JwtTokenProvider;
import com.bioconversion.utilisateur.dto.AuthRequest;
import com.bioconversion.utilisateur.dto.AuthResponse;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.utilisateur.dto.EleveurRegisterRequest;
import com.bioconversion.utilisateur.dto.MotDePasseUpdateRequest;
import com.bioconversion.utilisateur.dto.ProducteurRegisterRequest;
import com.bioconversion.utilisateur.dto.ProfilUpdateRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
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

    // Centre de Ouagadougou, utilisé tant que l'utilisateur n'a pas partagé sa position
    private static final double LATITUDE_PAR_DEFAUT = 12.3714;
    private static final double LONGITUDE_PAR_DEFAUT = -1.5197;

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        // Normalize phone number for lookup
        String normalizedPhone = PhoneUtils.normalizeToE164(request.getTelephone());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedPhone,
                            request.getMotDePasse()
                    )
            );

            Utilisateur user = utilisateurRepository.findByTelephone(normalizedPhone)
                    .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));

            String token = tokenProvider.generateToken(user.getTelephone(), user.getRole(), user.getId());
            long expiration = appProperties.jwt().expirationMs();

            return AuthResponse.of(token, expiration, UtilisateurResponse.from(user));
        } catch (DisabledException e) {
            throw new BusinessException(messageCompteInactif(normalizedPhone));
        } catch (LockedException e) {
            throw new BusinessException("Votre compte est suspendu. Contactez l'administration de BioConversion.");
        } catch (AuthenticationException e) {
            throw new BusinessException("Numéro de téléphone ou mot de passe incorrect");
        }
    }

    private String messageCompteInactif(String telephone) {
        StatutUtilisateur statut = utilisateurRepository.findByTelephone(telephone)
                .map(Utilisateur::getStatut)
                .orElse(null);
        if (statut == StatutUtilisateur.REFUSE) {
            return "Votre demande d'inscription a été refusée. Contactez l'administration de BioConversion.";
        }
        return "Votre compte est en attente de validation par un administrateur.";
    }

    @Transactional(readOnly = true)
    public UtilisateurResponse obtenirProfil(Long utilisateurId) {
        return UtilisateurResponse.from(trouverUtilisateur(utilisateurId));
    }

    @Transactional
    public UtilisateurResponse modifierProfil(Long utilisateurId, ProfilUpdateRequest request) {
        Utilisateur utilisateur = trouverUtilisateur(utilisateurId);
        utilisateur.setNom(request.getNom().trim());
        utilisateur.setPrenom(request.getPrenom().trim());

        if (utilisateur instanceof Producteur p) {
            if (request.getNomExploitation() != null && !request.getNomExploitation().isBlank()) {
                p.setNomExploitation(request.getNomExploitation().trim());
            }
            // D-MUST-3 : la capacité est horodatée seulement quand sa valeur change réellement
            if (request.getCapaciteProduction() != null
                    && request.getCapaciteProduction().doubleValue() != p.getCapaciteProduction()) {
                p.setCapaciteProduction(request.getCapaciteProduction());
                p.setCapaciteDerniereMaj(java.time.OffsetDateTime.now());
            }
            p.setLocalisation(localisationMiseAJour(p.getLocalisation(), request));
        } else if (utilisateur instanceof Eleveur e) {
            if (request.getTypeElevage() != null && !request.getTypeElevage().isBlank()) {
                e.setTypeElevage(request.getTypeElevage().trim());
            }
            e.setAdresse(request.getAdresse());
            if (e.getLocalisation() != null || request.getVille() != null || request.getProvince() != null
                    || request.getLatitude() != null) {
                e.setLocalisation(localisationMiseAJour(e.getLocalisation(), request));
            }
        }
        return UtilisateurResponse.from(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public void changerMotDePasse(Long utilisateurId, MotDePasseUpdateRequest request) {
        Utilisateur utilisateur = trouverUtilisateur(utilisateurId);
        if (!passwordEncoder.matches(request.getAncienMotDePasse(), utilisateur.getMotDePasse())) {
            throw new BusinessException("Le mot de passe actuel est incorrect");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);
    }

    private Utilisateur trouverUtilisateur(Long utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    /**
     * Les coordonnées sont obligatoires en base : sans position transmise, on conserve
     * celles déjà connues, ou à défaut le centre de Ouagadougou.
     */
    private Localisation localisationMiseAJour(Localisation actuelle, ProfilUpdateRequest request) {
        Localisation loc = actuelle != null ? actuelle : new Localisation();
        loc.setVille(request.getVille());
        loc.setProvince(request.getProvince());
        if (request.getLatitude() != null && request.getLongitude() != null) {
            loc.setLatitude(request.getLatitude());
            loc.setLongitude(request.getLongitude());
        } else if (loc.getLatitude() == null || loc.getLongitude() == null) {
            loc.setLatitude(LATITUDE_PAR_DEFAUT);
            loc.setLongitude(LONGITUDE_PAR_DEFAUT);
        }
        return loc;
    }

    @Transactional
    public UtilisateurResponse registerProducteur(ProducteurRegisterRequest request) {
        // Normalize phone number
        String normalizedPhone = PhoneUtils.normalizeToE164(request.getTelephone());

        if (utilisateurRepository.existsByTelephone(normalizedPhone)) {
            throw new BusinessException("Un compte existe déjà avec ce numéro de téléphone");
        }

        String hashedPwd = passwordEncoder.encode(request.getMotDePasse());

        Producteur p = new Producteur();
        p.setNom(request.getNom());
        p.setPrenom(request.getPrenom());
        p.setTelephone(normalizedPhone);
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
            loc.setLatitude(LATITUDE_PAR_DEFAUT);
            loc.setLongitude(LONGITUDE_PAR_DEFAUT);
        }
        p.setLocalisation(loc);

        Producteur saved = producteurRepository.save(p);
        return UtilisateurResponse.from(saved);
    }

    @Transactional
    public UtilisateurResponse registerEleveur(EleveurRegisterRequest request) {
        // Normalize phone number
        String normalizedPhone = PhoneUtils.normalizeToE164(request.getTelephone());

        if (utilisateurRepository.existsByTelephone(normalizedPhone)) {
            throw new BusinessException("Un compte existe déjà avec ce numéro de téléphone");
        }

        String hashedPwd = passwordEncoder.encode(request.getMotDePasse());

        Eleveur e = new Eleveur();
        e.setNom(request.getNom());
        e.setPrenom(request.getPrenom());
        e.setTelephone(normalizedPhone);
        e.setMotDePasse(hashedPwd);
        e.setTypeElevage(request.getTypeElevage());
        e.setAdresse(request.getAdresse());

        boolean positionFournie = request.getLatitude() != null && request.getLongitude() != null;
        boolean lieuFourni = (request.getVille() != null && !request.getVille().isBlank())
                || (request.getProvince() != null && !request.getProvince().isBlank());
        if (positionFournie || lieuFourni) {
            Localisation loc = new Localisation();
            loc.setProvince(request.getProvince());
            loc.setVille(request.getVille());
            loc.setLatitude(positionFournie ? request.getLatitude() : LATITUDE_PAR_DEFAUT);
            loc.setLongitude(positionFournie ? request.getLongitude() : LONGITUDE_PAR_DEFAUT);
            e.setLocalisation(loc);
        }

        Eleveur saved = eleveurRepository.save(e);
        return UtilisateurResponse.from(saved);
    }
}