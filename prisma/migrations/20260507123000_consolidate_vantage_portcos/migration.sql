-- Consolidate Vantage portfolio-company rows into the operating-company row.
-- The former rows represented investment sleeves / asset portfolios tied to
-- Vantage Data Centers, not separate operating companies.

ALTER TABLE "OwnershipPeriod"
  DROP CONSTRAINT IF EXISTS "OwnershipPeriod_companyId_organizationId_key";

UPDATE "Company"
SET
  "subsector" = 'Hyperscale data centers',
  "region" = 'NORTH_AMERICA',
  "country" = 'United States / Canada',
  "countryTags" = ARRAY['United States', 'Canada'],
  "description" = 'Vantage Data Centers develops and operates wholesale and hyperscale data center campuses for large cloud and technology customers. It serves hyperscalers, cloud providers, internet companies, and large enterprises requiring large-scale data center capacity. The business is asset-heavy and contracted because it finances, develops, owns, manages, and operates large physical campuses under long-term customer commitments. This portfolio-company scorecard consolidates the North American Vantage exposure in the database: the DigitalBridge-led platform investment, the Vantage SDC stabilized North American asset portfolio, and the North American growth-platform exposure. Vantage SDC is not a separate operating company; it is a stabilized asset portfolio formed through a 2020 strategic partnership between Vantage Data Centers and a DigitalBridge-led investor group, with Vantage continuing to manage and operate those facilities as part of its broader footprint. Public materials identify Silver Lake as Vantage''s launch sponsor and seller in the 2017 transaction, then as a lead investor alongside DigitalBridge in the 2024 equity round. CBRE Caledon invested in the 2020 stabilized portfolio, and GCM Grosvenor''s Labor Impact Fund, L.P. committed equity capital to Vantage''s North American growth platform.',
  "yearFounded" = 2010,
  "headquarters" = 'Denver, Colorado',
  "updatedAt" = now()
WHERE "name" = 'Vantage Data Centers';

INSERT INTO "Organization" ("id", "name", "types", "status", "createdAt", "updatedAt")
VALUES
  ('org_digitalbridge', 'DigitalBridge', ARRAY['FUND_MANAGER']::"OrgType"[], 'PUBLISHED', now(), now()),
  ('org_gcm_grosvenor', 'GCM Grosvenor', ARRAY['FUND_MANAGER']::"OrgType"[], 'PUBLISHED', now(), now()),
  ('org_silver_lake', 'Silver Lake', ARRAY['FUND_MANAGER']::"OrgType"[], 'PUBLISHED', now(), now())
ON CONFLICT ("name") DO NOTHING;

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
UPDATE "OwnershipPeriod" op
SET "companyId" = (SELECT "id" FROM canonical)
WHERE op."companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical)
  AND NOT EXISTS (
    SELECT 1
    FROM "OwnershipPeriod" existing, canonical
    WHERE existing."companyId" = canonical."id"
      AND existing."organizationId" IS NOT DISTINCT FROM op."organizationId"
      AND existing."vehicleName" IS NOT DISTINCT FROM op."vehicleName"
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
DELETE FROM "OwnershipPeriod"
WHERE "companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
digitalbridge AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" = 'DigitalBridge'
  LIMIT 1
)
UPDATE "OwnershipPeriod" op
SET
  "vehicleName" = 'DigitalBridge-managed vehicle / PSP Investments / TIAA Investments',
  "stake" = COALESCE(op."stake", 'Core Vantage platform acquisition'),
  "investmentYear" = 2017
WHERE op."companyId" = (SELECT "id" FROM canonical)
  AND op."organizationId" = (SELECT "id" FROM digitalbridge)
  AND op."investmentYear" = 2017
  AND op."vehicleName" IN (
    'DigitalBridge Partners / Silver Lake',
    'DigitalBridge Partners',
    'DigitalBridge-managed vehicle / PSP Investments / TIAA Investments'
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
digitalbridge AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" = 'DigitalBridge'
  LIMIT 1
)
UPDATE "OwnershipPeriod" op
SET
  "vehicleName" = 'DigitalBridge-led investor group / Vantage SDC',
  "stake" = 'Vantage SDC exposure; DigitalBridge retained 12.8% balance-sheet interest after 2023 deconsolidation',
  "investmentYear" = 2020
WHERE op."companyId" = (SELECT "id" FROM canonical)
  AND op."organizationId" = (SELECT "id" FROM digitalbridge)
  AND op."investmentYear" = 2020
  AND op."vehicleName" IN (
    'DigitalBridge Strategic Assets Fund',
    'DigitalBridge-led investor group / Vantage SDC',
    'Vantage SDC'
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
gcm_grosvenor AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" = 'GCM Grosvenor'
  LIMIT 1
),
gcm_variants AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" IN ('GCM', 'GCM Grosvenor')
)
UPDATE "OwnershipPeriod" op
SET
  "organizationId" = COALESCE((SELECT "id" FROM gcm_grosvenor), op."organizationId"),
  "vehicleName" = 'Labor Impact Fund, L.P. / Infrastructure Advantage Strategy',
  "investmentYear" = 2020
WHERE op."companyId" = (SELECT "id" FROM canonical)
  AND op."investmentYear" = 2020
  AND (
    op."organizationId" IN (SELECT "id" FROM gcm_variants)
    OR op."vehicleName" = 'Infrastructure Advantage Strategy'
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
silver_lake AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" = 'Silver Lake'
  LIMIT 1
)
INSERT INTO "OwnershipPeriod" (
  "id",
  "companyId",
  "organizationId",
  "fundId",
  "vehicleName",
  "stake",
  "investmentYear",
  "isActive",
  "createdAt"
)
SELECT
  'ownership_vantage_silver_lake_2024_equity',
  canonical."id",
  silver_lake."id",
  NULL,
  '2024 DigitalBridge / Silver Lake equity investment round',
  'Lead investor in 2024 equity investment',
  2024,
  true,
  now()
FROM canonical, silver_lake
WHERE NOT EXISTS (
  SELECT 1
  FROM "OwnershipPeriod" op
  WHERE op."companyId" = canonical."id"
    AND op."organizationId" = silver_lake."id"
    AND op."vehicleName" = '2024 DigitalBridge / Silver Lake equity investment round'
)
ON CONFLICT ("id") DO UPDATE SET
  "vehicleName" = EXCLUDED."vehicleName",
  "stake" = EXCLUDED."stake",
  "investmentYear" = EXCLUDED."investmentYear",
  "isActive" = EXCLUDED."isActive";

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
digitalbridge AS (
  SELECT "id"
  FROM "Organization"
  WHERE "name" = 'DigitalBridge'
  LIMIT 1
)
INSERT INTO "OwnershipPeriod" (
  "id",
  "companyId",
  "organizationId",
  "fundId",
  "vehicleName",
  "stake",
  "investmentYear",
  "isActive",
  "createdAt"
)
SELECT
  'ownership_vantage_digitalbridge_2024_equity',
  canonical."id",
  digitalbridge."id",
  NULL,
  '2024 DigitalBridge / Silver Lake equity investment round',
  'Lead investor in 2024 equity investment',
  2024,
  true,
  now() + interval '1 second'
FROM canonical, digitalbridge
WHERE NOT EXISTS (
  SELECT 1
  FROM "OwnershipPeriod" op
  WHERE op."companyId" = canonical."id"
    AND op."organizationId" = digitalbridge."id"
    AND op."vehicleName" = '2024 DigitalBridge / Silver Lake equity investment round'
)
ON CONFLICT ("id") DO UPDATE SET
  "vehicleName" = EXCLUDED."vehicleName",
  "stake" = EXCLUDED."stake",
  "investmentYear" = EXCLUDED."investmentYear",
  "isActive" = EXCLUDED."isActive";

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
UPDATE "Milestone" m
SET "companyId" = (SELECT "id" FROM canonical)
WHERE m."companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical)
  AND NOT EXISTS (
    SELECT 1
    FROM "Milestone" existing, canonical
    WHERE existing."companyId" = canonical."id"
      AND existing."date" = m."date"
      AND existing."event" = m."event"
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
DELETE FROM "Milestone"
WHERE "companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
UPDATE "ManagementRole" r
SET "companyId" = (SELECT "id" FROM canonical)
WHERE r."companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical)
  AND NOT EXISTS (
    SELECT 1
    FROM "ManagementRole" existing, canonical
    WHERE existing."companyId" = canonical."id"
      AND existing."personId" = r."personId"
      AND existing."title" = r."title"
  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
DELETE FROM "ManagementRole"
WHERE "companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
UPDATE "Citation" c
SET "companyId" = (SELECT "id" FROM canonical)
WHERE c."companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical)
	  AND NOT EXISTS (
	    SELECT 1
	    FROM "Citation" existing, canonical
	    WHERE existing."companyId" = canonical."id"
	      AND existing."sourceId" = c."sourceId"
	  );

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
DELETE FROM "Citation"
WHERE "companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
UPDATE "NewsMention"
SET "companyId" = (SELECT "id" FROM canonical)
WHERE "companyId" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
duplicates AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" IN (
    'Vantage Data Centers North America',
    'Vantage SDC',
    'Vantage Data Centers Stabilized North America Portfolio'
  )
)
DELETE FROM "Company"
WHERE "id" IN (SELECT "id" FROM duplicates)
  AND EXISTS (SELECT 1 FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
)
UPDATE "Milestone"
SET "event" = 'A consortium including Digital Bridge Holdings, PSP Investments, and TIAA Investments acquired Vantage Data Centers from Silver Lake.'
WHERE "companyId" = (SELECT "id" FROM canonical)
  AND "date" = 'Mar 27, 2017'
  AND "event" = 'A consortium including DigitalBridge acquired Vantage Data Centers.';

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
)
UPDATE "Milestone"
SET "event" = 'GCM Grosvenor reported a partial realization by the Infrastructure Advantage Strategy while retaining remaining ownership exposure to Vantage Data Centers.'
WHERE "companyId" = (SELECT "id" FROM canonical)
  AND "date" = '2024'
  AND "event" = 'GCM Grosvenor reported a partial realization while retaining remaining ownership exposure to Vantage Data Centers.';

INSERT INTO "Source" ("id", "label", "url", "type", "createdAt")
VALUES
  ('source_vantage_2017_silverlake', 'Close date source — Silver Lake — Vantage Data Centers', 'https://www.silverlake.com/consortium-of-digital-bridge-psp-investments-and-tiaa-investments-acquires-vantage-data-centers/', 'PRESS_RELEASE', now()),
  ('source_vantage_sdc_deconsolidation', 'DigitalBridge — Vantage SDC deconsolidation', 'https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-completes-deconsolidation-vantage-sdc/', 'PRESS_RELEASE', now()),
  ('source_vantage_gcm_2024_impact', 'GCM Grosvenor — Vantage Data Centers partial realization', 'https://www.gcmgrosvenor.com/wp-content/uploads/GCM-Grosvenor-2024-Labor-and-Economic-Impact-Report.pdf', 'PRESENTATION', now()),
  ('source_vantage_contact', 'Vantage Dc — Vantage Data Centers offices', 'https://vantage-dc.com/company/contact-us/', 'WEBSITE', now())
ON CONFLICT ("url") DO UPDATE SET
  "label" = EXCLUDED."label",
  "type" = EXCLUDED."type";

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
)
INSERT INTO "Citation" ("id", "sourceId", "companyId")
VALUES
  ('citation_vantage_2017_silverlake', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.silverlake.com/consortium-of-digital-bridge-psp-investments-and-tiaa-investments-acquires-vantage-data-centers/'), (SELECT "id" FROM canonical)),
  ('citation_vantage_sdc_deconsolidation', (SELECT "id" FROM "Source" WHERE "url" = 'https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-completes-deconsolidation-vantage-sdc/'), (SELECT "id" FROM canonical)),
  ('citation_vantage_gcm_2024_impact', (SELECT "id" FROM "Source" WHERE "url" = 'https://www.gcmgrosvenor.com/wp-content/uploads/GCM-Grosvenor-2024-Labor-and-Economic-Impact-Report.pdf'), (SELECT "id" FROM canonical)),
  ('citation_vantage_contact', (SELECT "id" FROM "Source" WHERE "url" = 'https://vantage-dc.com/company/contact-us/'), (SELECT "id" FROM canonical))
ON CONFLICT ("id") DO NOTHING;

WITH canonical AS (
  SELECT "id"
  FROM "Company"
  WHERE "name" = 'Vantage Data Centers'
  LIMIT 1
),
ranked AS (
  SELECT
    op."id",
    row_number() OVER (
      PARTITION BY op."companyId", op."organizationId", op."vehicleName"
      ORDER BY op."createdAt" DESC, op."id" DESC
    ) AS rn
  FROM "OwnershipPeriod" op
  WHERE op."companyId" = (SELECT "id" FROM canonical)
)
DELETE FROM "OwnershipPeriod"
WHERE "id" IN (
  SELECT "id"
  FROM ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "OwnershipPeriod_companyId_organizationId_vehicleName_key"
  ON "OwnershipPeriod"("companyId", "organizationId", "vehicleName");
