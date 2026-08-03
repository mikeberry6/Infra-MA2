CREATE TYPE "FundSizeBasis" AS ENUM (
  'TARGET',
  'AMOUNT_SOLD',
  'FIRST_CLOSE',
  'FINAL_CLOSE',
  'AUM',
  'COMMITMENTS'
);

CREATE TYPE "FundEvidenceSourceTier" AS ENUM (
  'PRIMARY',
  'INSTITUTIONAL',
  'REPUTABLE_SECONDARY',
  'OTHER_SECONDARY'
);

CREATE TYPE "FundEvidenceConfidence" AS ENUM (
  'HIGH',
  'MEDIUM',
  'LOW'
);

CREATE TYPE "FundEvidenceScope" AS ENUM (
  'FUND',
  'PROGRAM_EXCEPTION'
);

ALTER TABLE "Fund"
  ADD COLUMN "sizeNativeCurrency" VARCHAR(3),
  ADD COLUMN "sizeNativeAmount" DECIMAL(24,4),
  ADD COLUMN "sizeBasis" "FundSizeBasis",
  ADD COLUMN "sizeAsOf" DATE,
  ADD COLUMN "sizeUsdFxRate" DECIMAL(20,10),
  ADD COLUMN "sizeUsdFxDate" DATE;

ALTER TABLE "Fund"
  ADD CONSTRAINT "Fund_size_native_pair_check"
    CHECK (("sizeNativeCurrency" IS NULL) = ("sizeNativeAmount" IS NULL)),
  ADD CONSTRAINT "Fund_size_native_currency_check"
    CHECK ("sizeNativeCurrency" IS NULL OR "sizeNativeCurrency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "Fund_size_native_amount_check"
    CHECK ("sizeNativeAmount" IS NULL OR "sizeNativeAmount" >= 0),
  ADD CONSTRAINT "Fund_size_native_basis_check"
    CHECK ("sizeNativeAmount" IS NULL OR "sizeBasis" IS NOT NULL),
  ADD CONSTRAINT "Fund_size_basis_amount_check"
    CHECK ("sizeBasis" IS NULL OR "sizeNativeAmount" IS NOT NULL OR "sizeUsdMm" IS NOT NULL),
  ADD CONSTRAINT "Fund_size_basis_date_check"
    CHECK ("sizeBasis" IS NULL OR "sizeAsOf" IS NOT NULL),
  ADD CONSTRAINT "Fund_size_fx_pair_check"
    CHECK (("sizeUsdFxRate" IS NULL) = ("sizeUsdFxDate" IS NULL)),
  ADD CONSTRAINT "Fund_size_fx_rate_check"
    CHECK ("sizeUsdFxRate" IS NULL OR "sizeUsdFxRate" > 0),
  ADD CONSTRAINT "Fund_size_fx_native_check"
    CHECK ("sizeUsdFxRate" IS NULL OR "sizeNativeAmount" IS NOT NULL),
  ADD CONSTRAINT "Fund_size_fx_usd_check"
    CHECK ("sizeUsdFxRate" IS NULL OR "sizeUsdMm" IS NOT NULL),
  ADD CONSTRAINT "Fund_size_final_close_status_check"
    CHECK (
      "sizeBasis" IS NULL
      OR "sizeBasis" <> 'FINAL_CLOSE'::"FundSizeBasis"
      OR "fundStatus" = 'FINANCIAL_CLOSE'::"FundStatusEnum"
    );

CREATE TABLE "FundEvidence" (
  "id" TEXT NOT NULL,
  "fundId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "supportedFields" TEXT[] NOT NULL,
  "sourceTier" "FundEvidenceSourceTier" NOT NULL,
  "scope" "FundEvidenceScope" NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "retrievedAt" TIMESTAMP(3) NOT NULL,
  "confidence" "FundEvidenceConfidence" NOT NULL,
  "evidenceLabel" TEXT NOT NULL,
  "pipelineRunId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FundEvidence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FundEvidence_supportedFields_nonempty_check" CHECK (cardinality("supportedFields") > 0)
);

CREATE TABLE "FundRevision" (
  "id" TEXT NOT NULL,
  "fundId" TEXT NOT NULL,
  "proposalHash" TEXT NOT NULL,
  "beforeJson" JSONB,
  "afterJson" JSONB NOT NULL,
  "changedFields" TEXT[] NOT NULL,
  "approver" TEXT NOT NULL,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pipelineRunId" TEXT,

  CONSTRAINT "FundRevision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FundRevision_changedFields_nonempty_check" CHECK (cardinality("changedFields") > 0)
);

CREATE UNIQUE INDEX "FundEvidence_fundId_sourceId_evidenceLabel_key"
  ON "FundEvidence"("fundId", "sourceId", "evidenceLabel");
CREATE INDEX "FundEvidence_fundId_idx" ON "FundEvidence"("fundId");
CREATE INDEX "FundEvidence_sourceId_idx" ON "FundEvidence"("sourceId");
CREATE INDEX "FundEvidence_pipelineRunId_idx" ON "FundEvidence"("pipelineRunId");
CREATE INDEX "FundEvidence_retrievedAt_idx" ON "FundEvidence"("retrievedAt");

CREATE UNIQUE INDEX "FundRevision_fundId_proposalHash_key"
  ON "FundRevision"("fundId", "proposalHash");
CREATE INDEX "FundRevision_proposalHash_idx" ON "FundRevision"("proposalHash");
CREATE INDEX "FundRevision_pipelineRunId_idx" ON "FundRevision"("pipelineRunId");
CREATE INDEX "FundRevision_appliedAt_idx" ON "FundRevision"("appliedAt");

ALTER TABLE "FundEvidence"
  ADD CONSTRAINT "FundEvidence_fundId_fkey"
    FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "FundEvidence_sourceId_fkey"
    FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "FundEvidence_pipelineRunId_fkey"
    FOREIGN KEY ("pipelineRunId") REFERENCES "PipelineRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FundRevision"
  ADD CONSTRAINT "FundRevision_fundId_fkey"
    FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "FundRevision_pipelineRunId_fkey"
    FOREIGN KEY ("pipelineRunId") REFERENCES "PipelineRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
