-- Remove unused ENUM types that were created but never used in column definitions
-- The application uses VARCHAR columns for enum values instead of PostgreSQL ENUM types

DROP TYPE IF EXISTS statut_utilisateur_enum;
DROP TYPE IF EXISTS statut_commande_enum;
DROP TYPE IF EXISTS statut_paiement_enum;
