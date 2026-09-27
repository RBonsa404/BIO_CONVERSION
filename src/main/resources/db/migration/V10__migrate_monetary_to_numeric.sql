-- Migrate monetary columns from DOUBLE PRECISION to NUMERIC(19,4) for better precision
-- Preserves larva quantity (quantite_stock) as DOUBLE PRECISION per business decision

-- Change paiement.montant to NUMERIC
ALTER TABLE paiement ALTER COLUMN montant TYPE NUMERIC(19,4);

-- Change produit.prix to NUMERIC
ALTER TABLE produit ALTER COLUMN prix TYPE NUMERIC(19,4);

-- Change ligne_commande.prix_unitaire_fige to NUMERIC
ALTER TABLE ligne_commande ALTER COLUMN prix_unitaire_fige TYPE NUMERIC(19,4);

-- Change facture.montant to NUMERIC
ALTER TABLE facture ALTER COLUMN montant TYPE NUMERIC(19,4);

-- Note: quantite_stock remains DOUBLE PRECISION as per business decision (larvae sold by weight in kg)
-- Note: ligne_commande.quantite remains INT (quantity is a count, not a weight)
