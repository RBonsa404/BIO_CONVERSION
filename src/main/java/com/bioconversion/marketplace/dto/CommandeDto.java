package com.bioconversion.marketplace.dto;

import com.bioconversion.marketplace.Commande;
import com.bioconversion.marketplace.StatutCommande;
import com.bioconversion.paiement.Paiement;
import com.bioconversion.paiement.StatutPaiement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO de transfert réseau représentant une Commande complète avec ses lignes et son montant calculé.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandeDto {

    private Long idCommande;
    private String numeroCommande;
    private Long eleveurId;
    private String nomEleveur;
    private Long producteurId;
    private String nomExploitation;
    private OffsetDateTime dateCommande;
    private StatutCommande statut;
    private BigDecimal montantTotal;
    private List<LigneCommandeDto> lignes;

    // Coordonnées des deux parties, pour organiser la livraison
    private String telephoneEleveur;
    private String telephoneProducteur;

    // État du règlement (null tant qu'aucun paiement n'a été initié)
    private StatutPaiement statutPaiement;
    private String referenceFacture;

    public static CommandeDto fromEntity(Commande commande) {
        if (commande == null) {
            return null;
        }

        List<LigneCommandeDto> lignesDto = null;
        if (commande.getLignes() != null) {
            lignesDto = commande.getLignes().stream()
                    .map(l -> LigneCommandeDto.builder()
                            .idLigne(l.getIdLigne())
                            .produitId(l.getProduit() != null ? l.getProduit().getIdProduit() : null)
                            .nomProduit(l.getProduit() != null ? l.getProduit().getNomProduit() : null)
                            .quantite(l.getQuantite())
                            .prixUnitaireFige(l.getPrixUnitaireFige())
                            .sousTotal(l.calculerSousTotal())
                            .build())
                    .collect(Collectors.toList());
        }

        Paiement paiement = commande.getPaiement();

        return CommandeDto.builder()
                .idCommande(commande.getIdCommande())
                .numeroCommande(commande.getNumeroCommande())
                .eleveurId(commande.getEleveur() != null ? commande.getEleveur().getIdUtilisateur() : null)
                .nomEleveur(commande.getEleveur() != null ? (commande.getEleveur().getPrenom() + " " + commande.getEleveur().getNom()) : null)
                .producteurId(commande.getProducteur() != null ? commande.getProducteur().getIdUtilisateur() : null)
                .nomExploitation(commande.getProducteur() != null ? commande.getProducteur().getNomExploitation() : null)
                .dateCommande(commande.getDateCommande())
                .statut(commande.getStatut())
                .montantTotal(commande.calculerMontantTotal())
                .lignes(lignesDto)
                .telephoneEleveur(commande.getEleveur() != null ? commande.getEleveur().getTelephone() : null)
                .telephoneProducteur(commande.getProducteur() != null ? commande.getProducteur().getTelephone() : null)
                .statutPaiement(paiement != null ? paiement.getStatutPaiement() : null)
                .referenceFacture(paiement != null && paiement.getFacture() != null
                        ? paiement.getFacture().getReference()
                        : null)
                .build();
    }
}
