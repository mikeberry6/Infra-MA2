-- Quarantine previously published deals that have no supporting citation.
-- Records remain intact for editorial review and can be republished through
-- the admin publication gate after a primary source is attached.
UPDATE "Deal" AS deal
SET "status" = 'DRAFT'
WHERE deal."status" = 'PUBLISHED'
  AND NOT EXISTS (
    SELECT 1
    FROM "Citation" AS citation
    WHERE citation."dealId" = deal."id"
  );
