import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_CATEGORY_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { DealView, BriefingReference } from "@/modules/shared/types";
import type { Deal as DbDeal, DealParticipant } from "@/generated/prisma/client";

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Map a DB deal + participants to the DealView that client components expect
function toDealView(
  deal: DbDeal & {
    participants: (DealParticipant & { organization: { name: string } })[];
    citations: { source: { label: string; url: string } }[];
  },
  briefings: BriefingReference[] = [],
  legacyIdAliases: string[] = [],
): DealView {
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
    briefings,
    legacyIdAliases,
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

async function getAllDealsRaw(): Promise<DealView[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    include: DEAL_INCLUDE,
    orderBy: { date: "desc" },
  });
  const references = await getBriefingReferences(deals.map(d => d.id));
  const aliases = await getMergedDealAliases();
  return deals.map(deal => toDealView(deal, references.get(deal.id) ?? [], aliases.get(deal.legacyId) ?? []));
}

const getAllDealsCached = unstable_cache(
  getAllDealsRaw,
  ["deals:all"],
  { tags: [CACHE_TAGS.deals], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllDeals(): Promise<DealView[]> {
  return getAllDealsCached();
}

export async function getDealById(legacyId: string): Promise<DealView | null> {
  const aliases = await getMergedDealAliases();
  const canonicalId = [...aliases].find(([, ids]) => ids.includes(legacyId))?.[0] ?? legacyId;
  const deal = await prisma.deal.findUnique({
    where: { legacyId: canonicalId },
    include: DEAL_INCLUDE,
  });
  if (!deal) return null;
  const references = await getBriefingReferences([deal.id]);
  return toDealView(deal, references.get(deal.id) ?? [], aliases.get(deal.legacyId) ?? []);
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
  const references = await getBriefingReferences(deals.map(d => d.id));
  const aliases = await getMergedDealAliases();
  return deals.map(deal => toDealView(deal, references.get(deal.id) ?? [], aliases.get(deal.legacyId) ?? []));
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

async function briefingSchemaReady(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ ready: boolean }>>`SELECT to_regclass('public."BriefingIssue"') IS NOT NULL AND to_regclass('public."BriefingDeal"') IS NOT NULL AS ready`;
  return rows[0]?.ready === true;
}

async function getBriefingReferences(dealIds: string[]) {
  const result = new Map<string, BriefingReference[]>();
  if (!dealIds.length || !(await briefingSchemaReady())) return result;
  const appearances = await prisma.briefingDeal.findMany({
    where: { dealId: { in: dealIds } },
    select: { dealId: true, issue: { select: { edition: true, archivePath: true } } },
    orderBy: { issueEdition: "desc" },
  });
  for (const appearance of appearances) {
    const references = result.get(appearance.dealId) ?? [];
    if (!references.some(r => r.edition === appearance.issue.edition)) references.push(appearance.issue);
    result.set(appearance.dealId, references);
  }
  return result;
}

export async function getBriefingIssues() {
  if (!(await briefingSchemaReady())) return [];
  return prisma.briefingIssue.findMany({
    select: { edition: true, archivePath: true },
    orderBy: { edition: "desc" },
  });
}

async function getMergedDealAliases() {
  const rows = await prisma.auditEvent.findMany({
    where: { entityType: "BriefingDuplicateMerge", action: "MERGE" },
    select: { entityId: true, metadata: true },
  });
  const aliases = new Map<string, string[]>();
  for (const row of rows) {
    const metadata = row.metadata as { canonicalLegacyId?: unknown } | null;
    if (!row.entityId || typeof metadata?.canonicalLegacyId !== "string") continue;
    const ids = aliases.get(metadata.canonicalLegacyId) ?? [];
    if (!ids.includes(row.entityId)) ids.push(row.entityId);
    aliases.set(metadata.canonicalLegacyId, ids);
  }
  return aliases;
}
