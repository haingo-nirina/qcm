-- CreateTable
CREATE TABLE "sessions_utilisateur" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "jeton_hash" CHAR(64) NOT NULL,
    "fournisseur" "fournisseur_connexion" NOT NULL,
    "expire_le" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_utilisateur_jeton_hash_key" ON "sessions_utilisateur"("jeton_hash");

-- CreateIndex
CREATE INDEX "sessions_utilisateur_utilisateur_id_idx" ON "sessions_utilisateur"("utilisateur_id");

-- CreateIndex
CREATE INDEX "sessions_utilisateur_expire_le_idx" ON "sessions_utilisateur"("expire_le");

-- AddForeignKey
ALTER TABLE "sessions_utilisateur" ADD CONSTRAINT "sessions_utilisateur_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
