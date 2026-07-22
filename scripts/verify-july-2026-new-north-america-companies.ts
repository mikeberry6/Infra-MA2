/** Read-only verification for the July 2026 North American company additions. */
import "dotenv/config";

import { createHash } from "node:crypto";
import { Client } from "pg";

import { companies as seedCompanies } from "../prisma/seed-data/companies";
import {
  july2026NewNorthAmericaCompanyRecords as records,
  type July2026NewNorthAmericaCompanyRecord,
} from "../prisma/seed-data/july-2026-new-north-america-companies";
import type { PortCoMilestone, PortCoOwner } from "../prisma/seed-data/portco-types";

const BATCH = "july-2026-new-north-america-companies";

const COMPANY_SECTORS: Record<string, string> = {
  "Power & ET": "POWER_ET",
  Utilities: "UTILITIES",
  Digital: "DIGITAL",
  Midstream: "MIDSTREAM",
  Transportation: "TRANSPORTATION",
  "Social Infra": "SOCIAL_INFRA",
};

const COMPANY_REGIONS: Record<string, string> = {
  "North America": "NORTH_AMERICA",
  Europe: "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  Global: "GLOBAL",
};

const MILESTONE_CATEGORIES: Record<PortCoMilestone["category"], string> = {
  Founding: "FOUNDING",
  Acquisition: "ACQUISITION",
  Financing: "FINANCING",
  Expansion: "EXPANSION",
  Management: "MANAGEMENT",
  Divestiture: "DIVESTITURE",
  IPO: "IPO",
  Other: "OTHER",
};

interface CompanyRow {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[] | null;
  description: string;
  companyStatus: string;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  status: string;
}

interface OwnershipRow {
  fundId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
}

function fail(message: string): never {
  throw new Error(message);
}

function guardedTarget(): { connectionString: string; host: string; database: string } {
  const connectionString = process.env.DATABASE_URL;
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!connectionString || !expectedHost || !expectedDatabase) {
    fail("DATABASE_URL, EXPECTED_DATABASE_HOST, and EXPECTED_DATABASE_NAME are required");
  }
  const parsed = new URL(connectionString);
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost || database !== expectedDatabase) fail("Database target guard failed");
  return { connectionString, host, database };
}

function canonicalName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stableId(kind: string, identity: string): string {
  const digest = createHash("sha256").update(`${BATCH}\u0000${kind}\u0000${identity}`).digest("hex").slice(0, 24);
  return `j26_${kind}_${digest}`;
}

function nullableString(value: string | undefined): string | null {
  return value ?? null;
}

function nullableNumber(value: number | undefined): number | null {
  return value ?? null;
}

function parseMilestoneSortDate(date: string): string {
  const yearOnly = date.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;
  const months: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
  };
  const monthYear = date.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = months[monthYear[1].toLowerCase()];
    if (!month) fail(`Unsupported milestone date ${date}`);
    return `${monthYear[2]}-${String(month).padStart(2, "0")}-01`;
  }
  const full = date.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!full) fail(`Unsupported milestone date ${date}`);
  const month = months[full[1].toLowerCase()];
  if (!month) fail(`Unsupported milestone date ${date}`);
  return `${full[3]}-${String(month).padStart(2, "0")}-${String(Number(full[2])).padStart(2, "0")}`;
}

function assertCompany(row: CompanyRow, record: July2026NewNorthAmericaCompanyRecord): void {
  const expected = record.portco;
  const failures = [
    row.name !== expected.name && "name",
    row.sector !== COMPANY_SECTORS[expected.sector] && "sector",
    row.subsector !== expected.subsector && "subsector",
    row.region !== COMPANY_REGIONS[expected.region] && "region",
    row.country !== expected.country && "country",
    JSON.stringify(row.countryTags ?? []) !== JSON.stringify(expected.countryTags) && "countryTags",
    row.description !== expected.description && "description",
    row.companyStatus !== "ACTIVE" && "companyStatus",
    row.website !== nullableString(expected.website) && "website",
    row.yearFounded !== nullableNumber(expected.yearFounded) && "yearFounded",
    row.headquarters !== nullableString(expected.headquarters) && "headquarters",
    row.status !== "PUBLISHED" && "status",
  ].filter(Boolean);
  if (failures.length) fail(`Company postcondition failed for ${expected.name}: ${failures.join(", ")}`);
}

function assertOwner(row: OwnershipRow, expected: PortCoOwner, companyName: string): void {
  const failures = [
    row.organizationName !== expected.investmentFirm && "organizationName",
    row.fundId !== null && "fundId",
    row.vehicleName !== expected.ownershipVehicle && "vehicleName",
    row.stake !== nullableString(expected.stake) && "stake",
    row.investmentYear !== nullableNumber(expected.investmentYear) && "investmentYear",
    row.exitYear !== nullableNumber(expected.exitYear) && "exitYear",
    row.isActive !== (expected.status === "Active") && "isActive",
  ].filter(Boolean);
  if (failures.length) fail(`Owner postcondition failed for ${companyName}/${expected.investmentFirm}: ${failures.join(", ")}`);
}

function assertSeedParity(record: July2026NewNorthAmericaCompanyRecord): void {
  const expected = record.portco;
  const matches = seedCompanies.filter((company) => company.name === expected.name && company.country === expected.country);
  if (matches.length !== 1) fail(`Seed identity does not resolve exactly once: ${expected.name}`);
  const actual = matches[0];
  const scalarKeys = [
    "investmentFirm", "sector", "subsector", "region", "country", "ownershipVehicle", "description",
    "status", "website", "yearFounded", "investmentYear", "headquarters",
  ] as const;
  for (const key of scalarKeys) {
    if ((actual[key] ?? null) !== (expected[key] ?? null)) fail(`Seed ${key} drift for ${expected.name}`);
  }
  if (JSON.stringify(actual.countryTags) !== JSON.stringify(expected.countryTags)
      || JSON.stringify(actual.owners ?? []) !== JSON.stringify(expected.owners ?? [])
      || JSON.stringify(actual.milestones ?? []) !== JSON.stringify(expected.milestones ?? [])
      || JSON.stringify(actual.sources ?? []) !== JSON.stringify(expected.sources ?? [])) {
    fail(`Seed nested-data drift for ${expected.name}`);
  }
}

async function main(): Promise<void> {
  if (records.length !== 17
      || records.filter((record) => record.transactionState === "CURRENT").length !== 9
      || records.filter((record) => record.transactionState === "PENDING").length !== 8
      || new Set(records.map((record) => record.dealLegacyId)).size !== 16) {
    fail("Manifest coverage invariant failed");
  }
  const target = guardedTarget();
  const client = new Client({ connectionString: target.connectionString });
  const companyIds: string[] = [];
  let ownerCount = 0;
  let milestoneCount = 0;
  let citationCount = 0;
  let dealLinkedCitationCount = 0;
  let companyTotal = 0;
  let legacySourceMetadataAccepted = 0;

  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await client.query("SET LOCAL statement_timeout = '90s'");

    const total = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS "count" FROM "Company"`);
    companyTotal = Number(total.rows[0]?.count ?? 0);
    if (companyTotal < records.length) fail("Company table count is invalid");

    const expectedDealIds = [...new Set(records.map((record) => record.dealLegacyId))];
    const dealResult = await client.query<{ legacyId: string; status: string }>(
      `SELECT "legacyId", "status"::text FROM "Deal" WHERE "legacyId" = ANY($1)`,
      [expectedDealIds],
    );
    if (dealResult.rows.length !== 16 || new Set(dealResult.rows.map((row) => row.legacyId)).size !== 16
        || dealResult.rows.some((row) => row.status !== "PUBLISHED")) {
      fail("Published deal coverage invariant failed");
    }

    for (const record of records) {
      assertSeedParity(record);
      const companyResult = await client.query<CompanyRow>(
        `SELECT "id", "name", "sector"::text, "subsector", "region"::text, "country", "countryTags",
                "description", "companyStatus"::text, "website", "yearFounded", "headquarters", "status"::text
           FROM "Company"
          WHERE lower(regexp_replace("name", '[^a-zA-Z0-9]', '', 'g')) = $1`,
        [canonicalName(record.portco.name)],
      );
      if (companyResult.rows.length !== 1) fail(`Canonical identity count failed for ${record.portco.name}`);
      const company = companyResult.rows[0];
      assertCompany(company, record);
      companyIds.push(company.id);

      const ownerships = await client.query<OwnershipRow>(
        `SELECT op."fundId", org."name" AS "organizationName", op."vehicleName", op."stake",
                op."investmentYear", op."exitYear", op."isActive"
           FROM "OwnershipPeriod" op LEFT JOIN "Organization" org ON org."id" = op."organizationId"
          WHERE op."companyId" = $1`,
        [company.id],
      );
      const expectedOwners = record.portco.owners ?? [];
      if (ownerships.rows.length !== expectedOwners.length) fail(`Ownership count failed for ${record.portco.name}`);
      for (const expectedOwner of expectedOwners) {
        const candidates = ownerships.rows.filter((row) => row.organizationName === expectedOwner.investmentFirm
          && row.vehicleName === expectedOwner.ownershipVehicle);
        if (candidates.length !== 1) fail(`Owner selector failed for ${record.portco.name}/${expectedOwner.investmentFirm}`);
        assertOwner(candidates[0], expectedOwner, record.portco.name);
        ownerCount += 1;
      }

      for (const forbidden of record.forbiddenIncomingOrganizations) {
        const result = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod" op
            JOIN "Organization" org ON org."id" = op."organizationId"
           WHERE op."companyId" = $1 AND org."name" = $2`,
          [company.id, forbidden],
        );
        if (Number(result.rows[0]?.count ?? 0) !== 0) fail(`Pending buyer was applied to ${record.portco.name}: ${forbidden}`);
      }

      for (const item of record.portco.milestones ?? []) {
        const result = await client.query<{ category: string; sortDate: string | null }>(
          `SELECT "category"::text, to_char("sortDate", 'YYYY-MM-DD') AS "sortDate"
             FROM "Milestone" WHERE "companyId" = $1 AND "date" = $2 AND "event" = $3`,
          [company.id, item.date, item.event],
        );
        if (result.rows.length !== 1 || result.rows[0].category !== MILESTONE_CATEGORIES[item.category]
            || result.rows[0].sortDate !== parseMilestoneSortDate(item.date)) {
          fail(`Milestone postcondition failed for ${record.portco.name}: ${item.date}`);
        }
        milestoneCount += 1;
      }

      for (const item of record.portco.sources ?? []) {
        const isDealLinked = record.dealSourceUrls.includes(item.url);
        const result = await client.query<{
          sourceId: string;
          sourceLabel: string;
          sourceType: string;
          purpose: string;
          evidenceLabel: string | null;
          legacyId: string | null;
        }>(
          `SELECT s."id" AS "sourceId", s."label" AS "sourceLabel", s."type"::text AS "sourceType",
                  c."purpose"::text, c."evidenceLabel", d."legacyId"
             FROM "Citation" c JOIN "Source" s ON s."id" = c."sourceId"
             LEFT JOIN "Deal" d ON d."id" = c."dealId"
            WHERE c."companyId" = $1 AND s."url" = $2
              AND (($3::boolean AND d."legacyId" = $4) OR (NOT $3::boolean AND c."dealId" IS NULL))
              AND c."purpose" = $5::"CitationPurpose" AND c."evidenceLabel" IS NOT DISTINCT FROM $6`,
          [company.id, item.url, isDealLinked, record.dealLegacyId, item.purpose ?? "SUPPORTING_CONTEXT", item.evidenceLabel ?? null],
        );
        if (result.rows.length !== 1) fail(`Citation postcondition failed for ${record.portco.name}: ${item.url}`);
        const sourceRow = result.rows[0];
        const expectedType = item.type ?? "ARTICLE";
        const isBatchSource = sourceRow.sourceId === stableId("source", item.url);
        const legacyTypeCompatible = sourceRow.sourceType === expectedType
          || (sourceRow.sourceType === "ARTICLE" && expectedType === "PRESS_RELEASE");
        if (!sourceRow.sourceLabel.trim() || (isBatchSource
          ? sourceRow.sourceLabel !== item.label || sourceRow.sourceType !== expectedType
          : !legacyTypeCompatible)) {
          fail(`Source metadata postcondition failed for ${record.portco.name}: ${item.url}`);
        }
        if (!isBatchSource && (sourceRow.sourceLabel !== item.label || sourceRow.sourceType !== expectedType)) {
          legacySourceMetadataAccepted += 1;
        }
        citationCount += 1;
        if (isDealLinked) dealLinkedCitationCount += 1;
      }
    }

    const expectedOwnerCount = records.flatMap((record) => record.portco.owners ?? []).length;
    const expectedMilestoneCount = records.flatMap((record) => record.portco.milestones ?? []).length;
    const expectedCitationCount = records.flatMap((record) => record.portco.sources ?? []).length;
    if (new Set(companyIds).size !== 17 || ownerCount !== expectedOwnerCount || milestoneCount !== expectedMilestoneCount
        || citationCount !== expectedCitationCount || dealLinkedCitationCount !== 17) {
      fail("Aggregate coverage postcondition failed");
    }

    const lifecycle = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod"
        WHERE "companyId" = ANY($1)
          AND (("isActive" AND "exitYear" IS NOT NULL)
            OR (NOT "isActive" AND "exitYear" IS NULL)
            OR ("investmentYear" IS NOT NULL AND "exitYear" IS NOT NULL AND "exitYear" < "investmentYear"))`,
      [companyIds],
    );
    if (Number(lifecycle.rows[0]?.count ?? 0) !== 0) fail("Ownership lifecycle invariant failed");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  console.log(JSON.stringify({
    status: "VERIFIED",
    target: { host: target.host, database: target.database },
    companyTableTotal: companyTotal,
    companies: records.length,
    currentTransactions: 9,
    pendingTransactions: 8,
    deals: 16,
    ownershipPeriods: ownerCount,
    milestones: milestoneCount,
    citations: citationCount,
    dealLinkedCitations: dealLinkedCitationCount,
    legacySourceMetadataAccepted,
    seedParity: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
