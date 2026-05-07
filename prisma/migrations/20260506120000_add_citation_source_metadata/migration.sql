-- Add fact-based source metadata for PortCo scorecard citations.

CREATE TYPE "CitationPurpose" AS ENUM (
  'COMPANY_PROFILE',
  'OWNERSHIP_INVESTMENT',
  'OPERATIONS_ASSETS',
  'MILESTONE_EVENT',
  'FINANCING_FILINGS',
  'SUPPORTING_CONTEXT'
);

ALTER TABLE "Citation"
  ADD COLUMN "purpose" "CitationPurpose" NOT NULL DEFAULT 'SUPPORTING_CONTEXT',
  ADD COLUMN "evidenceLabel" TEXT;

UPDATE "Source"
SET "type" = CASE
  WHEN "url" ILIKE '%sec.gov%' OR "label" ILIKE '%sec %'
    THEN 'SEC_FILING'::"SourceType"
  WHEN "url" ILIKE '%.pdf%' OR "label" ILIKE '%presentation%' OR "label" ILIKE '%deck%' OR "label" ILIKE '%factsheet%' OR "label" ILIKE '%fact sheet%' OR "label" ILIKE '%aif%' OR "label" ILIKE '%annual report%'
    THEN 'PRESENTATION'::"SourceType"
  WHEN "url" ILIKE '%prnewswire%' OR "url" ILIKE '%businesswire%' OR "url" ILIKE '%globenewswire%' OR "label" ILIKE '%press release%' OR "label" ILIKE '%news release%' OR "label" ILIKE '%announcement%' OR "label" ILIKE '%newsroom%'
    THEN 'PRESS_RELEASE'::"SourceType"
  WHEN "url" ~* '^https?://[^/]+/?$' OR "url" ILIKE '%/about%' OR "url" ILIKE '%/portfolio%' OR "url" ILIKE '%/our-portfolio%' OR "url" ILIKE '%/operations%' OR "url" ILIKE '%/projects%' OR "url" ILIKE '%/investments%'
    THEN 'WEBSITE'::"SourceType"
  ELSE "type"
END;

UPDATE "Citation" c
SET "purpose" = CASE
  WHEN s."label" ILIKE '%sec %'
    OR s."url" ILIKE '%sec.gov%'
    OR s."label" ILIKE '%filing%'
    OR s."label" ILIKE '%aif%'
    OR s."label" ILIKE '%annual report%'
    OR s."label" ILIKE '%cfius%'
    OR s."label" ILIKE '%clearance%'
    OR s."label" ILIKE '%bond%'
    OR s."label" ILIKE '%financing%'
    OR s."label" ILIKE '%debt%'
    OR s."label" ILIKE '%notes%'
    OR s."label" ILIKE '%tax equity%'
    THEN 'FINANCING_FILINGS'::"CitationPurpose"
  WHEN s."label" ILIKE '%investment date%'
    OR s."label" ILIKE '%close date%'
    OR s."label" ILIKE '%announcement date%'
    OR s."label" ILIKE '%ownership history%'
    OR s."label" ILIKE '%current ownership%'
    OR s."label" ILIKE '%interest confirmation%'
    OR s."label" ILIKE '%portfolio source%'
    THEN 'OWNERSHIP_INVESTMENT'::"CitationPurpose"
  WHEN s."label" ILIKE '%acquires%'
    OR s."label" ILIKE '%acquired%'
    OR s."label" ILIKE '%acquisition%'
    OR s."label" ILIKE '%divestiture%'
    OR s."label" ILIKE '%sale%'
    OR s."label" ILIKE '%launch%'
    OR s."label" ILIKE '%rebrand%'
    OR s."label" ILIKE '%milestone%'
    THEN 'MILESTONE_EVENT'::"CitationPurpose"
  WHEN s."url" ILIKE '%/operations%'
    OR s."url" ILIKE '%/projects%'
    OR s."url" ILIKE '%/project%'
    OR s."url" ILIKE '%/portfolio%'
    OR s."url" ILIKE '%/assets%'
    OR s."url" ILIKE '%/network%'
    OR s."url" ILIKE '%/facilities%'
    OR s."url" ILIKE '%/locations%'
    OR s."url" ILIKE '%factsheet%'
    THEN 'OPERATIONS_ASSETS'::"CitationPurpose"
  WHEN s."url" ~* '^https?://[^/]+/?$'
    OR s."url" ILIKE '%/about%'
    THEN 'COMPANY_PROFILE'::"CitationPurpose"
  ELSE 'SUPPORTING_CONTEXT'::"CitationPurpose"
END
FROM "Source" s
WHERE c."sourceId" = s."id";
