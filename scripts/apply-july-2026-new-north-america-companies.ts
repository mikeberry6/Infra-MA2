/**
 * Guarded, additive loader for the 17 North American companies identified in
 * the July 21, 2026 deal reconciliation.
 *
 * Safety properties:
 * - rollback is the default;
 * - writes require --apply and the exact reviewed manifest SHA-256;
 * - host and database must be explicitly approved through environment guards;
 * - all work runs in one SERIALIZABLE transaction under an advisory lock;
 * - the SQL targets the deployed pre-trust schema and feature-detects
 *   Citation.isPrimary rather than assuming the latest Prisma migration state;
 * - existing exact rows are validated and reused; canonical conflicts or
 *   partial/drifted records fail closed.
 */
import "dotenv/config";

import { createHash } from "node:crypto";
import { Client } from "pg";

import {
  july2026NewNorthAmericaCompanyRecords as records,
  type July2026NewNorthAmericaCompanyRecord,
  type July2026OwnerOrganizationType,
} from "../prisma/seed-data/july-2026-new-north-america-companies";
import type { PortCoMilestone, PortCoOwner, PortCoSource } from "../prisma/seed-data/portco-types";

type DbCompanySector = "POWER_ET" | "UTILITIES" | "DIGITAL" | "MIDSTREAM" | "TRANSPORTATION" | "SOCIAL_INFRA";
type DbCompanyRegion = "NORTH_AMERICA" | "EUROPE" | "ASIA_PACIFIC" | "LATIN_AMERICA" | "GLOBAL";
type DbMilestoneCategory = "FOUNDING" | "ACQUISITION" | "FINANCING" | "EXPANSION" | "MANAGEMENT" | "DIVESTITURE" | "IPO" | "OTHER";
type DbSourceType = "ARTICLE" | "PRESS_RELEASE" | "SEC_FILING" | "PRESENTATION" | "WEBSITE" | "OTHER";
type DbCitationPurpose = "COMPANY_PROFILE" | "OWNERSHIP_INVESTMENT" | "OPERATIONS_ASSETS" | "MILESTONE_EVENT" | "FINANCING_FILINGS" | "SUPPORTING_CONTEXT";

interface CompanyRow {
  id: string;
  name: string;
  sector: DbCompanySector;
  subsector: string;
  region: DbCompanyRegion;
  country: string;
  countryTags: string[] | null;
  description: string;
  companyStatus: string;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  status: string;
}

interface OrganizationRow {
  id: string;
  name: string;
  types: string[] | null;
  status: string;
}

interface OwnershipRow {
  id: string;
  fundId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
}

interface DealRow {
  id: string;
  legacyId: string;
  status: string;
  target: string;
  dealStatus: string;
}

interface Counters {
  companiesInserted: number;
  companiesReused: number;
  organizationsInserted: number;
  organizationsReused: number;
  ownershipPeriodsInserted: number;
  ownershipPeriodsReused: number;
  sourcesInserted: number;
  sourcesReused: number;
  legacySourceMetadataAccepted: number;
  citationsInserted: number;
  citationsReused: number;
  milestonesInserted: number;
  milestonesReused: number;
}

const BATCH = "july-2026-new-north-america-companies";
const MANIFEST_VERSION = "2026-07-22.1";
const REVIEWED_MANIFEST = { batch: BATCH, version: MANIFEST_VERSION, records };
const MANIFEST_SHA256 = createHash("sha256").update(JSON.stringify(REVIEWED_MANIFEST)).digest("hex");

const COMPANY_SECTORS: Record<string, DbCompanySector> = {
  "Power & ET": "POWER_ET",
  Utilities: "UTILITIES",
  Digital: "DIGITAL",
  Midstream: "MIDSTREAM",
  Transportation: "TRANSPORTATION",
  "Social Infra": "SOCIAL_INFRA",
};

const COMPANY_REGIONS: Record<string, DbCompanyRegion> = {
  "North America": "NORTH_AMERICA",
  Europe: "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  Global: "GLOBAL",
};

const MILESTONE_CATEGORIES: Record<PortCoMilestone["category"], DbMilestoneCategory> = {
  Founding: "FOUNDING",
  Acquisition: "ACQUISITION",
  Financing: "FINANCING",
  Expansion: "EXPANSION",
  Management: "MANAGEMENT",
  Divestiture: "DIVESTITURE",
  IPO: "IPO",
  Other: "OTHER",
};

const counters: Counters = {
  companiesInserted: 0,
  companiesReused: 0,
  organizationsInserted: 0,
  organizationsReused: 0,
  ownershipPeriodsInserted: 0,
  ownershipPeriodsReused: 0,
  sourcesInserted: 0,
  sourcesReused: 0,
  legacySourceMetadataAccepted: 0,
  citationsInserted: 0,
  citationsReused: 0,
  milestonesInserted: 0,
  milestonesReused: 0,
};

function fail(message: string): never {
  throw new Error(message);
}

function stableId(kind: string, identity: string): string {
  const digest = createHash("sha256").update(`${BATCH}\u0000${kind}\u0000${identity}`).digest("hex").slice(0, 24);
  return `j26_${kind}_${digest}`;
}

function canonicalName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nullableString(value: string | undefined): string | null {
  return value ?? null;
}

function nullableNumber(value: number | undefined): number | null {
  return value ?? null;
}

function sameStrings(first: readonly string[] | null, second: readonly string[]): boolean {
  return JSON.stringify(first ?? []) === JSON.stringify(second);
}

function parseArgs(): { apply: boolean; approvalHash: string | null } {
  const apply = process.argv.includes("--apply");
  const hashArg = process.argv.find((arg) => arg.startsWith("--approval-hash="));
  const approvalHash = hashArg?.slice("--approval-hash=".length) ?? null;
  if (apply && approvalHash !== MANIFEST_SHA256) {
    fail(`Apply requires --approval-hash=${MANIFEST_SHA256}`);
  }
  if (!apply && approvalHash) fail("--approval-hash is only valid with --apply");
  return { apply, approvalHash };
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
  if (!host || !database || host !== expectedHost || database !== expectedDatabase) {
    fail(`Database target guard failed (resolved ${host}/${database})`);
  }
  if (["postgres", "template0", "template1"].includes(database.toLowerCase())) {
    fail(`Refusing broad/system database target ${database}`);
  }
  return { connectionString, host, database };
}

function parseMilestoneSortDate(date: string): string {
  const yearOnly = date.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  const monthNames: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
  };
  const monthYear = date.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = monthNames[monthYear[1].toLowerCase()];
    if (!month) fail(`Unsupported milestone month: ${date}`);
    return `${monthYear[2]}-${String(month).padStart(2, "0")}-01`;
  }
  const fullDate = date.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (fullDate) {
    const month = monthNames[fullDate[1].toLowerCase()];
    if (!month) fail(`Unsupported milestone month: ${date}`);
    return `${fullDate[3]}-${String(month).padStart(2, "0")}-${String(Number(fullDate[2])).padStart(2, "0")}`;
  }
  fail(`Unsupported milestone date: ${date}`);
}

function sourceType(sourceItem: PortCoSource): DbSourceType {
  const value = sourceItem.type ?? "ARTICLE";
  if (!["ARTICLE", "PRESS_RELEASE", "SEC_FILING", "PRESENTATION", "WEBSITE", "OTHER"].includes(value)) {
    fail(`Unsupported source type ${value}: ${sourceItem.url}`);
  }
  return value as DbSourceType;
}

function citationPurpose(sourceItem: PortCoSource): DbCitationPurpose {
  const value = sourceItem.purpose ?? "SUPPORTING_CONTEXT";
  if (!["COMPANY_PROFILE", "OWNERSHIP_INVESTMENT", "OPERATIONS_ASSETS", "MILESTONE_EVENT", "FINANCING_FILINGS", "SUPPORTING_CONTEXT"].includes(value)) {
    fail(`Unsupported citation purpose ${value}: ${sourceItem.url}`);
  }
  return value as DbCitationPurpose;
}

function validateManifest(): void {
  if (records.length !== 17) fail(`Expected 17 records, found ${records.length}`);
  if (records.filter((record) => record.transactionState === "CURRENT").length !== 9) fail("Expected nine current transactions");
  if (records.filter((record) => record.transactionState === "PENDING").length !== 8) fail("Expected eight pending transactions");
  if (new Set(records.map((record) => record.dealLegacyId)).size !== 16) fail("Expected 16 distinct deal IDs");
  if (records.flatMap((record) => record.dealSourceUrls).length !== 17) fail("Expected 17 deal-linked company citations");

  const exactKeys = new Set<string>();
  const canonicalKeys = new Set<string>();
  for (const record of records) {
    const { portco } = record;
    const exactKey = `${portco.name}\u0000${portco.country}`;
    const canonicalKey = canonicalName(portco.name);
    if (exactKeys.has(exactKey) || canonicalKeys.has(canonicalKey)) fail(`Duplicate manifest company: ${portco.name}`);
    exactKeys.add(exactKey);
    canonicalKeys.add(canonicalKey);

    if (portco.status !== "Active" || portco.region !== "North America") fail(`Invalid status/region for ${portco.name}`);
    if (!COMPANY_SECTORS[portco.sector] || !COMPANY_REGIONS[portco.region]) fail(`Invalid enum mapping for ${portco.name}`);
    if (!portco.description.trim() || !portco.sources?.length || !portco.milestones?.length || !portco.owners?.length) {
      fail(`Incomplete company specification: ${portco.name}`);
    }
    if (portco.investmentFirm !== portco.owners[0].investmentFirm
        || portco.ownershipVehicle !== portco.owners[0].ownershipVehicle
        || (portco.investmentYear ?? null) !== (portco.owners[0].investmentYear ?? null)) {
      fail(`Primary owner fields are not aligned for ${portco.name}`);
    }
    for (const ownerItem of portco.owners) {
      if ((ownerItem.status === "Active" && ownerItem.exitYear !== undefined)
          || (ownerItem.status === "Realized" && ownerItem.exitYear === undefined)
          || (ownerItem.investmentYear !== undefined && ownerItem.exitYear !== undefined
            && ownerItem.exitYear < ownerItem.investmentYear)) {
        fail(`Invalid owner lifecycle for ${portco.name}/${ownerItem.investmentFirm}`);
      }
      if (!record.ownerOrganizationTypes[ownerItem.investmentFirm]) fail(`Missing organization type for ${portco.name}/${ownerItem.investmentFirm}`);
      if (record.forbiddenIncomingOrganizations.includes(ownerItem.investmentFirm)) fail(`Pending buyer is modeled as an owner for ${portco.name}`);
      if (record.transactionState === "PENDING" && ownerItem.investmentYear === 2026) {
        fail(`Pending company seller was assigned a synthetic 2026 investment year: ${portco.name}`);
      }
    }
    if (record.transactionState === "PENDING" && record.forbiddenIncomingOrganizations.length === 0) fail(`Pending record lacks buyer guard: ${portco.name}`);
    if (record.transactionState === "CURRENT" && record.forbiddenIncomingOrganizations.length !== 0) fail(`Current record has buyer guard: ${portco.name}`);

    const sourceUrls = new Set(portco.sources.map((item) => item.url));
    if (sourceUrls.size !== portco.sources.length) fail(`Duplicate source URL within ${portco.name}`);
    for (const url of record.dealSourceUrls) if (!sourceUrls.has(url)) fail(`Deal source missing from ${portco.name}: ${url}`);
    for (const item of portco.sources) {
      new URL(item.url);
      sourceType(item);
      citationPurpose(item);
      if (!item.evidenceLabel?.trim()) fail(`Source lacks evidence label for ${portco.name}: ${item.url}`);
    }

    const displayCategory = Object.entries(MILESTONE_CATEGORIES)
      .find(([, dbValue]) => dbValue === record.transactionMilestone.category)?.[0];
    if (!portco.milestones.some((item) => item.date === record.transactionMilestone.date
        && item.event === record.transactionMilestone.event && item.category === displayCategory)) {
      fail(`Transaction milestone is not present in seed record: ${portco.name}`);
    }
    if (parseMilestoneSortDate(record.transactionMilestone.date) !== record.transactionMilestone.sortDate) {
      fail(`Transaction milestone sort date mismatch: ${portco.name}`);
    }
  }
}

async function assertSchema(client: Client): Promise<{ hasCitationIsPrimary: boolean }> {
  const required: Record<string, string[]> = {
    Company: ["id", "name", "sector", "subsector", "region", "country", "countryTags", "description", "companyStatus", "website", "yearFounded", "headquarters", "status", "updatedAt"],
    Organization: ["id", "name", "types", "status", "updatedAt"],
    OwnershipPeriod: ["id", "fundId", "organizationId", "companyId", "vehicleName", "stake", "investmentYear", "exitYear", "isActive"],
    Milestone: ["id", "companyId", "date", "event", "category", "sortDate"],
    Source: ["id", "label", "url", "type"],
    Citation: ["id", "sourceId", "dealId", "companyId", "purpose", "evidenceLabel"],
    Deal: ["id", "legacyId", "status", "target", "dealStatus"],
  };
  const result = await client.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ANY($1)`,
    [Object.keys(required)],
  );
  const available = new Map<string, Set<string>>();
  for (const row of result.rows) {
    if (!available.has(row.table_name)) available.set(row.table_name, new Set());
    available.get(row.table_name)!.add(row.column_name);
  }
  for (const [table, columns] of Object.entries(required)) {
    for (const column of columns) if (!available.get(table)?.has(column)) fail(`Required deployed column is missing: ${table}.${column}`);
  }
  return { hasCitationIsPrimary: available.get("Citation")?.has("isPrimary") ?? false };
}

async function loadDeals(client: Client): Promise<Map<string, DealRow>> {
  const legacyIds = [...new Set(records.map((record) => record.dealLegacyId))];
  const result = await client.query<DealRow>(
    `SELECT "id", "legacyId", "status"::text, "target", "dealStatus"::text FROM "Deal" WHERE "legacyId" = ANY($1)`,
    [legacyIds],
  );
  if (result.rows.length !== legacyIds.length) {
    const found = new Set(result.rows.map((row) => row.legacyId));
    fail(`Missing reviewed deals: ${legacyIds.filter((id) => !found.has(id)).join(", ")}`);
  }
  const byLegacyId = new Map<string, DealRow>();
  for (const row of result.rows) {
    if (row.status !== "PUBLISHED") fail(`Deal is not published: ${row.legacyId}`);
    if (byLegacyId.has(row.legacyId)) fail(`Duplicate deal legacy ID: ${row.legacyId}`);
    byLegacyId.set(row.legacyId, row);
  }
  return byLegacyId;
}

function assertCompanyMatches(row: CompanyRow, record: July2026NewNorthAmericaCompanyRecord): void {
  const company = record.portco;
  const failures = [
    row.name !== company.name && "name",
    row.sector !== COMPANY_SECTORS[company.sector] && "sector",
    row.subsector !== company.subsector && "subsector",
    row.region !== COMPANY_REGIONS[company.region] && "region",
    row.country !== company.country && "country",
    !sameStrings(row.countryTags, company.countryTags) && "countryTags",
    row.description !== company.description && "description",
    row.companyStatus !== "ACTIVE" && "companyStatus",
    row.website !== nullableString(company.website) && "website",
    row.yearFounded !== nullableNumber(company.yearFounded) && "yearFounded",
    row.headquarters !== nullableString(company.headquarters) && "headquarters",
    row.status !== "PUBLISHED" && "status",
  ].filter(Boolean);
  if (failures.length) fail(`Existing company drift for ${company.name}: ${failures.join(", ")}`);
}

async function ensureCompany(client: Client, record: July2026NewNorthAmericaCompanyRecord): Promise<CompanyRow> {
  const company = record.portco;
  const result = await client.query<CompanyRow>(
    `SELECT "id", "name", "sector"::text, "subsector", "region"::text, "country", "countryTags",
            "description", "companyStatus"::text, "website", "yearFounded", "headquarters", "status"::text
       FROM "Company"
      WHERE lower(regexp_replace("name", '[^a-zA-Z0-9]', '', 'g')) = $1`,
    [canonicalName(company.name)],
  );
  if (result.rows.length > 1) fail(`Canonical company identity is duplicated: ${company.name}`);
  if (result.rows.length === 1) {
    assertCompanyMatches(result.rows[0], record);
    counters.companiesReused += 1;
    return result.rows[0];
  }

  const id = stableId("company", `${company.name}\u0000${company.country}`);
  const inserted = await client.query<CompanyRow>(
    `INSERT INTO "Company"
      ("id", "name", "sector", "subsector", "region", "country", "countryTags", "description",
       "companyStatus", "website", "yearFounded", "headquarters", "status", "updatedAt")
     VALUES ($1, $2, $3::"CompanySector", $4, $5::"CompanyRegion", $6, $7::text[], $8,
       'ACTIVE'::"CompanyStatus", $9, $10, $11, 'PUBLISHED'::"RecordStatus", CURRENT_TIMESTAMP)
     RETURNING "id", "name", "sector"::text, "subsector", "region"::text, "country", "countryTags",
       "description", "companyStatus"::text, "website", "yearFounded", "headquarters", "status"::text`,
    [id, company.name, COMPANY_SECTORS[company.sector], company.subsector, COMPANY_REGIONS[company.region],
      company.country, company.countryTags, company.description, nullableString(company.website),
      nullableNumber(company.yearFounded), nullableString(company.headquarters)],
  );
  counters.companiesInserted += 1;
  return inserted.rows[0];
}

async function ensureOrganization(
  client: Client,
  name: string,
  organizationType: July2026OwnerOrganizationType,
): Promise<OrganizationRow> {
  const result = await client.query<OrganizationRow>(
    `SELECT "id", "name", "types"::text[], "status"::text FROM "Organization" WHERE "name" = $1`,
    [name],
  );
  if (result.rows.length > 1) fail(`Organization name is duplicated: ${name}`);
  if (result.rows.length === 1) {
    const row = result.rows[0];
    if (row.status !== "PUBLISHED" || !row.types?.includes(organizationType)) {
      fail(`Existing organization drift for ${name}`);
    }
    counters.organizationsReused += 1;
    return row;
  }
  const inserted = await client.query<OrganizationRow>(
    `INSERT INTO "Organization" ("id", "name", "types", "status", "updatedAt")
     VALUES ($1, $2, ARRAY[$3]::"OrgType"[], 'PUBLISHED'::"RecordStatus", CURRENT_TIMESTAMP)
     RETURNING "id", "name", "types"::text[], "status"::text`,
    [stableId("org", name), name, organizationType],
  );
  counters.organizationsInserted += 1;
  return inserted.rows[0];
}

function assertOwnershipMatches(row: OwnershipRow, ownerItem: PortCoOwner, companyName: string): void {
  const failures = [
    row.fundId !== null && "fundId",
    row.vehicleName !== ownerItem.ownershipVehicle && "vehicleName",
    row.stake !== nullableString(ownerItem.stake) && "stake",
    row.investmentYear !== nullableNumber(ownerItem.investmentYear) && "investmentYear",
    row.exitYear !== nullableNumber(ownerItem.exitYear) && "exitYear",
    row.isActive !== (ownerItem.status === "Active") && "isActive",
  ].filter(Boolean);
  if (failures.length) fail(`Ownership drift for ${companyName}/${ownerItem.investmentFirm}: ${failures.join(", ")}`);
}

async function ensureOwnerships(
  client: Client,
  record: July2026NewNorthAmericaCompanyRecord,
  companyId: string,
): Promise<void> {
  const expectedKeys = new Set<string>();
  for (const ownerItem of record.portco.owners ?? []) {
    const org = await ensureOrganization(client, ownerItem.investmentFirm, record.ownerOrganizationTypes[ownerItem.investmentFirm]);
    const key = `${org.id}\u0000${ownerItem.ownershipVehicle}`;
    expectedKeys.add(key);
    const result = await client.query<OwnershipRow>(
      `SELECT op."id", op."fundId", op."organizationId", org."name" AS "organizationName", op."vehicleName",
              op."stake", op."investmentYear", op."exitYear", op."isActive"
         FROM "OwnershipPeriod" op
         LEFT JOIN "Organization" org ON org."id" = op."organizationId"
        WHERE op."companyId" = $1 AND op."organizationId" = $2 AND op."vehicleName" = $3`,
      [companyId, org.id, ownerItem.ownershipVehicle],
    );
    if (result.rows.length > 1) fail(`Ownership selector is duplicated: ${record.portco.name}/${ownerItem.investmentFirm}`);
    if (result.rows.length === 1) {
      assertOwnershipMatches(result.rows[0], ownerItem, record.portco.name);
      counters.ownershipPeriodsReused += 1;
      continue;
    }
    await client.query(
      `INSERT INTO "OwnershipPeriod"
        ("id", "fundId", "organizationId", "companyId", "vehicleName", "stake", "investmentYear", "exitYear", "isActive")
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)`,
      [stableId("owner", `${companyId}\u0000${org.id}\u0000${ownerItem.ownershipVehicle}`), org.id, companyId,
        ownerItem.ownershipVehicle, nullableString(ownerItem.stake), nullableNumber(ownerItem.investmentYear),
        nullableNumber(ownerItem.exitYear), ownerItem.status === "Active"],
    );
    counters.ownershipPeriodsInserted += 1;
  }

  const all = await client.query<OwnershipRow>(
    `SELECT op."id", op."fundId", op."organizationId", org."name" AS "organizationName", op."vehicleName",
            op."stake", op."investmentYear", op."exitYear", op."isActive"
       FROM "OwnershipPeriod" op LEFT JOIN "Organization" org ON org."id" = op."organizationId"
      WHERE op."companyId" = $1`,
    [companyId],
  );
  for (const row of all.rows) {
    const key = `${row.organizationId}\u0000${row.vehicleName ?? ""}`;
    if (!expectedKeys.has(key)) fail(`Unexpected ownership period for ${record.portco.name}: ${row.organizationName ?? row.id}`);
  }
  if (all.rows.length !== expectedKeys.size) fail(`Ownership count mismatch for ${record.portco.name}`);
}

async function ensureMilestones(client: Client, record: July2026NewNorthAmericaCompanyRecord, companyId: string): Promise<void> {
  for (const item of record.portco.milestones ?? []) {
    const category = MILESTONE_CATEGORIES[item.category];
    const sortDate = parseMilestoneSortDate(item.date);
    const result = await client.query<{ id: string; category: string; sortDate: string | null }>(
      `SELECT "id", "category"::text, to_char("sortDate", 'YYYY-MM-DD') AS "sortDate"
         FROM "Milestone" WHERE "companyId" = $1 AND "date" = $2 AND "event" = $3`,
      [companyId, item.date, item.event],
    );
    if (result.rows.length > 1) fail(`Milestone is duplicated for ${record.portco.name}: ${item.date}`);
    if (result.rows.length === 1) {
      if (result.rows[0].category !== category || result.rows[0].sortDate !== sortDate) {
        fail(`Milestone drift for ${record.portco.name}: ${item.date}`);
      }
      counters.milestonesReused += 1;
      continue;
    }
    await client.query(
      `INSERT INTO "Milestone" ("id", "companyId", "date", "event", "category", "sortDate")
       VALUES ($1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp)`,
      [stableId("milestone", `${companyId}\u0000${item.date}\u0000${item.event}`), companyId, item.date, item.event, category, sortDate],
    );
    counters.milestonesInserted += 1;
  }
}

async function ensureSource(client: Client, item: PortCoSource): Promise<string> {
  const result = await client.query<{ id: string; label: string; type: string }>(
    `SELECT "id", "label", "type"::text FROM "Source" WHERE "url" = $1`,
    [item.url],
  );
  if (result.rows.length > 1) fail(`Source URL is duplicated: ${item.url}`);
  if (result.rows.length === 1) {
    const row = result.rows[0];
    const expectedType = sourceType(item);
    const isBatchSource = row.id === stableId("source", item.url);
    const legacyTypeCompatible = row.type === expectedType
      || (row.type === "ARTICLE" && expectedType === "PRESS_RELEASE");
    if (!row.label.trim() || (isBatchSource
      ? row.label !== item.label || row.type !== expectedType
      : !legacyTypeCompatible)) {
      fail(`Existing source metadata drift: ${item.url}`);
    }
    if (!isBatchSource && (row.label !== item.label || row.type !== expectedType)) {
      counters.legacySourceMetadataAccepted += 1;
    }
    counters.sourcesReused += 1;
    return row.id;
  }
  const inserted = await client.query<{ id: string }>(
    `INSERT INTO "Source" ("id", "label", "url", "type") VALUES ($1, $2, $3, $4::"SourceType") RETURNING "id"`,
    [stableId("source", item.url), item.label, item.url, sourceType(item)],
  );
  counters.sourcesInserted += 1;
  return inserted.rows[0].id;
}

async function ensureCitations(
  client: Client,
  record: July2026NewNorthAmericaCompanyRecord,
  companyId: string,
  dealId: string,
  hasCitationIsPrimary: boolean,
): Promise<void> {
  for (const item of record.portco.sources ?? []) {
    const sourceId = await ensureSource(client, item);
    const linkedDealId = record.dealSourceUrls.includes(item.url) ? dealId : null;
    const purpose = citationPurpose(item);
    const evidenceLabel = item.evidenceLabel ?? null;
    const existing = await client.query<{ id: string }>(
      `SELECT "id" FROM "Citation"
        WHERE "sourceId" = $1 AND "companyId" = $2 AND "dealId" IS NOT DISTINCT FROM $3
          AND "purpose" = $4::"CitationPurpose" AND "evidenceLabel" IS NOT DISTINCT FROM $5`,
      [sourceId, companyId, linkedDealId, purpose, evidenceLabel],
    );
    if (existing.rows.length > 1) fail(`Citation is duplicated for ${record.portco.name}: ${item.url}`);
    if (existing.rows.length === 1) {
      counters.citationsReused += 1;
      continue;
    }
    const id = stableId("citation", `${sourceId}\u0000${companyId}\u0000${linkedDealId ?? ""}\u0000${purpose}\u0000${evidenceLabel ?? ""}`);
    // Match prisma/seed.ts: the first company source is the primary citation.
    const isPrimary = item.url === record.portco.sources?.[0]?.url;
    if (hasCitationIsPrimary) {
      await client.query(
        `INSERT INTO "Citation" ("id", "sourceId", "dealId", "companyId", "isPrimary", "purpose", "evidenceLabel")
         VALUES ($1, $2, $3, $4, $5, $6::"CitationPurpose", $7)`,
        [id, sourceId, linkedDealId, companyId, isPrimary, purpose, evidenceLabel],
      );
    } else {
      await client.query(
        `INSERT INTO "Citation" ("id", "sourceId", "dealId", "companyId", "purpose", "evidenceLabel")
         VALUES ($1, $2, $3, $4, $5::"CitationPurpose", $6)`,
        [id, sourceId, linkedDealId, companyId, purpose, evidenceLabel],
      );
    }
    counters.citationsInserted += 1;
  }
}

async function assertForbiddenBuyers(client: Client, record: July2026NewNorthAmericaCompanyRecord, companyId: string): Promise<void> {
  for (const name of record.forbiddenIncomingOrganizations) {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod" op
        JOIN "Organization" org ON org."id" = op."organizationId"
       WHERE op."companyId" = $1 AND org."name" = $2`,
      [companyId, name],
    );
    if (Number(result.rows[0]?.count ?? 0) !== 0) fail(`Pending buyer was prematurely applied to ${record.portco.name}: ${name}`);
  }
}

async function main(): Promise<void> {
  validateManifest();
  const options = parseArgs();
  const target = guardedTarget();
  const client = new Client({ connectionString: target.connectionString });
  const companyIds: string[] = [];
  let beforeCount = 0;
  let afterCount = 0;
  let hasCitationIsPrimary = false;

  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '90s'");
    await client.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [BATCH]);
    ({ hasCitationIsPrimary } = await assertSchema(client));

    const before = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS "count" FROM "Company"`);
    beforeCount = Number(before.rows[0]?.count ?? 0);
    const deals = await loadDeals(client);

    for (const record of records) {
      const deal = deals.get(record.dealLegacyId);
      if (!deal) fail(`Deal lookup failed: ${record.dealLegacyId}`);
      const company = await ensureCompany(client, record);
      companyIds.push(company.id);
      await ensureOwnerships(client, record, company.id);
      await ensureMilestones(client, record, company.id);
      await ensureCitations(client, record, company.id, deal.id, hasCitationIsPrimary);
      await assertForbiddenBuyers(client, record, company.id);
    }

    const affected = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "Company" WHERE "id" = ANY($1) AND "status" = 'PUBLISHED' AND "companyStatus" = 'ACTIVE'`,
      [companyIds],
    );
    if (Number(affected.rows[0]?.count ?? 0) !== 17 || new Set(companyIds).size !== 17) fail("Affected-company postcondition failed");

    const lifecycle = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod"
        WHERE "companyId" = ANY($1)
          AND (("isActive" AND "exitYear" IS NOT NULL)
            OR (NOT "isActive" AND "exitYear" IS NULL)
            OR ("investmentYear" IS NOT NULL AND "exitYear" IS NOT NULL AND "exitYear" < "investmentYear"))`,
      [companyIds],
    );
    if (Number(lifecycle.rows[0]?.count ?? 0) !== 0) fail("Ownership lifecycle postcondition failed");

    const after = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS "count" FROM "Company"`);
    afterCount = Number(after.rows[0]?.count ?? 0);
    if (afterCount - beforeCount !== counters.companiesInserted) fail("Company-count delta postcondition failed");

    if (options.apply) await client.query("COMMIT");
    else await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  console.log(JSON.stringify({
    batch: BATCH,
    manifestVersion: MANIFEST_VERSION,
    manifestSha256: MANIFEST_SHA256,
    mode: options.apply ? "APPLIED" : "DRY_RUN_ROLLED_BACK",
    target: { host: target.host, database: target.database },
    coverage: { companies: records.length, current: 9, pending: 8, deals: 16, dealLinkedCitations: 17 },
    schema: { citationIsPrimary: hasCitationIsPrimary },
    companyCount: { before: beforeCount, withinTransactionAfter: afterCount },
    counters,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
