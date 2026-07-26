import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { dataCacheKeyParts } from "@/lib/data-cache-namespace";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_CATEGORY_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { DealDetail, DealListItem } from "@/modules/shared/types";
import type { Deal as DbDeal, DealParticipant, ParticipantRole } from "@/generated/prisma/client";

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Map a DB deal + participants to the complete public detail contract.
function toDealView(
  deal: DbDeal & {
    participants: (DealParticipant & { organization: { name: string } })[];
    citations: { source: { label: string; url: string } }[];
  },
): DealDetail {
  const buyers = uniqueNames(deal.participants
    .filter((p) => p.role === "BUYER")
    .map((p) => p.displayName || p.organization.name));
  const sellers = uniqueNames(deal.participants
    .filter((p) => p.role === "SELLER")
    .map((p) => p.displayName || p.organization.name));
  const faBuyer = uniqueNames(deal.participants
    .filter((p) => p.role === "FINANCIAL_ADVISOR_BUYER")
    .map((p) => p.organization.name));
  const faSeller = uniqueNames(deal.participants
    .filter((p) => p.role === "FINANCIAL_ADVISOR_SELLER")
    .map((p) => p.organization.name));
  const laBuyer = uniqueNames(deal.participants
    .filter((p) => p.role === "LEGAL_ADVISOR_BUYER")
    .map((p) => p.organization.name));
  const laSeller = uniqueNames(deal.participants
    .filter((p) => p.role === "LEGAL_ADVISOR_SELLER")
    .map((p) => p.organization.name));

  const firstCitation = deal.citations[0];

  return {
    id: deal.legacyId,
    legacyId: deal.legacyId,
    title: deal.title,
    target: deal.target,
    buyer: buyers.join(" / ") || "N/A",
    seller: sellers.join(" / ") || "N/A",
    sellerDisclosureStatus: deal.sellerDisclosureStatus,
    sellerDisclosureReason: deal.sellerDisclosureReason,
    sector: DEAL_SECTOR_DISPLAY[deal.sector],
    subsector: deal.subsector,
    region: DEAL_REGION_DISPLAY[deal.region],
    category: deal.categories.map((c) => DEAL_CATEGORY_DISPLAY[c]),
    date: deal.date.toISOString(),
    description: deal.description,
    targetDescription: deal.targetDescription,
    sourceName: firstCitation?.source.label || "",
    sourceUrl: firstCitation?.source.url || "",
    enterpriseValue: deal.enterpriseValue,
    equityValue: deal.equityValue,
    stake: deal.stake,
    status: DEAL_STATUS_DISPLAY[deal.dealStatus],
    closingDate: deal.closingDate?.toISOString() || null,
    financialAdvisorBuyer: faBuyer.length > 0 ? faBuyer : null,
    financialAdvisorSeller: faSeller.length > 0 ? faSeller : null,
    legalAdvisorBuyer: laBuyer.length > 0 ? laBuyer : null,
    legalAdvisorSeller: laSeller.length > 0 ? laSeller : null,
    country: deal.country,
    assetScale: deal.assetScale,
    valuationMultiple: deal.valuationMultiple,
    fundVehicle: deal.fundVehicle,
    keyHighlights: deal.keyHighlights.length > 0 ? deal.keyHighlights : null,
  };
}

const DEAL_INCLUDE = {
  participants: {
    include: { organization: { select: { name: true } } },
  },
  citations: {
    where: { isPrimary: true },
    include: { source: { select: { label: true, url: true } } },
    orderBy: { id: "asc" as const },
    take: 1,
  },
} as const;

const DEAL_LIST_SELECT = {
  legacyId: true,
  title: true,
  target: true,
  sector: true,
  subsector: true,
  region: true,
  categories: true,
  date: true,
  dealStatus: true,
  country: true,
  citations: {
    where: { isPrimary: true },
    select: { source: { select: { label: true, url: true } } },
    orderBy: { id: "asc" as const },
    take: 1,
  },
  participants: {
    where: { role: { in: ["BUYER", "SELLER"] as ParticipantRole[] } },
    select: {
      role: true,
      displayName: true,
      organization: { select: { name: true } },
    },
  },
} as const;

async function getAllDealsRaw(): Promise<DealListItem[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    select: DEAL_LIST_SELECT,
    orderBy: { date: "desc" },
  });
  return deals.map((deal) => {
    const buyers = uniqueNames(deal.participants.filter((participant) => participant.role === "BUYER").map((participant) => participant.displayName || participant.organization.name));
    const sellers = uniqueNames(deal.participants.filter((participant) => participant.role === "SELLER").map((participant) => participant.displayName || participant.organization.name));
    const primarySource = deal.citations[0]?.source;
    return {
      id: deal.legacyId,
      legacyId: deal.legacyId,
      title: deal.title,
      target: deal.target,
      buyer: buyers.join(" / ") || "N/A",
      seller: sellers.join(" / ") || "N/A",
      sector: DEAL_SECTOR_DISPLAY[deal.sector],
      subsector: deal.subsector,
      region: DEAL_REGION_DISPLAY[deal.region],
      category: deal.categories.map((category) => DEAL_CATEGORY_DISPLAY[category]),
      date: deal.date.toISOString(),
      status: DEAL_STATUS_DISPLAY[deal.dealStatus],
      country: deal.country,
      sourceName: primarySource?.label ?? "",
      sourceUrl: primarySource?.url ?? "",
    };
  });
}

const getAllDealsCached = unstable_cache(
  getAllDealsRaw,
  dataCacheKeyParts("deals:all"),
  { tags: [CACHE_TAGS.deals], revalidate: CACHE_REVALIDATE_SECONDS },
);

async function getAllDealDetailsRaw(): Promise<DealDetail[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    include: DEAL_INCLUDE,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealView);
}

const getAllDealDetailsCached = unstable_cache(
  getAllDealDetailsRaw,
  dataCacheKeyParts("deals:all:detail"),
  { tags: [CACHE_TAGS.deals], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllDeals(): Promise<DealListItem[]> {
  return getAllDealsCached();
}

/** Full published projection for authenticated exports and other bulk detail consumers. */
export async function getAllDealDetails(): Promise<DealDetail[]> {
  return getAllDealDetailsCached();
}

export async function getDealById(legacyId: string): Promise<DealDetail | null> {
  const deal = await prisma.deal.findFirst({
    where: { legacyId, status: "PUBLISHED" },
    include: DEAL_INCLUDE,
  });
  return deal ? toDealView(deal) : null;
}

export async function getWeeklyDeals(anchorDate: Date): Promise<DealDetail[]> {
  const weekAgo = new Date(anchorDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const deals = await prisma.deal.findMany({
    where: {
      status: "PUBLISHED",
      date: { gte: weekAgo, lte: anchorDate },
    },
    include: DEAL_INCLUDE,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealView);
}

export async function getLatestDealDate(): Promise<Date> {
  const deal = await prisma.deal.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  return deal?.date ?? new Date();
}

export async function getDealCount(): Promise<number> {
  return prisma.deal.count({ where: { status: "PUBLISHED" } });
}
