IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'pfadb')
    CREATE DATABASE pfadb;
GO

USE pfadb;
GO

-- Utilisateurs
CREATE TABLE utilisateurs (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom          NVARCHAR(100)  NOT NULL,
    prenom       NVARCHAR(100)  NOT NULL,
    email        NVARCHAR(255)  NOT NULL UNIQUE,
    mot_de_passe NVARCHAR(255)  NOT NULL,
    role         VARCHAR(20)    NOT NULL CHECK (role IN ('ADMIN','PROFESSEUR','ETUDIANT'))
);
GO

-- Modules
CREATE TABLE modules (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom         NVARCHAR(150)  NOT NULL UNIQUE,
    description NVARCHAR(1000) NULL
);
GO

-- Sujets
CREATE TABLE sujets (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    titre           NVARCHAR(255)  NOT NULL,
    description     NVARCHAR(MAX)  NULL,
    annee           INT            NOT NULL,
    disponible      BIT            NOT NULL DEFAULT 1,
    module_id       BIGINT         NULL,
    professeur_id   BIGINT         NOT NULL,
    date_creation   DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_sujets_module      FOREIGN KEY (module_id)     REFERENCES modules(id),
    CONSTRAINT FK_sujets_professeur  FOREIGN KEY (professeur_id) REFERENCES utilisateurs(id)
);
GO

-- Projets
CREATE TABLE projets (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    sujet_id      BIGINT         NOT NULL UNIQUE,
    statut        VARCHAR(20)    NOT NULL DEFAULT 'EN_COURS' CHECK (statut IN ('EN_COURS','TERMINE','ARCHIVE')),
    rapport_url   NVARCHAR(500)  NULL,
    date_creation DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_projets_sujet FOREIGN KEY (sujet_id) REFERENCES sujets(id)
);
GO

-- Projet \u2194 \u00e9tudiants
CREATE TABLE projet_etudiants (
    projet_id    BIGINT NOT NULL,
    etudiant_id  BIGINT NOT NULL,
    PRIMARY KEY (projet_id, etudiant_id),
    CONSTRAINT FK_pe_projet   FOREIGN KEY (projet_id)   REFERENCES projets(id) ON DELETE CASCADE,
    CONSTRAINT FK_pe_etudiant FOREIGN KEY (etudiant_id) REFERENCES utilisateurs(id)
);
GO

-- T\u00e2ches Kanban
CREATE TABLE taches (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    titre         NVARCHAR(255)  NOT NULL,
    description   NVARCHAR(2000) NULL,
    statut        VARCHAR(20)    NOT NULL DEFAULT 'TODO' CHECK (statut IN ('TODO','DOING','DONE')),
    projet_id     BIGINT         NOT NULL,
    date_creation DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_taches_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
);
GO

-- \u00c9quipes
CREATE TABLE equipes (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom           NVARCHAR(150)  NOT NULL,
    sujet_id      BIGINT         NULL,
    date_creation DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_equipes_sujet FOREIGN KEY (sujet_id) REFERENCES sujets(id)
);
GO

-- \u00c9quipe \u2194 membres
CREATE TABLE equipe_membres (
    equipe_id    BIGINT NOT NULL,
    etudiant_id  BIGINT NOT NULL,
    PRIMARY KEY (equipe_id, etudiant_id),
    CONSTRAINT FK_em_equipe   FOREIGN KEY (equipe_id)   REFERENCES equipes(id) ON DELETE CASCADE,
    CONSTRAINT FK_em_etudiant FOREIGN KEY (etudiant_id) REFERENCES utilisateurs(id)
);
GO

-- Messages (chat projet)
CREATE TABLE messages (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    projet_id     BIGINT         NOT NULL,
    expediteur_id BIGINT         NOT NULL,
    contenu       NVARCHAR(4000) NOT NULL,
    date_envoi    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_msg_projet     FOREIGN KEY (projet_id)     REFERENCES projets(id) ON DELETE CASCADE,
    CONSTRAINT FK_msg_expediteur FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
);
GO

-- Fichiers upload\u00e9s
CREATE TABLE fichiers (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    projet_id        BIGINT         NOT NULL,
    uploader_id      BIGINT         NOT NULL,
    nom_original     NVARCHAR(255)  NOT NULL,
    chemin_stockage  NVARCHAR(500)  NOT NULL,
    type_mime        NVARCHAR(100)  NOT NULL,
    taille_octets    BIGINT         NOT NULL,
    categorie        NVARCHAR(50)   NULL,
    date_upload      DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_fic_projet   FOREIGN KEY (projet_id)   REFERENCES projets(id) ON DELETE CASCADE,
    CONSTRAINT FK_fic_uploader FOREIGN KEY (uploader_id) REFERENCES utilisateurs(id)
);
GO

-- Index
CREATE INDEX IX_sujets_professeur ON sujets(professeur_id);
CREATE INDEX IX_sujets_annee      ON sujets(annee);
CREATE INDEX IX_sujets_disponible ON sujets(disponible);
CREATE INDEX IX_taches_projet     ON taches(projet_id);
CREATE INDEX IX_messages_projet   ON messages(projet_id);
CREATE INDEX IX_fichiers_projet   ON fichiers(projet_id);
CREATE INDEX IX_equipes_sujet     ON equipes(sujet_id);
GO

PRINT 'Sch\u00e9ma cr\u00e9\u00e9 avec succ\u00e8s.';
