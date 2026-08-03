import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PortCo, PortCoSource } from "../../prisma/seed-data/portco-types";
import { resolveOrgName } from "../../prisma/entity-resolution";
import {
  dedupeExactPortCoSources,
  getSourceDisplayLabel,
  inferCitationPurpose,
  inferSourceType,
} from "../../src/lib/source-utils";
import {
  finalizeProductionSnapshot,
  finalizeSeedSnapshot,
  snapshotCompanySha256,
} from "./artifacts";
import { sha256Canonical } from "./hash";
import type {
  ProductionSnapshot,
  SeedSnapshot,
  SnapshotCompany,
} from "./schema";

const execFileAsync = promisify(execFile);

const TARGET_OVERRIDE_PARAMETERS = new Set([
  "connectionstring",
  "database",
  "dbname",
  "host",
  "hostaddr",
  "options",
  "password",
  "port",
  "service",
  "schema",
  "search_path",
  "user",
  "username",
]);

const SYSTEM_DATABASES = new Set(["postgres", "template0", "template1"]);

const SECTOR_MAP: Record<PortCo["sector"], string> = {
  "Power & ET": "POWER_ET",
  Utilities: "UTILITIES",
  Digital: "DIGITAL",
  Midstream: "MIDSTREAM",
  Transportation: "TRANSPORTATION",
  "Social Infra": "SOCIAL_INFRA",
};

const REGION_MAP: Record<PortCo["region"], string> = {
  "North America": "NORTH_AMERICA",
  Europe: "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  Global: "GLOBAL",
};

export interface DatabaseTargetIdentity {
  label: string;
  fingerprint: string;
}

interface DatabaseTargetDescriptor {
  engine: "postgresql";
  hostname: string;
  port: string;
  database: string;
}

export interface ProductionRelationCounts {
  ownershipPeriods: number;
  pendingOwnershipTransactions: number;
  milestones: number;
  managementRoles: number;
  citations: number;
  redirects: number;
}

export interface ProductionCompanyRow {
  id: string;
  name: string;
  country: string;
  countryTags: string[];
  sector: string;
  subsector: string;
  region: string;
  companyStatus: string;
  status: string;
  website: string | null;
  updatedAt: Date | string;
  lastVerifiedAt: Date | string | null;
  _count: ProductionRelationCounts;
}

interface CountDelegate {
  count(args?: unknown): Promise<number>;
}

export interface ProductionSnapshotTransaction {
  $executeRawUnsafe(query: string): Promise<unknown>;
  $queryRawUnsafe(query: string): Promise<unknown>;
  company: {
    findMany(args: unknown): Promise<ProductionCompanyRow[]>;
  };
  ownershipPeriod: CountDelegate;
  pendingOwnershipTransaction?: CountDelegate;
  milestone: CountDelegate;
  managementRole: CountDelegate;
  citation: CountDelegate;
  companyRedirect: CountDelegate;
}

export interface ProductionSnapshotClient {
  $transaction<T>(
    callback: (transaction: ProductionSnapshotTransaction) => Promise<T>,
    options: { isolationLevel: "RepeatableRead"; timeout: number },
  ): Promise<T>;
}

export interface ProductionSnapshotRead {
  rows: ProductionCompanyRow[];
  totals: ProductionRelationCounts;
  pendingOwnershipTransactionsAvailable: boolean;
}

export interface ApprovedSeedAfterImageMetadata {
  company: { name: string; country: string };
  retiredCompanies: Array<{ name: string; country: string }>;
}

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function decodeDatabasePath(parsed: URL): string {
  if (parsed.pathname.startsWith("//")) {
    throw new Error("Database URL must contain exactly one path separator before the database name");
  }
  const encoded = parsed.pathname.slice(1);
  if (!encoded || /%(?:00|2f|5c)/i.test(encoded)) {
    throw new Error("Database URL contains an empty or unsafe database name");
  }
  let database: string;
  try {
    database = decodeURIComponent(encoded);
  } catch {
    throw new Error("Database URL database name contains invalid encoding");
  }
  if (!database || /[\u0000-\u001f\u007f/\\]/.test(database)) {
    throw new Error("Database URL contains an empty or unsafe database name");
  }
  if (SYSTEM_DATABASES.has(database.toLowerCase())) {
    throw new Error("System databases cannot be used for a portfolio snapshot");
  }
  return database;
}

/**
 * Resolve and verify a database target without ever returning credentials.
 * The digest intentionally excludes user, password, and non-target query
 * options so credential rotation does not change the database identity.
 */
export function databaseTargetIdentity(input: {
  connectionString: string;
  expectedHost: string;
  expectedDatabase: string;
  label: string;
}): DatabaseTargetIdentity {
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(input.label)) {
    throw new Error("Database target label must contain only letters, numbers, dot, underscore, or hyphen");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.connectionString);
  } catch {
    throw new Error("Database URL is invalid");
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Database URL must use the postgres protocol");
  }
  for (const [parameter] of parsed.searchParams) {
    if (TARGET_OVERRIDE_PARAMETERS.has(parameter.toLowerCase())) {
      throw new Error(`Database URL query parameter ${JSON.stringify(parameter)} may override the verified target`);
    }
  }

  const hostname = normalizeHost(parsed.hostname);
  const expectedHost = normalizeHost(input.expectedHost);
  const database = decodeDatabasePath(parsed);
  if (!expectedHost || !input.expectedDatabase.trim()) {
    throw new Error("Expected database host and name are required");
  }
  if (hostname !== expectedHost || database !== input.expectedDatabase.trim()) {
    throw new Error("Database URL does not match the explicitly expected host and database");
  }

  const descriptor: DatabaseTargetDescriptor = {
    engine: "postgresql",
    hostname,
    port: parsed.port || "5432",
    database,
  };
  return {
    label: input.label,
    fingerprint: sha256Canonical(descriptor),
  };
}

export function redactDatabaseError(error: unknown, connectionString: string): string {
  const raw = error instanceof Error ? error.message : String(error);
  let redacted = raw.split(connectionString).join("[REDACTED_DATABASE_URL]");
  try {
    const parsed = new URL(connectionString);
    const secrets = [
      parsed.username,
      decodeURIComponent(parsed.username || ""),
      parsed.password,
      decodeURIComponent(parsed.password || ""),
    ].filter((value) => value.length >= 3);
    for (const secret of new Set(secrets)) {
      redacted = redacted.split(secret).join("[REDACTED]");
    }
  } catch {
    // Target parsing reports its own credential-free error.
  }
  return redacted;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Snapshot row contains an invalid timestamp");
  return date.toISOString();
}

export function seedKey(name: string, country: string): string {
  return `${name.trim().toLowerCase()}|${country.trim()}`;
}

function compareSnapshotCompanies(left: SnapshotCompany, right: SnapshotCompany): number {
  return left.name.localeCompare(right.name, "en")
    || left.country.localeCompare(right.country, "en")
    || (left.id ?? "").localeCompare(right.id ?? "", "en")
    || left.seedKey.localeCompare(right.seedKey, "en");
}

function finalizeSnapshotCompany(
  input: Omit<SnapshotCompany, "companySnapshotSha256">,
): SnapshotCompany {
  return {
    ...input,
    companySnapshotSha256: snapshotCompanySha256(input),
  };
}

function sumProductionCounts(rows: readonly ProductionCompanyRow[]): ProductionRelationCounts {
  const totals: ProductionRelationCounts = {
    ownershipPeriods: 0,
    pendingOwnershipTransactions: 0,
    milestones: 0,
    managementRoles: 0,
    citations: 0,
    redirects: 0,
  };
  for (const row of rows) {
    for (const key of Object.keys(totals) as Array<keyof ProductionRelationCounts>) {
      const value = row._count[key];
      if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`Company ${row.id} has an invalid ${key} relation count`);
      }
      totals[key] += value;
    }
  }
  return totals;
}

function assertExactRelationTotals(
  rows: readonly ProductionCompanyRow[],
  totals: ProductionRelationCounts,
): void {
  const summed = sumProductionCounts(rows);
  for (const key of Object.keys(summed) as Array<keyof ProductionRelationCounts>) {
    if (!Number.isSafeInteger(totals[key]) || totals[key] < 0 || summed[key] !== totals[key]) {
      throw new Error(
        `Production ${key} count is incomplete: company counts total ${summed[key]}, table count is ${totals[key]}`,
      );
    }
  }
}

/**
 * All production reads run in one repeatable-read transaction whose first
 * statement makes PostgreSQL enforce read-only semantics.
 */
export async function readProductionSnapshot(
  client: ProductionSnapshotClient,
  options: { allowLegacySchema?: boolean } = {},
): Promise<ProductionSnapshotRead> {
  return client.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const capabilityRows = await transaction.$queryRawUnsafe(
      `SELECT to_regclass('"PendingOwnershipTransaction"')::text AS "relation"`,
    ) as Array<{ relation: string | null }>;
    const capability = Array.isArray(capabilityRows) ? capabilityRows[0] : null;
    if (!Array.isArray(capabilityRows)
      || capabilityRows.length !== 1
      || !capability
      || typeof capability !== "object"
      || !("relation" in capability)
      || (capability.relation !== null && typeof capability.relation !== "string")) {
      throw new Error("Unable to determine pending ownership transaction schema capability");
    }
    const pendingOwnershipTransactionsAvailable = capability.relation !== null;
    if (!pendingOwnershipTransactionsAvailable && !options.allowLegacySchema) {
      throw new Error(
        "PendingOwnershipTransaction table is absent; rerun with --legacy-schema only for an explicitly reviewed pre-migration baseline",
      );
    }

    const databaseRows = await transaction.company.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        countryTags: true,
        sector: true,
        subsector: true,
        region: true,
        companyStatus: true,
        status: true,
        website: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: {
          select: {
            ownershipPeriods: true,
            ...(pendingOwnershipTransactionsAvailable
              ? { pendingOwnershipTransactions: true }
              : {}),
            milestones: true,
            managementRoles: true,
            citations: true,
            redirects: true,
          },
        },
      },
      orderBy: [{ name: "asc" }, { country: "asc" }, { id: "asc" }],
    });
    const rows = databaseRows.map((row) => ({
      ...row,
      _count: {
        ...row._count,
        pendingOwnershipTransactions: pendingOwnershipTransactionsAvailable
          ? row._count.pendingOwnershipTransactions
          : 0,
      },
    }));
    if (pendingOwnershipTransactionsAvailable && !transaction.pendingOwnershipTransaction) {
      throw new Error("Prisma client does not expose the detected PendingOwnershipTransaction table");
    }
    const totals: ProductionRelationCounts = {
      ownershipPeriods: await transaction.ownershipPeriod.count(),
      pendingOwnershipTransactions: pendingOwnershipTransactionsAvailable
        ? await transaction.pendingOwnershipTransaction!.count()
        : 0,
      milestones: await transaction.milestone.count(),
      managementRoles: await transaction.managementRole.count(),
      citations: await transaction.citation.count({ where: { companyId: { not: null } } }),
      redirects: await transaction.companyRedirect.count(),
    };
    assertExactRelationTotals(rows, totals);
    return { rows, totals, pendingOwnershipTransactionsAvailable };
  }, { isolationLevel: "RepeatableRead", timeout: 120_000 });
}

export function buildProductionSnapshot(input: {
  asOfDate: string;
  capturedAt: string;
  target: DatabaseTargetIdentity;
  read: ProductionSnapshotRead;
}): ProductionSnapshot {
  assertExactRelationTotals(input.read.rows, input.read.totals);
  const targetLabelTokens = input.target.label.toLowerCase().split(/[._-]/);
  if (!input.read.pendingOwnershipTransactionsAvailable
    && !targetLabelTokens.includes("legacy")) {
    throw new Error(
      "A pre-migration snapshot target label must visibly include legacy",
    );
  }
  const companies = input.read.rows.map((row) => finalizeSnapshotCompany({
    id: row.id,
    seedKey: seedKey(row.name, row.country),
    name: row.name,
    country: row.country,
    countryTags: [...row.countryTags].sort((left, right) => left.localeCompare(right, "en")),
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    companyStatus: row.companyStatus as SnapshotCompany["companyStatus"],
    recordStatus: row.status as SnapshotCompany["recordStatus"],
    website: row.website,
    updatedAt: iso(row.updatedAt),
    lastVerifiedAt: row.lastVerifiedAt === null ? null : iso(row.lastVerifiedAt),
    relationCounts: { ...row._count },
  })).sort(compareSnapshotCompanies);

  return finalizeProductionSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
    asOfDate: input.asOfDate,
    capturedAt: input.capturedAt,
    readOnly: true,
    databaseTargetLabel: input.target.label,
    databaseTargetFingerprint: input.target.fingerprint,
    companies,
  });
}

function ownersFor(company: PortCo): NonNullable<PortCo["owners"]> {
  return company.owners?.length
    ? company.owners
    : [{
      investmentFirm: company.investmentFirm,
      ownershipVehicle: company.ownershipVehicle,
      investmentYear: company.investmentYear,
      status: company.status,
    }];
}

function exactOwnershipCount(company: PortCo): number {
  return new Set(ownersFor(company).map((owner) => {
    const vehicle = owner.ownershipVehicle || owner.investmentFirm;
    return `${resolveOrgName(owner.investmentFirm)}\u0000${vehicle}`;
  })).size;
}

function exactMilestoneCount(company: PortCo): number {
  return new Set((company.milestones ?? []).map((milestone) =>
    `${milestone.date}\u0000${milestone.event}`)).size;
}

function exactManagementCount(company: PortCo): number {
  return new Set((company.management ?? []).map((role) =>
    `${role.name}\u0000${role.title}`)).size;
}

function citationKey(source: PortCoSource): string {
  const sourceType = inferSourceType(source);
  const purpose = inferCitationPurpose(source);
  const evidenceLabel = source.evidenceLabel
    || getSourceDisplayLabel({ ...source, purpose, type: sourceType });
  return `${source.url}\u0000${purpose}\u0000${evidenceLabel}`;
}

function exactCitationCount(company: PortCo): number {
  const { kept } = dedupeExactPortCoSources(company.sources ?? []);
  return new Set(kept.filter((source) => Boolean(source.url)).map(citationKey)).size;
}

function redirectCountsByCanonical(
  afterImages: readonly ApprovedSeedAfterImageMetadata[],
): Map<string, number> {
  const result = new Map<string, number>();
  const retiredKeys = new Set<string>();
  for (const afterImage of afterImages) {
    const canonicalKey = seedKey(afterImage.company.name, afterImage.company.country);
    for (const retired of afterImage.retiredCompanies) {
      const retiredKey = seedKey(retired.name, retired.country);
      if (retiredKeys.has(retiredKey)) {
        throw new Error(`Approved seed overlays retire ${retiredKey} more than once`);
      }
      retiredKeys.add(retiredKey);
      result.set(canonicalKey, (result.get(canonicalKey) ?? 0) + 1);
    }
  }
  return result;
}

export function buildSeedSnapshot(input: {
  asOfDate: string;
  capturedAt: string;
  baseCommit: string;
  evaluatedFrom?: string;
  companies: readonly PortCo[];
  approvedAfterImages: readonly ApprovedSeedAfterImageMetadata[];
}): SeedSnapshot {
  const redirects = redirectCountsByCanonical(input.approvedAfterImages);
  const companies = input.companies.map((company) => {
    const companySeedKey = seedKey(company.name, company.country);
    return finalizeSnapshotCompany({
      id: null,
      seedKey: companySeedKey,
      name: company.name,
      country: company.country,
      countryTags: [...company.countryTags].sort((left, right) => left.localeCompare(right, "en")),
      sector: SECTOR_MAP[company.sector],
      subsector: company.subsector,
      region: REGION_MAP[company.region],
      companyStatus: company.status === "Active" ? "ACTIVE" : "REALIZED",
      recordStatus: "PUBLISHED",
      website: company.website ?? null,
      updatedAt: null,
      lastVerifiedAt: null,
      relationCounts: {
        ownershipPeriods: exactOwnershipCount(company),
        pendingOwnershipTransactions: 0,
        milestones: exactMilestoneCount(company),
        managementRoles: exactManagementCount(company),
        citations: exactCitationCount(company),
        redirects: redirects.get(companySeedKey) ?? 0,
      },
    });
  }).sort(compareSnapshotCompanies);

  const knownKeys = new Set(companies.map((company) => company.seedKey));
  for (const key of redirects.keys()) {
    if (!knownKeys.has(key)) {
      throw new Error(`Approved seed overlay canonical company ${key} is absent from evaluated seed data`);
    }
  }

  return finalizeSeedSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_SEED_SNAPSHOT",
    asOfDate: input.asOfDate,
    capturedAt: input.capturedAt,
    baseCommit: input.baseCommit,
    evaluatedFrom: input.evaluatedFrom ?? "prisma/seed-data/companies.ts",
    companies,
  });
}

export async function currentGitCommit(repoRoot: string): Promise<string> {
  const { stdout } = await execFileAsync("git", ["rev-parse", "--verify", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const commit = stdout.trim();
  if (!/^[a-f0-9]{40}$/i.test(commit)) throw new Error("Unable to resolve a full Git commit for seed provenance");
  return commit;
}
