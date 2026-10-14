package com.bioconversion.commission;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/** Lecture des paramètres de la plateforme : aucune valeur n'est écrite en dur dans le code. */
@Service
@RequiredArgsConstructor
public class ParametreService {

    public static final String COMMISSION_TAUX = "COMMISSION_TAUX";
    public static final String COMMISSION_SEUIL_ESPECES = "COMMISSION_SEUIL_ESPECES";
    public static final String FRAIS_VERSEMENT_TAUX = "FRAIS_VERSEMENT_TAUX";

    private final ParametreRepository parametreRepository;

    @Transactional(readOnly = true)
    public BigDecimal valeur(String cle) {
        return parametreRepository.findById(cle)
                .map(Parametre::getValeur)
                .orElseThrow(() -> new IllegalStateException("Paramètre manquant en base : " + cle));
    }

    /** 0.05 pour 5 %. */
    public BigDecimal tauxCommission() {
        return valeur(COMMISSION_TAUX);
    }

    /** 10 000 F : en dessous, une vente en espèces ne paie pas de commission. */
    public BigDecimal seuilCommissionEspeces() {
        return valeur(COMMISSION_SEUIL_ESPECES);
    }

    /** 0.01 pour 1 % (taux provisoire, à ajuster avec la grille de l'agrégateur). */
    public BigDecimal tauxFraisVersement() {
        return valeur(FRAIS_VERSEMENT_TAUX);
    }
}