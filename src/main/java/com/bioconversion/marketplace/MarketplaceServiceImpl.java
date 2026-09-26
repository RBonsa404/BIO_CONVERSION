package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.geo.Localisation;
import com.bioconversion.marketplace.dto.ProducteurLocaliseDto;
import com.bioconversion.marketplace.dto.ProduitDto;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service Marketplace (Module B).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MarketplaceServiceImpl implements MarketplaceService {

    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    private final ProducteurRepository producteurRepository;
    private final EleveurRepository eleveurRepository;
    private final IdempotencyService idempotencyService;

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
        return passerCommande(eleveurId, produitId, quantite, null);
    }

    @Override
    @Transactional
    public Commande passerCommande(Long eleveurId, Long produitId, Double quantite, String idempotencyKey) {
        return idempotencyService.executerAvecIdempotence(idempotencyKey, () -> {
            if (eleveurId == null) {
                throw new BusinessException("L'identifiant de l'éleveur est obligatoire");
            }
            if (produitId == null) {
                throw new BusinessException("L'identifiant du produit est obligatoire");
            }
            if (quantite == null || quantite <= 0) {
                throw new BusinessException("La quantité commandée doit être strictement positive");
            }

            Eleveur eleveur = eleveurRepository.findById(eleveurId)
                    .orElseThrow(() -> new ResourceNotFoundException("Éleveur introuvable avec l'ID : " + eleveurId));

            Produit produit = produitRepository.findById(produitId)
                    .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));

            if (!produit.isDisponibilite()) {
                throw new BusinessException("Le produit '" + produit.getNomProduit() + "' n'est plus disponible.");
            }

            if (quantite > produit.getQuantiteStock()) {
                throw new BusinessException("Stock insuffisant pour le produit '" + produit.getNomProduit()
                        + "'. Stock disponible : " + produit.getQuantiteStock() + ", quantité demandée : " + quantite);
            }

            // Décrémenter le stock via le canal exposé par OUATTARA
            modifierStock(produitId, produit.getQuantiteStock() - quantite);

            // Créer la commande (statut initial EN_ATTENTE)
            Commande commande = Commande.builder()
                    .eleveur(eleveur)
                    .producteur(produit.getProducteur())
                    .dateCommande(OffsetDateTime.now())
                    .statut(StatutCommande.EN_ATTENTE)
                    .numeroCommande(Commande.genererNumeroCommande())
                    .build();

            // Créer la ligne de commande associée avec prix unitaire figé copié depuis le prix courant
            LigneCommande ligne = LigneCommande.builder()
                    .commande(commande)
                    .produit(produit)
                    .quantite(quantite)
                    .prixUnitaireFige(produit.getPrix())
                    .build();

            commande.ajouterLigne(ligne);

            return commandeRepository.save(commande);
        });
    }

    @Override
    @Transactional
    public Commande changerStatutCommande(Long commandeId, StatutCommande nouveauStatut) {
        if (commandeId == null) {
            throw new BusinessException("L'identifiant de la commande est obligatoire");
        }
        if (nouveauStatut == null) {
            throw new BusinessException("Le nouveau statut est obligatoire");
        }

        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        StatutCommande statutActuel = commande.getStatut();
        if (statutActuel == nouveauStatut) {
            return commande;
        }

        if (nouveauStatut == StatutCommande.PAYE) {
            throw new BusinessException("La transition vers le statut PAYE doit être effectuée exclusivement via le service de paiement (marquerCommandePayee)");
        }

        // Machine à états explicite
        boolean transitionValide = false;
        switch (statutActuel) {
            case EN_ATTENTE -> transitionValide = (nouveauStatut == StatutCommande.CONFIRME
                    || nouveauStatut == StatutCommande.REFUSE
                    || nouveauStatut == StatutCommande.NON_CONFIRMEE
                    || nouveauStatut == StatutCommande.ANNULE);
            case CONFIRME -> transitionValide = (nouveauStatut == StatutCommande.ANNULE);
            case PAYE -> transitionValide = (nouveauStatut == StatutCommande.EXPEDIE
                    || nouveauStatut == StatutCommande.ANNULE);
            case EXPEDIE -> transitionValide = (nouveauStatut == StatutCommande.LIVRE);
            case LIVRE, REFUSE, ANNULE, NON_CONFIRMEE -> transitionValide = false;
        }

        if (!transitionValide) {
            throw new BusinessException("Transition de statut invalide : impossible de passer de "
                    + statutActuel + " à " + nouveauStatut);
        }

        // Restitution du stock en cas d'annulation, refus ou expiration (NON_CONFIRMEE)
        if (nouveauStatut == StatutCommande.ANNULE || nouveauStatut == StatutCommande.REFUSE
                || nouveauStatut == StatutCommande.NON_CONFIRMEE) {
            restituerStock(commande);
        }

        commande.setStatut(nouveauStatut);
        return commandeRepository.save(commande);
    }

    @Override
    @Transactional
    public Commande confirmerCommande(Long commandeId, Long producteurId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        if (producteurId != null && !commande.getProducteur().getIdUtilisateur().equals(producteurId)) {
            throw new BusinessException("Seul le producteur assigné à cette commande peut la confirmer");
        }

        if (commande.getStatut() != StatutCommande.EN_ATTENTE) {
            throw new BusinessException("Seule une commande EN_ATTENTE peut être confirmée (statut actuel : "
                    + commande.getStatut() + ")");
        }

        OffsetDateTime limite12h = commande.getDateCommande().plusHours(12);
        if (OffsetDateTime.now().isAfter(limite12h)) {
            changerStatutCommande(commandeId, StatutCommande.NON_CONFIRMEE);
            proposerProducteursAlternatifs(commande);
            throw new BusinessException("Le délai de confirmation de 12h est dépassé. La commande a été marquée comme NON_CONFIRMEE.");
        }

        return changerStatutCommande(commandeId, StatutCommande.CONFIRME);
    }

    @Override
    @Transactional
    public Commande annulerCommande(Long commandeId, String motif) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        if (commande.getStatut() == StatutCommande.LIVRE || commande.getStatut() == StatutCommande.EXPEDIE
                || commande.getStatut() == StatutCommande.ANNULE || commande.getStatut() == StatutCommande.REFUSE
                || commande.getStatut() == StatutCommande.NON_CONFIRMEE) {
            throw new BusinessException("Impossible d'annuler une commande avec le statut " + commande.getStatut());
        }

        OffsetDateTime limite12h = commande.getDateCommande().plusHours(12);
        if (OffsetDateTime.now().isAfter(limite12h)) {
            throw new BusinessException("L'annulation automatique n'est plus possible au-delà de 12h après le passage de la commande. "
                    + "Veuillez contacter le service client pour un traitement manuel (motif : "
                    + (motif != null && !motif.isBlank() ? motif : "non précisé") + ").");
        }

        return changerStatutCommande(commandeId, StatutCommande.ANNULE);
    }

    @Override
    @Transactional
    public Commande annulerCommande(Long commandeId, String motif, Long currentUserId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        if (!commande.getEleveur().getIdUtilisateur().equals(currentUserId) 
                && !commande.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException("Vous n'êtes pas autorisé à annuler cette commande");
        }

        if (commande.getStatut() == StatutCommande.LIVRE || commande.getStatut() == StatutCommande.EXPEDIE
                || commande.getStatut() == StatutCommande.ANNULE || commande.getStatut() == StatutCommande.REFUSE
                || commande.getStatut() == StatutCommande.NON_CONFIRMEE) {
            throw new BusinessException("Impossible d'annuler une commande avec le statut " + commande.getStatut());
        }

        OffsetDateTime limite12h = commande.getDateCommande().plusHours(12);
        if (OffsetDateTime.now().isAfter(limite12h)) {
            throw new BusinessException("L'annulation automatique n'est plus possible au-delà de 12h après le passage de la commande. "
                    + "Veuillez contacter le service client pour un traitement manuel (motif : "
                    + (motif != null && !motif.isBlank() ? motif : "non précisé") + ").");
        }

        return changerStatutCommande(commandeId, StatutCommande.ANNULE);
    }

    @Override
    @Transactional(readOnly = true)
    public Commande trouverCommandeParId(Long commandeId) {
        return commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));
    }

    @Override
    @Transactional(readOnly = true)
    public Commande trouverCommandeParId(Long commandeId, Long currentUserId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        if (!commande.getEleveur().getIdUtilisateur().equals(currentUserId) 
                && !commande.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException("Vous n'êtes pas autorisé à accéder à cette commande");
        }

        return commande;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Commande> listerCommandesEleveur(Long eleveurId, Pageable pageable) {
        return commandeRepository.findByEleveurIdUtilisateur(eleveurId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Commande> listerCommandesProducteur(Long producteurId, Pageable pageable) {
        return commandeRepository.findByProducteurIdUtilisateur(producteurId, pageable);
    }

    @Override
    @Transactional
    public List<Commande> expirerCommandesNonConfirmees() {
        OffsetDateTime dateLimite = OffsetDateTime.now().minusHours(12);
        List<Commande> commandesExpirees = commandeRepository.findByStatutAndDateCommandeBefore(
                StatutCommande.EN_ATTENTE, dateLimite);

        for (Commande cmd : commandesExpirees) {
            log.info("Expiration automatique de la commande #{} (non confirmée après 12h)", cmd.getIdCommande());
            changerStatutCommande(cmd.getIdCommande(), StatutCommande.NON_CONFIRMEE);
            proposerProducteursAlternatifs(cmd);
        }
        return commandesExpirees;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProducteurLocaliseDto> proposerProducteursAlternatifs(Commande commande) {
        if (commande == null || commande.getProducteur() == null || commande.getProducteur().getLocalisation() == null) {
            return List.of();
        }
        Localisation loc = commande.getProducteur().getLocalisation();
        List<ProducteurLocaliseDto> alternatives = rechercherProducteursParRayon(loc.getLatitude(), loc.getLongitude(), 50.0).stream()
                .filter(p -> !p.getProducteurId().equals(commande.getProducteur().getIdUtilisateur()))
                .collect(Collectors.toList());
        log.info("Proposition de {} producteurs alternatifs pour la commande non confirmée #{}",
                alternatives.size(), commande.getIdCommande());
        return alternatives;
    }

    private void restituerStock(Commande commande) {
        if (commande.getLignes() != null) {
            for (LigneCommande ligne : commande.getLignes()) {
                Produit p = ligne.getProduit();
                if (p != null) {
                    double stockActuel = p.getQuantiteStock();
                    modifierStock(p.getIdProduit(), stockActuel + ligne.getQuantite());
                }
            }
        }
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
    public Produit modifierStock(Long produitId, double nouvelleQuantite, Long currentUserId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        
        if (!produit.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException("Vous n'êtes pas autorisé à modifier ce produit");
        }
        
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
    public Produit modifierPrix(Long produitId, double nouveauPrix, Long currentUserId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        
        if (!produit.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException("Vous n'êtes pas autorisé à modifier ce produit");
        }
        
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
    @Transactional
    public void retirerProduit(Long produitId, Long currentUserId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable avec l'ID : " + produitId));
        
        if (!produit.getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException("Vous n'êtes pas autorisé à retirer ce produit");
        }
        
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

        return producteurRepository.findByStatut(com.bioconversion.utilisateur.StatutUtilisateur.ACTIF, Pageable.unpaged()).getContent().stream()
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

    @Override
    @Transactional
    public Commande marquerCommandePayee(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable avec l'ID : " + commandeId));

        if (commande.getStatut() == StatutCommande.PAYE) {
            return commande;
        }

        if (commande.getStatut() == StatutCommande.ANNULE || commande.getStatut() == StatutCommande.REFUSE
                || commande.getStatut() == StatutCommande.NON_CONFIRMEE) {
            throw new BusinessException("Impossible de marquer comme payée une commande avec le statut "
                    + commande.getStatut());
        }

        commande.setStatut(StatutCommande.PAYE);
        return commandeRepository.save(commande);
    }
}

