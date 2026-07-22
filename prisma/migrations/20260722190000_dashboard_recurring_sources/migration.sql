CREATE TYPE "DashboardSignalReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "DashboardMetricDefinition"
ADD CONSTRAINT "DashboardMetricDefinition_status_check"
CHECK ("status" IN ('ACTIVE', 'ROADMAP'));

ALTER TABLE "DashboardSignal"
ADD COLUMN "sourceRunId" TEXT,
ADD COLUMN "reviewStatus" "DashboardSignalReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "contentHash" TEXT NOT NULL DEFAULT '',
ADD COLUMN "reviewedContentHash" TEXT;

CREATE INDEX "DashboardSignal_sourceRunId_idx" ON "DashboardSignal"("sourceRunId");
CREATE INDEX "DashboardSignal_reviewStatus_observedAt_idx" ON "DashboardSignal"("reviewStatus", "observedAt");
CREATE INDEX "DashboardSignal_reviewedById_idx" ON "DashboardSignal"("reviewedById");
CREATE INDEX "DashboardMetricDefinition_status_idx" ON "DashboardMetricDefinition"("status");

ALTER TABLE "DashboardSignal"
ADD CONSTRAINT "DashboardSignal_sourceRunId_fkey"
FOREIGN KEY ("sourceRunId") REFERENCES "DashboardSourceRun"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DashboardSignal"
ADD CONSTRAINT "DashboardSignal_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
