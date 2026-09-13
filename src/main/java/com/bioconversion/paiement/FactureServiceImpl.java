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

    private static final String DOSSIER_FACTURES = "factures";

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
        Files.createDirectories(Paths.get(DOSSIER_FACTURES));

        String nomFichier = facture.getReference() + ".pdf";
        Path chemin = Paths.get(DOSSIER_FACTURES, nomFichier);

        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        try (var out = Files.newOutputStream(chemin)) {
            PdfWriter.getInstance(document, out);
            document.open();

            // Couleurs de la charte (sobre, cf. CDC §4.4)
            Color vertPrincipal = new Color(46, 125, 50);
            Color grisTexte = new Color(60, 60, 60);
            Color grisClair = new Color(240, 240, 240);

            Font policeTitre = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, vertPrincipal);
            Font policeSousTitre = FontFactory.getFont(FontFactory.HELVETICA, 10, grisTexte);
            Font policeLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, grisTexte);
            Font policeValeur = FontFactory.getFont(FontFactory.HELVETICA, 10, grisTexte);
            Font policeTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, vertPrincipal);

            // En-tête
            Paragraph titre = new Paragraph("BIO CONVERSION", policeTitre);
            titre.setAlignment(Element.ALIGN_LEFT);
            document.add(titre);

            Paragraph sousTitre = new Paragraph(
                    "Plateforme numérique de bio-conversion — Burkina Faso", policeSousTitre);
            sousTitre.setSpacingAfter(20);
            document.add(sousTitre);

            // Ligne de séparation
            document.add(ligneSeparatrice(vertPrincipal));
            document.add(new Paragraph(" "));

            // Titre du document
            Paragraph libelle = new Paragraph("FACTURE",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, grisTexte));
            libelle.setSpacingAfter(15);
            document.add(libelle);

            // Bloc infos (référence / date / commande)
            PdfPTable infos = new PdfPTable(2);
            infos.setWidthPercentage(100);
            infos.setSpacingAfter(20);
            infos.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            ajouterLigneInfo(infos, "Référence", facture.getReference(), policeLabel, policeValeur);
            ajouterLigneInfo(infos, "Date", facture.getDateFacture().toString(), policeLabel, policeValeur);
            ajouterLigneInfo(infos, "Commande n°",
                    facture.getPaiement().getCommande().getNumeroCommande(), policeLabel, policeValeur);
            ajouterLigneInfo(infos, "Opérateur de paiement",
                    facture.getPaiement().getOperateur(), policeLabel, policeValeur);
            document.add(infos);

            // Tableau du détail financier
            PdfPTable detail = new PdfPTable(2);
            detail.setWidthPercentage(100);
            detail.setWidths(new float[]{3, 1});
            detail.setSpacingAfter(10);

            ajouterEnteteTableau(detail, "Description", grisClair, policeLabel);
            ajouterEnteteTableau(detail, "Montant (FCFA)", grisClair, policeLabel);

            ajouterLigneTableau(detail, "Montant payé par l'éleveur",
                    String.format(Locale.FRANCE, "%,.0f", facture.getMontant()), policeValeur);
            ajouterLigneTableau(detail,
                    String.format(Locale.FRANCE, "Commission plateforme (%.1f%%)", tauxCommission * 100),
                    String.format(Locale.FRANCE, "%,.0f", montantCommission), policeValeur);

            document.add(detail);

            // Ligne total
            PdfPTable total = new PdfPTable(2);
            total.setWidthPercentage(100);
            total.setWidths(new float[]{3, 1});

            PdfPCell celluleTotalLabel = new PdfPCell(new Phrase("Total payé", policeTotal));
            celluleTotalLabel.setBorder(Rectangle.TOP);
            celluleTotalLabel.setBorderColor(vertPrincipal);
            celluleTotalLabel.setPaddingTop(8);

            PdfPCell celluleTotalValeur = new PdfPCell(new Phrase(
                    String.format(Locale.FRANCE, "%,.0f FCFA", facture.getMontant()), policeTotal));
            celluleTotalValeur.setBorder(Rectangle.TOP);
            celluleTotalValeur.setBorderColor(vertPrincipal);
            celluleTotalValeur.setPaddingTop(8);
            celluleTotalValeur.setHorizontalAlignment(Element.ALIGN_RIGHT);

            total.addCell(celluleTotalLabel);
            total.addCell(celluleTotalValeur);
            document.add(total);

            // Pied de page
            Paragraph piedDePage = new Paragraph(
                    "\n\nFacture générée automatiquement — Bio Conversion, Ouagadougou, Burkina Faso",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            piedDePage.setAlignment(Element.ALIGN_CENTER);
            piedDePage.setSpacingBefore(40);
            document.add(piedDePage);

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

    private String genererReference() {
        return "FACT-" + UUID.randomUUID();
    }
}
