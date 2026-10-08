# BioConversion — Frontend

Application Angular de la plateforme BioConversion : accueil, inscription et connexion, puis un
espace par rôle (producteur, éleveur, administrateur) derrière une barre latérale commune.

Le lancement de la plateforme complète est décrit dans le [README principal](../README.md).

## Développement

Prérequis : Node.js 22+ et le backend démarré sur `localhost:8080`.

```bash
npm install
```

```bash
npm start
```

L'application est servie sur <http://localhost:4200>.

## Connexion au backend

Le frontend appelle toujours l'URL relative `/api/v1` (`src/environments/`) :

* en développement, `ng serve` relaie `/api` vers `http://localhost:8080` (`proxy.conf.json`) ;
* en production, le backend sert lui-même le frontend compilé, sur le même domaine.

Il n'y a donc aucune adresse de serveur à configurer, quels que soient la machine ou le domaine.
Pour pointer le serveur de développement vers un autre backend, modifier `target` dans `proxy.conf.json`.

## Build

```bash
npm run build
```

Le résultat est écrit dans `dist/frontend/browser`. Le backend le sert directement depuis ce
dossier en local, et l'embarque dans son jar lors du build Docker.

## Tests

```bash
npm test
```

## Pages et API utilisées

Chaque page correspond à une route et s'appuie sur des endpoints existants du backend.

| Route | Rôle | Page | Endpoints |
|---|---|---|---|
| `/accueil` | public | Présentation, choix du profil | — |
| `/connexion` | public | Connexion | `POST /auth/login` |
| `/inscription/producteur`, `/inscription/eleveur` | public | Inscription | `POST /auth/register/*` |
| `/dashboard/producteur` | producteur | Tableau de bord, commandes à valider | commandes, solde, produits, capteurs |
| `/dashboard/commandes` | producteur | Validation, expédition, livraison, factures | `/marketplace/commandes/*`, `/factures/*` |
| `/dashboard/produits` | producteur | Catalogue : publier, modifier, retirer | `/marketplace/produits/*` |
| `/dashboard/statistiques` | producteur | Ventes et répartition des commandes | commandes, solde |
| `/iot` | producteur | Capteurs, mesures, alertes | `/iot/capteurs`, `/iot/alertes` |
| `/marketplace` | connecté | Recherche par rayon, catalogue | `/marketplace/produits`, recherche géolocalisée |
| `/producteur/:id` | connecté | Fiche et catalogue d'un producteur | `/producteurs/{id}`, catalogue |
| `/commande` | éleveur | Passer commande | `POST /marketplace/commandes` |
| `/confirmation` | éleveur | Commande envoyée | `GET /marketplace/commandes/{id}` |
| `/mes-commandes` | éleveur | Suivi, paiement, réception, facture | commandes, `/paiements/*`, `/factures/*` |
| `/historique` | éleveur | Commandes terminées, factures | commandes, `/factures/*` |
| `/admin` | administrateur | Indicateurs, comptes à valider | `/admin/statistiques`, `/admin/utilisateurs` |
| `/admin/utilisateurs` | administrateur | Tous les comptes : valider, suspendre | `/admin/utilisateurs/*` |
| `/profil` | connecté | Informations, mot de passe, session | `/auth/me` |

Les routes de l'espace connecté sont protégées par `authGuard` et par un garde de rôle
(`core/guards`) : un visiteur est renvoyé vers la connexion, un utilisateur d'un autre rôle vers
son propre espace. Le backend applique les mêmes règles ; une session expirée (401) ramène à la connexion.

## Structure

```
src/app/
├── core/
│   ├── guards/      authGuard, guestGuard, gardes de rôle
│   ├── models/      Types de l'authentification et des inscriptions
│   ├── services/    AuthService, MarketplaceService, PaiementService, IotService, AdminService, intercepteur JWT
│   └── utils/       Libellés de statuts, messages d'erreur, validateurs
├── layouts/         EspaceLayout (page connectée) et barre latérale
├── features/        Une page par dossier (auth, marketplace, commande, producteur-*, iot, admin, profil)
└── shared/          Composants réutilisables (badge, carte, en-tête de page)
public/              Logo, photos du carrousel (WebP), icônes
```

## Design

Couleurs (`tailwind.config.js`) : `wine` #64102f (marque), `wine-dark` #3f0820 (barre latérale),
`green` #4e7d3f (accents, validation), `green-soft` #e8f0df, `cream` #f7f4ea (fond),
`text` #3f4a57, `line` #ddd9cd.

Typographie : Georgia pour les titres, Inter pour le texte, Caveat pour les accroches.

Icônes : Flaticon UIcons (crédit dans `src/assets/icons/README.md` et dans le pied de page de l'accueil).

## Coordonnées du pied de page

L'adresse e-mail et le numéro WhatsApp de l'accueil se règlent dans
`features/auth/accueil/accueil.component.ts` (`contact`). Le bouton WhatsApp n'apparaît que si un
numéro est renseigné.

## Sécurité de l'authentification

Le jeton JWT est conservé dans `localStorage`. Ce choix facilite l'authentification côté client,
mais rend le jeton accessible à tout script exécuté dans l'origine de l'application, notamment en
cas de faille XSS. Ce risque est accepté pour la version actuelle ; une évolution devrait
privilégier un cookie `httpOnly` posé et renouvelé par le backend.

## Stack

Angular 22 (composants autonomes, signaux), TypeScript, Tailwind CSS 3.4, SCSS, RxJS, Vitest.
