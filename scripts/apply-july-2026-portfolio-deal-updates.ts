/**
 * Applies the reviewed July 2026 deal-to-portfolio reconciliation.
 *
 * Safety properties:
 * - dry-run is the default and always rolls the transaction back;
 * - writes require --apply and the exact canonical manifest SHA-256;
 * - the database host and database name must both be explicitly approved;
 * - every read and write runs on one SERIALIZABLE pg transaction client;
 * - the SQL intentionally targets the deployed, pre-trust schema and does not
 *   reference Company.lastVerifiedAt, Citation.isPrimary, AuditEvent, or
 *   CompanyRedirect.
 *
 * Usage:
 *   npx tsx scripts/apply-july-2026-portfolio-deal-updates.ts
 *   npx tsx scripts/apply-july-2026-portfolio-deal-updates.ts \
 *     --apply --approval-hash=<sha256 printed by the dry run>
 */
import "dotenv/config";

import { createHash } from "node:crypto";
import { Client, type ClientBase } from "pg";
import { nanoid } from "nanoid";

type JsonObject = Record<string, unknown>;

type SourceType =
  | "ARTICLE"
  | "PRESS_RELEASE"
  | "SEC_FILING"
  | "PRESENTATION"
  | "WEBSITE"
  | "OTHER";

type CitationPurpose =
  | "COMPANY_PROFILE"
  | "OWNERSHIP_INVESTMENT"
  | "OPERATIONS_ASSETS"
  | "MILESTONE_EVENT"
  | "FINANCING_FILINGS"
  | "SUPPORTING_CONTEXT";

type MilestoneCategory =
  | "FOUNDING"
  | "ACQUISITION"
  | "FINANCING"
  | "EXPANSION"
  | "MANAGEMENT"
  | "DIVESTITURE"
  | "IPO"
  | "OTHER";

type OrgType =
  | "FUND_MANAGER"
  | "CORPORATE"
  | "ADVISOR_FINANCIAL"
  | "ADVISOR_LEGAL"
  | "SOVEREIGN_WEALTH"
  | "PENSION"
  | "OTHER";

type RecordStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
type CompanyStatus = "ACTIVE" | "REALIZED";

interface ReviewedSource {
  label: string;
  url: string;
  type: SourceType;
  purpose: CitationPurpose;
  evidenceLabel: string | null;
  dealLegacyId: string;
}

interface ReviewedMilestone {
  date: string;
  event: string;
  category: MilestoneCategory;
  sortDate: string | null;
  dealLegacyId: string;
}

interface ReviewedCompanyUpdate {
  id: string;
  name: string;
  country: string;
  status: RecordStatus;
  updatedAt: string;
  expectedCompanyStatus?: CompanyStatus;
  setCompanyStatus?: CompanyStatus;
  expectedDescriptionSha256: string;
  narrativeAppend: string;
  sources: ReviewedSource[];
  milestones: ReviewedMilestone[];
  ownershipOperations: JsonObject[];
}

interface ReviewedManifest {
  version: string;
  batch: string;
  companies: ReviewedCompanyUpdate[];
  organizationOperations: JsonObject[];
}

interface CompanyRow {
  id: string;
  name: string;
  country: string;
  status: RecordStatus;
  companyStatus: CompanyStatus;
  description: string;
  updatedAt: Date;
}

interface OrganizationRow {
  id: string;
  name: string;
  types: OrgType[];
  website: string | null;
  headquarters: string | null;
  description: string | null;
  status: RecordStatus;
}

interface PeriodRow {
  id: string;
  fundId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  companyId: string;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
}

interface PeriodState {
  fundId: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
}

interface ReceiptCounters {
  companiesValidated: number;
  descriptionsUpdated: number;
  companyStatusesUpdated: number;
  dealsValidated: number;
  sourcesInserted: number;
  sourcesReused: number;
  citationsInserted: number;
  citationsReused: number;
  milestonesInserted: number;
  milestonesReused: number;
  milestonesNormalized: number;
  organizationsInserted: number;
  organizationsUpdated: number;
  organizationsValidated: number;
  ownershipPeriodsInserted: number;
  ownershipPeriodsUpdated: number;
  ownershipPeriodsDeleted: number;
}

const SOURCE_TYPES = new Set<SourceType>([
  "ARTICLE",
  "PRESS_RELEASE",
  "SEC_FILING",
  "PRESENTATION",
  "WEBSITE",
  "OTHER",
]);
const CITATION_PURPOSES = new Set<CitationPurpose>([
  "COMPANY_PROFILE",
  "OWNERSHIP_INVESTMENT",
  "OPERATIONS_ASSETS",
  "MILESTONE_EVENT",
  "FINANCING_FILINGS",
  "SUPPORTING_CONTEXT",
]);
const MILESTONE_CATEGORIES = new Set<MilestoneCategory>([
  "FOUNDING",
  "ACQUISITION",
  "FINANCING",
  "EXPANSION",
  "MANAGEMENT",
  "DIVESTITURE",
  "IPO",
  "OTHER",
]);
const ORG_TYPES = new Set<OrgType>([
  "FUND_MANAGER",
  "CORPORATE",
  "ADVISOR_FINANCIAL",
  "ADVISOR_LEGAL",
  "SOVEREIGN_WEALTH",
  "PENSION",
  "OTHER",
]);
const RECORD_STATUSES = new Set<RecordStatus>([
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);
const COMPANY_STATUSES = new Set<CompanyStatus>(["ACTIVE", "REALIZED"]);
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function fail(message: string): never {
  throw new Error(message);
}

function asObject(value: unknown, path: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${path} must be an object`);
  }
  return value as JsonObject;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(`${path} must be an array`);
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${path} must be a non-empty string`);
  }
  return value;
}

function asTrimmedString(value: unknown, path: string): string {
  const result = asString(value, path).trim();
  if (!result) fail(`${path} must not be blank`);
  return result;
}

function asNullableString(value: unknown, path: string): string | null {
  if (value === null) return null;
  return asString(value, path);
}

function asNullableInteger(value: unknown, path: string): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value)) fail(`${path} must be an integer or null`);
  return value as number;
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(`${path} must be a boolean`);
  return value;
}

function asEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
  path: string,
): T {
  const result = asString(value, path) as T;
  if (!allowed.has(result)) fail(`${path} has unsupported value ${result}`);
  return result;
}

function optionalEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
  path: string,
): T | undefined {
  return value === undefined ? undefined : asEnum(value, allowed, path);
}

function hasOwn(value: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("Manifest contains a non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as JsonObject)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
  }
  fail(`Manifest contains unsupported ${typeof value} value`);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function newId(prefix: string): string {
  return `${prefix}_${nanoid(20)}`;
}

function option(name: string): string | undefined {
  const args = process.argv.slice(2);
  const equalsForm = args.find((argument) => argument.startsWith(`--${name}=`));
  if (equalsForm) return equalsForm.slice(name.length + 3);
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

async function resolveRawManifest(): Promise<unknown> {
  // Keep the runtime import exact while allowing this guarded runner to be
  // typechecked independently before the reviewed manifest is generated.
  const manifestModulePath = "../prisma/seed-data/july-2026-portfolio-deal-updates.ts";
  const exports = await import(manifestModulePath) as JsonObject;
  return exports.july2026PortfolioDealUpdateManifest
    ?? exports.JULY_2026_PORTFOLIO_DEAL_UPDATE_MANIFEST
    ?? exports.portfolioDealUpdateManifest
    ?? exports.default
    ?? fail("Manifest module does not export july2026PortfolioDealUpdateManifest");
}

function normalizeSource(value: unknown, path: string): ReviewedSource {
  const source = asObject(value, path);
  return {
    label: asTrimmedString(source.label, `${path}.label`),
    url: asTrimmedString(source.url, `${path}.url`),
    type: asEnum(source.type, SOURCE_TYPES, `${path}.type`),
    purpose: asEnum(source.purpose, CITATION_PURPOSES, `${path}.purpose`),
    evidenceLabel: source.evidenceLabel === undefined
      ? null
      : asNullableString(source.evidenceLabel, `${path}.evidenceLabel`),
    dealLegacyId: asTrimmedString(source.dealLegacyId, `${path}.dealLegacyId`),
  };
}

function normalizeMilestone(value: unknown, path: string): ReviewedMilestone {
  const milestone = asObject(value, path);
  const sortDate = milestone.sortDate === undefined || milestone.sortDate === null
    ? null
    : asString(milestone.sortDate, `${path}.sortDate`);
  if (sortDate !== null && Number.isNaN(Date.parse(sortDate))) {
    fail(`${path}.sortDate must be an ISO-compatible date or null`);
  }
  return {
    date: asTrimmedString(milestone.date, `${path}.date`),
    event: asTrimmedString(milestone.event, `${path}.event`),
    category: asEnum(milestone.category, MILESTONE_CATEGORIES, `${path}.category`),
    sortDate,
    dealLegacyId: asTrimmedString(milestone.dealLegacyId, `${path}.dealLegacyId`),
  };
}

function normalizeManifest(value: unknown): ReviewedManifest {
  const manifest = asObject(value, "manifest");
  const rawCompanies = asArray(manifest.companies, "manifest.companies");
  if (rawCompanies.length === 0) fail("manifest.companies must not be empty");

  const companies = rawCompanies.map((rawCompany, index): ReviewedCompanyUpdate => {
    const path = `manifest.companies[${index}]`;
    const company = asObject(rawCompany, path);
    const expectedDescriptionSha256 = asString(
      company.expectedDescriptionSha256,
      `${path}.expectedDescriptionSha256`,
    );
    if (!SHA256_PATTERN.test(expectedDescriptionSha256)) {
      fail(`${path}.expectedDescriptionSha256 must be a lowercase SHA-256`);
    }
    const updatedAt = asString(
      company.updatedAt ?? company.expectedUpdatedAt,
      `${path}.updatedAt`,
    );
    if (Number.isNaN(Date.parse(updatedAt))) fail(`${path}.updatedAt must be an ISO timestamp`);
    const sources = asArray(company.sources, `${path}.sources`)
      .map((source, sourceIndex) => normalizeSource(source, `${path}.sources[${sourceIndex}]`));
    if (sources.length === 0) fail(`${path}.sources must not be empty`);
    const milestones = asArray(company.milestones, `${path}.milestones`)
      .map((milestone, milestoneIndex) => normalizeMilestone(
        milestone,
        `${path}.milestones[${milestoneIndex}]`,
      ));
    if (milestones.length === 0) fail(`${path}.milestones must not be empty`);

    const citedDeals = new Set(sources.map((source) => source.dealLegacyId));
    for (const milestone of milestones) {
      if (!citedDeals.has(milestone.dealLegacyId)) {
        fail(`${path} milestone deal ${milestone.dealLegacyId} has no matching reviewed source citation`);
      }
    }

    const status = asEnum(company.status, RECORD_STATUSES, `${path}.status`);
    if (status !== "PUBLISHED") fail(`${path}.status must be PUBLISHED for this reviewed batch`);
    const expectedCompanyStatus = optionalEnum(
      company.expectedCompanyStatus,
      COMPANY_STATUSES,
      `${path}.expectedCompanyStatus`,
    );
    const setCompanyStatus = optionalEnum(
      company.setCompanyStatus,
      COMPANY_STATUSES,
      `${path}.setCompanyStatus`,
    );
    if (setCompanyStatus && !expectedCompanyStatus) {
      fail(`${path}.expectedCompanyStatus is required when setCompanyStatus is present`);
    }

    return {
      id: asTrimmedString(company.id, `${path}.id`),
      name: asTrimmedString(company.name, `${path}.name`),
      country: asTrimmedString(company.country, `${path}.country`),
      status,
      updatedAt,
      expectedCompanyStatus,
      setCompanyStatus,
      expectedDescriptionSha256,
      narrativeAppend: asTrimmedString(company.narrativeAppend, `${path}.narrativeAppend`),
      sources,
      milestones,
      ownershipOperations: company.ownershipOperations === undefined
        ? []
        : asArray(company.ownershipOperations, `${path}.ownershipOperations`)
            .map((operation, operationIndex) => asObject(
              operation,
              `${path}.ownershipOperations[${operationIndex}]`,
            )),
    };
  });

  const companyIds = new Set<string>();
  for (const company of companies) {
    if (companyIds.has(company.id)) fail(`Manifest repeats company id ${company.id}`);
    companyIds.add(company.id);
    const milestoneKeys = new Set<string>();
    for (const milestone of company.milestones) {
      const key = `${milestone.date}\u0000${milestone.event}`;
      if (milestoneKeys.has(key)) fail(`Manifest repeats a milestone for company ${company.id}`);
      milestoneKeys.add(key);
    }
  }

  return {
    version: String(manifest.version ?? manifest.schemaVersion ?? "1"),
    batch: asTrimmedString(manifest.batch ?? manifest.batchId, "manifest.batch"),
    companies,
    organizationOperations: manifest.organizationOperations === undefined
      ? []
      : asArray(manifest.organizationOperations, "manifest.organizationOperations")
          .map((operation, index) => asObject(operation, `manifest.organizationOperations[${index}]`)),
  };
}

function guardedConnectionString(): { connectionString: string; host: string; database: string } {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) fail("DATABASE_URL is required");
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!expectedHost) fail("EXPECTED_DATABASE_HOST is required");
  if (!expectedDatabase) fail("EXPECTED_DATABASE_NAME is required");

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    fail("DATABASE_URL is not a valid URL");
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    fail(`Unsupported database protocol ${parsed.protocol || "unknown"}`);
  }
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost) fail(`Database host ${host || "unknown"} is not the explicitly approved host`);
  if (database !== expectedDatabase) {
    fail(`Database ${database || "unknown"} is not the explicitly approved database`);
  }

  const forbiddenHosts = [
    process.env.FORBIDDEN_DATABASE_HOST,
    process.env.FORBIDDEN_DATABASE_HOST_2,
  ].map((value) => value?.trim().toLowerCase()).filter(Boolean);
  if (forbiddenHosts.includes(host)) fail("The explicitly approved database host is forbidden");
  return { connectionString, host, database };
}

function sameDate(left: Date | null, right: string | null): boolean {
  if (left === null || right === null) return left === null && right === null;
  const [year, month, day] = right.slice(0, 10).split("-").map(Number);
  return left.getFullYear() === year
    && left.getMonth() + 1 === month
    && left.getDate() === day;
}

function sameStringArrays(left: string[], right: string[]): boolean {
  return [...left].sort().join("\u0000") === [...right].sort().join("\u0000");
}

function expectedValue<T>(object: JsonObject, key: string, parse: (value: unknown, path: string) => T, path: string): T {
  if (!hasOwn(object, key)) fail(`${path}.${key} is required`);
  return parse(object[key], `${path}.${key}`);
}

function parseFullPeriodState(value: unknown, path: string): PeriodState {
  const state = asObject(value, path);
  return {
    fundId: expectedValue(state, "fundId", asNullableString, path),
    stake: expectedValue(state, "stake", asNullableString, path),
    investmentYear: expectedValue(state, "investmentYear", asNullableInteger, path),
    exitYear: expectedValue(state, "exitYear", asNullableInteger, path),
    isActive: expectedValue(state, "isActive", asBoolean, path),
  };
}

function assertPeriodInvariant(state: PeriodState, path: string): void {
  if (state.isActive && state.exitYear !== null) {
    fail(`${path} cannot be active and have an exit year`);
  }
  if (state.investmentYear !== null && state.exitYear !== null && state.exitYear < state.investmentYear) {
    fail(`${path} exit year cannot precede its investment year`);
  }
}

function assertPeriodState(actual: PeriodRow, expected: PeriodState, path: string): void {
  const mismatches: string[] = [];
  if (actual.fundId !== expected.fundId) mismatches.push("fundId");
  if (actual.stake !== expected.stake) mismatches.push("stake");
  if (actual.investmentYear !== expected.investmentYear) mismatches.push("investmentYear");
  if (actual.exitYear !== expected.exitYear) mismatches.push("exitYear");
  if (actual.isActive !== expected.isActive) mismatches.push("isActive");
  if (mismatches.length > 0) fail(`${path} ownership precondition failed for ${mismatches.join(", ")}`);
}

async function findOrganization(
  client: ClientBase,
  name: string,
  lock = true,
): Promise<OrganizationRow | null> {
  const result = await client.query<OrganizationRow>(
    `SELECT "id", "name", "types"::text[] AS "types", "website", "headquarters", "description", "status"
       FROM "Organization"
      WHERE "name" = $1
      ${lock ? "FOR UPDATE" : ""}`,
    [name],
  );
  if (result.rows.length > 1) fail(`Organization name ${name} is not unique`);
  return result.rows[0] ?? null;
}

async function applyOrganizationOperation(
  client: ClientBase,
  rawOperation: JsonObject,
  path: string,
  counters: ReceiptCounters,
): Promise<void> {
  const kind = asString(rawOperation.kind, `${path}.kind`);
  if (kind !== "upsertOrganization") fail(`${path} is not an organization operation`);
  const organizationObject = rawOperation.organization === undefined
    ? rawOperation
    : asObject(rawOperation.organization, `${path}.organization`);
  const name = asTrimmedString(
    organizationObject.name ?? rawOperation.name,
    `${path}.name`,
  );
  const expected = asObject(rawOperation.expected, `${path}.expected`);
  const expectedExists = expectedValue(expected, "exists", asBoolean, `${path}.expected`);
  const set = asObject(rawOperation.set ?? rawOperation.values, `${path}.set`);
  const actual = await findOrganization(client, name);
  if ((actual !== null) !== expectedExists) {
    fail(`${path} expected organization ${name} to ${expectedExists ? "exist" : "be absent"}`);
  }

  if (actual) {
    if (hasOwn(expected, "id") && actual.id !== asString(expected.id, `${path}.expected.id`)) {
      fail(`${path} organization id precondition failed`);
    }
    if (hasOwn(expected, "types")) {
      const expectedTypes = asArray(expected.types, `${path}.expected.types`)
        .map((value, index) => asEnum(value, ORG_TYPES, `${path}.expected.types[${index}]`));
      if (!sameStringArrays(actual.types, expectedTypes)) fail(`${path} organization types precondition failed`);
    }
    for (const key of ["website", "headquarters", "description"] as const) {
      if (hasOwn(expected, key) && actual[key] !== asNullableString(expected[key], `${path}.expected.${key}`)) {
        fail(`${path} organization ${key} precondition failed`);
      }
    }
    if (hasOwn(expected, "status") && actual.status !== asEnum(expected.status, RECORD_STATUSES, `${path}.expected.status`)) {
      fail(`${path} organization status precondition failed`);
    }
  }

  const types = hasOwn(set, "types")
    ? asArray(set.types, `${path}.set.types`)
        .map((value, index) => asEnum(value, ORG_TYPES, `${path}.set.types[${index}]`))
    : actual?.types;
  const status = hasOwn(set, "status")
    ? asEnum(set.status, RECORD_STATUSES, `${path}.set.status`)
    : actual?.status;
  if (!types || types.length === 0) fail(`${path}.set.types is required for a new organization`);
  if (!status) fail(`${path}.set.status is required for a new organization`);
  const website = hasOwn(set, "website")
    ? asNullableString(set.website, `${path}.set.website`)
    : actual?.website ?? null;
  const headquarters = hasOwn(set, "headquarters")
    ? asNullableString(set.headquarters, `${path}.set.headquarters`)
    : actual?.headquarters ?? null;
  const description = hasOwn(set, "description")
    ? asNullableString(set.description, `${path}.set.description`)
    : actual?.description ?? null;

  if (!actual) {
    await client.query(
      `INSERT INTO "Organization"
         ("id", "name", "types", "website", "headquarters", "description", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3::"OrgType"[], $4, $5, $6, $7::"RecordStatus", NOW(), NOW())`,
      [newId("org"), name, types, website, headquarters, description, status],
    );
    counters.organizationsInserted += 1;
  } else {
    const changed = !sameStringArrays(actual.types, types)
      || actual.website !== website
      || actual.headquarters !== headquarters
      || actual.description !== description
      || actual.status !== status;
    if (changed) {
      for (const key of ["types", "website", "headquarters", "description", "status"] as const) {
        if (hasOwn(set, key) && !hasOwn(expected, key)) {
          fail(`${path}.expected.${key} is required before changing an existing organization`);
        }
      }
      await client.query(
        `UPDATE "Organization"
            SET "types" = $2::"OrgType"[], "website" = $3, "headquarters" = $4,
                "description" = $5, "status" = $6::"RecordStatus", "updatedAt" = NOW()
          WHERE "id" = $1`,
        [actual.id, types, website, headquarters, description, status],
      );
      counters.organizationsUpdated += 1;
    } else {
      counters.organizationsValidated += 1;
    }
  }

  const after = await findOrganization(client, name, false);
  if (!after || !sameStringArrays(after.types, types) || after.status !== status
      || after.website !== website || after.headquarters !== headquarters
      || after.description !== description) {
    fail(`${path} organization postcondition failed`);
  }
}

async function selectPeriod(
  client: ClientBase,
  companyId: string,
  operation: JsonObject,
  path: string,
): Promise<PeriodRow | null> {
  let result;
  if (operation.periodId !== undefined) {
    const periodId = asString(operation.periodId, `${path}.periodId`);
    result = await client.query<PeriodRow>(
      `SELECT op."id", op."fundId", op."organizationId", org."name" AS "organizationName",
              op."companyId", op."vehicleName", op."stake", op."investmentYear", op."exitYear", op."isActive"
         FROM "OwnershipPeriod" op
         LEFT JOIN "Organization" org ON org."id" = op."organizationId"
        WHERE op."id" = $1
        FOR UPDATE OF op`,
      [periodId],
    );
  } else {
    const organizationName = asTrimmedString(operation.organizationName, `${path}.organizationName`);
    if (!hasOwn(operation, "vehicleName")) fail(`${path}.vehicleName is required without periodId`);
    const vehicleName = asNullableString(operation.vehicleName, `${path}.vehicleName`);
    result = await client.query<PeriodRow>(
      `SELECT op."id", op."fundId", op."organizationId", org."name" AS "organizationName",
              op."companyId", op."vehicleName", op."stake", op."investmentYear", op."exitYear", op."isActive"
         FROM "OwnershipPeriod" op
         JOIN "Organization" org ON org."id" = op."organizationId"
        WHERE op."companyId" = $1 AND org."name" = $2
          AND op."vehicleName" IS NOT DISTINCT FROM $3
        FOR UPDATE OF op`,
      [companyId, organizationName, vehicleName],
    );
  }
  if (result.rows.length > 1) fail(`${path} ownership selector matched multiple periods`);
  const row = result.rows[0] ?? null;
  if (row && row.companyId !== companyId) fail(`${path} ownership period belongs to another company`);
  return row;
}

async function verifyPeriodById(
  client: ClientBase,
  periodId: string,
  companyId: string,
  organizationName: string,
  vehicleName: string | null,
  state: PeriodState,
  path: string,
): Promise<void> {
  const result = await client.query<PeriodRow>(
    `SELECT op."id", op."fundId", op."organizationId", org."name" AS "organizationName",
            op."companyId", op."vehicleName", op."stake", op."investmentYear", op."exitYear", op."isActive"
       FROM "OwnershipPeriod" op
       LEFT JOIN "Organization" org ON org."id" = op."organizationId"
      WHERE op."id" = $1`,
    [periodId],
  );
  const actual = result.rows[0];
  if (!actual || actual.companyId !== companyId || actual.organizationName !== organizationName
      || actual.vehicleName !== vehicleName) {
    fail(`${path} ownership identity postcondition failed`);
  }
  assertPeriodState(actual, state, path);
  assertPeriodInvariant(state, path);
}

async function applyPeriodOperation(
  client: ClientBase,
  companyId: string,
  operation: JsonObject,
  path: string,
  counters: ReceiptCounters,
): Promise<void> {
  const kind = asString(operation.kind, `${path}.kind`);
  if (!["upsertPeriod", "updatePeriod", "deletePeriod"].includes(kind)) {
    fail(`${path} has unsupported ownership operation ${kind}`);
  }
  const expected = asObject(operation.expected, `${path}.expected`);
  const actual = await selectPeriod(client, companyId, operation, path);

  if (kind === "upsertPeriod") {
    const expectedExists = expectedValue(expected, "exists", asBoolean, `${path}.expected`);
    if ((actual !== null) !== expectedExists) {
      fail(`${path} expected ownership period to ${expectedExists ? "exist" : "be absent"}`);
    }
    if (actual) assertPeriodState(actual, parseFullPeriodState(expected, `${path}.expected`), path);
  } else {
    if (!actual) fail(`${path} ownership period does not exist`);
    assertPeriodState(actual, parseFullPeriodState(expected, `${path}.expected`), path);
  }

  if (hasOwn(operation, "organizationName") && actual
      && actual.organizationName !== asString(operation.organizationName, `${path}.organizationName`)) {
    fail(`${path} organization identity precondition failed`);
  }
  if (hasOwn(operation, "vehicleName") && actual
      && actual.vehicleName !== asNullableString(operation.vehicleName, `${path}.vehicleName`)) {
    fail(`${path} vehicle identity precondition failed`);
  }

  if (kind === "deletePeriod") {
    await client.query(`DELETE FROM "OwnershipPeriod" WHERE "id" = $1`, [actual!.id]);
    const after = await client.query(`SELECT 1 FROM "OwnershipPeriod" WHERE "id" = $1`, [actual!.id]);
    if (after.rows.length !== 0) fail(`${path} delete postcondition failed`);
    counters.ownershipPeriodsDeleted += 1;
    return;
  }

  const set = parseFullPeriodState(operation.set ?? operation.values, `${path}.set`);
  assertPeriodInvariant(set, `${path}.set`);
  const organizationName = asTrimmedString(
    operation.organizationName ?? actual?.organizationName,
    `${path}.organizationName`,
  );
  const organization = await findOrganization(client, organizationName, false);
  if (!organization) fail(`${path} references missing organization ${organizationName}`);
  const vehicleName = hasOwn(operation, "setVehicleName")
    ? asNullableString(operation.setVehicleName, `${path}.setVehicleName`)
    : hasOwn(operation, "vehicleName")
      ? asNullableString(operation.vehicleName, `${path}.vehicleName`)
      : actual?.vehicleName ?? null;

  let periodId: string;
  if (!actual) {
    periodId = newId("own");
    await client.query(
      `INSERT INTO "OwnershipPeriod"
         ("id", "fundId", "organizationId", "companyId", "vehicleName", "stake",
          "investmentYear", "exitYear", "isActive", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [periodId, set.fundId, organization.id, companyId, vehicleName, set.stake,
        set.investmentYear, set.exitYear, set.isActive],
    );
    counters.ownershipPeriodsInserted += 1;
  } else {
    periodId = actual.id;
    await client.query(
      `UPDATE "OwnershipPeriod"
          SET "fundId" = $2, "organizationId" = $3, "vehicleName" = $4, "stake" = $5,
              "investmentYear" = $6, "exitYear" = $7, "isActive" = $8
        WHERE "id" = $1`,
      [periodId, set.fundId, organization.id, vehicleName, set.stake,
        set.investmentYear, set.exitYear, set.isActive],
    );
    counters.ownershipPeriodsUpdated += 1;
  }
  await verifyPeriodById(
    client,
    periodId,
    companyId,
    organizationName,
    vehicleName,
    set,
    `${path}.postcondition`,
  );
}

async function resolveDeal(
  client: ClientBase,
  legacyId: string,
  cache: Map<string, string>,
): Promise<string> {
  const cached = cache.get(legacyId);
  if (cached) return cached;
  const result = await client.query<{ id: string; status: RecordStatus }>(
    `SELECT "id", "status" FROM "Deal" WHERE "legacyId" = $1 FOR SHARE`,
    [legacyId],
  );
  if (result.rows.length !== 1) fail(`Referenced deal ${legacyId} did not resolve exactly once`);
  if (result.rows[0].status !== "PUBLISHED") fail(`Referenced deal ${legacyId} is not published`);
  cache.set(legacyId, result.rows[0].id);
  return result.rows[0].id;
}

async function applySourceAndCitation(
  client: ClientBase,
  companyId: string,
  source: ReviewedSource,
  dealId: string,
  counters: ReceiptCounters,
): Promise<void> {
  const existing = await client.query<{ id: string; label: string; type: SourceType }>(
    `SELECT "id", "label", "type" FROM "Source" WHERE "url" = $1 FOR UPDATE`,
    [source.url],
  );
  if (existing.rows.length > 1) fail(`Source URL ${source.url} is not unique`);
  let sourceId: string;
  if (existing.rows[0]) {
    sourceId = existing.rows[0].id;
    counters.sourcesReused += 1;
  } else {
    sourceId = newId("src");
    await client.query(
      `INSERT INTO "Source" ("id", "label", "url", "type", "createdAt")
       VALUES ($1, $2, $3, $4::"SourceType", NOW())`,
      [sourceId, source.label, source.url, source.type],
    );
    counters.sourcesInserted += 1;
  }

  const citations = await client.query<{ id: string }>(
    `SELECT "id" FROM "Citation"
      WHERE "sourceId" = $1 AND "companyId" = $2 AND "dealId" = $3
        AND "purpose" = $4::"CitationPurpose"
        AND "evidenceLabel" IS NOT DISTINCT FROM $5
      FOR UPDATE`,
    [sourceId, companyId, dealId, source.purpose, source.evidenceLabel],
  );
  if (citations.rows.length > 0) {
    counters.citationsReused += 1;
  } else {
    await client.query(
      `INSERT INTO "Citation"
         ("id", "sourceId", "dealId", "companyId", "purpose", "evidenceLabel")
       VALUES ($1, $2, $3, $4, $5::"CitationPurpose", $6)`,
      [newId("cit"), sourceId, dealId, companyId, source.purpose, source.evidenceLabel],
    );
    counters.citationsInserted += 1;
  }

  const citationPostcondition = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS "count" FROM "Citation"
      WHERE "sourceId" = $1 AND "companyId" = $2 AND "dealId" = $3
        AND "purpose" = $4::"CitationPurpose"
        AND "evidenceLabel" IS NOT DISTINCT FROM $5`,
    [sourceId, companyId, dealId, source.purpose, source.evidenceLabel],
  );
  if (Number(citationPostcondition.rows[0]?.count ?? 0) < 1) {
    fail(`Citation postcondition failed for company ${companyId} and ${source.url}`);
  }
}

async function applyMilestone(
  client: ClientBase,
  companyId: string,
  milestone: ReviewedMilestone,
  counters: ReceiptCounters,
): Promise<void> {
  const existing = await client.query<{ id: string; category: MilestoneCategory; sortDate: Date | null }>(
    `SELECT "id", "category", "sortDate" FROM "Milestone"
      WHERE "companyId" = $1 AND "date" = $2 AND "event" = $3
      FOR UPDATE`,
    [companyId, milestone.date, milestone.event],
  );
  if (existing.rows.length > 1) {
    fail(`Exact milestone is duplicated for company ${companyId}: ${milestone.date}`);
  }
  if (!existing.rows[0]) {
    await client.query(
      `INSERT INTO "Milestone" ("id", "companyId", "date", "event", "category", "sortDate")
       VALUES ($1, $2, $3, $4, $5::"MilestoneCategory", $6::date::timestamp)`,
      [newId("mil"), companyId, milestone.date, milestone.event, milestone.category, milestone.sortDate],
    );
    counters.milestonesInserted += 1;
  } else {
    counters.milestonesReused += 1;
    const categoryMatches = existing.rows[0].category === milestone.category;
    const dateMatches = sameDate(existing.rows[0].sortDate, milestone.sortDate);
    if (!categoryMatches || !dateMatches) {
      await client.query(
        `UPDATE "Milestone" SET "category" = $2::"MilestoneCategory", "sortDate" = $3::date::timestamp
          WHERE "id" = $1`,
        [existing.rows[0].id, milestone.category, milestone.sortDate],
      );
      counters.milestonesNormalized += 1;
    }
  }

  const postcondition = await client.query<{ category: MilestoneCategory; sortDate: Date | null }>(
    `SELECT "category", "sortDate" FROM "Milestone"
      WHERE "companyId" = $1 AND "date" = $2 AND "event" = $3`,
    [companyId, milestone.date, milestone.event],
  );
  if (postcondition.rows.length !== 1
      || postcondition.rows[0].category !== milestone.category
      || !sameDate(postcondition.rows[0].sortDate, milestone.sortDate)) {
    fail(`Milestone postcondition failed for company ${companyId}: ${milestone.date}`);
  }
}

function buildReviewedDescription(existing: string, narrativeAppend: string): string {
  const base = existing.trimEnd();
  const suffix = narrativeAppend.trim();
  if (base === suffix || base.endsWith(` ${suffix}`)) return base;
  return base ? `${base} ${suffix}` : suffix;
}

async function applyCompanyUpdate(
  client: ClientBase,
  company: ReviewedCompanyUpdate,
  dealCache: Map<string, string>,
  counters: ReceiptCounters,
): Promise<{ id: string; name: string; deals: string[] }> {
  const result = await client.query<CompanyRow>(
    `SELECT "id", "name", "country", "status", "companyStatus", "description", "updatedAt"
       FROM "Company" WHERE "id" = $1 FOR UPDATE`,
    [company.id],
  );
  if (result.rows.length !== 1) fail(`Company ${company.id} did not resolve exactly once`);
  const actual = result.rows[0];
  if (actual.name !== company.name) fail(`Company ${company.id} name precondition failed`);
  if (actual.country !== company.country) fail(`Company ${company.id} country precondition failed`);
  if (actual.status !== company.status) fail(`Company ${company.id} record-status precondition failed`);
  if (actual.updatedAt.getTime() !== new Date(company.updatedAt).getTime()) {
    fail(`Company ${company.id} updatedAt precondition failed`);
  }
  if (company.expectedCompanyStatus && actual.companyStatus !== company.expectedCompanyStatus) {
    fail(`Company ${company.id} company-status precondition failed`);
  }
  if (sha256(actual.description) !== company.expectedDescriptionSha256) {
    fail(`Company ${company.id} description SHA-256 precondition failed`);
  }
  counters.companiesValidated += 1;

  const dealLegacyIds = [...new Set([
    ...company.sources.map((source) => source.dealLegacyId),
    ...company.milestones.map((milestone) => milestone.dealLegacyId),
  ])].sort();
  for (const legacyId of dealLegacyIds) await resolveDeal(client, legacyId, dealCache);

  const reviewedDescription = buildReviewedDescription(actual.description, company.narrativeAppend);
  const nextCompanyStatus = company.setCompanyStatus ?? actual.companyStatus;
  const descriptionChanged = reviewedDescription !== actual.description;
  const statusChanged = nextCompanyStatus !== actual.companyStatus;
  if (descriptionChanged || statusChanged) {
    await client.query(
      `UPDATE "Company"
          SET "description" = $2, "companyStatus" = $3::"CompanyStatus", "updatedAt" = NOW()
        WHERE "id" = $1`,
      [company.id, reviewedDescription, nextCompanyStatus],
    );
    if (descriptionChanged) counters.descriptionsUpdated += 1;
    if (statusChanged) counters.companyStatusesUpdated += 1;
  }

  for (const source of company.sources) {
    await applySourceAndCitation(
      client,
      company.id,
      source,
      await resolveDeal(client, source.dealLegacyId, dealCache),
      counters,
    );
  }
  for (const milestone of company.milestones) {
    await applyMilestone(client, company.id, milestone, counters);
  }
  for (let index = 0; index < company.ownershipOperations.length; index += 1) {
    const operation = company.ownershipOperations[index];
    const path = `company ${company.id} ownershipOperations[${index}]`;
    if (operation.kind === "upsertOrganization") {
      await applyOrganizationOperation(client, operation, path, counters);
    } else {
      await applyPeriodOperation(client, company.id, operation, path, counters);
    }
  }

  const postcondition = await client.query<CompanyRow>(
    `SELECT "id", "name", "country", "status", "companyStatus", "description", "updatedAt"
       FROM "Company" WHERE "id" = $1`,
    [company.id],
  );
  const after = postcondition.rows[0];
  if (!after || after.name !== company.name || after.country !== company.country
      || after.status !== company.status || after.companyStatus !== nextCompanyStatus
      || after.description !== reviewedDescription) {
    fail(`Company ${company.id} postcondition failed`);
  }

  return { id: company.id, name: company.name, deals: dealLegacyIds };
}

async function main(): Promise<void> {
  const apply = process.argv.slice(2).includes("--apply");
  const manifest = normalizeManifest(await resolveRawManifest());
  const manifestSha256 = sha256(canonicalJson(manifest));
  const suppliedApprovalHash = option("approval-hash");
  if (suppliedApprovalHash !== undefined && !SHA256_PATTERN.test(suppliedApprovalHash)) {
    fail("--approval-hash must be an exact lowercase SHA-256");
  }
  if (apply && !suppliedApprovalHash) fail("--apply requires --approval-hash=<exact manifest SHA-256>");
  if (suppliedApprovalHash && suppliedApprovalHash !== manifestSha256) {
    fail("--approval-hash does not match the canonical reviewed manifest SHA-256");
  }

  const target = guardedConnectionString();
  const client = new Client({ connectionString: target.connectionString });
  const counters: ReceiptCounters = {
    companiesValidated: 0,
    descriptionsUpdated: 0,
    companyStatusesUpdated: 0,
    dealsValidated: 0,
    sourcesInserted: 0,
    sourcesReused: 0,
    citationsInserted: 0,
    citationsReused: 0,
    milestonesInserted: 0,
    milestonesReused: 0,
    milestonesNormalized: 0,
    organizationsInserted: 0,
    organizationsUpdated: 0,
    organizationsValidated: 0,
    ownershipPeriodsInserted: 0,
    ownershipPeriodsUpdated: 0,
    ownershipPeriodsDeleted: 0,
  };
  let transactionOpen = false;
  try {
    await client.connect();
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    transactionOpen = true;
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '120s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [manifest.batch]);
    const targetCheck = await client.query<{ database: string; isolation: string }>(
      `SELECT current_database() AS "database",
              current_setting('transaction_isolation') AS "isolation"`,
    );
    if (targetCheck.rows[0]?.database !== target.database) fail("Connected database failed the in-transaction target check");
    if (targetCheck.rows[0]?.isolation !== "serializable") fail("Transaction is not SERIALIZABLE");

    for (let index = 0; index < manifest.organizationOperations.length; index += 1) {
      await applyOrganizationOperation(
        client,
        manifest.organizationOperations[index],
        `manifest.organizationOperations[${index}]`,
        counters,
      );
    }

    const dealCache = new Map<string, string>();
    const companies = [];
    for (const company of manifest.companies) {
      companies.push(await applyCompanyUpdate(client, company, dealCache, counters));
    }
    counters.dealsValidated = dealCache.size;

    if (apply) {
      await client.query("COMMIT");
    } else {
      await client.query("ROLLBACK");
    }
    transactionOpen = false;

    const receipt = {
      receiptVersion: 1,
      manifestVersion: manifest.version,
      batch: manifest.batch,
      manifestSha256,
      mode: apply ? "apply" : "dry-run",
      outcome: apply ? "committed" : "rolled-back",
      target: { host: target.host, database: target.database },
      counters,
      companies,
    };
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original failure; PostgreSQL will also roll back on disconnect.
      }
    }
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Portfolio update application failed"}\n`);
  process.exitCode = 1;
});
