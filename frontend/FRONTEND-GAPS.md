# Écarts maquette / produit livré

Toutes les pages du frontend s'appuient sur des endpoints existants du backend : aucun écran
n'affiche de données fictives. Ce document liste ce que la maquette prévoyait et qui **n'est pas**
dans la version livrée, pour décider des suites.

## Fonctions de la maquette non livrées

| Fonction | Écran de la maquette | Ce qu'il faudrait |
|---|---|---|
| Panier multi-produits | 6 | Une commande porte aujourd'hui sur un seul produit. Le modèle (`LigneCommande`) accepte plusieurs lignes : il reste l'API de panier et l'écran. |
| Notes et avis sur les producteurs | 5, 6 | Entité `Avis`, endpoints de dépôt et de consultation, note moyenne sur la fiche producteur. |
| Mode de livraison (producteur, transporteur, retrait) | 7 | Champ sur `Commande`, frais et délais associés. |
| Paiement en espèces à la livraison | 7 | Second mode de paiement, validé par le producteur à la remise. |
| Litiges | 10 | Entité `Litige`, signalement par l'éleveur ou le producteur, traitement par l'administrateur. |
| Pièce d'identité (CNIB) à l'inscription | 3, 4 | Endpoint d'envoi de fichier et stockage ; la colonne `chemin_piece_identite` existe déjà. |
| Mot de passe oublié | — | Envoi d'un code par SMS (CDC §2.2.5). |

## Points à brancher avant la mise en service réelle

* **Orange Money** : la confirmation de paiement est simulée (`PAIEMENT_SIMULATION=true`). Le webhook
  opérateur existe et est signé ; il reste à contractualiser un agrégateur et à le brancher dessus.
* **Mentions des factures** : IFU, RCCM et coordonnées bancaires se renseignent par variables
  `ENTREPRISE_*`. La facture indique qu'elle n'est pas encore certifiée fiscalement.
* **Coordonnées de contact** : e-mail et WhatsApp du pied de page (voir le README du frontend).
* **Carte des producteurs** : vue schématique placée d'après les coordonnées GPS, sans fond de carte.
