# BioConversion Frontend

Frontend Angular pour la plateforme BioConversion (Dunord Smart) - plateforme agri-tech de vente de larves BSFL entre producteurs et éleveurs au Burkina Faso.

## Prérequis

- Node.js 18+ et npm
- Angular CLI (installé via npm ou global)

## Installation

```bash
npm install
```

## Configuration de l'API

L'URL de l'API backend est configurée dans les fichiers d'environnement :

- `src/environments/environment.ts` : Développement
- `src/environments/environment.prod.ts` : Production

Par défaut, l'URL de développement est `http://localhost:8080/api/v1`.

Pour modifier l'URL de l'API, éditez le fichier correspondant :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

## Lancer le serveur de développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`.

## Build pour la production

```bash
npm run build
```

Les fichiers compilés seront générés dans le dossier `dist/frontend`.

## Tests

```bash
npm test
```

## Sécurité de l'authentification

Le token JWT est actuellement conservé dans `localStorage`. Ce choix facilite
l'authentification côté client, mais rend le token accessible à tout script
exécuté dans l'origine de l'application, notamment en cas de faille XSS. Ce
risque est accepté pour la version actuelle; toute évolution des exigences de
sécurité devrait privilégier une migration vers un cookie `httpOnly`, posé et
renouvelé par le backend.

## Structure du projet

```
src/
├── app/
│   ├── core/              # Services, guards, models (cœur de l'application)
│   │   ├── services/      # AuthService, HttpTokenInterceptor, etc.
│   │   ├── guards/        # authGuard, roleGuard
│   │   └── models/        # Interfaces TypeScript (Utilisateur, Produit, Commande, etc.)
│   ├── shared/            # Composants réutilisables
│   │   └── components/    # ui-button, ui-card, ui-badge, ui-icon-circle
│   ├── features/          # Écrans fonctionnels
│   │   ├── auth/          # Accueil, connexion, inscription
│   │   ├── producteur-dashboard/
│   │   ├── marketplace/
│   │   ├── commande/
│   │   ├── iot/
│   │   └── admin/
│   ├── app.config.ts      # Configuration Angular (routing, providers)
│   ├── app.routes.ts      # Routes de l'application
│   └── app.html           # Template racine
├── environments/          # Configuration par environnement
└── styles.scss            # Styles globaux
```

## Design System

### Couleurs

- `wine` (#64102f) : Couleur de marque principale
- `wine-dark` (#3f0820) : Sidebar, dégradés foncés
- `green` (#4e7d3f) : Accents, liens, boutons de validation
- `green-soft` (#e8f0df) : Fond des badges/pastilles
- `cream` (#f7f4ea) : Fond général de l'application
- `text` (#3f4a57) : Texte principal
- `line` (#ddd9cd) : Bordures, séparateurs

### Typographie

- Titres : Georgia, Times New Roman (serif)
- Corps de texte : Inter, Arial, Helvetica (sans-serif)
- Accroches manuscrites : Caveat (script)

## Écrans implémentés

1. **Accueil / Choix du profil** - Sélection Producteur/Éleveur
2. **Connexion** - Formulaire de connexion (téléphone + mot de passe)
3. **Inscription Producteur** - Formulaire d'inscription (à compléter)
4. **Inscription Éleveur** - Formulaire d'inscription (à compléter)
5. **Dashboard Producteur** - Vue connectée Producteur (à compléter)
6. **Marketplace** - Recherche de producteurs (à compléter)
7. **Fiche catalogue producteur** - Détail produits d'un producteur (à compléter)
8. **Commande et paiement** - Processus de commande (à compléter)
9. **Confirmation de commande** - Écran de confirmation (à compléter)
10. **Module IoT** - Écran verrouillé (non fonctionnel par défaut)
11. **Dashboard Administrateur** - Vue connectée Admin (à compléter)

## Écarts Backend

Certains éléments de la maquette ne sont pas encore supportés par l'API backend. Voir le fichier `FRONTEND-GAPS.md` pour la liste détaillée des écarts et les actions requises côté backend.

## Stack technique

- Angular 19
- TypeScript
- Tailwind CSS 3.4
- SCSS
- RxJS
- Standalone components (pas de NgModule)

## Auteurs

Développé pour ODC Groupe 3.
