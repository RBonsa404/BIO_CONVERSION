package com.bioconversion.marketplace;

import com.bioconversion.common.dto.ApiResponse;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

/**
 * Photo des produits du catalogue (Module B).
 *
 * <p>La lecture est publique (voir SecurityConfig) : une balise {@code <img>} ne peut pas
 * envoyer l'en-tête d'authentification, et la photo fait partie de la vitrine.
 * Le dépôt est réservé au producteur propriétaire du produit.</p>
 */
@RestController
@RequestMapping("/api/v1/marketplace/produits")
@RequiredArgsConstructor
public class ProduitPhotoController {

    private final ProduitPhotoService produitPhotoService;

    @PostMapping(value = "/{produitId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProduitDto>> deposerPhoto(@PathVariable Long produitId,
                                                                @RequestPart("photo") MultipartFile photo) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProduitDto maj = produitPhotoService.enregistrer(produitId, currentUserId, photo);
        return ResponseEntity.ok(ApiResponse.success(maj, "Photo enregistrée"));
    }

    @GetMapping("/{produitId}/photo")
    public ResponseEntity<byte[]> lirePhoto(@PathVariable Long produitId) {
        ProduitPhoto photo = produitPhotoService.lire(produitId);
        // L'adresse porte la date de mise à jour (?v=...) : la mise en cache longue est sans risque.
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getTypeContenu()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(photo.getContenu());
    }
}
