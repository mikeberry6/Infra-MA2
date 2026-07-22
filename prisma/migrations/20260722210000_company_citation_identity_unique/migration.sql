-- Prevent seed replays and concurrent workflows from appending the same
-- company/source/purpose/evidence/deal citation identity. Exact duplicates
-- must be removed by the guarded remediation workflow before this migration.
-- PostgreSQL's NULLS NOT DISTINCT preserves null as a meaningful identity
-- value without conflating it with a deliberate empty string.
CREATE UNIQUE INDEX IF NOT EXISTS "Citation_company_identity_unique"
ON "Citation" ("companyId", "sourceId", "purpose", "evidenceLabel", "dealId") NULLS NOT DISTINCT
WHERE "companyId" IS NOT NULL;
