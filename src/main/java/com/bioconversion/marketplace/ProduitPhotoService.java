package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ForbiddenException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.marketplace.dto.ProduitDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;

/**
 * Photo des produits du catalogue : dépôt par le producteur propriétaire,
 * lecture publique (la photo fait partie de la vitrine de la marketplace).
 */
@Service
@RequiredArgsConstructor
public class ProduitPhotoService {

    /**
     * 2 Mo : le formulaire réduit la photo avant l'envoi (environ 150 Ko), cette limite
     * protège le serveur si un autre client envoie une photo brute.
     */
    public static final long TAILLE_MAX = 2L * 1024 * 1024;

    private final ProduitRepository produitRepository;
    private final ProduitPhotoRepository produitPhotoRepository;
    private final MarketplaceService marketplaceService;

    /**
     * Ajoute la photo du produit, ou remplace l'ancienne. Réservé au producteur du produit.
     * Renvoie le produit à jour : la conversion en DTO se fait ici, dans la transaction,
     * car l'exploitation du producteur est chargée à la demande.
     */
    @Transactional
    public ProduitDto enregistrer(Long produitId, Long currentUserId, MultipartFile fichier) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        if (!produit.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à modifier ce produit");
        }

        byte[] contenu = lireFichier(fichier);
        String type = detecterType(contenu);

        ProduitPhoto photo = produitPhotoRepository.findById(produitId).orElseGet(ProduitPhoto::new);
        photo.setProduitId(produitId);
        photo.setTypeContenu(type);
        photo.setContenu(contenu);
        produitPhotoRepository.save(photo);

        produit.setPhotoMaj(OffsetDateTime.now());
        return marketplaceService.versDto(produitRepository.save(produit));
    }

    /** Lecture publique : la photo d'un produit retiré de la vente reste lisible. */
    @Transactional(readOnly = true)
    public ProduitPhoto lire(Long produitId) {
        return produitPhotoRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune photo pour ce produit"));
    }

    private byte[] lireFichier(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new BusinessException("La photo du produit est vide");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new BusinessException("La photo ne doit pas dépasser 2 Mo");
        }
        try {
            return fichier.getBytes();
        } catch (IOException e) {
            throw new BusinessException("La photo n'a pas pu être lue. Réessayez.");
        }
    }

    /**
     * Le type est déduit des premiers octets du fichier, pas du nom ni de l'en-tête envoyés
     * par le navigateur, qui peuvent être faux.
     */
    private String detecterType(byte[] contenu) {
        if (commencePar(contenu, 0, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        if (commencePar(contenu, 0, 0x89, 0x50, 0x4E, 0x47)) {
            return "image/png";
        }
        // WebP : "RIFF" (octets 0 à 3), puis la taille, puis "WEBP" (octets 8 à 11)
        if (commencePar(contenu, 0, 0x52, 0x49, 0x46, 0x46) && commencePar(contenu, 8, 0x57, 0x45, 0x42, 0x50)) {
            return "image/webp";
        }
        throw new BusinessException("Format non accepté : envoyez une image JPG, PNG ou WebP");
    }

    private boolean commencePar(byte[] contenu, int decalage, int... signature) {
        if (contenu.length < decalage + signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((contenu[decalage + i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
