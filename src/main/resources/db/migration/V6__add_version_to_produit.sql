-- Add version column for optimistic locking on produit table
ALTER TABLE produit ADD COLUMN version BIGINT;
