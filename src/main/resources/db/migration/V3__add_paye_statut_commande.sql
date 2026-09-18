-- Migration V3: Ajout du statut PAYE à statut_commande_enum (décision #8)
-- PostgreSQL impose que l'ajout d'une valeur à un enum s'exécute hors transaction
-- flyway:executeInTransaction=false

ALTER TYPE statut_commande_enum ADD VALUE IF NOT EXISTS 'PAYE';
