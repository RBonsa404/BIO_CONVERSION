# BioConversion Backend

Backend Java / Spring Boot pour la plateforme BioConversion (supervision IoT, marketplace d'engrais bio, paiement Mobile Money et cartographie des producteurs).

## Structure du projet

* `config/` : Configuration Spring Security (JWT), CORS et propriétés de l'application.
* `utilisateur/` : Gestion des utilisateurs (Producteur, Éleveur, Administrateur) et authentification.
* `iot/` : Ingestion des données capteurs (température, humidite) et gestion des alertes.
* `marketplace/` : Gestion du catalogue produits, stocks et commandes.
* `paiement/` : Intégration du paiement Orange Money et génération de factures.
* `geo/` : Référentiel de géolocalisation des producteurs.

## Configuration & Lancement

### Prérequis

* Java 17+
* Maven 3.8+
* PostgreSQL 15+ (dev et production)

### Lancement en mode dev

Le profil `dev` utilise PostgreSQL sur `localhost:5432`, la base `bioconversion_db`, l'utilisateur `bioconversion_user` et Flyway. Une instance PostgreSQL doit donc être installée et démarrée localement avant le lancement; Docker n'est pas requis. Les valeurs par défaut de développement ci-dessous sont à adapter si votre installation PostgreSQL utilise d'autres identifiants.

```bash
psql -h localhost -p 5432 -U postgres -c "CREATE USER bioconversion_user WITH PASSWORD 'bioconversion_pass';"
createdb -h localhost -p 5432 -U postgres -O bioconversion_user bioconversion_db
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Les deux premières commandes ne sont à exécuter qu'une fois, et seulement si le rôle et la base n'existent pas déjà. Les migrations Flyway sont appliquées automatiquement au démarrage. L'application démarre sur `http://localhost:8080`.

### Comptes de test en local

Au démarrage avec le profil `dev`, un jeu de comptes de test et un petit catalogue de larves sont ajoutés s'ils n'existent pas déjà. Les mots de passe sont hachés avant stockage.

| Profil | Téléphone | Mot de passe | Statut initial |
|---|---|---|---|
| Producteur validé | `+226 70 00 00 01` | `TestPass123!` | ACTIF |
| Producteur en attente | `+226 70 00 00 02` | `TestPass123!` | EN_ATTENTE_VALIDATION |
| Éleveur pisciculteur | `+226 70 00 00 03` | `TestPass123!` | ACTIF |
| Éleveur aviculteur | `+226 70 00 00 04` | `TestPass123!` | ACTIF |
| Administrateur | `+226 70 00 00 05` | `TestPass123!` | ACTIF |

Ces comptes sont réservés au développement local. L'initialiseur est limité au profil Spring `dev`; ne l'activez jamais en production. Les actions réalisées sur ces comptes (par exemple valider le producteur en attente) sont conservées en base.

### Lancement en mode prod

Configurez les paramètres PostgreSQL de production dans votre environnement, puis lancez :

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Les migrations Flyway s'exécutent automatiquement. Les comptes de démonstration ne sont pas créés avec ce profil.

## Endpoints principaux

* Authentification : `POST /api/v1/auth/login` et `POST /api/v1/auth/register`
* IoT : `POST /api/v1/iot/telemetrie`
* Marketplace : `GET /api/v1/marketplace/produits`
* Producteurs : `GET /api/v1/producteurs`
