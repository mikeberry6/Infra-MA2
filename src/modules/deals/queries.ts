import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_CATEGORY_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { DealListView, DealView, BriefingReference } from "@/modules/shared/types";
import type { Prisma } from "@/generated/prisma/client";
import { isPublicSponsor, SPONSOR_IDENTITY_SELECT } from "@/lib/sponsor-profile";

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toDealListView(
  deal: Prisma.DealGetPayload<{ select: typeof DEAL_LIST_SELECT }>,
  briefings: BriefingReference[],
  legacyIdAliases: string[],
): DealListView {
  const participants = deal.participants
    .filter((participant) => participant.role === "BUYER" || participant.role === "SELLER")
    .map(({ organization, displayName, role }) => ({
      organizationId: organization.id,
      name: displayName || organization.name,
      role,
      hasPublicProfile: isPublicSponsor(organization),
    }));
  const namesFor = (role: string) => uniqueNames(participants.filter((p) => p.role === role).map((p) => p.name));
  const firstCitation = deal.citations[0];

  return {
    briefings,
    legacyIdAliases,
    participants,
    id: deal.legacyId,
    legacyId: deal.legacyId,
    title: deal.title,
    target: deal.target,
    buyer: namesFor("BUYER").join(" / ") || "N/A",
    seller: namesFor("SELLER").join(" / ") || "N/A",
    sector: DEAL_SECTOR_DISPLAY[deal.sector],
    subsector: deal.subsector,
    region: DEAL_REGION_DISPLAY[deal.region],
    category: deal.categories.map((c) => DEAL_CATEGORY_DISPLAY[c]),
    date: deal.date.toISOString(),
    sourceName: firstCitation?.source.label || "",
    sourceUrl: firstCitation?.source.url || "",
    status: DEAL_STATUS_DISPLAY[deal.dealStatus],
    country: deal.country,
  };
}

function toDealView(
  deal: Prisma.DealGetPayload<{ include: typeof DEAL_INCLUDE }>,
  briefings: BriefingReference[] = [],
  legacyIdAliases: string[] = [],
): DealView {
  const advisorsFor = (role: string) => {
    const names = uniqueNames(deal.participants.filter((p) => p.role === role).map((p) => p.organization.name));
    return names.length > 0 ? names : null;
  };

  return {
    ...toDealListView(deal, briefings, legacyIdAliases),
    description: deal.description,
    targetDescription: deal.targetDescription,
    enterpriseValue: deal.enterpriseValue,
    equityValue: deal.equityValue,
    stake: deal.stake,
    closingDate: deal.closingDate?.toISOString() || null,
    financialAdvisorBuyer: advisorsFor("FINANCIAL_ADVISOR_BUYER"),
    financialAdvisorSeller: advisorsFor("FINANCIAL_ADVISOR_SELLER"),
    legalAdvisorBuyer: advisorsFor("LEGAL_ADVISOR_BUYER"),
    legalAdvisorSeller: advisorsFor("LEGAL_ADVISOR_SELLER"),
    assetScale: deal.assetScale,
    valuationMultiple: deal.valuationMultiple,
    fundVehicle: deal.fundVehicle,
    keyHighlights: deal.keyHighlights.length > 0 ? deal.keyHighlights : null,
  };
}

const DEAL_INCLUDE = {
  participants: {
    include: { organization: { select: SPONSOR_IDENTITY_SELECT } },
  },
  citations: {
    include: { source: { select: { label: true, url: true } } },
    take: 1,
  },
} as const;

const DEAL_LIST_SELECT = {
  id: true,
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
  citations: DEAL_INCLUDE.citations,
  participants: {
    where: { role: { in: ["BUYER", "SELLER"] } },
    select: {
      role: true,
      displayName: true,
      organization: { select: SPONSOR_IDENTITY_SELECT },
    },
  },
} satisfies Prisma.DealSelect;

export const getDealList = unstable_cache(
  async (): Promise<DealListView[]> => {
    const deals = await prisma.deal.findMany({
      where: { status: "PUBLISHED" },
      select: DEAL_LIST_SELECT,
      orderBy: [{ date: "desc" }, { legacyId: "asc" }],
    });
    const [references, aliases] = await Promise.all([
      getBriefingReferences(deals.map(({ id }) => id)),
      getMergedDealAliases(),
    ]);
    return deals.map((deal) => toDealListView(deal, references.get(deal.id) ?? [], aliases.get(deal.legacyId) ?? []));
  },
  ["deals:list:v1"],
  { tags: [CACHE_TAGS.deals, CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

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
  ["deals:all:participants-v2"],
  { tags: [CACHE_TAGS.deals, CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllDeals(): Promise<DealView[]> {
  return getAllDealsCached();
}

async function getDealByIdRaw(legacyId: string): Promise<DealView | null> {
  const aliases = await getMergedDealAliases();
  const canonicalId = [...aliases].find(([, ids]) => ids.includes(legacyId))?.[0] ?? legacyId;
  const deal = await prisma.deal.findUnique({
    where: { legacyId: canonicalId, status: "PUBLISHED" },
    include: DEAL_INCLUDE,
  });
  if (!deal) return null;
  const references = await getBriefingReferences([deal.id]);
  return toDealView(deal, references.get(deal.id) ?? [], aliases.get(deal.legacyId) ?? []);
}

export const getDealById = unstable_cache(
  getDealByIdRaw,
  ["deals:detail:v1"],
  { tags: [CACHE_TAGS.deals, CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

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
