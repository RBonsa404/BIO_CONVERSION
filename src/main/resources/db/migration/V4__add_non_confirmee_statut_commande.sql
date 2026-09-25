-- Migration V4: Ajout du statut NON_CONFIRMEE à statut_commande_enum (B-MUST-8)
-- PostgreSQL impose que l'ajout d'une valeur à un enum s'exécute hors transaction
-- flyway:executeInTransaction=false

ALTER TYPE statut_commande_enum ADD VALUE IF NOT EXISTS 'NON_CONFIRMEE';
