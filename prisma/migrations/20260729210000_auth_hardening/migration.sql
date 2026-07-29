-- This table already exists with this exact shape in environments that
-- rehearsed the earlier platform-trust migration. Release preflight verifies
-- that shape before this guarded, additive compatibility migration is applied.
CREATE TABLE IF NOT EXISTS "AuthThrottle" (
  "keyHash" TEXT NOT NULL,
  "failedAttempts" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthThrottle_pkey" PRIMARY KEY ("keyHash")
);

CREATE INDEX IF NOT EXISTS "AuthThrottle_lockedUntil_idx"
  ON "AuthThrottle"("lockedUntil");

CREATE INDEX IF NOT EXISTS "AuthThrottle_updatedAt_idx"
  ON "AuthThrottle"("updatedAt");
