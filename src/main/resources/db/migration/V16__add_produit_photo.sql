-- Photo du produit (catalogue marketplace).
-- Le fichier est stocké en base, comme la CNIB (V15) : le disque des conteneurs
-- (Railway) est effacé à chaque déploiement.
-- Table séparée de produit : les listes de produits ne chargent jamais les octets de l'image.
CREATE TABLE produit_photo (
    produit_id   BIGINT       PRIMARY KEY REFERENCES produit(id) ON DELETE CASCADE,
    type_contenu VARCHAR(100) NOT NULL,
    contenu      BYTEA        NOT NULL
);

-- Date de dernière mise à jour de la photo : NULL = pas de photo.
-- Sert à construire l'adresse de l'image (?v=...) pour que le navigateur recharge
-- la nouvelle photo après un remplacement.
ALTER TABLE produit ADD COLUMN photo_maj TIMESTAMP WITH TIME ZONE;
