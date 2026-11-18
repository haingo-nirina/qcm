-- AlterTable
ALTER TABLE "departs_groupage" ADD COLUMN     "abonnes_alertes_le" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "abonnes_alertes_le" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "abonnes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "jeton_desabonnement" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desabonne_le" TIMESTAMPTZ(3),

    CONSTRAINT "abonnes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abonnes_email_key" ON "abonnes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "abonnes_jeton_desabonnement_key" ON "abonnes"("jeton_desabonnement");

-- CreateIndex
CREATE INDEX "abonnes_actif_idx" ON "abonnes"("actif");

