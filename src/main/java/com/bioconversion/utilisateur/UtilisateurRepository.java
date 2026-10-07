package com.bioconversion.utilisateur;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA pour l'entité racine {@link Utilisateur}.
 * Utilisé principalement pour l'authentification (recherche par téléphone).
 */
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par son numéro de téléphone (identifiant fonctionnel unique).
     *
     * @param telephone le numéro au format +226 XX XX XX XX
     * @return l'utilisateur correspondant, ou empty si introuvable
     */
    Optional<Utilisateur> findByTelephone(String telephone);

    /** Vérifie l'unicité d'un numéro de téléphone avant inscription. */
    boolean existsByTelephone(String telephone);

    /**
     * Liste les utilisateurs de tous types (producteurs, éleveurs...) ayant un statut donné.
     * Utilisé par l'administrateur pour voir les comptes EN_ATTENTE_VALIDATION.
     */
    Page<Utilisateur> findByStatut(StatutUtilisateur statut, Pageable pageable);
}