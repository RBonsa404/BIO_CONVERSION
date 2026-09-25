package com.bioconversion.utilisateur.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Donnees recues du Module B (Marketplace) lorsqu'une commande est validee,
 * pour declencher la notification au producteur (D-MUST-4).
 */
@Data
public class CommandeValideeNotification {

    @NotNull(message = "L'identifiant de la commande est obligatoire")
    private Long commandeId;

    @NotBlank(message = "Le numero de commande est obligatoire")
    private String numeroCommande;
    @NotNull(message = "L'identifiant du producteur est obligatoire")
    private Long producteurId;
}