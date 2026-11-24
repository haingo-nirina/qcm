-- CreateTable
CREATE TABLE "reactions_publications" (
    "id" SERIAL NOT NULL,
    "publication_id" INTEGER NOT NULL,
    "reacteur_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions_commentaires" (
    "id" SERIAL NOT NULL,
    "commentaire_id" INTEGER NOT NULL,
    "reacteur_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reactions_publications_reacteur_hash_idx" ON "reactions_publications"("reacteur_hash");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_publications_publication_id_reacteur_hash_key" ON "reactions_publications"("publication_id", "reacteur_hash");

-- CreateIndex
CREATE INDEX "reactions_commentaires_reacteur_hash_idx" ON "reactions_commentaires"("reacteur_hash");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_commentaires_commentaire_id_reacteur_hash_key" ON "reactions_commentaires"("commentaire_id", "reacteur_hash");

-- AddForeignKey
ALTER TABLE "reactions_publications" ADD CONSTRAINT "reactions_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions_commentaires" ADD CONSTRAINT "reactions_commentaires_commentaire_id_fkey" FOREIGN KEY ("commentaire_id") REFERENCES "commentaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;
