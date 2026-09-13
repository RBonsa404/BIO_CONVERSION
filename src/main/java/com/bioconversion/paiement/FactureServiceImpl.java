package com.bioconversion.paiement;

import com.bioconversion.common.exception.BusinessException;
import com.bioconversion.common.exception.ResourceNotFoundException;
import com.bioconversion.config.AppProperties;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Implémentation du service métier Module C — Facturation.
 * CDC v1.1, C-MUST-5.
 */
@Service
@RequiredArgsConstructor
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
            Path dossier = Path.of("./factures");
            Files.createDirectories(dossier);

            Path fichier = dossier.resolve(facture.getReference() + ".pdf");

            Document document = new Document();
            try (FileOutputStream out = new FileOutputStream(fichier.toFile())) {
                PdfWriter.getInstance(document, out);
                document.open();

                document.add(new Paragraph("BIO CONVERSION — Facture"));
                document.add(new Paragraph("Référence : " + facture.getReference()));
                document.add(new Paragraph("Date : " + facture.getDateFacture()));
                document.add(new Paragraph("Commande : "
                        + facture.getPaiement().getCommande().getNumeroCommande()));
                document.add(new Paragraph("Montant payé : " + facture.getMontant() + " FCFA"));
                document.add(new Paragraph(String.format(
                        "Commission plateforme (%.2f%%) : %.2f FCFA",
                        tauxCommission * 100, montantCommission)));

                document.close();
            }

            return fichier.toString();
        } catch (IOException | DocumentException e) {
            throw new RuntimeException(
                    "Impossible de générer le PDF de la facture " + facture.getReference(), e);
        }
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
