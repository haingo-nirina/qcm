-- CreateTable
CREATE TABLE "sessions_admin" (
    "id" SERIAL NOT NULL,
    "administrateur_id" INTEGER NOT NULL,
    "jeton_hash" CHAR(64) NOT NULL,
    "expire_le" TIMESTAMPTZ(3) NOT NULL,
    "persistante" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_admin_jeton_hash_key" ON "sessions_admin"("jeton_hash");

-- CreateIndex
CREATE INDEX "sessions_admin_administrateur_id_idx" ON "sessions_admin"("administrateur_id");

-- CreateIndex
CREATE INDEX "sessions_admin_expire_le_idx" ON "sessions_admin"("expire_le");

-- AddForeignKey
ALTER TABLE "sessions_admin" ADD CONSTRAINT "sessions_admin_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
