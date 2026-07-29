CREATE TABLE "ImportPreview" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "summary" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ImportPreview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImportPreview_tokenHash_key" ON "ImportPreview"("tokenHash");
CREATE INDEX "ImportPreview_actorId_entityType_idx" ON "ImportPreview"("actorId", "entityType");
CREATE INDEX "ImportPreview_expiresAt_idx" ON "ImportPreview"("expiresAt");

ALTER TABLE "ImportPreview"
ADD CONSTRAINT "ImportPreview_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
