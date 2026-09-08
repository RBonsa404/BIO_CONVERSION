# Migrations de base de données

Les migrations de schéma SQL sont gérées avec Flyway dans le dossier `src/main/resources/db/migration/`.

## Format des fichiers

`V{VERSION}__{description}.sql` (ex: `V1__init_schema.sql`).

## Exécution

En mode `prod`, Flyway applique automatiquement les nouvelles migrations au démarrage.
Vous pouvez aussi utiliser les commandes Maven Flyway :

```bash
mvn flyway:info
mvn flyway:migrate
```
