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
* PostgreSQL (en production) ou H2 (en développement local)

### Lancement en mode dev (H2)

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

L'application démarre sur `http://localhost:8080`.
La console H2 est disponible sur `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:bioconversion_dev`).

### Lancement en mode prod (PostgreSQL)

Assurez-vous qu'une instance PostgreSQL tourne avec la base `bioconversion_db`, puis lancez :

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Les migrations Flyway s'exécutent automatiquement au démarrage.

## Endpoints principaux

* Authentification : `POST /api/v1/auth/login` et `POST /api/v1/auth/register`
* IoT : `POST /api/v1/iot/telemetrie`
* Marketplace : `GET /api/v1/marketplace/produits`
* Producteurs : `GET /api/v1/producteurs`
