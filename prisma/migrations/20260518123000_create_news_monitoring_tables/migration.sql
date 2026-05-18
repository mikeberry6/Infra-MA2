-- Create news monitoring tables for databases that were missing the physical
-- NewsItem / NewsMention tables despite the Prisma models being present.

DO $$
BEGIN
  CREATE TYPE "NewsCategory" AS ENUM (
    'TRANSACTION_ACTIVITY',
    'FUNDRAISING_ACTIVITY',
    'PORTFOLIO_COMPANY_NEWS',
    'INVESTMENT_FIRM_NEWS',
    'RUMORED_SALES_PROCESS',
    'LOW_CONFIDENCE_NEEDS_REVIEW'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "NewsMentionType" AS ENUM (
    'COMPANY',
    'FUND_MANAGER',
    'FUND',
    'DEAL'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "NewsConfidence" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'PORTFOLIO_COMPANY_NEWS';
ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'INVESTMENT_FIRM_NEWS';
ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'LOW_CONFIDENCE_NEEDS_REVIEW';

CREATE TABLE IF NOT EXISTS "NewsItem" (
  "id" TEXT NOT NULL,
  "legacyId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "category" "NewsCategory" NOT NULL,
  "sourceName" TEXT NOT NULL DEFAULT '',
  "sourceUrl" TEXT,
  "linkedinUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "isRumor" BOOLEAN NOT NULL DEFAULT false,
  "confidence" "NewsConfidence" NOT NULL DEFAULT 'HIGH',
  "status" "RecordStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsItem_legacyId_key" ON "NewsItem"("legacyId");
CREATE INDEX IF NOT EXISTS "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");
CREATE INDEX IF NOT EXISTS "NewsItem_category_idx" ON "NewsItem"("category");
CREATE INDEX IF NOT EXISTS "NewsItem_status_idx" ON "NewsItem"("status");
CREATE INDEX IF NOT EXISTS "NewsItem_sourceUrl_idx" ON "NewsItem"("sourceUrl");

CREATE TABLE IF NOT EXISTS "NewsMention" (
  "id" TEXT NOT NULL,
  "newsItemId" TEXT NOT NULL,
  "mentionType" "NewsMentionType" NOT NULL,
  "label" TEXT NOT NULL,
  "confidence" "NewsConfidence" NOT NULL DEFAULT 'HIGH',
  "reason" TEXT,
  "companyId" TEXT,
  "fundId" TEXT,
  "organizationId" TEXT,
  "dealId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NewsMention_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "NewsMention"
    ADD CONSTRAINT "NewsMention_newsItemId_fkey"
    FOREIGN KEY ("newsItemId") REFERENCES "NewsItem"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "NewsMention"
    ADD CONSTRAINT "NewsMention_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "NewsMention"
    ADD CONSTRAINT "NewsMention_fundId_fkey"
    FOREIGN KEY ("fundId") REFERENCES "Fund"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "NewsMention"
    ADD CONSTRAINT "NewsMention_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "NewsMention"
    ADD CONSTRAINT "NewsMention_dealId_fkey"
    FOREIGN KEY ("dealId") REFERENCES "Deal"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsMention_newsItemId_mentionType_label_key"
  ON "NewsMention"("newsItemId", "mentionType", "label");
CREATE INDEX IF NOT EXISTS "NewsMention_newsItemId_idx" ON "NewsMention"("newsItemId");
CREATE INDEX IF NOT EXISTS "NewsMention_companyId_idx" ON "NewsMention"("companyId");
CREATE INDEX IF NOT EXISTS "NewsMention_fundId_idx" ON "NewsMention"("fundId");
CREATE INDEX IF NOT EXISTS "NewsMention_organizationId_idx" ON "NewsMention"("organizationId");
CREATE INDEX IF NOT EXISTS "NewsMention_dealId_idx" ON "NewsMention"("dealId");
CREATE INDEX IF NOT EXISTS "NewsMention_mentionType_idx" ON "NewsMention"("mentionType");
