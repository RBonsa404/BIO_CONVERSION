package com.bioconversion.utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PieceIdentiteRepository extends JpaRepository<PieceIdentite, Long> {

    Optional<PieceIdentite> findByUtilisateurId(Long utilisateurId);
}