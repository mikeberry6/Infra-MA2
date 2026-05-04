-- Align all major sector enums to the latest weekly email taxonomy.
-- Canonical display order: Power & ET, Utilities, Digital, Midstream,
-- Transportation, Social Infra.

ALTER TYPE "FundSectorEnum" RENAME TO "FundSectorEnum_old";
ALTER TYPE "CompanySector" RENAME TO "CompanySector_old";
ALTER TYPE "DealSector" RENAME TO "DealSector_old";

CREATE TYPE "FundSectorEnum" AS ENUM (
  'POWER_ET',
  'UTILITIES',
  'DIGITAL',
  'MIDSTREAM',
  'TRANSPORTATION',
  'SOCIAL_INFRA'
);

CREATE TYPE "CompanySector" AS ENUM (
  'POWER_ET',
  'UTILITIES',
  'DIGITAL',
  'MIDSTREAM',
  'TRANSPORTATION',
  'SOCIAL_INFRA'
);

CREATE TYPE "DealSector" AS ENUM (
  'POWER_ET',
  'UTILITIES',
  'DIGITAL',
  'MIDSTREAM',
  'TRANSPORTATION',
  'SOCIAL_INFRA'
);

CREATE FUNCTION map_fund_sectors_to_weekly(old_sectors "FundSectorEnum_old"[])
RETURNS "FundSectorEnum"[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    array_agg(mapped::"FundSectorEnum" ORDER BY sort_order),
    ARRAY[]::"FundSectorEnum"[]
  )
  FROM (
    SELECT DISTINCT mapped, sort_order
    FROM (
      SELECT
        CASE sector::text
          WHEN 'RENEWABLES_ENERGY_TRANSITION' THEN 'POWER_ET'
          WHEN 'POWER_GENERATION' THEN 'POWER_ET'
          WHEN 'WASTE_ENVIRONMENTAL_SERVICES' THEN 'UTILITIES'
          WHEN 'WATER' THEN 'UTILITIES'
          WHEN 'DIGITAL_INFRASTRUCTURE' THEN 'DIGITAL'
          WHEN 'COMMUNICATIONS' THEN 'DIGITAL'
          WHEN 'MIDSTREAM_ENERGY' THEN 'MIDSTREAM'
          WHEN 'LOGISTICS' THEN 'TRANSPORTATION'
          WHEN 'SOCIAL_INFRASTRUCTURE' THEN 'SOCIAL_INFRA'
          ELSE sector::text
        END AS mapped,
        CASE sector::text
          WHEN 'RENEWABLES_ENERGY_TRANSITION' THEN 1
          WHEN 'POWER_GENERATION' THEN 1
          WHEN 'POWER_ET' THEN 1
          WHEN 'WASTE_ENVIRONMENTAL_SERVICES' THEN 2
          WHEN 'WATER' THEN 2
          WHEN 'UTILITIES' THEN 2
          WHEN 'DIGITAL_INFRASTRUCTURE' THEN 3
          WHEN 'COMMUNICATIONS' THEN 3
          WHEN 'DIGITAL' THEN 3
          WHEN 'MIDSTREAM_ENERGY' THEN 4
          WHEN 'MIDSTREAM' THEN 4
          WHEN 'LOGISTICS' THEN 5
          WHEN 'TRANSPORTATION' THEN 5
          WHEN 'SOCIAL_INFRASTRUCTURE' THEN 6
          WHEN 'SOCIAL_INFRA' THEN 6
          ELSE 99
        END AS sort_order
      FROM unnest(old_sectors) AS sector
    ) mapped_sectors
  ) deduped_sectors;
$$;

ALTER TABLE "Fund"
  ALTER COLUMN "sectors" TYPE "FundSectorEnum"[]
  USING map_fund_sectors_to_weekly("sectors");

ALTER TABLE "Company"
  ALTER COLUMN "sector" TYPE "CompanySector"
  USING (
    CASE "sector"::text
      WHEN 'DIGITAL_INFRASTRUCTURE' THEN 'DIGITAL'
      WHEN 'ENERGY_TRANSITION' THEN 'POWER_ET'
      WHEN 'POWER_GENERATION' THEN 'POWER_ET'
      WHEN 'RENEWABLE_RESOURCES' THEN 'POWER_ET'
      WHEN 'MIDSTREAM_ENERGY' THEN 'MIDSTREAM'
      WHEN 'REGULATED_UTILITIES' THEN 'UTILITIES'
      WHEN 'ENVIRONMENTAL_WASTE' THEN 'UTILITIES'
      WHEN 'INFRASTRUCTURE_SERVICES' THEN 'UTILITIES'
      WHEN 'SOCIAL_INFRASTRUCTURE' THEN 'SOCIAL_INFRA'
      ELSE "sector"::text
    END
  )::"CompanySector";

ALTER TABLE "Deal"
  ALTER COLUMN "sector" TYPE "DealSector"
  USING (
    CASE
      WHEN "legacyId" = 'INF-2026-022' AND "sector"::text = 'WASTE_ES' THEN 'POWER_ET'
      WHEN "sector"::text = 'WASTE_ES' THEN 'UTILITIES'
      WHEN "sector"::text = 'SOCIAL' THEN 'SOCIAL_INFRA'
      ELSE "sector"::text
    END
  )::"DealSector";

DROP FUNCTION map_fund_sectors_to_weekly("FundSectorEnum_old"[]);

DROP TYPE "FundSectorEnum_old";
DROP TYPE "CompanySector_old";
DROP TYPE "DealSector_old";
