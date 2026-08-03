import "dotenv/config";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../../src/generated/prisma/client";
import {
  canonicalManager,
  managerAliases,
  managerNameMatches,
} from "./lib";
import { repoSnapshotSchema, type PortfolioCensusRepoSnapshot } from "./schema";

export type SnapshotMode = "auto" | "database" | "seed";

const COMPANY_REGION_DISPLAY: Record<string, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  LATIN_AMERICA: "Latin America",
  GLOBAL: "Global",
};

const COMPANY_SECTOR_DISPLAY: Record<string, string> = {
  POWER_ET: "Power & ET",
  UTILITIES: "Utilities",
  DIGITAL: "Digital",
  MIDSTREAM: "Midstream",
  TRANSPORTATION: "Transportation",
  SOCIAL_INFRA: "Social Infra",
};

interface SeedOwner {
  investmentFirm: string;
  ownershipVehicle: string;
  investmentYear?: number;
  exitYear?: number;
  stake?: string;
  status: "Active" | "Realized";
}

interface SeedCompany {
  name: string;
  investmentFirm: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[];
  ownershipVehicle: string;
  status: "Active" | "Realized";
  website?: string;
  investmentYear?: number;
  headquarters?: string;
  owners?: SeedOwner[];
  sources?: Array<{ url: string }>;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => !!value?.trim()).map((value) => value.trim()))];
}

function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function buildSnapshot(input: Omit<PortfolioCensusRepoSnapshot, "schemaVersion" | "artifactType">) {
  return repoSnapshotSchema.parse({
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_REPO_SNAPSHOT",
    ...input,
  });
}

async function databaseSnapshot(
  requestedManager: string,
  asOfDate: string,
): Promise<PortfolioCensusRepoSnapshot> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const adapter = new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter });
  const aliases = managerAliases(requestedManager);

  try {
    const companies = await prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        country: true,
        countryTags: true,
        region: true,
        sector: true,
        subsector: true,
        companyStatus: true,
        website: true,
        headquarters: true,
        ownershipPeriods: {
          select: {
            vehicleName: true,
            stake: true,
            investmentYear: true,
            exitYear: true,
            isActive: true,
            organization: { select: { name: true } },
            fund: {
              select: {
                fundName: true,
                manager: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        citations: {
          select: { source: { select: { url: true } } },
          orderBy: { id: "asc" },
        },
      },
      orderBy: [{ name: "asc" }, { country: "asc" }],
    });

    const matchingCompanies = companies.flatMap((company) => {
      const ownerships = company.ownershipPeriods.map((ownership) => {
        const investmentFirm = ownership.organization?.name || ownership.fund?.manager.name || "Unknown";
        const fundManagerName = ownership.fund?.manager.name ?? null;
        return {
          investmentFirm,
          fundManagerName,
          vehicle: ownership.vehicleName || ownership.fund?.fundName || "",
          investmentYear: ownership.investmentYear,
          exitYear: ownership.exitYear,
          stake: ownership.stake,
          isActive: ownership.isActive,
          managerMatch:
            managerNameMatches(investmentFirm, aliases)
            || managerNameMatches(fundManagerName, aliases),
        };
      });
      if (!ownerships.some((ownership) => ownership.managerMatch)) return [];

      return [{
        repoCompanyId: company.id,
        name: company.name,
        country: company.country,
        countryTags: company.countryTags,
        region: COMPANY_REGION_DISPLAY[company.region] || company.region,
        sector: COMPANY_SECTOR_DISPLAY[company.sector] || company.sector,
        subsector: company.subsector,
        companyStatus: company.companyStatus,
        website: safeUrl(company.website),
        headquarters: company.headquarters,
        ownerships,
        sourceUrls: uniqueStrings(company.citations.map((citation) => safeUrl(citation.source.url))),
      }];
    });

    return buildSnapshot({
      asOfDate,
      requestedManager,
      canonicalManager: canonicalManager(requestedManager),
      aliases,
      source: "DATABASE",
      generatedAt: new Date().toISOString(),
      sourceNote: "Read-only snapshot of published Company and OwnershipPeriod records from the configured Prisma database.",
      companies: matchingCompanies,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function seedSnapshot(
  requestedManager: string,
  asOfDate: string,
  sourceNote = "DATABASE_URL was unavailable; evaluated Prisma seed data was used as the explicit fallback.",
): Promise<PortfolioCensusRepoSnapshot> {
  const seedModulePath = "../../prisma/seed-data/companies.ts";
  const { companies } = await import(seedModulePath) as { companies: SeedCompany[] };
  const aliases = managerAliases(requestedManager);

  const matchingCompanies = companies.flatMap((company) => {
    const sourceOwners = company.owners?.length
      ? company.owners
      : [{
          investmentFirm: company.investmentFirm,
          ownershipVehicle: company.ownershipVehicle,
          investmentYear: company.investmentYear,
          exitYear: undefined,
          stake: undefined,
          status: company.status,
        }];

    const ownerships = sourceOwners.map((ownership) => ({
      investmentFirm: ownership.investmentFirm,
      fundManagerName: null,
      vehicle: ownership.ownershipVehicle,
      investmentYear: ownership.investmentYear ?? null,
      exitYear: ownership.exitYear ?? null,
      stake: ownership.stake ?? null,
      isActive: ownership.status === "Active",
      managerMatch: managerNameMatches(ownership.investmentFirm, aliases),
    }));
    if (!ownerships.some((ownership) => ownership.managerMatch)) return [];

    return [{
      repoCompanyId: null,
      name: company.name,
      country: company.country,
      countryTags: company.countryTags,
      region: company.region,
      sector: company.sector,
      subsector: company.subsector,
      companyStatus: company.status.toUpperCase() as "ACTIVE" | "REALIZED",
      website: safeUrl(company.website),
      headquarters: company.headquarters ?? null,
      ownerships,
      sourceUrls: uniqueStrings(company.sources?.map((source) => safeUrl(source.url)) ?? []),
    }];
  });

  return buildSnapshot({
    asOfDate,
    requestedManager,
    canonicalManager: canonicalManager(requestedManager),
    aliases,
    source: "SEED_FALLBACK",
    generatedAt: new Date().toISOString(),
    sourceNote,
    companies: matchingCompanies,
  });
}

export async function loadRepoSnapshot(input: {
  requestedManager: string;
  asOfDate: string;
  mode?: SnapshotMode;
}): Promise<PortfolioCensusRepoSnapshot> {
  const mode = input.mode ?? "auto";
  if (mode === "database") {
    return databaseSnapshot(input.requestedManager, input.asOfDate);
  }
  if (mode === "seed") {
    return seedSnapshot(
      input.requestedManager,
      input.asOfDate,
      "Seed fallback was explicitly selected for prompt generation.",
    );
  }
  if (!process.env.DATABASE_URL) {
    return seedSnapshot(input.requestedManager, input.asOfDate);
  }

  try {
    return await databaseSnapshot(input.requestedManager, input.asOfDate);
  } catch {
    return seedSnapshot(
      input.requestedManager,
      input.asOfDate,
      "The configured Prisma database snapshot failed; evaluated seed data was used as the explicit fallback.",
    );
  }
}
