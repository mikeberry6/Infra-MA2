-- Persist whether a portfolio-company fund assignment is disclosed, inferred,
-- a direct/program investment, or still unresolved. Existing rows default to
-- UNRESOLVED so historical labels are never silently promoted to facts.
CREATE TYPE "OwnershipFundAttribution" AS ENUM (
  'DISCLOSED',
  'INFERRED',
  'DIRECT_PROGRAM',
  'UNRESOLVED'
);

CREATE TYPE "AttributionConfidence" AS ENUM (
  'HIGH',
  'MEDIUM',
  'LOW'
);

ALTER TABLE "OwnershipPeriod"
  ADD COLUMN "fundAttribution" "OwnershipFundAttribution" NOT NULL DEFAULT 'UNRESOLVED',
  ADD COLUMN "attributedFundName" TEXT,
  ADD COLUMN "attributionConfidence" "AttributionConfidence",
  ADD COLUMN "attributionRationale" TEXT,
  ADD CONSTRAINT "OwnershipPeriod_inferred_attribution_check"
    CHECK (
      "fundAttribution" <> 'INFERRED'::"OwnershipFundAttribution"
      OR (
        "attributionConfidence" IN (
          'MEDIUM'::"AttributionConfidence",
          'LOW'::"AttributionConfidence"
        )
        AND "attributedFundName" IS NOT NULL
        AND length(btrim("attributedFundName")) > 0
        AND "attributionRationale" IS NOT NULL
        AND length(btrim("attributionRationale")) > 0
      )
    ),
  ADD CONSTRAINT "OwnershipPeriod_non_inferred_confidence_check"
    CHECK (
      "fundAttribution" = 'INFERRED'::"OwnershipFundAttribution"
      OR "attributionConfidence" IS NULL
    ),
  ADD CONSTRAINT "OwnershipPeriod_non_fund_attribution_check"
    CHECK (
      "fundAttribution" <> 'DIRECT_PROGRAM'::"OwnershipFundAttribution"
      OR "fundId" IS NULL
    ),
  ADD CONSTRAINT "OwnershipPeriod_attributed_fund_name_check"
    CHECK (
      (
        "fundAttribution" IN (
          'DISCLOSED'::"OwnershipFundAttribution",
          'INFERRED'::"OwnershipFundAttribution"
        )
        AND "attributedFundName" IS NOT NULL
        AND length(btrim("attributedFundName")) > 0
      )
      OR (
        "fundAttribution" IN (
          'DIRECT_PROGRAM'::"OwnershipFundAttribution",
          'UNRESOLVED'::"OwnershipFundAttribution"
        )
        AND "attributedFundName" IS NULL
      )
    );

-- Preserve distinct sponsor/vehicle investment rounds (for example, one
-- platform with multiple fund vintages) instead of collapsing them solely by
-- company, manager, and display vehicle.
CREATE UNIQUE INDEX "OwnershipPeriod_companyId_organizationId_vehicleName_investmentYear_key"
  ON "OwnershipPeriod"("companyId", "organizationId", "vehicleName", "investmentYear");

-- The superseded three-field index is removed by the guarded, idempotent
-- finalize-ownership-period-identity.ts cutover after this additive migration
-- has been applied and the replacement index has been verified in catalog.

CREATE INDEX "OwnershipPeriod_fundAttribution_idx"
  ON "OwnershipPeriod"("fundAttribution");
