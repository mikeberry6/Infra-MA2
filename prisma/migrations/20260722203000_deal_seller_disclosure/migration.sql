-- Add an explicit editorial assertion for transactions where a seller is not
-- represented by a DealParticipant. Existing records remain intentionally
-- LEGACY_UNREVIEWED so the additive migration does not invent reviewed facts or
-- remove any currently published data.
CREATE TYPE "SellerDisclosureStatus" AS ENUM (
  'DISCLOSED',
  'NOT_DISCLOSED',
  'NOT_APPLICABLE',
  'LEGACY_UNREVIEWED'
);

ALTER TABLE "Deal"
  ADD COLUMN "sellerDisclosureStatus" "SellerDisclosureStatus" NOT NULL DEFAULT 'LEGACY_UNREVIEWED',
  ADD COLUMN "sellerDisclosureReason" TEXT;
