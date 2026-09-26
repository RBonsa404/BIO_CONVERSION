-- Remove compte_valide column from producteur table
-- We now use Utilisateur.statut as the single source of truth for validation status
ALTER TABLE producteur DROP COLUMN IF EXISTS compte_valide;
