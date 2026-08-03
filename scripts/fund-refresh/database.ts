import { PrismaClient, type Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  FUND_REGION_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_STRATEGY_DISPLAY,
  FUND_STRUCTURE_DISPLAY,
} from "../../src/modules/shared/enum-maps";
import type { FundRefreshSnapshot } from "../../src/modules/funds/refresh-schema";
import { canonicalJson, sha256 } from "./lib";

export type FundDatabaseClient = PrismaClient;
type FundQueryClient = Pick<PrismaClient, "fund">;
type OwnershipQueryClient = Pick<PrismaClient, "ownershipPeriod">;
type FundOperationalQueryClient = Pick<PrismaClient, "fund" | "fundEvidence">;

export function assertMutationDatabaseTarget(
  environment: "validation" | "production",
  connectionString = process.env.DATABASE_URL,
) {
  if (!connectionString) throw new Error("DATABASE_URL is required for a database mutation");
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!expectedHost || !expectedDatabase) {
    throw new Error("EXPECTED_DATABASE_HOST and EXPECTED_DATABASE_NAME are required for a database mutation");
  }
  const parsed = new URL(connectionString);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const actualHost = parsed.hostname.toLowerCase();
  const actualDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (actualHost !== expectedHost || actualDatabase !== expectedDatabase) {
    throw new Error(`Database mutation target does not match the approved ${environment} host and database`);
  }
  const forbiddenHosts = [process.env.FORBIDDEN_DATABASE_HOST, process.env.FORBIDDEN_DATABASE_HOST_2]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));
  if (forbiddenHosts.includes(actualHost)) throw new Error("Database mutation target is explicitly forbidden");
  if (environment === "validation" && forbiddenHosts.length === 0) {
    throw new Error("Validation mutations require at least one explicit forbidden production host");
  }
}

export function createFundDatabaseClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) throw new Error("DATABASE_URL is required for database verification");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export interface FoundationStatus {
  ready: boolean;
  pipelineRun: boolean;
  auditEvent: boolean;
  lastVerifiedAt: boolean;
  fundEvidence: boolean;
  fundRevision: boolean;
  migrationApplied: boolean;
  failedMigrations: string[];
}

export async function checkFundRefreshFoundations(prisma: PrismaClient): Promise<FoundationStatus> {
  const objects = await prisma.$queryRaw<Array<{
    pipeline_run: boolean;
    audit_event: boolean;
    fund_evidence: boolean;
    fund_revision: boolean;
    last_verified_at: boolean;
  }>>`
    SELECT
      to_regclass('"PipelineRun"') IS NOT NULL AS pipeline_run,
      to_regclass('"AuditEvent"') IS NOT NULL AS audit_event,
      to_regclass('"FundEvidence"') IS NOT NULL AS fund_evidence,
      to_regclass('"FundRevision"') IS NOT NULL AS fund_revision,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Fund'
          AND column_name = 'lastVerifiedAt'
      ) AS last_verified_at
  `;
  let migrations: Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }> = [];
  try {
    migrations = await prisma.$queryRawUnsafe(`
      SELECT migration_name, finished_at, rolled_back_at
      FROM "_prisma_migrations"
      WHERE migration_name IN (
        '20260722030000_platform_trust_foundations',
        '20260722031500_enforce_deal_citation_gate',
        '20260722040000_fund_refresh_foundations'
      ) OR (finished_at IS NULL AND rolled_back_at IS NULL)
    `);
  } catch {
    migrations = [];
  }
  const row = objects[0];
  const applied = new Set(migrations.filter((migration) => migration.finished_at && !migration.rolled_back_at).map((migration) => migration.migration_name));
  const failedMigrations = migrations
    .filter((migration) => !migration.finished_at && !migration.rolled_back_at)
    .map((migration) => migration.migration_name);
  const migrationApplied = [
    "20260722030000_platform_trust_foundations",
    "20260722031500_enforce_deal_citation_gate",
    "20260722040000_fund_refresh_foundations",
  ].every((name) => applied.has(name));
  const status = {
    pipelineRun: Boolean(row?.pipeline_run),
    auditEvent: Boolean(row?.audit_event),
    lastVerifiedAt: Boolean(row?.last_verified_at),
    fundEvidence: Boolean(row?.fund_evidence),
    fundRevision: Boolean(row?.fund_revision),
    migrationApplied,
    failedMigrations,
  };
  return { ...status, ready: Object.values(status).every((value) => Array.isArray(value) ? value.length === 0 : value === true) };
}

const BASE_FUND_SELECT = {
  legacyId: true,
  manager: { select: { name: true } },
  fundName: true,
  ticker: true,
  investmentStrategy: true,
  size: true,
  sizeUsdMm: true,
  vintage: true,
  strategies: true,
  structure: true,
  fundStatus: true,
  sectors: true,
  regions: true,
  sourceUrls: true,
  strategyUrl: true,
} satisfies Prisma.FundSelect;

const STRUCTURED_SIZE_SELECT = {
  ...BASE_FUND_SELECT,
  sizeNativeCurrency: true,
  sizeNativeAmount: true,
  sizeBasis: true,
  sizeAsOf: true,
  sizeUsdFxRate: true,
  sizeUsdFxDate: true,
} satisfies Prisma.FundSelect;

function dateOnly(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function snapshotFromDatabaseRow(row: Record<string, any>): FundRefreshSnapshot {
  return {
    legacyId: row.legacyId,
    managerName: row.manager.name,
    fundName: row.fundName,
    ticker: row.ticker,
    investmentStrategy: row.investmentStrategy,
    size: row.size,
    sizeUsdMm: row.sizeUsdMm,
    sizeNativeCurrency: row.sizeNativeCurrency ?? null,
    sizeNativeAmount: row.sizeNativeAmount?.toString() ?? null,
    sizeBasis: row.sizeBasis ?? null,
    sizeAsOf: dateOnly(row.sizeAsOf),
    sizeUsdFxRate: row.sizeUsdFxRate?.toString() ?? null,
    sizeUsdFxDate: dateOnly(row.sizeUsdFxDate),
    vintage: row.vintage,
    strategies: row.strategies.map((value: keyof typeof FUND_STRATEGY_DISPLAY) => FUND_STRATEGY_DISPLAY[value]).sort(),
    structure: FUND_STRUCTURE_DISPLAY[row.structure as keyof typeof FUND_STRUCTURE_DISPLAY],
    fundStatus: FUND_STATUS_DISPLAY[row.fundStatus as keyof typeof FUND_STATUS_DISPLAY],
    sectors: row.sectors.map((value: keyof typeof FUND_SECTOR_DISPLAY) => FUND_SECTOR_DISPLAY[value]).sort(),
    regions: row.regions.map((value: keyof typeof FUND_REGION_DISPLAY) => FUND_REGION_DISPLAY[value]).sort(),
    sourceUrls: [...row.sourceUrls].sort(),
    strategyUrl: row.strategyUrl || null,
  } as FundRefreshSnapshot;
}

export async function fetchFundSnapshots(
  prisma: FundQueryClient,
  includeStructuredSize: boolean,
): Promise<FundRefreshSnapshot[]> {
  const rows = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: includeStructuredSize ? STRUCTURED_SIZE_SELECT : BASE_FUND_SELECT,
    orderBy: { legacyId: "asc" },
  });
  return rows.map((row) => snapshotFromDatabaseRow(row as Record<string, any>));
}

export async function fetchFundSnapshot(
  prisma: FundQueryClient,
  legacyId: string,
  includeStructuredSize: boolean,
): Promise<FundRefreshSnapshot | undefined> {
  const row = await prisma.fund.findUnique({
    where: { legacyId, status: "PUBLISHED" },
    select: includeStructuredSize ? STRUCTURED_SIZE_SELECT : BASE_FUND_SELECT,
  });
  return row ? snapshotFromDatabaseRow(row as Record<string, any>) : undefined;
}

export async function fetchFundOperationalFingerprint(
  prisma: FundOperationalQueryClient,
): Promise<string> {
  const [snapshots, operationalFunds, evidenceRows] = await Promise.all([
    fetchFundSnapshots(prisma, true),
    prisma.fund.findMany({
      where: { status: "PUBLISHED" },
      select: {
        legacyId: true,
        status: true,
        lastVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { legacyId: "asc" },
    }),
    prisma.fundEvidence.findMany({
      where: { fund: { status: "PUBLISHED" } },
      select: {
        fund: { select: { legacyId: true } },
        source: { select: { label: true, url: true, type: true } },
        supportedFields: true,
        sourceTier: true,
        scope: true,
        publishedAt: true,
        retrievedAt: true,
        confidence: true,
        evidenceLabel: true,
        pipelineRunId: true,
        createdAt: true,
      },
      orderBy: [
        { fund: { legacyId: "asc" } },
        { source: { url: "asc" } },
        { evidenceLabel: "asc" },
      ],
    }),
  ]);
  const iso = (value: Date | null) => value?.toISOString() ?? null;
  return sha256(canonicalJson({
    snapshots,
    operationalFunds: operationalFunds.map((fund) => ({
      ...fund,
      lastVerifiedAt: iso(fund.lastVerifiedAt),
      createdAt: fund.createdAt.toISOString(),
      updatedAt: fund.updatedAt.toISOString(),
    })),
    evidence: evidenceRows.map((evidence) => ({
      ...evidence,
      publishedAt: iso(evidence.publishedAt),
      retrievedAt: evidence.retrievedAt.toISOString(),
      createdAt: evidence.createdAt.toISOString(),
    })),
  }));
}

export async function fetchOwnershipFingerprint(prisma: OwnershipQueryClient): Promise<string> {
  const rows = await prisma.ownershipPeriod.findMany({
    select: {
      id: true,
      fundId: true,
      organizationId: true,
      companyId: true,
      vehicleName: true,
      stake: true,
      investmentYear: true,
      exitYear: true,
      isActive: true,
    },
    orderBy: { id: "asc" },
  });
  return sha256(canonicalJson(rows));
}
