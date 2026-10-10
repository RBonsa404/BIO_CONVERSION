-- CDC §2.2.4 : pièce d'identité (CNIB) déposée par le producteur à l'inscription,
-- vérifiée par un administrateur avant la validation du compte.
-- Le fichier est stocké en base : le disque des conteneurs (Railway) est effacé à chaque déploiement.
CREATE TABLE piece_identite (
    id              BIGSERIAL       PRIMARY KEY,
    utilisateur_id  BIGINT          NOT NULL UNIQUE REFERENCES utilisateur(id) ON DELETE CASCADE,
    type_contenu    VARCHAR(100)    NOT NULL,
    nom_fichier     VARCHAR(255),
    contenu         BYTEA           NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);