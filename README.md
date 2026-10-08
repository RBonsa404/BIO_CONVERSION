# BioConversion

Plateforme de mise en relation entre producteurs de larves de mouches soldats noires (BSF) et
éleveurs piscicoles et avicoles du Burkina Faso : marketplace géolocalisée, cycle de commande,
paiement Orange Money, facturation, supervision IoT des installations et administration.

* **Backend** : Java 17, Spring Boot 3.3, Spring Security (JWT), JPA, Flyway, PostgreSQL.
* **Frontend** : Angular 22, Tailwind CSS — dossier [`frontend/`](frontend/README.md).
* **Livraison** : une seule application. Le backend sert le frontend compilé : une URL, un service.

## Démarrer

Trois façons de lancer la plateforme. Dans les trois cas elle répond sur <http://localhost:8080>.

### 1. Sans rien installer d'autre que Java et Node (recommandé pour une démonstration)

Prérequis : Java 17+ et Node.js 22+. Aucune base de données à installer.

```bash
demarrer.bat
```

```bash
./demarrer.sh
```

Le script compile le frontend puis lance l'application en profil `local` : base H2 stockée dans
`./data`, comptes de démonstration créés automatiquement.

### 2. Avec Docker (identique à la production)

```bash
docker compose up --build
```

PostgreSQL et l'application démarrent ensemble, comptes de démonstration inclus. Si le port 5432
est déjà pris : `POSTGRES_PORT=5433 docker compose up --build`.

### 3. En développement (rechargement à chaud)

Prérequis : PostgreSQL 15+ sur `localhost:5432` (ou `docker compose up -d postgres`).

```bash
psql -h localhost -U postgres -c "CREATE USER bioconversion_user WITH PASSWORD 'bioconversion_pass';"
```

```bash
createdb -h localhost -U postgres -O bioconversion_user bioconversion_db
```

Les deux commandes ci-dessus ne servent qu'une fois. Ensuite, dans deux terminaux :

```bash
./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm start
```

Le frontend de développement tourne sur <http://localhost:4200> et relaie `/api` vers le backend
(`frontend/proxy.conf.json`). Les migrations Flyway s'appliquent au démarrage.

## Comptes de démonstration

Créés au démarrage quand `app.demo.enabled` vaut `true` (profils `local` et `dev`, ou variable
`DEMO_DATA=true`). Mot de passe commun : `TestPass123!`.

| Profil | Téléphone | État |
|---|---|---|
| Producteur — Ferme BioConversion (2 produits, 2 capteurs) | `+226 70 00 00 01` | actif |
| Producteur en attente | `+226 70 00 00 02` | à valider par l'admin |
| Éleveur pisciculteur | `+226 70 00 00 03` | actif |
| Éleveur aviculteur | `+226 70 00 00 04` | actif |
| Administrateur | `+226 70 00 00 05` | actif |
| Producteur — Ferme BSF de Koubri (à 25 km) | `+226 70 00 00 06` | actif |
| Éleveuse en attente | `+226 70 00 00 07` | à valider par l'admin |

Ce mot de passe est public : n'activez `DEMO_DATA` sur une instance en ligne que le temps d'une
démonstration.

### Parcours de démonstration

1. **Éleveur** (`…03`) : Marketplace → fiche d'un producteur → *Commander* → *Envoyer la commande*.
2. **Producteur** (`…01` ou `…06` selon la ferme choisie) : *Commandes* → *Valider*.
3. **Éleveur** : *Mes commandes* → *Payer avec Orange Money* → *Simuler la confirmation du paiement*
   → *Télécharger la facture*.
4. **Producteur** : *Marquer comme expédiée* ; **Éleveur** : *Confirmer la réception*.
5. **Administrateur** (`…05`) : valider les comptes en attente, suspendre un compte, suivre les
   indicateurs (volume payé, commission).

## Déploiement sur Railway

Le dépôt est prêt : `Dockerfile` (frontend + backend dans une image) et `railway.json`
(build Docker, contrôle de santé sur `/api/v1/health`).

1. Sur [railway.com](https://railway.com) : **New Project → Deploy from GitHub repo** et choisir ce dépôt.
2. Dans le projet : **New → Database → Add PostgreSQL**.
3. Dans le service de l'application, onglet **Variables**, ajouter :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `JWT_SECRET` | une phrase secrète d'au moins 32 caractères |
   | `ADMIN_TELEPHONE` | le numéro du premier administrateur, ex. `+22670123456` |
   | `ADMIN_MOT_DE_PASSE` | son mot de passe (8 caractères minimum) |
   | `DEMO_DATA` | `true` pour disposer des comptes de démonstration (facultatif) |

4. Onglet **Settings → Networking → Generate Domain** : le site est en ligne à cette adresse.

Railway fournit le port (`PORT`) ; l'application l'utilise automatiquement. Les migrations de base
s'exécutent au premier démarrage. La liste complète des variables est dans
[`.env.example`](.env.example) ; aucune n'est obligatoire pour démarrer (sans `JWT_SECRET`, un
secret aléatoire est généré et les sessions sont perdues à chaque redéploiement).

## Paiement Orange Money

L'intégration avec un agrégateur Orange Money n'est pas encore branchée. Tant que
`PAIEMENT_SIMULATION=true` (valeur par défaut), l'éleveur confirme lui-même le paiement depuis
« Mes commandes » : l'interface l'indique clairement et aucun débit réel n'a lieu. Le traitement
est celui du webhook réel (`POST /api/v1/paiements/webhook`, signé HMAC-SHA256) : il suffira de
brancher l'agrégateur sur ce webhook et de passer `PAIEMENT_SIMULATION=false`.

Les factures PDF portent les mentions `ENTREPRISE_*` (IFU, RCCM, coordonnées bancaires) : elles
affichent « À renseigner » tant que ces variables ne sont pas fournies.

## Capteurs IoT

Les capteurs envoient leurs mesures avec une clé d'API (`IOT_API_KEY`) :

```bash
curl -X POST "http://localhost:8080/api/v1/iot/telemetrie?codeCapteur=SERRE-01&temperature=31.5&humidite=64" -H "X-API-Key: dev-iot-api-key-change-in-production"
```

Le producteur déclare ses capteurs et leurs seuils depuis *Capteurs IoT* ; une mesure au-dessus
d'un seuil lève une alerte visible sur son tableau de bord.

## Structure

```
src/main/java/com/bioconversion/
├── config/         Sécurité, CORS, données de démonstration, service du frontend
├── security/       JWT, clé d'API IoT
├── utilisateur/    Comptes, authentification, profil, réseau des producteurs
├── admin/          Validation des inscriptions, suspension, indicateurs
├── marketplace/    Catalogue, recherche géolocalisée, cycle de commande
├── paiement/       Paiement, webhook opérateur, factures PDF
├── iot/            Capteurs, télémétrie, alertes
└── geo/            Localisation et calcul de distance
src/main/resources/db/migration/   Migrations Flyway
frontend/                          Application Angular
```

Référence des endpoints : [`API.md`](API.md). En développement, Swagger est disponible sur
`/swagger-ui.html` (désactivé en production sauf `SWAGGER_ENABLED=true`).

## Tests

```bash
./mvnw test
```

```bash
cd frontend && npm test
```

## Profils Spring

| Profil | Base | Schéma | Usage |
|---|---|---|---|
| `local` | H2 fichier (`./data`) | créé par Hibernate | démonstration sans installation |
| `dev` (défaut) | PostgreSQL local | Flyway | développement |
| `prod` | PostgreSQL (`DATABASE_URL`) | Flyway | Railway, Docker |
| `test` | H2 mémoire | créé par Hibernate | tests automatisés |
