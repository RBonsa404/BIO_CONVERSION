# API REST — BioConversion

Base : `/api/v1`. Sauf mention « public », chaque appel porte l'en-tête
`Authorization: Bearer <jeton>` obtenu à la connexion.

Réponse type :

```json
{ "success": true, "message": "Opération réussie", "data": { }, "timestamp": "2026-10-08T22:00:00Z" }
```

Erreur type (400, 401, 403, 404, 409) :

```json
{ "status": 400, "error": "Bad Request", "message": "Stock insuffisant…", "fieldErrors": { "prix": "…" } }
```

`401` : jeton absent, expiré ou compte désactivé. `403` : rôle insuffisant ou ressource d'un autre utilisateur.

## Authentification et profil

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| POST | `/auth/login` | public | Connexion par téléphone + mot de passe |
| POST | `/auth/register/producteur` | public | Inscription producteur (compte en attente de validation) |
| POST | `/auth/register/eleveur` | public | Inscription éleveur (compte en attente de validation) |
| GET | `/auth/me` | connecté | Profil de l'utilisateur connecté |
| PUT | `/auth/me` | connecté | Modification du profil |
| PUT | `/auth/me/mot-de-passe` | connecté | Changement de mot de passe |
| GET | `/health` | public | État de l'application |

Connexion :

```json
{ "telephone": "+226 70 00 00 03", "motDePasse": "…" }
```

Le téléphone accepte `70 00 00 03`, `+22670000003` ou `0022670000003`. La réponse contient
`token`, `expiresInMs` et `user` (`id`, `nom`, `prenom`, `telephone`, `role`, `statut`, …).

## Marketplace — catalogue

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| GET | `/marketplace/produits?page=&size=` | connecté | Produits en vente |
| GET | `/marketplace/produits/{id}` | connecté | Un produit en vente |
| GET | `/marketplace/produits/producteur/{producteurId}` | connecté | Catalogue d'un producteur |
| GET | `/marketplace/produits/recherche?latitude=&longitude=&rayonKm=` | connecté | Produits dans un rayon |
| GET | `/marketplace/producteurs/recherche-geolocalisee?latitude=&longitude=&rayonKm=` | connecté | Producteurs dans un rayon |
| GET | `/marketplace/produits/mes-produits` | producteur | Tout son catalogue, produits retirés compris |
| POST | `/marketplace/produits` | producteur | Publier un produit |
| PUT | `/marketplace/produits/{id}` | producteur propriétaire | Modifier nom, type, prix, stock |
| PATCH | `/marketplace/produits/{id}/stock?nouvelleQuantite=` | producteur propriétaire | Ajuster le stock |
| PATCH | `/marketplace/produits/{id}/prix?nouveauPrix=` | producteur propriétaire | Ajuster le prix |
| DELETE | `/marketplace/produits/{id}` | producteur propriétaire | Retirer de la vente |
| POST | `/marketplace/produits/{id}/republier` | producteur propriétaire | Remettre en vente |

Produit : `{ "nomProduit": "Larves fraîches", "typeProduit": "LARVE", "prix": 450, "quantiteStock": 40 }`
(`typeProduit` : `LARVE` ou `RESIDU_PRODUCTION`).

## Marketplace — commandes

Cycle : `EN_ATTENTE` → `CONFIRME` → `PAYE` → `EXPEDIE` → `LIVRE`, avec les sorties `REFUSE`,
`ANNULE` et `NON_CONFIRMEE` (commande non validée sous 12 h, stock restitué).

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| POST | `/marketplace/commandes` | éleveur | Passer commande `{ "produitId": 1, "quantite": 2 }` (réserve le stock) |
| GET | `/marketplace/commandes/{id}` | partie de la commande | Détail |
| GET | `/marketplace/commandes/eleveur/{eleveurId}` | cet éleveur | Ses commandes, les plus récentes d'abord |
| GET | `/marketplace/commandes/producteur/{producteurId}` | ce producteur | Commandes reçues |
| POST | `/marketplace/commandes/{id}/confirmer` | producteur de la commande | `EN_ATTENTE` → `CONFIRME` |
| POST | `/marketplace/commandes/{id}/refuser` | producteur de la commande | `EN_ATTENTE` → `REFUSE` |
| POST | `/marketplace/commandes/{id}/annuler?motif=` | partie de la commande | Annulation (dans les 12 h) |
| PATCH | `/marketplace/commandes/{id}/statut` | voir ci-dessous | Suivi de livraison |

`PATCH …/statut` avec `{ "nouveauStatut": "EXPEDIE" }` (producteur) puis
`{ "nouveauStatut": "LIVRE" }` (producteur ou éleveur). Les autres statuts passent par les actions dédiées.

Une commande expose aussi `statutPaiement`, `referenceFacture` et le téléphone des deux parties.

## Paiement et factures

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| POST | `/paiements` | éleveur de la commande | Initier le paiement `{ "idCommande": 1, "operateur": "ORANGE_MONEY" }` (commande `CONFIRME`) |
| GET | `/paiements/commande/{idCommande}` | partie de la commande | État du paiement |
| GET | `/paiements/mode` | connecté | `{ "simulation": true }` si la réponse opérateur est simulée |
| POST | `/paiements/commande/{idCommande}/simulation?succes=true` | éleveur de la commande | Réponse opérateur simulée (si `PAIEMENT_SIMULATION=true`) |
| POST | `/paiements/webhook` | public, signé | Réponse de l'opérateur `{ "referenceTransaction": "…", "statut": "SUCCES" }` |
| GET | `/paiements/producteur/{producteurId}/solde` | ce producteur | Total des paiements confirmés |
| GET | `/factures/commande/{idCommande}/telecharger` | partie de la commande | Facture PDF de la commande |
| GET | `/factures/{reference}` | partie de la commande | Métadonnées d'une facture |
| GET | `/factures/{reference}/telecharger` | partie de la commande | PDF en téléchargement |
| GET | `/factures/{reference}/imprimer` | partie de la commande | PDF affiché dans le navigateur |

Le webhook exige l'en-tête `X-Signature` : HMAC-SHA256 du corps brut avec `WEBHOOK_SECRET`, encodé en Base64.

## IoT

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| POST | `/iot/telemetrie?codeCapteur=&temperature=&humidite=` | capteur (`X-API-Key`) | Enregistrer une mesure, lever une alerte au-delà d'un seuil |
| GET | `/iot/capteurs` | producteur | Ses capteurs et leur dernière mesure |
| POST | `/iot/capteurs` | producteur | Déclarer un capteur `{ "codeIdentifiant": "SERRE-02", "typeCapteur": "…", "seuilTemperatureMax": 35, "seuilHumiditeMax": 80 }` |
| PATCH | `/iot/capteurs/{id}/statut?actif=` | producteur propriétaire | Activer / désactiver |
| GET | `/iot/alertes?limite=20` | producteur | Dernières alertes |
| GET | `/iot/capteurs/producteur/{producteurId}` | ce producteur, admin | Capteurs d'un producteur |

## Réseau des producteurs

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| GET | `/producteurs` | connecté | Producteurs validés |
| GET | `/producteurs/{id}` | connecté | Fiche d'un producteur |
| GET | `/producteurs/province/{province}` | connecté | Producteurs d'une province |
| GET | `/producteurs/en-attente` | admin | Producteurs à valider |
| PUT | `/producteurs/{id}/valider?approuve=` | admin | Valider / refuser un producteur |

## Administration

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| GET | `/admin/utilisateurs?statut=&page=&size=` | admin | Tous les comptes, filtrables par statut |
| PUT | `/admin/utilisateurs/{id}/valider?approuve=` | admin | Valider / refuser une inscription (producteur ou éleveur) |
| PUT | `/admin/utilisateurs/{id}/suspendre` | admin | Suspendre un compte actif |
| PUT | `/admin/utilisateurs/{id}/reactiver` | admin | Réactiver un compte suspendu ou refusé |
| GET | `/admin/statistiques` | admin | Indicateurs : comptes, produits, commandes par statut, volume payé, commission |

Statuts de compte : `EN_ATTENTE_VALIDATION`, `ACTIF`, `SUSPENDU`, `REFUSE`. Seul un compte `ACTIF` peut se connecter.
