package com.bioconversion.utilisateur;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.utilisateur.dto.ProducteurRegisterRequest;
import com.bioconversion.utilisateur.dto.UtilisateurResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Pièce d'identité (CNIB) des producteurs, CDC §2.2.4 : dépôt à l'inscription,
 * consultation par un administrateur avant la validation du compte.
 */
@Service
@RequiredArgsConstructor
public class PieceIdentiteService {

    /** 5 Mo : une photo de téléphone ou un scan tient largement dans cette limite. */
    public static final long TAILLE_MAX = 5L * 1024 * 1024;

    private final PieceIdentiteRepository pieceIdentiteRepository;
    private final AuthService authService;

    /**
     * Inscription d'un producteur avec sa CNIB, en une seule transaction : si la pièce
     * ne peut pas être enregistrée, le compte n'est pas créé non plus.
     */
    @Transactional
    public UtilisateurResponse inscrireProducteur(ProducteurRegisterRequest request, MultipartFile cnib) {
        byte[] contenu = lireFichier(cnib);
        String type = detecterType(contenu);

        UtilisateurResponse producteur = authService.registerProducteur(request);

        PieceIdentite piece = new PieceIdentite();
        piece.setUtilisateurId(producteur.getId());
        piece.setTypeContenu(type);
        piece.setNomFichier(nomFichier(cnib.getOriginalFilename()));
        piece.setContenu(contenu);
        pieceIdentiteRepository.save(piece);

        return producteur;
    }

    /** Lecture réservée aux administrateurs (contrôle fait par la route /api/v1/admin/**). */
    @Transactional(readOnly = true)
    public PieceIdentite lire(Long utilisateurId) {
        return pieceIdentiteRepository.findByUtilisateurId(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune pièce d'identité pour ce compte"));
    }

    /** Extension à utiliser pour nommer le fichier renvoyé à l'administrateur. */
    public static String extension(String typeContenu) {
        return switch (typeContenu) {
            case "image/png" -> "png";
            case "application/pdf" -> "pdf";
            default -> "jpg";
        };
    }

    private byte[] lireFichier(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new BusinessException("La photo ou le scan de la CNIB est obligatoire");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new BusinessException("La pièce d'identité ne doit pas dépasser 5 Mo");
        }
        try {
            return fichier.getBytes();
        } catch (IOException e) {
            throw new BusinessException("La pièce d'identité n'a pas pu être lue. Réessayez.");
        }
    }

    /**
     * Le type est déduit des premiers octets du fichier, pas du nom ni de l'en-tête envoyés
     * par le navigateur, qui peuvent être faux.
     */
    private String detecterType(byte[] contenu) {
        if (commencePar(contenu, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        if (commencePar(contenu, 0x89, 0x50, 0x4E, 0x47)) {
            return "image/png";
        }
        if (commencePar(contenu, 0x25, 0x50, 0x44, 0x46)) { // %PDF
            return "application/pdf";
        }
        throw new BusinessException("Format non accepté : envoyez une image JPG, PNG ou un PDF");
    }

    private boolean commencePar(byte[] contenu, int... signature) {
        if (contenu.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((contenu[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private String nomFichier(String nomOriginal) {
        if (nomOriginal == null || nomOriginal.isBlank()) {
            return null;
        }
        // Ne garde que le nom, sans chemin, limité à la taille de la colonne
        String nom = nomOriginal.replace('\\', '/');
        nom = nom.substring(nom.lastIndexOf('/') + 1);
        return nom.length() > 255 ? nom.substring(0, 255) : nom;
    }
}