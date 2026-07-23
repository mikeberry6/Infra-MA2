ALTER TABLE "Deal" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Fund" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);

CREATE TABLE "PipelineRun" (
  "id" TEXT NOT NULL,
  "pipeline" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "inserted" INTEGER NOT NULL DEFAULT 0,
  "updated" INTEGER NOT NULL DEFAULT 0,
  "skipped" INTEGER NOT NULL DEFAULT 0,
  "errorSummary" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "action" TEXT NOT NULL,
  "changes" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyRedirect" (
  "retiredId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "reason" TEXT NOT NULL DEFAULT 'CANONICAL_MERGE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyRedirect_pkey" PRIMARY KEY ("retiredId")
);

CREATE INDEX "PipelineRun_pipeline_startedAt_idx" ON "PipelineRun"("pipeline", "startedAt");
CREATE INDEX "PipelineRun_status_startedAt_idx" ON "PipelineRun"("status", "startedAt");
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
CREATE INDEX "CompanyRedirect_companyId_idx" ON "CompanyRedirect"("companyId");

ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompanyRedirect" ADD CONSTRAINT "CompanyRedirect_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompanyRedirect" ADD CONSTRAINT "CompanyRedirect_retiredId_fkey" FOREIGN KEY ("retiredId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
