-- Add UNIQUE NOT NULL constraint on paiement.reference_transaction
ALTER TABLE paiement ALTER COLUMN reference_transaction SET NOT NULL;
ALTER TABLE paiement ADD CONSTRAINT uk_paiement_reference_transaction UNIQUE (reference_transaction);
