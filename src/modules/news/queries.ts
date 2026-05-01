import { prisma } from "@/lib/prisma";
import {
  companyAliases,
  fundAliases,
  managerAliases,
  matchNewsCandidates,
  mergeNewsMentions,
  type NewsMatchCandidate,
} from "@/lib/news-utils";
import {
  COMPANY_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_SECTOR_DISPLAY,
  FUND_REGION_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_STRATEGY_DISPLAY,
} from "@/modules/shared/enum-maps";
import type {
  NewsCategory,
  NewsConfidence,
  NewsFeedView,
  NewsItemView,
  NewsMentionView,
} from "@/modules/shared/types";

const RUMOR_RE =
  /\b(rumou?red|sale process|sales process|explor(?:ed|ing|es) (?:a )?sale|strategic alternatives|auction|sell-side|mandate|solicit(?:ing)? bids)\b/i;

const CATEGORY_FROM_DB: Record<string, NewsCategory> = {
  TRANSACTION_ACTIVITY: "Infrastructure Transaction Activity",
  FUNDRAISING_ACTIVITY: "Infrastructure Fundraising Activity",
  RUMORED_SALES_PROCESS: "Rumored Infrastructure Sales Processes",
};

const CONFIDENCE_FROM_DB: Record<string, NewsConfidence> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

type CandidateContext = {
  companies: Array<{ id: string; name: string }>;
  funds: Array<{
    id: string;
    legacyId: string;
    fundName: string;
    manager: { id: string; name: string; aliases?: { alias: string }[] };
  }>;
  candidates: NewsMatchCandidate[];
  candidateByKey: Map<string, NewsMatchCandidate>;
};

type RawCuratedNewsItem = {
  id: string;
  legacyId: string | null;
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string | null;
  publishedAt: Date | string;
  isRumor: boolean;
  confidence: string;
};

export async function getNewsFeed(): Promise<NewsFeedView> {
  const context = await buildCandidateContext();
  const [curatedItems, transactionItems, fundraisingItems, rumorItems] = await Promise.all([
    getCuratedNewsItems(context),
    getTransactionNewsItems(context),
    getFundraisingNewsItems(context),
    getRumoredSaleNewsItems(context),
  ]);

  const bySourceOrId = new Map<string, NewsItemView>();
  for (const item of [...curatedItems, ...transactionItems, ...fundraisingItems, ...rumorItems]) {
    const key = item.sourceUrl ? `url:${item.sourceUrl}` : `id:${item.id}`;
    if (!bySourceOrId.has(key)) bySourceOrId.set(key, item);
  }

  const items = Array.from(bySourceOrId.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return {
    items,
    lastUpdated: new Date().toISOString(),
  };
}

async function buildCandidateContext(): Promise<CandidateContext> {
  const [companies, funds] = await Promise.all([
    prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.fund.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        legacyId: true,
        fundName: true,
        manager: {
          select: {
            id: true,
            name: true,
            aliases: { select: { alias: true } },
          },
        },
      },
      orderBy: { fundName: "asc" },
    }),
  ]);

  const managerById = new Map<string, { id: string; name: string; aliases: string[] }>();
  for (const fund of funds) {
    if (!managerById.has(fund.manager.id)) {
      managerById.set(fund.manager.id, {
        id: fund.manager.id,
        name: fund.manager.name,
        aliases: fund.manager.aliases?.map((a) => a.alias) ?? [],
      });
    }
  }

  const companyCandidates: NewsMatchCandidate[] = companies.map((company) => ({
    id: company.id,
    label: company.name,
    type: "PortCo",
    href: `/portfolio?focus=${encodeURIComponent(company.id)}`,
    aliases: companyAliases(company.name),
  }));

  const managerCandidates: NewsMatchCandidate[] = Array.from(managerById.values()).map((manager) => ({
    id: manager.id,
    label: manager.name,
    type: "Investment Firm",
    href: `/funds`,
    aliases: managerAliases(manager.name, manager.aliases),
  }));

  const fundCandidates: NewsMatchCandidate[] = funds.map((fund) => ({
    id: fund.legacyId,
    label: fund.fundName,
    type: "Fund",
    href: `/funds?focus=${encodeURIComponent(fund.legacyId)}`,
    aliases: fundAliases(fund.fundName),
  }));

  const candidates = [...companyCandidates, ...managerCandidates, ...fundCandidates];
  const candidateByKey = new Map(candidates.map((candidate) => [`${candidate.type}:${candidate.id}`, candidate]));

  return { companies, funds, candidates, candidateByKey };
}

async function getCuratedNewsItems(context: CandidateContext): Promise<NewsItemView[]> {
  try {
    const exists = await prisma.$queryRawUnsafe<Array<{ exists: string | null }>>(
      `SELECT to_regclass('public."NewsItem"')::text AS exists`,
    );
    if (!exists[0]?.exists) return [];

    const rows = await prisma.$queryRawUnsafe<RawCuratedNewsItem[]>(
      `SELECT
        id,
        "legacyId",
        title,
        summary,
        category::text AS category,
        "sourceName",
        COALESCE("sourceUrl", '') AS "sourceUrl",
        "publishedAt",
        "isRumor",
        confidence::text AS confidence
      FROM "NewsItem"
      WHERE status = 'PUBLISHED'
      ORDER BY "publishedAt" DESC
      LIMIT 100`,
    );

    return rows.map((row) => {
      const text = `${row.title} ${row.summary}`;
      return {
        id: row.legacyId || row.id,
        title: row.title,
        summary: row.summary,
        category: CATEGORY_FROM_DB[row.category] ?? "Infrastructure Transaction Activity",
        sourceName: row.sourceName,
        sourceUrl: row.sourceUrl || "",
        publishedAt: new Date(row.publishedAt).toISOString(),
        isRumor: row.isRumor,
        confidence: CONFIDENCE_FROM_DB[row.confidence] ?? "Medium",
        mentions: matchNewsCandidates(text, context.candidates),
      };
    });
  } catch {
    return [];
  }
}

async function getTransactionNewsItems(context: CandidateContext): Promise<NewsItemView[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    include: {
      participants: {
        include: { organization: { select: { id: true, name: true } } },
      },
      citations: {
        include: { source: { select: { label: true, url: true } } },
        take: 1,
      },
    },
    orderBy: { date: "desc" },
    take: 75,
  });

  return deals.map((deal): NewsItemView => {
    const source = deal.citations[0]?.source;
    const participants = deal.participants.map((p) => p.displayName || p.organization.name);
    const text = [
      deal.title,
      deal.target,
      deal.description,
      deal.targetDescription,
      deal.country,
      participants.join(" "),
    ].join(" ");

    const explicitMentions = deal.participants
      .map((participant): NewsMentionView | null => {
        const candidate = context.candidateByKey.get(`Investment Firm:${participant.organization.id}`);
        if (!candidate) return null;
        return mentionFromCandidate(candidate, "High", "Deal participant");
      })
      .filter((m): m is NewsMentionView => !!m);

    return {
      id: `deal-${deal.legacyId}`,
      title: deal.title,
      summary: trimSummary(deal.description || deal.targetDescription || `${deal.target} transaction activity.`),
      category: "Infrastructure Transaction Activity",
      sourceName: source?.label || "Deal Database",
      sourceUrl: source?.url || "",
      publishedAt: deal.date.toISOString(),
      isRumor: false,
      confidence: source?.url ? "High" : "Medium",
      sector: DEAL_SECTOR_DISPLAY[deal.sector],
      region: DEAL_REGION_DISPLAY[deal.region],
      mentions: mergeNewsMentions(explicitMentions, matchNewsCandidates(text, context.candidates)),
    };
  });
}

async function getFundraisingNewsItems(context: CandidateContext): Promise<NewsItemView[]> {
  const currentYear = new Date().getUTCFullYear();
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    include: {
      manager: { select: { id: true, name: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { fundName: "asc" }],
    take: 300,
  });

  return funds
    .filter((fund) => {
      const vintageYear = parseVintageYear(fund.vintage);
      return fund.fundStatus === "RAISING" || (vintageYear != null && vintageYear >= currentYear - 2);
    })
    .slice(0, 60)
    .map((fund): NewsItemView => {
      const status = FUND_STATUS_DISPLAY[fund.fundStatus];
      const verb = status === "Raising" ? "raising" : "reports fundraising activity for";
      const sourceUrl = fund.sourceUrls[0] || fund.strategyUrl || "";
      const sourceName = sourceUrl ? sourceNameFromUrl(sourceUrl) : "Fund Database";
      const publishedAt = inferFundDate(fund.vintage, fund.updatedAt).toISOString();
      const managerCandidate = context.candidateByKey.get(`Investment Firm:${fund.manager.id}`);
      const fundCandidate = context.candidateByKey.get(`Fund:${fund.legacyId}`);
      const directMentions = [
        managerCandidate ? mentionFromCandidate(managerCandidate, "High", "Fund manager") : null,
        fundCandidate ? mentionFromCandidate(fundCandidate, "High", "Fund vehicle") : null,
      ].filter((m): m is NewsMentionView => !!m);

      const strategyText = fund.strategies.map((s) => FUND_STRATEGY_DISPLAY[s]).join(", ");
      const regionText = fund.regions.map((r) => FUND_REGION_DISPLAY[r]).join(", ");
      const sectorText = fund.sectors.map((s) => FUND_SECTOR_DISPLAY[s]).join(", ");

      return {
        id: `fund-${fund.legacyId}`,
        title: `${fund.manager.name} ${verb} ${fund.fundName}`,
        summary: trimSummary(
          [
            `${fund.fundName} is ${displaySize(fund.size)} ${strategyText.toLowerCase()} infrastructure vehicle.`,
            sectorText ? `Its mandate covers ${sectorText.toLowerCase()} across ${regionText.toLowerCase()}.` : "",
            fund.investmentStrategy,
          ].filter(Boolean).join(" "),
        ),
        category: "Infrastructure Fundraising Activity",
        sourceName,
        sourceUrl,
        publishedAt,
        isRumor: false,
        confidence: sourceUrl ? "High" : "Medium",
        mentions: directMentions,
      };
    });
}

async function getRumoredSaleNewsItems(context: CandidateContext): Promise<NewsItemView[]> {
  const companies = await prisma.company.findMany({
    where: {
      status: "PUBLISHED",
      milestones: {
        some: {
          OR: [
            { event: { contains: "sale process", mode: "insensitive" } },
            { event: { contains: "sales process", mode: "insensitive" } },
            { event: { contains: "explored a sale", mode: "insensitive" } },
            { event: { contains: "rumored", mode: "insensitive" } },
            { event: { contains: "strategic alternatives", mode: "insensitive" } },
            { event: { contains: "auction", mode: "insensitive" } },
          ],
        },
      },
    },
    include: {
      milestones: { orderBy: { sortDate: "desc" } },
      ownershipPeriods: {
        include: {
          fund: {
            select: {
              legacyId: true,
              fundName: true,
              manager: { select: { id: true, name: true } },
            },
          },
          organization: { select: { id: true, name: true } },
        },
      },
      citations: {
        include: { source: { select: { label: true, url: true } } },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
  });

  const items: NewsItemView[] = [];
  for (const company of companies) {
    const rumorMilestones = company.milestones.filter((milestone) => RUMOR_RE.test(milestone.event));
    const companyCandidate = context.candidateByKey.get(`PortCo:${company.id}`);
    const companyMention = companyCandidate
      ? [mentionFromCandidate(companyCandidate, "High", "Mentioned PortCo")]
      : [];

    const ownerMentions = company.ownershipPeriods
      .flatMap((period): NewsMentionView[] => {
        const mentions: NewsMentionView[] = [];
        if (period.fund?.manager?.id) {
          const managerCandidate = context.candidateByKey.get(`Investment Firm:${period.fund.manager.id}`);
          if (managerCandidate) mentions.push(mentionFromCandidate(managerCandidate, "High", "Current or historical owner"));
        }
        if (period.fund?.legacyId) {
          const fundCandidate = context.candidateByKey.get(`Fund:${period.fund.legacyId}`);
          if (fundCandidate) mentions.push(mentionFromCandidate(fundCandidate, "High", "Ownership vehicle"));
        }
        if (period.organizationId) {
          const managerCandidate = context.candidateByKey.get(`Investment Firm:${period.organizationId}`);
          if (managerCandidate) mentions.push(mentionFromCandidate(managerCandidate, "High", "Current or historical owner"));
        }
        return mentions;
      });

    for (const milestone of rumorMilestones) {
      const source = company.citations[0]?.source;
      items.push({
        id: `rumor-${company.id}-${milestone.id}`,
        title: `${company.name}: rumored infrastructure sale process`,
        summary: trimSummary(`${milestone.event} ${company.description}`),
        category: "Rumored Infrastructure Sales Processes",
        sourceName: source?.label || "Portfolio Database",
        sourceUrl: source?.url || "",
        publishedAt: (milestone.sortDate || parseMilestoneDate(milestone.date) || company.updatedAt).toISOString(),
        isRumor: true,
        confidence: "Medium",
        sector: COMPANY_SECTOR_DISPLAY[company.sector],
        region: COMPANY_REGION_DISPLAY[company.region],
        mentions: mergeNewsMentions(companyMention, ownerMentions),
      });
    }
  }

  return items;
}

function mentionFromCandidate(
  candidate: NewsMatchCandidate,
  confidence: NewsConfidence,
  reason: string,
): NewsMentionView {
  return {
    id: candidate.id,
    label: candidate.label,
    type: candidate.type,
    href: candidate.href,
    confidence,
    reason,
  };
}

function trimSummary(value: string, max = 280): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

function sourceNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".")[0]?.replace(/-/g, " ") || "Source";
  } catch {
    return "Source";
  }
}

function parseVintageYear(vintage: string): number | null {
  const match = vintage.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function inferFundDate(vintage: string, updatedAt: Date): Date {
  const year = parseVintageYear(vintage);
  if (!year) return updatedAt;
  return new Date(Date.UTC(year, 0, 1, 12));
}

function parseMilestoneDate(date: string): Date | null {
  const direct = new Date(date);
  if (!isNaN(direct.getTime())) return direct;

  const monthYear = date.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const parsed = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const quarter = date.match(/^Q([1-4])\s+(\d{4})$/i);
  if (quarter) {
    const month = (Number(quarter[1]) - 1) * 3;
    return new Date(Date.UTC(Number(quarter[2]), month, 1, 12));
  }

  const yearOnly = date.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearOnly) return new Date(Date.UTC(Number(yearOnly[1]), 0, 1, 12));

  return null;
}

function displaySize(size: string): string {
  const inner = size.replace(/^\[(.*)\]$/, "$1").trim();
  return inner || "an undisclosed-size";
}
