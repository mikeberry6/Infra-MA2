-- Add an explicit, research-reviewed primary source designation for funds.
-- Existing sourceUrls and strategyUrl values remain supporting evidence and
-- are intentionally not promoted by this additive migration.
ALTER TABLE "Fund"
ADD COLUMN "primarySourceUrl" TEXT;
