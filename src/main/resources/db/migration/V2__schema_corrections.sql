-- Migration V2: Corrections de schéma SQL (décisions #1, #2, #3)

-- Décision #1 : Renommer la colonne prix_unitaire en prix_unitaire_fige dans ligne_commande
ALTER TABLE ligne_commande RENAME COLUMN prix_unitaire TO prix_unitaire_fige;

-- Décision #2 : Modifier la colonne quantite de INT vers NUMERIC(10,3) pour la vente au poids (kg)
ALTER TABLE ligne_commande ALTER COLUMN quantite TYPE NUMERIC(10,3);

-- Décision #3 : Étendre la taille des colonnes ville et province dans localisation de VARCHAR(100) à VARCHAR(150)
ALTER TABLE localisation ALTER COLUMN ville TYPE VARCHAR(150);
ALTER TABLE localisation ALTER COLUMN province TYPE VARCHAR(150);
