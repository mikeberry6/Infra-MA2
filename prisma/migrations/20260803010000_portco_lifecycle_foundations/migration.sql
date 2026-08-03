-- Preserve legal ownership state separately from the legacy isActive projection.
-- The protected schema-stage finalizer backfills this nullable additive column
-- from isActive, then applies the Prisma default and NOT NULL requirement.
CREATE TYPE "OwnershipPeriodState" AS ENUM (
  'CLOSED_ACTIVE',
  'SIGNED_PENDING_EXIT',
  'REALIZED'
);

CREATE TYPE "PendingOwnershipDirection" AS ENUM (
  'INCOMING',
  'EXIT'
);

CREATE TYPE "PendingOwnershipTransactionState" AS ENUM (
  'SIGNED_PENDING_INCOMING',
  'SIGNED_PENDING_EXIT'
);

-- Preserve company aliases in the approved company image rather than
-- requiring them to round-trip through the organization alias table.
ALTER TABLE "Company"
  ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "OwnershipPeriod"
  ADD COLUMN "transactionState" "OwnershipPeriodState",
  ADD CONSTRAINT "OwnershipPeriod_state_active_check"
    CHECK (
      ("transactionState" = 'REALIZED'::"OwnershipPeriodState" AND "isActive" = false)
      OR
      ("transactionState" IN (
        'CLOSED_ACTIVE'::"OwnershipPeriodState",
        'SIGNED_PENDING_EXIT'::"OwnershipPeriodState"
      ) AND "isActive" = true)
    );

CREATE INDEX "OwnershipPeriod_companyId_transactionState_idx"
  ON "OwnershipPeriod"("companyId", "transactionState");

-- Management history remains queryable while current leadership is explicit.
-- The protected schema-stage finalizer derives this nullable additive column
-- from endDate, then applies the Prisma default and NOT NULL requirement.
ALTER TABLE "ManagementRole"
  ADD COLUMN "isCurrent" BOOLEAN,
  ADD CONSTRAINT "ManagementRole_current_end_date_check"
    CHECK ("isCurrent" = false OR "endDate" IS NULL);

CREATE INDEX "ManagementRole_companyId_isCurrent_idx"
  ON "ManagementRole"("companyId", "isCurrent");

-- A signed incoming buyer is recorded here until legal closing. A signed exit
-- is recorded here while the incumbent OwnershipPeriod remains legally active.
CREATE TABLE "PendingOwnershipTransaction" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "direction" "PendingOwnershipDirection" NOT NULL,
  "state" "PendingOwnershipTransactionState" NOT NULL,
  "counterpartyName" TEXT NOT NULL,
  "counterpartyOrganizationId" TEXT,
  "vehicleName" TEXT,
  "stake" TEXT,
  "transactionDescription" TEXT NOT NULL,
  "announcedAt" DATE,
  "expectedClosing" TEXT,
  "relatedOwnershipPeriodIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PendingOwnershipTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PendingOwnershipTransaction_direction_state_check"
    CHECK (
      ("direction" = 'INCOMING'::"PendingOwnershipDirection"
        AND "state" = 'SIGNED_PENDING_INCOMING'::"PendingOwnershipTransactionState")
      OR
      ("direction" = 'EXIT'::"PendingOwnershipDirection"
        AND "state" = 'SIGNED_PENDING_EXIT'::"PendingOwnershipTransactionState")
    ),
  CONSTRAINT "PendingOwnershipTransaction_counterparty_nonempty_check"
    CHECK (length(btrim("counterpartyName")) > 0),
  CONSTRAINT "PendingOwnershipTransaction_description_nonempty_check"
    CHECK (length(btrim("transactionDescription")) > 0),
  CONSTRAINT "PendingOwnershipTransaction_expected_closing_nonempty_check"
    CHECK ("expectedClosing" IS NULL OR length(btrim("expectedClosing")) > 0)
);

-- Citations retain their canonical Source relation and may support more than
-- one pending transaction without duplicating source metadata.
CREATE TABLE "PendingOwnershipTransactionCitation" (
  "pendingOwnershipTransactionId" TEXT NOT NULL,
  "citationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PendingOwnershipTransactionCitation_pkey"
    PRIMARY KEY ("pendingOwnershipTransactionId", "citationId")
);

CREATE INDEX "PendingOwnershipTransaction_companyId_direction_counterpart_idx"
  ON "PendingOwnershipTransaction"(
    "companyId",
    "direction",
    "counterpartyName",
    "announcedAt"
  );
CREATE INDEX "PendingOwnershipTransaction_companyId_state_idx"
  ON "PendingOwnershipTransaction"("companyId", "state");
CREATE INDEX "PendingOwnershipTransaction_counterpartyOrganizationId_idx"
  ON "PendingOwnershipTransaction"("counterpartyOrganizationId");
CREATE INDEX "PendingOwnershipTransaction_announcedAt_idx"
  ON "PendingOwnershipTransaction"("announcedAt");
CREATE INDEX "PendingOwnershipTransactionCitation_citationId_idx"
  ON "PendingOwnershipTransactionCitation"("citationId");

ALTER TABLE "PendingOwnershipTransaction"
  ADD CONSTRAINT "PendingOwnershipTransaction_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PendingOwnershipTransaction_counterpartyOrganizationId_fkey"
    FOREIGN KEY ("counterpartyOrganizationId") REFERENCES "Organization"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PendingOwnershipTransactionCitation"
  ADD CONSTRAINT "PendingOwnershipTransactionCitation_pendingOwnershipTransa_fkey"
    FOREIGN KEY ("pendingOwnershipTransactionId") REFERENCES "PendingOwnershipTransaction"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PendingOwnershipTransactionCitation_citationId_fkey"
    FOREIGN KEY ("citationId") REFERENCES "Citation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Attach the exact sources supporting individual milestones and management
-- roles while retaining Citation as the canonical evidence record.
CREATE TABLE "MilestoneCitation" (
  "milestoneId" TEXT NOT NULL,
  "citationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MilestoneCitation_pkey"
    PRIMARY KEY ("milestoneId", "citationId")
);

CREATE TABLE "ManagementRoleCitation" (
  "managementRoleId" TEXT NOT NULL,
  "citationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ManagementRoleCitation_pkey"
    PRIMARY KEY ("managementRoleId", "citationId")
);

CREATE INDEX "MilestoneCitation_citationId_idx"
  ON "MilestoneCitation"("citationId");
CREATE INDEX "ManagementRoleCitation_citationId_idx"
  ON "ManagementRoleCitation"("citationId");

ALTER TABLE "MilestoneCitation"
  ADD CONSTRAINT "MilestoneCitation_milestoneId_fkey"
    FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "MilestoneCitation_citationId_fkey"
    FOREIGN KEY ("citationId") REFERENCES "Citation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ManagementRoleCitation"
  ADD CONSTRAINT "ManagementRoleCitation_managementRoleId_fkey"
    FOREIGN KEY ("managementRoleId") REFERENCES "ManagementRole"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ManagementRoleCitation_citationId_fkey"
    FOREIGN KEY ("citationId") REFERENCES "Citation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Store the exact approved company before/after image and proposal binding for
-- every applied list reconciliation or full scorecard refresh.
CREATE TABLE "CompanyRevision" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "proposalHash" TEXT NOT NULL,
  "beforeJson" JSONB,
  "afterJson" JSONB NOT NULL,
  "changedFields" TEXT[] NOT NULL,
  "approver" TEXT NOT NULL,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pipelineRunId" TEXT,

  CONSTRAINT "CompanyRevision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CompanyRevision_changedFields_nonempty_check"
    CHECK (cardinality("changedFields") > 0)
);

CREATE UNIQUE INDEX "CompanyRevision_companyId_proposalHash_key"
  ON "CompanyRevision"("companyId", "proposalHash");
CREATE INDEX "CompanyRevision_proposalHash_idx"
  ON "CompanyRevision"("proposalHash");
CREATE INDEX "CompanyRevision_pipelineRunId_idx"
  ON "CompanyRevision"("pipelineRunId");
CREATE INDEX "CompanyRevision_appliedAt_idx"
  ON "CompanyRevision"("appliedAt");

ALTER TABLE "CompanyRevision"
  ADD CONSTRAINT "CompanyRevision_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "CompanyRevision_pipelineRunId_fkey"
    FOREIGN KEY ("pipelineRunId") REFERENCES "PipelineRun"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
