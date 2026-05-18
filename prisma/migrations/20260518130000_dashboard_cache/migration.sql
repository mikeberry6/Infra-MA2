-- Daily infrastructure M&A conditions dashboard cache.

CREATE TABLE "DashboardMetricDefinition" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "unit" TEXT,
    "format" TEXT NOT NULL DEFAULT 'number',
    "cadence" TEXT NOT NULL DEFAULT 'daily',
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceKind" TEXT NOT NULL DEFAULT 'official',
    "description" TEXT NOT NULL DEFAULT '',
    "staleAfterDays" INTEGER NOT NULL DEFAULT 7,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardMetricDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DashboardObservation" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceRunId" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION,
    "textValue" TEXT,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CACHED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardObservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DashboardSignal" (
    "id" TEXT NOT NULL,
    "signalKey" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "direction" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
    "severity" INTEGER NOT NULL DEFAULT 1,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DashboardSourceRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "observationsFetched" INTEGER NOT NULL DEFAULT 0,
    "observationsUpserted" INTEGER NOT NULL DEFAULT 0,
    "signalsFetched" INTEGER NOT NULL DEFAULT 0,
    "signalsUpserted" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardSourceRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DashboardObservation_metricId_periodEnd_sourceId_key" ON "DashboardObservation"("metricId", "periodEnd", "sourceId");
CREATE UNIQUE INDEX "DashboardSignal_signalKey_observedAt_sourceId_key" ON "DashboardSignal"("signalKey", "observedAt", "sourceId");

CREATE INDEX "DashboardMetricDefinition_section_idx" ON "DashboardMetricDefinition"("section");
CREATE INDEX "DashboardMetricDefinition_sourceId_idx" ON "DashboardMetricDefinition"("sourceId");
CREATE INDEX "DashboardObservation_metricId_periodEnd_idx" ON "DashboardObservation"("metricId", "periodEnd");
CREATE INDEX "DashboardObservation_sourceId_idx" ON "DashboardObservation"("sourceId");
CREATE INDEX "DashboardObservation_status_idx" ON "DashboardObservation"("status");
CREATE INDEX "DashboardSignal_section_idx" ON "DashboardSignal"("section");
CREATE INDEX "DashboardSignal_sourceId_idx" ON "DashboardSignal"("sourceId");
CREATE INDEX "DashboardSignal_direction_idx" ON "DashboardSignal"("direction");
CREATE INDEX "DashboardSignal_observedAt_idx" ON "DashboardSignal"("observedAt");
CREATE INDEX "DashboardSourceRun_sourceId_idx" ON "DashboardSourceRun"("sourceId");
CREATE INDEX "DashboardSourceRun_status_idx" ON "DashboardSourceRun"("status");
CREATE INDEX "DashboardSourceRun_startedAt_idx" ON "DashboardSourceRun"("startedAt");

ALTER TABLE "DashboardObservation"
ADD CONSTRAINT "DashboardObservation_metricId_fkey"
FOREIGN KEY ("metricId") REFERENCES "DashboardMetricDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
