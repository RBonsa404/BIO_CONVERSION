-- Order quantities are fractional weights (kg) and are mapped as double in the entity.
ALTER TABLE ligne_commande
    ALTER COLUMN quantite TYPE DOUBLE PRECISION
    USING quantite::DOUBLE PRECISION;
