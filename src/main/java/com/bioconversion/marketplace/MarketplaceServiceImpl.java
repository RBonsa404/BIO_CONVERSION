package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service Marketplace (Module B).
 */
@Service
@RequiredArgsConstructor
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    private final ProducteurRepository producteurRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Produit> listerProduitsDisponibles(Pageable pageable) {
        return produitRepository.findByDisponibiliteTrue(pageable);
    }

    @Override
    @Transactional
    public Produit ajouterProduit(Produit produit, Long producteurId) {
        return publierProduit(produit, producteurId);
    }

    @Override
    @Transactional
    public Commande passerCommande(Long eleveurId, Long produitId, Double quantite) {
        // Géré par Abdoul Rachid (Cycle de commande)
        return null;
    }

    @Override
    @Transactional
    public Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut) {
        // Géré par Abdoul Rachid (Cycle de commande)
        return null;
    }

    @Override
    @Transactional
    public Produit publierProduit(Produit produit, Long producteurId) {
        Producteur producteur = producteurRepository.findById(producteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Producteur introuvable avec l'ID : " + producteurId));
        produit.setProducteur(producteur);
        produit.setDisponibilite(true);
        return produitRepository.save(produit);
    }

    @Override
    @Transactional
    public Produit modifierStock(Long produitId, double nouvelleQuantite) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        produit.setQuantiteStock(nouvelleQuantite);
        return produitRepository.save(produit);
    }

    @Override
    @Transactional
    public Produit modifierPrix(Long produitId, double nouveauPrix) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        produit.setPrix(nouveauPrix);
        return produitRepository.save(produit);
    }

    @Override
    @Transactional
    public void retirerProduit(Long produitId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        produit.setDisponibilite(false);
        produitRepository.save(produit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Produit> consulterCatalogueProducteur(Long producteurId) {
        return produitRepository.findByProducteurIdUtilisateur(producteurId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDto> consulterCatalogueProducteurDto(Long producteurId) {
        return produitRepository.findByProducteurIdUtilisateur(producteurId).stream()
                .map(p -> ProduitDto.builder()
                        .idProduit(p.getIdProduit())
                        .producteurId(p.getProducteur().getIdUtilisateur())
                        .nomExploitation(p.getProducteur().getNomExploitation())
                        .nomProduit(p.getNomProduit())
                        .quantiteStock(p.getQuantiteStock())
                        .prix(p.getPrix())
                        .typeProduit(p.getTypeProduit())
                        .disponibilite(p.isDisponibilite())
                        .build())
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<Produit> rechercherProduitsParRayon(double latitude, double longitude, double rayonKm) {
        Localisation pointRecherche = Localisation.builder()
                .latitude(latitude)
                .longitude(longitude)
                .build();

        return produitRepository.findByDisponibiliteTrue(Pageable.unpaged())
                .stream()
                .filter(produit -> produit.getProducteur().getLocalisation() != null &&
                        produit.getProducteur().getLocalisation().calculerDistance(pointRecherche) <= rayonKm)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducteurLocaliseDto> rechercherProducteursParRayon(double latitude, double longitude, double rayonKm) {
        Localisation centreRecherche = Localisation.builder()
                .latitude(latitude)
                .longitude(longitude)
                .build();

        return producteurRepository.findByCompteValideTrue(Pageable.unpaged()).getContent().stream()
                .filter(p -> p.getLocalisation() != null)
                .map(p -> {
                    double dist = p.getLocalisation().calculerDistance(centreRecherche);
                    return new java.util.AbstractMap.SimpleEntry<>(p, dist);
                })
                .filter(entry -> entry.getValue() <= rayonKm)
                .map(entry -> {
                    Producteur p = entry.getKey();
                    double dist = entry.getValue();
                    return ProducteurLocaliseDto.builder()
                            .producteurId(p.getIdUtilisateur())
                            .nomExploitation(p.getNomExploitation())
                            .ville(p.getLocalisation().getVille())
                            .province(p.getLocalisation().getProvince())
                            .latitude(p.getLocalisation().getLatitude())
                            .longitude(p.getLocalisation().getLongitude())
                            .distanceKm(Math.round(dist * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public Commande marquerCommandePayee(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new BusinessException("Commande introuvable avec l'ID : " + commandeId));

        commande.setStatut(StatutCommande.PAYE);
        return commandeRepository.save(commande);
    }
}
