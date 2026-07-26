CREATE TABLE "AuthThrottle" (
  "keyHash" TEXT NOT NULL,
  "failedAttempts" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthThrottle_pkey" PRIMARY KEY ("keyHash")
);

CREATE INDEX "AuthThrottle_lockedUntil_idx" ON "AuthThrottle"("lockedUntil");
