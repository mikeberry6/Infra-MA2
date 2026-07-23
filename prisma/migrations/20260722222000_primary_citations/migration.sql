-- Make the editorial primary-source designation explicit. Existing citations
-- are deliberately not auto-promoted: array order or CUID order is not
-- evidence that a source is primary. The release source-coverage gate remains
-- closed until a research owner reviews and designates each published record.
ALTER TABLE "Citation"
ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Citation_one_primary_per_deal"
ON "Citation"("dealId")
WHERE "isPrimary" = true AND "dealId" IS NOT NULL;

CREATE UNIQUE INDEX "Citation_one_primary_per_company"
ON "Citation"("companyId")
WHERE "isPrimary" = true AND "companyId" IS NOT NULL;
