-- Extend NewsItem for the monitoring pipeline review queue.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsCategory') THEN
    ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'PORTFOLIO_COMPANY_NEWS';
    ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'INVESTMENT_FIRM_NEWS';
    ALTER TYPE "NewsCategory" ADD VALUE IF NOT EXISTS 'LOW_CONFIDENCE_NEEDS_REVIEW';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public."NewsItem"') IS NOT NULL THEN
    ALTER TABLE "NewsItem"
      ADD COLUMN IF NOT EXISTS "linkedinUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  END IF;
END $$;
