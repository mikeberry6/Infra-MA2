import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { dataCacheKeyParts } from "@/lib/data-cache-namespace";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  DEAL_CATEGORY_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_SECTOR_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type {
  DealDetail,
  DealListItem,
  DetailResponse,
} from "@/modules/shared/types";

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const DEAL_PARTICIPANT_SELECT = {
  role: true,
  displayName: true,
  organization: { select: { name: true } },
} satisfies Prisma.DealParticipantSelect;

const DEAL_PRIMARY_CITATION_SELECT = {
  source: { select: { label: true, url: true } },
} satisfies Prisma.CitationSelect;

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
  participants: {
    where: { role: { in: ["BUYER", "SELLER"] } },
    select: DEAL_PARTICIPANT_SELECT,
    orderBy: { id: "asc" },
  },
  citations: {
    where: { isPrimary: true },
    select: DEAL_PRIMARY_CITATION_SELECT,
    orderBy: { id: "asc" },
    take: 1,
  },
} satisfies Prisma.DealSelect;

const DEAL_DETAIL_INCLUDE = {
  participants: {
    select: DEAL_PARTICIPANT_SELECT,
    orderBy: { id: "asc" },
  },
  citations: {
    where: { isPrimary: true },
    select: DEAL_PRIMARY_CITATION_SELECT,
    orderBy: { id: "asc" },
    take: 1,
  },
  _count: { select: { citations: true } },
} satisfies Prisma.DealInclude;

type DealListRow = Prisma.DealGetPayload<{ select: typeof DEAL_LIST_SELECT }>;
type DealDetailRow = Prisma.DealGetPayload<{ include: typeof DEAL_DETAIL_INCLUDE }>;

function participantNames(
  participants: DealDetailRow["participants"],
  role: DealDetailRow["participants"][number]["role"],
): string[] {
  return uniqueNames(
    participants
      .filter((participant) => participant.role === role)
      .map((participant) => participant.displayName || participant.organization.name),
  );
}

function toDealListItem(deal: DealListRow): DealListItem {
  const buyers = participantNames(deal.participants, "BUYER");
  const sellers = participantNames(deal.participants, "SELLER");
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
    sourceName: primarySource?.label ?? "",
    sourceUrl: primarySource?.url ?? "",
    status: DEAL_STATUS_DISPLAY[deal.dealStatus],
    country: deal.country,
  };
}

function toDealDetail(deal: DealDetailRow): DealDetail {
  const buyers = participantNames(deal.participants, "BUYER");
  const sellers = participantNames(deal.participants, "SELLER");
  const financialAdvisorBuyer = participantNames(deal.participants, "FINANCIAL_ADVISOR_BUYER");
  const financialAdvisorSeller = participantNames(deal.participants, "FINANCIAL_ADVISOR_SELLER");
  const legalAdvisorBuyer = participantNames(deal.participants, "LEGAL_ADVISOR_BUYER");
  const legalAdvisorSeller = participantNames(deal.participants, "LEGAL_ADVISOR_SELLER");
  const primarySource = deal.citations[0]?.source;

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
    category: deal.categories.map((category) => DEAL_CATEGORY_DISPLAY[category]),
    date: deal.date.toISOString(),
    description: deal.description,
    targetDescription: deal.targetDescription,
    sourceName: primarySource?.label ?? "",
    sourceUrl: primarySource?.url ?? "",
    enterpriseValue: deal.enterpriseValue,
    equityValue: deal.equityValue,
    stake: deal.stake,
    status: DEAL_STATUS_DISPLAY[deal.dealStatus],
    closingDate: deal.closingDate?.toISOString() ?? null,
    financialAdvisorBuyer: financialAdvisorBuyer.length ? financialAdvisorBuyer : null,
    financialAdvisorSeller: financialAdvisorSeller.length ? financialAdvisorSeller : null,
    legalAdvisorBuyer: legalAdvisorBuyer.length ? legalAdvisorBuyer : null,
    legalAdvisorSeller: legalAdvisorSeller.length ? legalAdvisorSeller : null,
    country: deal.country,
    assetScale: deal.assetScale,
    valuationMultiple: deal.valuationMultiple,
    fundVehicle: deal.fundVehicle,
    keyHighlights: deal.keyHighlights.length ? deal.keyHighlights : null,
  };
}

async function getAllDealsRaw(): Promise<DealListItem[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    select: DEAL_LIST_SELECT,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealListItem);
}

const getAllDealsCached = unstable_cache(
  getAllDealsRaw,
  dataCacheKeyParts("deals", "list"),
  { tags: [CACHE_TAGS.deals], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllDeals(): Promise<DealListItem[]> {
  return getAllDealsCached();
}

async function getAllDealDetailsRaw(): Promise<DealDetail[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    include: DEAL_DETAIL_INCLUDE,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealDetail);
}

const getAllDealDetailsCached = unstable_cache(
  getAllDealDetailsRaw,
  dataCacheKeyParts("deals", "export-details"),
  { tags: [CACHE_TAGS.deals], revalidate: CACHE_REVALIDATE_SECONDS },
);

/** Full published collection for authenticated exports. */
export async function getAllDealDetails(): Promise<DealDetail[]> {
  return getAllDealDetailsCached();
}

/** One query-layer operation returns data and metadata from the same row read. */
export async function getDealDetailResponse(
  legacyId: string,
): Promise<DetailResponse<DealDetail> | null> {
  const deal = await prisma.deal.findFirst({
    where: { legacyId, status: "PUBLISHED" },
    include: DEAL_DETAIL_INCLUDE,
  });
  if (!deal) return null;

  return {
    data: toDealDetail(deal),
    meta: {
      canonicalId: deal.legacyId,
      updatedAt: deal.updatedAt.toISOString(),
      lastVerifiedAt: deal.lastVerifiedAt?.toISOString() ?? null,
      sourceCount: deal._count.citations,
    },
  };
}

export async function getDealById(legacyId: string): Promise<DealDetail | null> {
  return (await getDealDetailResponse(legacyId))?.data ?? null;
}

export async function getWeeklyDeals(anchorDate: Date): Promise<DealDetail[]> {
  const weekAgo = new Date(anchorDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const deals = await prisma.deal.findMany({
    where: {
      status: "PUBLISHED",
      date: { gte: weekAgo, lte: anchorDate },
    },
    include: DEAL_DETAIL_INCLUDE,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealDetail);
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
