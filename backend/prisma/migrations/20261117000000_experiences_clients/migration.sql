-- CreateTable
CREATE TABLE "experiences_clients" (
    "id" SERIAL NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "texte" TEXT NOT NULL,
    "entreprise" TEXT,
    "statut" "statut_commentaire" NOT NULL DEFAULT 'en_attente',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiences_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "experiences_clients_statut_created_at_idx" ON "experiences_clients"("statut", "created_at");

-- CreateIndex
CREATE INDEX "experiences_clients_utilisateur_id_idx" ON "experiences_clients"("utilisateur_id");

-- AddForeignKey
ALTER TABLE "experiences_clients" ADD CONSTRAINT "experiences_clients_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

