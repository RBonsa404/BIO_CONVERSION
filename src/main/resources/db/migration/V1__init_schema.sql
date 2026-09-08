CREATE TYPE statut_utilisateur_enum AS ENUM (
    'EN_ATTENTE_VALIDATION',
    'ACTIF',
    'SUSPENDU'
);

CREATE TYPE statut_commande_enum AS ENUM (
    'EN_ATTENTE',
    'CONFIRME',
    'EN_LIVRAISON',
    'LIVRE',
    'ANNULE'
);

CREATE TYPE statut_paiement_enum AS ENUM (
    'EN_ATTENTE',
    'CONFIRME',
    'ECHOUE',
    'REMBOURSE'
);

CREATE TABLE utilisateur (
    id                    BIGSERIAL       PRIMARY KEY,
    nom                   VARCHAR(100)    NOT NULL,
    prenom                VARCHAR(100)    NOT NULL,
    telephone             VARCHAR(20)     NOT NULL UNIQUE,
    mot_de_passe          VARCHAR(255)    NOT NULL,
    statut                VARCHAR(30)     NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
    chemin_piece_identite VARCHAR(500),
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dtype                 VARCHAR(32)     NOT NULL
);

CREATE INDEX idx_utilisateur_telephone ON utilisateur(telephone);
CREATE INDEX idx_utilisateur_statut    ON utilisateur(statut);

CREATE TABLE localisation (
    id          BIGSERIAL       PRIMARY KEY,
    latitude    DOUBLE PRECISION NOT NULL
                    CONSTRAINT chk_lat CHECK (latitude  BETWEEN -90.0  AND 90.0),
    longitude   DOUBLE PRECISION NOT NULL
                    CONSTRAINT chk_lon CHECK (longitude BETWEEN -180.0 AND 180.0),
    province    VARCHAR(100),
    ville       VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_localisation_geo ON localisation(latitude, longitude);

CREATE TABLE producteur (
    id                  BIGINT          PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom_exploitation    VARCHAR(200)    NOT NULL,
    capacite_production DOUBLE PRECISION NOT NULL
                            CONSTRAINT chk_cap_prod CHECK (capacite_production >= 0),
    compte_valide       BOOLEAN         NOT NULL DEFAULT FALSE,
    localisation_id     BIGINT          NOT NULL REFERENCES localisation(id)
);

CREATE TABLE eleveur (
    id              BIGINT          PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    type_elevage    VARCHAR(150)    NOT NULL,
    adresse         VARCHAR(500),
    localisation_id BIGINT          REFERENCES localisation(id)
);

CREATE TABLE administrateur (
    id          BIGINT          PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    matricule   VARCHAR(50)     NOT NULL UNIQUE,
    super_admin BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE TABLE capteur (
    id                  BIGSERIAL       PRIMARY KEY,
    producteur_id       BIGINT          NOT NULL REFERENCES producteur(id) ON DELETE CASCADE,
    code_identifiant    VARCHAR(100)    NOT NULL UNIQUE,
    type_capteur        VARCHAR(100)    NOT NULL,
    est_actif           BOOLEAN         NOT NULL DEFAULT TRUE,
    temperature         DOUBLE PRECISION
                        CONSTRAINT chk_temperature CHECK (temperature BETWEEN -10 AND 60),
    humidite            DOUBLE PRECISION
                        CONSTRAINT chk_humidite    CHECK (humidite    BETWEEN   0 AND 100),
    date_mesure         TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capteur_producteur ON capteur(producteur_id);

CREATE TABLE alerte_iot (
    id          BIGSERIAL       PRIMARY KEY,
    capteur_id  BIGINT          NOT NULL REFERENCES capteur(id) ON DELETE CASCADE,
    type_alerte VARCHAR(100)    NOT NULL,
    message     TEXT            NOT NULL,
    date_alerte TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    seuil       DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_alerte_capteur ON alerte_iot(capteur_id);

CREATE TABLE produit (
    id              BIGSERIAL       PRIMARY KEY,
    producteur_id   BIGINT          NOT NULL REFERENCES producteur(id) ON DELETE CASCADE,
    nom_produit     VARCHAR(200)    NOT NULL,
    quantite_stock  DOUBLE PRECISION NOT NULL
                        CONSTRAINT chk_stock CHECK (quantite_stock >= 0),
    prix            DOUBLE PRECISION NOT NULL
                        CONSTRAINT chk_prix  CHECK (prix > 0),
    disponibilite   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produit_producteur    ON produit(producteur_id);
CREATE INDEX idx_produit_disponibilite ON produit(disponibilite);

CREATE TABLE commande (
    id               BIGSERIAL       PRIMARY KEY,
    numero_commande  VARCHAR(50)     UNIQUE,
    producteur_id    BIGINT          NOT NULL REFERENCES producteur(id),
    eleveur_id       BIGINT          NOT NULL REFERENCES eleveur(id),
    date_commande    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    statut           VARCHAR(20)     NOT NULL DEFAULT 'EN_ATTENTE',
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commande_producteur ON commande(producteur_id);
CREATE INDEX idx_commande_eleveur    ON commande(eleveur_id);
CREATE INDEX idx_commande_statut     ON commande(statut);

CREATE TABLE ligne_commande (
    id          BIGSERIAL       PRIMARY KEY,
    commande_id BIGINT          NOT NULL REFERENCES commande(id) ON DELETE CASCADE,
    produit_id  BIGINT          NOT NULL REFERENCES produit(id),
    quantite    INT             NOT NULL
                    CONSTRAINT chk_quantite CHECK (quantite > 0),
    prix_unitaire DOUBLE PRECISION NOT NULL
                    CONSTRAINT chk_pu CHECK (prix_unitaire > 0)
);

CREATE INDEX idx_ligne_cmd ON ligne_commande(commande_id);

CREATE TABLE paiement (
    id                    BIGSERIAL       PRIMARY KEY,
    commande_id           BIGINT          NOT NULL UNIQUE REFERENCES commande(id) ON DELETE CASCADE,
    montant               DOUBLE PRECISION NOT NULL
                            CONSTRAINT chk_montant CHECK (montant > 0),
    operateur             VARCHAR(100)    NOT NULL,
    reference_transaction VARCHAR(255),
    date_paiement         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    statut_paiement       VARCHAR(20)     NOT NULL DEFAULT 'EN_ATTENTE',
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE facture (
    id          BIGSERIAL       PRIMARY KEY,
    paiement_id BIGINT          NOT NULL UNIQUE REFERENCES paiement(id) ON DELETE CASCADE,
    date_facture TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    montant     DOUBLE PRECISION NOT NULL
                    CONSTRAINT chk_montant_facture CHECK (montant > 0),
    reference   VARCHAR(255)    NOT NULL UNIQUE,
    chemin_pdf  VARCHAR(500),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
