-- The release workflow verifies that ImportPreview is absent or exactly
-- matches the approved legacy/final catalog before this migration runs, then
-- verifies the exact final catalog after Prisma records the migration.
CREATE TABLE IF NOT EXISTS "ImportPreview" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "summary" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ImportPreview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ImportPreview_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ImportPreview_tokenHash_key"
  ON "ImportPreview"("tokenHash");

CREATE INDEX IF NOT EXISTS "ImportPreview_actorId_entityType_idx"
  ON "ImportPreview"("actorId", "entityType");

CREATE INDEX IF NOT EXISTS "ImportPreview_expiresAt_idx"
  ON "ImportPreview"("expiresAt");

ALTER TABLE "ImportPreview"
  ADD COLUMN IF NOT EXISTS "payload" JSONB,
  ADD COLUMN IF NOT EXISTS "report" JSONB,
  ADD COLUMN IF NOT EXISTS "stateHash" TEXT,
  ADD COLUMN IF NOT EXISTS "fileName" TEXT,
  ADD COLUMN IF NOT EXISTS "committedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "auditEventId" TEXT,
  ADD COLUMN IF NOT EXISTS "result" JSONB;

CREATE INDEX IF NOT EXISTS "ImportPreview_committedAt_idx"
  ON "ImportPreview"("committedAt");

CREATE INDEX IF NOT EXISTS "ImportPreview_auditEventId_idx"
  ON "ImportPreview"("auditEventId");

ALTER TABLE "ImportPreview"
  ADD CONSTRAINT "ImportPreview_auditEventId_fkey"
    FOREIGN KEY ("auditEventId") REFERENCES "AuditEvent"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
