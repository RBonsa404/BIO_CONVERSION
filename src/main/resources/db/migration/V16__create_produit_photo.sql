-- Photo d'un produit (une seule par produit, stockée en base : le disque Railway est éphémère).
CREATE TABLE produit_photo (
    produit_id   BIGINT        PRIMARY KEY REFERENCES produit(id) ON DELETE CASCADE,
    type_contenu VARCHAR(100)  NOT NULL,
    contenu      BYTEA         NOT NULL
);
