# Corrections de l'audit technique #2

Branche de travail initiale : `fix/audit-2`, basée sur `origin/main`. Les corrections techniques N1 à N18 ci-dessous y ont été commitées séparément selon leur point d'audit, sauf les points explicitement résolus avec un autre correctif ou non réécrits pour préserver l'historique partagé. La passe de fidélité design est réalisée sur `fix/design-fidelity`.

| Point | Commit(s) | Fichiers modifiés / état |
|---|---|---|
| N1 | `fcb61d8` | `frontend/src/app/app.config.ts`; `frontend/src/app/core/services/http-token.interceptor.spec.ts` |
| N2 | `0454429` | `frontend/src/app/app.spec.ts`; `frontend/src/app/core/models/auth.model.ts`; `frontend/src/app/core/services/admin.service.ts`; `frontend/src/app/core/services/auth.service.ts`; `frontend/src/app/core/services/marketplace.service.ts`; `frontend/src/app/core/services/paiement.service.ts`; `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`; `frontend/src/app/features/commande/commande.component.ts`; `frontend/src/app/features/commande/confirmation/confirmation.component.ts`; `frontend/src/app/features/marketplace/marketplace.component.ts`; `frontend/src/app/features/marketplace/producteur-detail/producteur-detail.component.ts`; `frontend/src/app/features/producteur-dashboard/producteur-dashboard.component.ts`; `src/main/java/com/bioconversion/marketplace/MarketplaceController.java`; `src/main/java/com/bioconversion/marketplace/MarketplaceService.java`; `src/main/java/com/bioconversion/marketplace/MarketplaceServiceImpl.java`; `src/main/java/com/bioconversion/paiement/PaiementController.java`; `src/main/java/com/bioconversion/paiement/PaiementRepository.java`; `src/main/java/com/bioconversion/paiement/PaiementService.java`; `src/main/java/com/bioconversion/paiement/PaiementServiceImpl.java`; `src/main/java/com/bioconversion/security/JwtAuthenticationFilter.java`; `src/main/java/com/bioconversion/security/JwtTokenProvider.java`; `src/main/java/com/bioconversion/utilisateur/ReseauProducteurController.java`; `src/main/java/com/bioconversion/utilisateur/ReseauProducteurService.java`; `src/main/java/com/bioconversion/utilisateur/ReseauProducteurServiceImpl.java`; `src/main/java/com/bioconversion/utilisateur/StatutUtilisateur.java`; `src/main/java/com/bioconversion/utilisateur/dto/ProducteurResponse.java`; `src/main/java/com/bioconversion/utilisateur/dto/UtilisateurResponse.java`; `src/test/java/com/bioconversion/marketplace/MarketplaceServiceCommandeTest.java`; `src/test/java/com/bioconversion/utilisateur/ReseauProducteurServiceTest.java`. L'écran IoT reste volontairement statique. |
| N3 | `84e1599` | `src/main/java/com/bioconversion/config/SecurityConfig.java`; `src/main/resources/application-dev.yml`; `src/test/java/com/bioconversion/config/CorsIntegrationTest.java`; `src/test/resources/application-test.yml` |
| N4 | `856c7df` | `src/main/java/com/bioconversion/security/IotApiKeyFilter.java`; `src/test/java/com/bioconversion/security/IotApiKeyFilterIntegrationTest.java` |
| N5 | `c3b3437` | `src/main/resources/application-dev.yml`; `src/main/resources/db/migration/V8__add_seuils_to_capteur.sql`; `src/main/resources/db/migration/V10__migrate_monetary_to_numeric.sql`; `src/main/resources/db/migration/V11__align_order_quantity_with_entity.sql`; `src/main/resources/db/migration/V12__add_product_type.sql` |
| N6 | `0a1249e` | `frontend/src/app/core/services/admin.service.ts`; `frontend/src/app/core/services/auth.service.ts`; `frontend/src/app/core/services/marketplace.service.ts`; `frontend/src/app/core/services/paiement.service.ts`; `frontend/src/environments/environment.prod.ts`; `frontend/src/environments/environment.ts` |
| N7 | `ce1eafd` | `src/test/java/com/bioconversion/BioConversionApplicationTests.java` |
| N8 | `08143b2` | `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`; `frontend/src/app/features/producteur-dashboard/producteur-dashboard.component.ts`; `frontend/src/app/layouts/sidebar-layout/sidebar-layout.component.ts` |
| N9 | `6cf5eef` | `src/test/java/com/bioconversion/marketplace/MarketplaceCommandeControllerTest.java` |
| N10 | `3c5ebe4` | `frontend/src/app/core/models/auth.model.ts`; `frontend/src/app/core/models/eleveur-register-request.model.ts`; `frontend/src/app/core/models/producteur-register-request.model.ts`; `frontend/src/app/core/services/auth.service.ts`; `frontend/src/app/features/auth/inscription-eleveur/inscription-eleveur.component.ts`; `frontend/src/app/features/auth/inscription-producteur/inscription-producteur.component.ts` |
| N11 | `c53f503` | `frontend/README.md` |
| N12 | Aucun commit de correction | Le commit `b8ff751` sur `main` et son attribution existante sont signalés; l'historique partagé n'a pas été réécrit. Cette décision revient à Rachid. Aucun commit de cette branche ne contient d'attribution IA. |
| N13 | `13b4a0f` | `CORRECTIONS.md` |
| N14 | `8413db2` | `src/main/java/com/bioconversion/common/exception/ForbiddenException.java`; `src/main/java/com/bioconversion/common/exception/GlobalExceptionHandler.java`; `src/main/java/com/bioconversion/common/exception/UnauthorizedException.java` (suppression); `src/main/java/com/bioconversion/marketplace/MarketplaceController.java`; `src/main/java/com/bioconversion/marketplace/MarketplaceServiceImpl.java`; `src/main/java/com/bioconversion/paiement/FactureServiceImpl.java`; `src/main/java/com/bioconversion/paiement/PaiementServiceImpl.java` |
| N15 | `40b6243` | `src/main/resources/db/migration/V10__migrate_monetary_to_numeric.sql` |
| N16 | `4ad56b1` | `Dockerfile`; `.dockerignore`; `docker-compose.yml` |
| N17 | `08143b2` (N8) | Résolu par le layout partagé et ses liens `routerLink`: `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`; `frontend/src/app/features/producteur-dashboard/producteur-dashboard.component.ts`; `frontend/src/app/layouts/sidebar-layout/sidebar-layout.component.ts` |
| N18 | `c3b3437` (N5), `4ad56b1` (N16) | Vérification d'exécution, sans fichier de code supplémentaire : PostgreSQL 15.19 sain, application `dev` démarrée par Compose, 12 migrations Flyway validées, route marketplace atteinte (403 sans authentification) et preflight OPTIONS CORS réussi (200 avec `Access-Control-Allow-Origin: http://localhost:4200`). |

## Vérifications et limites

- `mvn test` : succès (78 tests).
- `docker-compose config`, `docker-compose build app` et `docker-compose up -d` : succès. Le premier build a rencontré une coupure de téléchargement Maven; le retry a compilé et construit l'image.
- PostgreSQL local avait déjà appliqué V10 avant la correction du SQL/commentaire. L'application a d'abord refusé de démarrer à cause du checksum V10 divergent. Après vérification que les colonnes et types PostgreSQL correspondaient déjà aux migrations corrigées, `flyway:repair` a réaligné uniquement le checksum de métadonnées; aucune donnée ni structure métier n'a été modifiée par cette réparation. Flyway a ensuite validé les 12 migrations et le backend est resté démarré.
- `ng build` : succès.
- `npm test -- --watch=false` : les 2 tests passent depuis `X:\frontend`, un alias temporaire sans espaces vers le même worktree. Depuis son chemin actuel contenant espaces/parenthèses, Angular/Vitest compile les specs mais signale à tort « No test files found ». Le script et les specs n'ont pas été contournés ni modifiés pour masquer ce problème de découverte lié au chemin.

## Fidélité design

Les dix captures intégrées à `BioConversion_Ecrans_HTML_ordre_corrige-1.html` ont été comparées aux routes correspondantes avant les changements. Les retouches ont gardé les appels API et leurs états de chargement/erreur plutôt que de réintroduire des données de démonstration dans les écrans connectés.

| Écran | Écarts corrigés |
|---|---|
| 01 — Accueil | Remplacement de la landing page à sections par la vue compacte en deux colonnes, choix de profils, bouton de connexion, inscription producteur, engagements et accès admin. Le bouton « Se connecter » conduit maintenant à `/connexion`. |
| 02 — Dashboard producteur | Sidebar et marque partagées, en-tête d’accueil, alerte de nouvelles commandes, cartes de capacité/paiements/commandes et panneau de validation. Les valeurs et actions restent reliées aux services backend. |
| 03 — Inscription producteur | Formulaire élargi, hiérarchie et sections simplifiées pour reprendre la composition de la maquette; les champs soumis restent ceux acceptés par le DTO backend. |
| 04 — Inscription éleveur | Formulaire élargi et choix visuel Pisciculteur/Aviculteur présenté en cartes radio, relié au champ `typeElevage` existant. |
| 05 — Marketplace | Barre de marque et de recherche, tri, réglage du rayon, présentation carte/liste. Les produits, coordonnées, distances et marqueurs viennent de `MarketplaceService`; les erreurs carte et catalogue sont indépendantes. |
| 06 — Fiche producteur | Bannière exploitation, état de validation, catalogue plus visuel, stocks et actions de commande conservés. |
| 07 — Commande | En-tête de marque, récapitulatif produit, quantité, stock, mode de paiement exposé par l'API et panneau de confirmation; création de commande/paiement et erreurs existantes conservées. |
| 08 — Confirmation | Présentation dédiée de la référence, du producteur, des lignes, du montant et des statuts effectifs de commande et de paiement. |
| 09 — IoT | Vue statique de pause avec arrière-plan capteurs atténué et panneau verrouillé. Aucun appel IoT n'a été ajouté. |
| 10 — Administration | En-tête et tableau de validation; compteur, demandes et actions restent alimentés par l'API d'administration, sans inventer de statistiques/litiges. |

L'emblème sans texte utilisé dans la maquette remplace le badge « Ferme Dunord » dans les ressources frontend. Le jeu de favicons multi-résolution et l'icône Apple utilisent le même emblème; le visuel larves/panier est extrait de la capture de référence de l'accueil. `index.html` référence explicitement ces favicons.

Un initialiseur Spring `@Profile("dev")` ajoute idempotemment cinq comptes et deux produits à la ferme de démonstration; les identifiants sont documentés dans les deux README. Un test unitaire vérifie le nombre de comptes/produits au second démarrage et l'encodage des mots de passe. Le build Angular désactive uniquement l'inlining de Google Fonts afin que le build de production ne dépende pas d'un accès réseau à `fonts.googleapis.com`; les polices et leurs replis à l'exécution restent inchangés.

### Limites vérifiées

- Le contrat backend actuel ne fournit pas de flux d'upload CNIB ni de confirmation de formation pour l'inscription producteur. Ces commandes n'ont pas été simulées côté frontend; les ajouter fidèlement demande un endpoint de stockage et une règle métier backend.
- L'API d'administration ne fournit pas les statistiques, litiges, date d'inscription ou état CNIB visibles dans la maquette. La page n'affiche donc pas de valeurs fictives pour ces colonnes.
- PostgreSQL n'écoute pas sur `localhost:5432` dans l'environnement de vérification. `mvn test` et le test unitaire du seeder passent, mais le démarrage `dev` contre PostgreSQL, la connexion avec les comptes seedés et le parcours API paiement n'ont pas pu être exécutés ici.
- `npm run build` et les deux tests Angular passent. `npm test` doit être lancé via un chemin court sur cette machine (alias `X:`), sinon Vitest ne découvre pas les specs à cause du chemin du workspace contenant espaces/parenthèses.
- Le parcours manuel complet inscription → validation admin → commande → paiement n'a pas été exécuté; la vérification HTTP réelle couvre ici le démarrage PostgreSQL et CORS, pas un parcours authentifié avec comptes de démonstration.
