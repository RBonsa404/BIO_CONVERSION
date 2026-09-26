package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.config.AppProperties;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import java.awt.Color;
import com.lowagie.text.*;

/**
 * Implémentation du service métier Module C — Facturation.
 * CDC v1.1, C-MUST-5.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FactureServiceImpl implements FactureService {

    private final FactureRepository factureRepository;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public Facture genererPourPaiement(Paiement paiement) {
        return factureRepository.findByPaiementIdPaiement(paiement.getIdPaiement())
                .orElseGet(() -> creerEtGenererFacture(paiement));
    }

    private Facture creerEtGenererFacture(Paiement paiement) {
        if (paiement.getStatutPaiement() != StatutPaiement.CONFIRME) {
            throw new BusinessException(
                    "Impossible de générer une facture pour un paiement non confirmé : "
                            + paiement.getIdPaiement());
        }

        // C-MUST-5 : taux paramétrable côté administration, jamais codé en dur.
        // Facture.montant reste le montant TOTAL payé par l'éleveur — la
        // commission n'est jamais déduite de ce montant, elle n'apparaît que
        // comme ligne distincte dans le PDF généré ci-dessous.
        double tauxCommission = appProperties.commission().taux();
        double montantCommission = paiement.getMontant() * tauxCommission;

        Facture facture = Facture.builder()
                .paiement(paiement)
                .dateFacture(OffsetDateTime.now())
                .montant(paiement.getMontant())
                .reference(genererReference())
                .build();

        facture = factureRepository.save(facture);

        String cheminPdf = genererPdf(facture, montantCommission, tauxCommission);
        facture.setCheminPdf(cheminPdf);

        return factureRepository.save(facture);
    }

    private String genererPdf(Facture facture, double montantCommission, double tauxCommission) {
    try {
        String dossierFactures = appProperties.factures() != null && appProperties.factures().dossier() != null
                ? appProperties.factures().dossier()
                : "factures";
        
        Files.createDirectories(Paths.get(dossierFactures));

        String nomFichier = facture.getReference() + ".pdf";
        Path chemin = Paths.get(dossierFactures, nomFichier);

        var entreprise = appProperties.entreprise();
        var commande = facture.getPaiement().getCommande();
        var eleveur = commande.getEleveur();

        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        try (var out = Files.newOutputStream(chemin)) {
            PdfWriter.getInstance(document, out);
            document.open();

            Color vertPrincipal = new Color(46, 125, 50);
            Color grisTexte = new Color(60, 60, 60);
            Color grisClair = new Color(240, 240, 240);
            Color grisFonce = new Color(90, 90, 90);

            Font policeNomEntreprise = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, vertPrincipal);
            Font policePetite = FontFactory.getFont(FontFactory.HELVETICA, 8, grisFonce);
            Font policeTitreDoc = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, grisTexte);
            Font policeLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, grisTexte);
            Font policeValeur = FontFactory.getFont(FontFactory.HELVETICA, 9, grisTexte);
            Font policeEnteteTableau = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font policeTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, vertPrincipal);
            Font policeAvertissement = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.RED);

            // En-tête entreprise
            document.add(new Paragraph(entreprise.nom(), policeNomEntreprise));
            document.add(new Paragraph(
                    "IFU " + valeurOuPlaceholder(entreprise.ifu()) +
                    " · RCCM " + valeurOuPlaceholder(entreprise.rccm()), policePetite));
            document.add(new Paragraph(valeurOuPlaceholder(entreprise.adresse()), policePetite));
            document.add(new Paragraph(
                    valeurOuPlaceholder(entreprise.telephone()) + " · " +
                    valeurOuPlaceholder(entreprise.email()), policePetite));
            document.add(new Paragraph(" "));
            document.add(ligneSeparatrice(vertPrincipal));
            document.add(new Paragraph(" "));

            // Titre document + numéro/date
            PdfPTable enteteDoc = new PdfPTable(2);
            enteteDoc.setWidthPercentage(100);
            enteteDoc.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            PdfPCell celluleTitre = new PdfPCell(new Phrase("FACTURE N° " + facture.getReference(), policeTitreDoc));
            celluleTitre.setBorder(Rectangle.NO_BORDER);
            PdfPCell celluleDate = new PdfPCell(new Phrase(
                    facture.getDateFacture().toString(), policeValeur));
            celluleDate.setBorder(Rectangle.NO_BORDER);
            celluleDate.setHorizontalAlignment(Element.ALIGN_RIGHT);
            enteteDoc.addCell(celluleTitre);
            enteteDoc.addCell(celluleDate);
            enteteDoc.setSpacingAfter(15);
            document.add(enteteDoc);

            // Bloc client (éleveur)
            document.add(new Paragraph("Client", policeLabel));
            document.add(new Paragraph(
                    eleveur.getNom() + " " + eleveur.getPrenom(), policeValeur));
            document.add(new Paragraph(eleveur.getTelephone(), policeValeur));
            document.add(new Paragraph("Commande n° " + commande.getNumeroCommande(), policeValeur));
            document.add(new Paragraph(" "));

            // Tableau des lignes (Désignation / Qté / P.U. / Montant)
            PdfPTable tableauLignes = new PdfPTable(4);
            tableauLignes.setWidthPercentage(100);
            tableauLignes.setWidths(new float[]{4, 1, 1.5f, 1.5f});
            tableauLignes.setSpacingAfter(10);

            ajouterEnteteTableau(tableauLignes, "Désignation", vertPrincipal, policeEnteteTableau);
            ajouterEnteteTableau(tableauLignes, "Qté", vertPrincipal, policeEnteteTableau);
            ajouterEnteteTableau(tableauLignes, "P.U. (FCFA)", vertPrincipal, policeEnteteTableau);
            ajouterEnteteTableau(tableauLignes, "Montant (FCFA)", vertPrincipal, policeEnteteTableau);

            for (var ligne : commande.getLignes()) {
                ajouterLigneGauche(tableauLignes, ligne.getProduit().getNomProduit(), policeValeur);
                ajouterLigneCentree(tableauLignes, String.valueOf(ligne.getQuantite()), policeValeur);
                ajouterLigneDroite(tableauLignes,
                        String.format(Locale.FRANCE, "%,.0f", ligne.getPrixUnitaireFige()), policeValeur);
                ajouterLigneDroite(tableauLignes,
                        String.format(Locale.FRANCE, "%,.0f", ligne.calculerSousTotal()), policeValeur);
            }
            document.add(tableauLignes);

            // Récapitulatif montant / commission / total
            PdfPTable recap = new PdfPTable(2);
            recap.setWidthPercentage(50);
            recap.setHorizontalAlignment(Element.ALIGN_RIGHT);
            recap.setWidths(new float[]{2, 1});

            ajouterLigneRecap(recap, "Montant payé", facture.getMontant(), policeValeur, false);
            ajouterLigneRecap(recap,
                    String.format(Locale.FRANCE, "Commission plateforme (%.1f%%)", tauxCommission * 100),
                    montantCommission, policeValeur, false);
            ajouterLigneRecap(recap, "TOTAL", facture.getMontant(), policeTotal, true);

            recap.setSpacingBefore(10);
            document.add(recap);

            // Paiement
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Règlement — " + facture.getPaiement().getOperateur(), policeLabel));
            document.add(new Paragraph(
                    "Référence de transaction : " + facture.getPaiement().getReferenceTransaction(),
                    policeValeur));

            if (entreprise.banque() != null && !entreprise.banque().isBlank()
                    && !"À renseigner".equalsIgnoreCase(entreprise.banque())) {
                document.add(new Paragraph(
                        "Compte — " + entreprise.banque() + " : " + valeurOuPlaceholder(entreprise.iban()),
                        policePetite));
            }

            // Bloc certification — PAS de faux code de signature
            document.add(new Paragraph(" "));
            document.add(ligneSeparatrice(Color.LIGHT_GRAY));
            Paragraph certification = new Paragraph(
                    "CERTIFICATION FISCALE — EN ATTENTE D'INTÉGRATION\n" +
                    "Ce document n'est pas encore signé par un dispositif de certification agréé.",
                    policeAvertissement);
            certification.setSpacingBefore(8);
            document.add(certification);

            document.close();
        }

        return chemin.toString();

    } catch (IOException | DocumentException e) {
        log.error("Échec de génération du PDF pour la facture {}", facture.getReference(), e);
        throw new UncheckedIOException(
                "Impossible de générer le PDF de la facture " + facture.getReference(),
                e instanceof IOException ioEx ? ioEx : new IOException(e));
    }
}

private String valeurOuPlaceholder(String valeur) {
    return (valeur == null || valeur.isBlank()) ? "À renseigner" : valeur;
}

private void ajouterLigneCentree(PdfPTable table, String texte, Font police) {
    PdfPCell cellule = new PdfPCell(new Phrase(texte, police));
    cellule.setPadding(6);
    cellule.setHorizontalAlignment(Element.ALIGN_CENTER);
    cellule.setBorderColor(Color.LIGHT_GRAY);
    table.addCell(cellule);
}

private void ajouterLigneDroite(PdfPTable table, String texte, Font police) {
    PdfPCell cellule = new PdfPCell(new Phrase(texte, police));
    cellule.setPadding(6);
    cellule.setHorizontalAlignment(Element.ALIGN_RIGHT);
    cellule.setBorderColor(Color.LIGHT_GRAY);
    table.addCell(cellule);
}

private void ajouterLigneGauche(PdfPTable table, String texte, Font police) {
    PdfPCell cellule = new PdfPCell(new Phrase(texte, police));
    cellule.setPadding(6);
    cellule.setBorderColor(Color.LIGHT_GRAY);
    table.addCell(cellule);
}

private void ajouterLigneRecap(PdfPTable table, String label, double montant, Font police, boolean total) {
    PdfPCell celluleLabel = new PdfPCell(new Phrase(label, police));
    celluleLabel.setBorder(total ? Rectangle.TOP : Rectangle.NO_BORDER);
    celluleLabel.setPadding(6);

    PdfPCell celluleValeur = new PdfPCell(new Phrase(
            String.format(Locale.FRANCE, "%,.0f FCFA", montant), police));
    celluleValeur.setBorder(total ? Rectangle.TOP : Rectangle.NO_BORDER);
    celluleValeur.setHorizontalAlignment(Element.ALIGN_RIGHT);
    celluleValeur.setPadding(6);

    table.addCell(celluleLabel);
    table.addCell(celluleValeur);
}

    private PdfPTable ligneSeparatrice(Color couleur) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        PdfPCell cellule = new PdfPCell();
        cellule.setBorder(Rectangle.BOTTOM);
        cellule.setBorderColor(couleur);
        cellule.setBorderWidth(2);
        cellule.setFixedHeight(2);
        table.addCell(cellule);
        return table;
    }

    private void ajouterLigneInfo(PdfPTable table, String label, String valeur, Font policeLabel, Font policeValeur) {
        PdfPCell celluleLabel = new PdfPCell(new Phrase(label, policeLabel));
        celluleLabel.setBorder(Rectangle.NO_BORDER);
        celluleLabel.setPaddingBottom(4);

        PdfPCell celluleValeur = new PdfPCell(new Phrase(valeur, policeValeur));
        celluleValeur.setBorder(Rectangle.NO_BORDER);
        celluleValeur.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celluleValeur.setPaddingBottom(4);

        table.addCell(celluleLabel);
        table.addCell(celluleValeur);
    }

    private void ajouterEnteteTableau(PdfPTable table, String texte, Color fond, Font police) {
        PdfPCell cellule = new PdfPCell(new Phrase(texte, police));
        cellule.setBackgroundColor(fond);
        cellule.setPadding(8);
        table.addCell(cellule);
    }

    private void ajouterLigneTableau(PdfPTable table, String label, String valeur, Font police) {
        PdfPCell celluleLabel = new PdfPCell(new Phrase(label, police));
        celluleLabel.setPadding(8);
        celluleLabel.setBorderColor(Color.LIGHT_GRAY);

        PdfPCell celluleValeur = new PdfPCell(new Phrase(valeur, police));
        celluleValeur.setPadding(8);
        celluleValeur.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celluleValeur.setBorderColor(Color.LIGHT_GRAY);

        table.addCell(celluleLabel);
        table.addCell(celluleValeur);
    }

    @Override
    public Facture consulterParReference(String reference) {
        return factureRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucune facture pour la référence " + reference));
    }

    @Override
    public Facture consulterParReference(String reference, Long currentUserId) {
        Facture facture = factureRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucune facture pour la référence " + reference));

        if (!facture.getPaiement().getCommande().getEleveur().getIdUtilisateur().equals(currentUserId) 
                && !facture.getPaiement().getCommande().getProducteur().getIdUtilisateur().equals(currentUserId)) {
            throw new com.bioconversion.common.exception.UnauthorizedException(
                    "Vous n'êtes pas autorisé à consulter cette facture");
        }

        return facture;
    }

    @Override
    public byte[] telechargerPdf(String reference) {
        Facture facture = consulterParReference(reference);

        if (facture.getCheminPdf() == null) {
            throw new BusinessException(
                    "Le PDF de la facture " + reference + " n'a pas encore été généré");
        }

        try {
            return Files.readAllBytes(Path.of(facture.getCheminPdf()));
        } catch (IOException e) {
            throw new UncheckedIOException(
                    "Impossible de lire le PDF de la facture " + reference, e);
        }
    }

    @Override
    public byte[] telechargerPdf(String reference, Long currentUserId) {
        Facture facture = consulterParReference(reference, currentUserId);

        if (facture.getCheminPdf() == null) {
            throw new BusinessException(
                    "Le PDF de la facture " + reference + " n'a pas encore été généré");
        }

        try {
            return Files.readAllBytes(Path.of(facture.getCheminPdf()));
        } catch (IOException e) {
            throw new UncheckedIOException(
                    "Impossible de lire le PDF de la facture " + reference, e);
        }
    }

    private String genererReference() {
        return "FACT-" + UUID.randomUUID();
    }
}
