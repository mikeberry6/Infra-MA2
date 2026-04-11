import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_CATEGORY_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { DealView } from "@/modules/shared/types";
import type { Deal as DbDeal, DealParticipant } from "@/generated/prisma/client";

// Map a DB deal + participants to the DealView that client components expect
function toDealView(
  deal: DbDeal & {
    participants: (DealParticipant & { organization: { name: string } })[];
    citations: { source: { label: string; url: string } }[];
  },
): DealView {
  const buyers = deal.participants
    .filter((p) => p.role === "BUYER")
    .map((p) => p.displayName || p.organization.name);
  const sellers = deal.participants
    .filter((p) => p.role === "SELLER")
    .map((p) => p.displayName || p.organization.name);
  const faBuyer = deal.participants
    .filter((p) => p.role === "FINANCIAL_ADVISOR_BUYER")
    .map((p) => p.organization.name);
  const faSeller = deal.participants
    .filter((p) => p.role === "FINANCIAL_ADVISOR_SELLER")
    .map((p) => p.organization.name);
  const laBuyer = deal.participants
    .filter((p) => p.role === "LEGAL_ADVISOR_BUYER")
    .map((p) => p.organization.name);
  const laSeller = deal.participants
    .filter((p) => p.role === "LEGAL_ADVISOR_SELLER")
    .map((p) => p.organization.name);

  const firstCitation = deal.citations[0];

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
    include: { source: { select: { label: true, url: true } } },
    take: 1,
  },
} as const;

export async function getAllDeals(): Promise<DealView[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    include: DEAL_INCLUDE,
    orderBy: { date: "desc" },
  });
  return deals.map(toDealView);
}

export async function getDealById(legacyId: string): Promise<DealView | null> {
  const deal = await prisma.deal.findUnique({
    where: { legacyId },
    include: DEAL_INCLUDE,
  });
  return deal ? toDealView(deal) : null;
}

export async function getWeeklyDeals(anchorDate: Date): Promise<DealView[]> {
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
