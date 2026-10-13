-- =====================================================================
-- Module commission / séquestre
-- Règle unique : 5 % de commission payés par le producteur, jamais ajoutés
-- au prix de l'éleveur. Montants en francs CFA entiers (NUMERIC(19,0)).
-- =====================================================================

-- 1. Paramètres de la plateforme (lus en base, jamais écrits en dur dans le code)
CREATE TABLE parametre (
    cle          VARCHAR(50)     PRIMARY KEY,
    valeur       NUMERIC(19,4)   NOT NULL,
    description  VARCHAR(255),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO parametre (cle, valeur, description) VALUES
    ('COMMISSION_TAUX',          0.05,  'Taux de commission payé par le producteur'),
    ('COMMISSION_SEUIL_ESPECES', 10000, 'Montant (F CFA) à partir duquel une vente en espèces est soumise à commission'),
    ('FRAIS_VERSEMENT_TAUX',     0.01,  'Frais Orange Money de versement au producteur, supportés par la plateforme (taux provisoire)');

-- 2. Commission figée sur la commande à sa création
--    (un changement de paramètre ne touche jamais les commandes existantes).
--    Les commandes passées avant ce module restent à NULL.
ALTER TABLE commande ADD COLUMN taux_commission        NUMERIC(5,4);
ALTER TABLE commande ADD COLUMN montant_commission     NUMERIC(19,0);
ALTER TABLE commande ADD COLUMN montant_net_producteur NUMERIC(19,0);
-- Suivi de l'argent, séparé du statut de la commande :
-- EN_SEQUESTRE, VERSE, VERSEMENT_ECHOUE, REMBOURSE (Orange Money)
-- ENCAISSE_ESPECES (espèces)
ALTER TABLE commande ADD COLUMN statut_reglement       VARCHAR(30);

-- 3. Registre du séquestre : argent des éleveurs bloqué jusqu'à la livraison.
--    montant > 0 : entrée ; montant < 0 : sortie.
CREATE TABLE registre_sequestre (
    id                     BIGSERIAL       PRIMARY KEY,
    commande_id            BIGINT          NOT NULL REFERENCES commande(id),
    type_mouvement         VARCHAR(30)     NOT NULL,   -- ENTREE, SORTIE_VERSEMENT, SORTIE_REMBOURSEMENT, CORRECTION
    montant                NUMERIC(19,0)   NOT NULL,
    libelle                VARCHAR(255),
    reference_transaction  VARCHAR(255),
    auteur_id              BIGINT          REFERENCES utilisateur(id),
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_registre_sequestre_commande ON registre_sequestre(commande_id);
-- Un webhook reçu deux fois ne peut pas créditer ni verser deux fois
CREATE UNIQUE INDEX uq_registre_sequestre_mouvement
    ON registre_sequestre(commande_id, type_mouvement)
    WHERE type_mouvement <> 'CORRECTION';

-- 4. Registre du fonds : argent de la plateforme (commissions, frais, corrections).
CREATE TABLE registre_fonds (
    id              BIGSERIAL       PRIMARY KEY,
    commande_id     BIGINT          REFERENCES commande(id),
    type_mouvement  VARCHAR(30)     NOT NULL,   -- COMMISSION, FRAIS_VERSEMENT, COMMISSION_ESPECES, CORRECTION
    montant         NUMERIC(19,0)   NOT NULL,
    libelle         VARCHAR(255),
    auteur_id       BIGINT          REFERENCES utilisateur(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_registre_fonds_commande ON registre_fonds(commande_id);
CREATE UNIQUE INDEX uq_registre_fonds_mouvement
    ON registre_fonds(commande_id, type_mouvement)
    WHERE commande_id IS NOT NULL AND type_mouvement <> 'CORRECTION';

-- 5. Commissions des ventes en espèces, récupérées par un collecteur hors de l'appli
CREATE TABLE commission_a_collecter (
    id                 BIGSERIAL       PRIMARY KEY,
    commande_id        BIGINT          NOT NULL UNIQUE REFERENCES commande(id),
    producteur_id      BIGINT          NOT NULL REFERENCES producteur(id),
    montant            NUMERIC(19,0)   NOT NULL CHECK (montant > 0),
    statut             VARCHAR(20)     NOT NULL DEFAULT 'A_COLLECTER',   -- A_COLLECTER, ENCAISSEE
    collecteur         VARCHAR(150),
    date_encaissement  TIMESTAMP WITH TIME ZONE,
    encaissee_par      BIGINT          REFERENCES utilisateur(id),
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_commission_collecter_producteur ON commission_a_collecter(producteur_id, statut);

-- 6. Historique de chaque changement de statut : date, auteur, montant
CREATE TABLE historique_statut_commande (
    id              BIGSERIAL       PRIMARY KEY,
    commande_id     BIGINT          NOT NULL REFERENCES commande(id),
    type_statut     VARCHAR(20)     NOT NULL,   -- COMMANDE ou REGLEMENT
    ancien_statut   VARCHAR(30),
    nouveau_statut  VARCHAR(30)     NOT NULL,
    montant         NUMERIC(19,0),
    auteur_id       BIGINT          REFERENCES utilisateur(id),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_historique_statut_commande ON historique_statut_commande(commande_id);

-- 7. Registres en ajout seul : aucune ligne n'est modifiée ni supprimée.
--    Une erreur se corrige par une ligne inverse (type CORRECTION).
CREATE OR REPLACE FUNCTION refuser_modification_registre() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Le registre % est en ajout seul : corrigez par une ligne inverse', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER registre_sequestre_ajout_seul
    BEFORE UPDATE OR DELETE ON registre_sequestre
    FOR EACH ROW EXECUTE FUNCTION refuser_modification_registre();

CREATE TRIGGER registre_fonds_ajout_seul
    BEFORE UPDATE OR DELETE ON registre_fonds
    FOR EACH ROW EXECUTE FUNCTION refuser_modification_registre();

CREATE TRIGGER historique_statut_ajout_seul
    BEFORE UPDATE OR DELETE ON historique_statut_commande
    FOR EACH ROW EXECUTE FUNCTION refuser_modification_registre();