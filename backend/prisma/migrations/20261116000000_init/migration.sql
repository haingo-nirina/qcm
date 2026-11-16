-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "statut_depart" AS ENUM ('ouvert', 'bientot_complet', 'ferme');

-- CreateEnum
CREATE TYPE "fournisseur_connexion" AS ENUM ('facebook', 'google', 'email');

-- CreateEnum
CREATE TYPE "categorie_publication" AS ENUM ('arrivage', 'depart_groupage', 'evenement', 'actualite');

-- CreateEnum
CREATE TYPE "statut_publication" AS ENUM ('brouillon', 'publie');

-- CreateEnum
CREATE TYPE "statut_commentaire" AS ENUM ('en_attente', 'publie', 'refuse');

-- CreateEnum
CREATE TYPE "source_devis" AS ENUM ('formulaire', 'whatsapp');

-- CreateEnum
CREATE TYPE "statut_devis" AS ENUM ('nouvelle', 'traitee');

-- CreateEnum
CREATE TYPE "role_admin" AS ENUM ('admin', 'moderateur');

-- CreateTable
CREATE TABLE "pays" (
    "id" SERIAL NOT NULL,
    "code" CHAR(2) NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_depart" (
    "id" SERIAL NOT NULL,
    "pays_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "points_depart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departs_groupage" (
    "id" SERIAL NOT NULL,
    "point_depart_id" INTEGER NOT NULL,
    "date_cloture" DATE NOT NULL,
    "arrivee_estimee" DATE NOT NULL,
    "statut" "statut_depart" NOT NULL DEFAULT 'ouvert',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "departs_groupage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone_whatsapp" TEXT,
    "photo_url" TEXT,
    "bloque" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_sociaux" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "fournisseur" "fournisseur_connexion" NOT NULL,
    "identifiant_externe" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comptes_sociaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorie" "categorie_publication" NOT NULL,
    "contenu" TEXT NOT NULL,
    "image_url" TEXT,
    "statut" "statut_publication" NOT NULL DEFAULT 'brouillon',
    "commentaires_ouverts" BOOLEAN NOT NULL DEFAULT true,
    "commentaires_moderes" BOOLEAN NOT NULL DEFAULT true,
    "publie_le" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id" SERIAL NOT NULL,
    "publication_id" INTEGER NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "statut" "statut_commentaire" NOT NULL DEFAULT 'en_attente',
    "reponse_qcm" TEXT,
    "reponse_le" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_devis" (
    "id" SERIAL NOT NULL,
    "nom_client" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "entreprise" TEXT,
    "message" TEXT,
    "depart_id" INTEGER,
    "source" "source_devis" NOT NULL DEFAULT 'formulaire',
    "statut" "statut_devis" NOT NULL DEFAULT 'nouvelle',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traitee_le" TIMESTAMPTZ(3),

    CONSTRAINT "demandes_devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "role" "role_admin" NOT NULL DEFAULT 'moderateur',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniere_connexion" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pays_code_key" ON "pays"("code");

-- CreateIndex
CREATE UNIQUE INDEX "points_depart_pays_id_nom_key" ON "points_depart"("pays_id", "nom");

-- CreateIndex
CREATE INDEX "departs_groupage_visible_date_cloture_idx" ON "departs_groupage"("visible", "date_cloture");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "comptes_sociaux_utilisateur_id_idx" ON "comptes_sociaux"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_sociaux_fournisseur_identifiant_externe_key" ON "comptes_sociaux"("fournisseur", "identifiant_externe");

-- CreateIndex
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- CreateIndex
CREATE INDEX "publications_statut_publie_le_idx" ON "publications"("statut", "publie_le");

-- CreateIndex
CREATE INDEX "commentaires_publication_id_statut_idx" ON "commentaires"("publication_id", "statut");

-- CreateIndex
CREATE INDEX "commentaires_statut_created_at_idx" ON "commentaires"("statut", "created_at");

-- CreateIndex
CREATE INDEX "demandes_devis_statut_created_at_idx" ON "demandes_devis"("statut", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "administrateurs_email_key" ON "administrateurs"("email");

-- AddForeignKey
ALTER TABLE "points_depart" ADD CONSTRAINT "points_depart_pays_id_fkey" FOREIGN KEY ("pays_id") REFERENCES "pays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departs_groupage" ADD CONSTRAINT "departs_groupage_point_depart_id_fkey" FOREIGN KEY ("point_depart_id") REFERENCES "points_depart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes_sociaux" ADD CONSTRAINT "comptes_sociaux_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_devis" ADD CONSTRAINT "demandes_devis_depart_id_fkey" FOREIGN KEY ("depart_id") REFERENCES "departs_groupage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
