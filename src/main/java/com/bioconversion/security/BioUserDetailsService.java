package com.bioconversion.security;

import com.bioconversion.utilisateur.Utilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implémentation de {@link UserDetailsService} pour Spring Security.
 *
 * <p>
 * L'identifiant utilisateur est le <b>numéro de téléphone</b> (unique par CDC
 * §2.3.1).
 * Le rôle est déduit du type concret de l'entité {@link Utilisateur}
 * (Producteur/Eleveur/Administrateur).
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BioUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String telephone) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository
                .findByTelephone(telephone)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur introuvable pour le téléphone : " + telephone));

        return new User(
                utilisateur.getTelephone(),
                utilisateur.getMotDePasse(),
                utilisateur.getStatut().isActif(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                !utilisateur.getStatut().isSuspendu(), // accountNonLocked
                List.of(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole())));
    }
}
