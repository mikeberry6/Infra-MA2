import { cutoffInstant, normalizeSourceUrl, sha256Canonical } from "./sources-normalize";
import type {
  DealRegion,
  DealSector,
  ProductionDealRecord,
  ProductionSnapshot,
} from "./sources-types";

const SECTOR_DISPLAY: Record<string, DealSector> = {
  POWER_ET: "Power & ET",
  UTILITIES: "Utilities",
  DIGITAL: "Digital",
  MIDSTREAM: "Midstream",
  TRANSPORTATION: "Transportation",
  SOCIAL_INFRA: "Social Infra",
};

const REGION_DISPLAY: Record<string, DealRegion> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  MIDDLE_EAST_AFRICA: "Middle East & Africa",
  LATIN_AMERICA: "Latin America",
};

interface RawParticipant {
  role: string;
  displayName: string | null;
  organization: { name: string };
}

interface RawCitation {
  source: { label: string; url: string };
}

interface RawProductionDeal {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  sector: string;
  subsector: string;
  region: string;
  categories: string[];
  date: Date | string;
  description: string;
  country: string;
  dealStatus: string;
  fundVehicle: string | null;
  participants: RawParticipant[];
  citations: RawCitation[];
}

export interface ReadOnlyDealClient {
  deal: {
    findMany(input: unknown): Promise<RawProductionDeal[]>;
  };
}

function displayNames(rows: RawParticipant[], role: string): string {
  return rows
    .filter((row) => row.role === role)
    .map((row) => row.displayName?.trim() || row.organization.name.trim())
    .filter(Boolean)
    .filter((name, index, names) => names.indexOf(name) === index)
    .join(" / ");
}

function missingProductionSnapshot(cutoff: string, reason: string): ProductionSnapshot {
  return {
    status: "NOT_CONFIGURED",
    cutoff,
    queryContract: "PUBLISHED_DEALS_THROUGH_CUTOFF_READ_ONLY",
    recordCount: 0,
    recordsHash: sha256Canonical([]),
    records: [],
    reason,
  };
}

export async function captureProductionSnapshotFromClient(input: {
  client: ReadOnlyDealClient;
  cutoff: string;
}): Promise<ProductionSnapshot> {
  const cutoffDate = new Date(cutoffInstant(input.cutoff));
  const raw = await input.client.deal.findMany({
    where: { status: "PUBLISHED", date: { lte: cutoffDate } },
    // Keep this explicit: production can intentionally lag additive schema
    // migrations, and Prisma's default scalar selection would make a read-only
    // snapshot depend on unrelated new columns.
    select: {
      id: true,
      legacyId: true,
      title: true,
      target: true,
      sector: true,
      subsector: true,
      region: true,
      categories: true,
      date: true,
      description: true,
      country: true,
      dealStatus: true,
      fundVehicle: true,
      participants: {
        select: {
          role: true,
          displayName: true,
          organization: { select: { name: true } },
        },
      },
      citations: {
        select: { source: { select: { label: true, url: true } } },
      },
    },
    orderBy: { legacyId: "asc" },
  });

  const records: ProductionDealRecord[] = raw.map((deal) => {
    const sector = SECTOR_DISPLAY[deal.sector];
    const region = REGION_DISPLAY[deal.region];
    if (!sector || !region) throw new Error(`Unsupported production geography for ${deal.legacyId}`);
    const citationUrls = deal.citations
      .map((citation) => normalizeSourceUrl(citation.source.url))
      .filter((url): url is string => Boolean(url));

    return {
      databaseId: deal.id,
      legacyId: deal.legacyId,
      title: deal.title,
      target: deal.target,
      buyer: displayNames(deal.participants, "BUYER") || "N/A",
      seller: displayNames(deal.participants, "SELLER") || "N/A",
      sector,
      subsector: deal.subsector,
      region,
      categories: [...deal.categories],
      announcementDate: new Date(deal.date).toISOString(),
      description: deal.description,
      country: deal.country,
      sourceName: deal.citations[0]?.source.label ?? "",
      sourceUrl: citationUrls[0] ?? null,
      citationUrls,
      status: deal.dealStatus,
      fundVehicle: deal.fundVehicle,
    };
  });

  const uniqueIds = new Set(records.map((record) => record.legacyId));
  if (uniqueIds.size !== records.length) throw new Error("Production snapshot contains duplicate legacy IDs");

  return {
    status: "CAPTURED",
    cutoff: input.cutoff,
    queryContract: "PUBLISHED_DEALS_THROUGH_CUTOFF_READ_ONLY",
    recordCount: records.length,
    recordsHash: sha256Canonical(records),
    records,
    reason: null,
  };
}

export async function captureConfiguredProductionSnapshot(input: {
  cutoff: string;
  connectionString?: string;
}): Promise<ProductionSnapshot> {
  const connectionString = input.connectionString?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    return missingProductionSnapshot(input.cutoff, "DATABASE_URL is not configured; no network query was attempted.");
  }

  const [{ PrismaClient }, { PrismaNeonHttp }] = await Promise.all([
    import("../../src/generated/prisma/client"),
    import("@prisma/adapter-neon"),
  ]);
  const prisma = new PrismaClient({
    adapter: new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true }),
  });

  try {
    return await captureProductionSnapshotFromClient({
      client: prisma as unknown as ReadOnlyDealClient,
      cutoff: input.cutoff,
    });
  } finally {
    await prisma.$disconnect();
  }
}
