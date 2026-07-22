import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { nextNewsScanAt } from "@/modules/operations/pipeline-schedules";
import type {
  NewsCategory,
  NewsConfidence,
  NewsFeedView,
  NewsItemView,
  NewsMentionType,
  NewsMentionView,
} from "@/modules/shared/types";

const CATEGORY_FROM_DB: Record<string, NewsCategory> = {
  TRANSACTION_ACTIVITY: "Transaction Activity",
  FUNDRAISING_ACTIVITY: "Fundraising Activity",
  PORTFOLIO_COMPANY_NEWS: "Portfolio Company News",
  INVESTMENT_FIRM_NEWS: "Investment Firm News",
  RUMORED_SALES_PROCESS: "Rumored Sales Processes",
  LOW_CONFIDENCE_NEEDS_REVIEW: "Low Confidence / Needs Review",
};

const CONFIDENCE_FROM_DB: Record<string, NewsConfidence> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const MENTION_TYPE_FROM_DB: Record<string, NewsMentionType> = {
  COMPANY: "PortCo",
  FUND_MANAGER: "Investment Firm",
  FUND: "Fund",
  DEAL: "Deal",
};

type DbNewsItem = Awaited<ReturnType<typeof getNewsRows>>[number];
type DbNewsMention = DbNewsItem["mentions"][number];

async function getNewsRows() {
  return prisma.newsItem.findMany({
    where: { status: "PUBLISHED" },
    include: {
      mentions: {
        include: {
          company: { select: { id: true } },
          organization: { select: { id: true } },
          fund: { select: { id: true, legacyId: true } },
          deal: { select: { id: true, legacyId: true } },
        },
        orderBy: [
          { mentionType: "asc" },
          { confidence: "desc" },
          { label: "asc" },
        ],
      },
    },
    orderBy: [
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ],
    take: 500,
  });
}

// Keep each database access behind an async boundary. If the Prisma client is
// unavailable (for example, a deliberately misconfigured health/failure
// check), every failure is then owned by Promise.all instead of leaving an
// earlier query as an unhandled rejection while a later property access
// throws synchronously.
async function getLatestNewsAttempt() {
  return prisma.pipelineRun.findFirst({
    where: { pipeline: "NEWS_SCAN" },
    orderBy: { startedAt: "desc" },
  });
}

async function getLatestSuccessfulNewsRun() {
  return prisma.pipelineRun.findFirst({
    where: { pipeline: "NEWS_SCAN", status: "SUCCEEDED" },
    orderBy: { endedAt: "desc" },
  });
}

async function getNewsFeedRaw(): Promise<NewsFeedView> {
  const [rows, latestAttempt, latestSuccess] = await Promise.all([
    getNewsRows(),
    getLatestNewsAttempt(),
    getLatestSuccessfulNewsRun(),
  ]);
  const now = new Date();
  const lastSuccessfulAt = latestSuccess?.endedAt ?? latestSuccess?.startedAt;
  const nextExpected = nextNewsScanAt(now);
  const overdue = !lastSuccessfulAt || now.getTime() - lastSuccessfulAt.getTime() > 36 * 60 * 60 * 1000;
  const latestMetadata = latestSuccess?.metadata && typeof latestSuccess.metadata === "object"
    ? latestSuccess.metadata as Record<string, unknown>
    : null;
  const tracked = latestMetadata?.tracked && typeof latestMetadata.tracked === "object"
    ? Object.values(latestMetadata.tracked as Record<string, unknown>).reduce<number>(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0,
      )
    : undefined;
  const state = !latestAttempt
    ? "never-run"
    : latestAttempt.status === "FAILED"
      ? "failed"
      : latestAttempt.status === "RUNNING"
        ? "pending"
      : overdue
        ? "overdue"
        : "healthy";

  return {
    items: rows.map(toNewsItemView),
    lastUpdated: lastSuccessfulAt?.toISOString() ?? rows[0]?.updatedAt.toISOString() ?? null,
    operations: {
      state,
      lastAttemptAt: latestAttempt?.startedAt.toISOString(),
      lastSuccessfulAt: lastSuccessfulAt?.toISOString(),
      nextExpectedAt: nextExpected.toISOString(),
      trackedEntities: tracked,
      message: state === "healthy"
        ? "The daily public-source scan completed successfully."
        : state === "failed"
          ? "The latest scan failed; the last successful results remain visible."
          : state === "pending"
            ? lastSuccessfulAt
              ? "A news scan is currently running; the last successful results remain visible."
              : "The first news scan is currently running."
          : state === "overdue"
            ? "The next scheduled scan is overdue."
            : "No completed news scan has been recorded yet.",
    },
  };
}

const getNewsFeedCached = unstable_cache(
  getNewsFeedRaw,
  ["news:feed"],
  {
    tags: [CACHE_TAGS.news, CACHE_TAGS.deals, CACHE_TAGS.funds, CACHE_TAGS.companies],
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

export async function getNewsFeed(): Promise<NewsFeedView> {
  return getNewsFeedCached();
}

function toNewsItemView(item: DbNewsItem): NewsItemView {
  return {
    id: item.legacyId || item.id,
    title: item.title,
    summary: item.summary,
    category: CATEGORY_FROM_DB[item.category] ?? "Low Confidence / Needs Review",
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl || "",
    linkedinUrls: item.linkedinUrls,
    publishedAt: item.publishedAt.toISOString(),
    isRumor: item.isRumor,
    confidence: CONFIDENCE_FROM_DB[item.confidence] ?? "Low",
    mentions: item.mentions.map(toMentionView),
  };
}

function toMentionView(mention: DbNewsMention): NewsMentionView {
  const type = MENTION_TYPE_FROM_DB[mention.mentionType] ?? "PortCo";
  const id = mention.companyId
    || mention.fund?.legacyId
    || mention.organizationId
    || mention.deal?.legacyId
    || mention.id;

  return {
    id,
    label: mention.label,
    type,
    href: mentionHref(type, {
      companyId: mention.companyId,
      fundLegacyId: mention.fund?.legacyId,
      organizationId: mention.organizationId,
      dealLegacyId: mention.deal?.legacyId,
    }),
    confidence: CONFIDENCE_FROM_DB[mention.confidence] ?? "Low",
    reason: mention.reason || undefined,
  };
}

function mentionHref(
  type: NewsMentionType,
  ids: {
    companyId?: string | null;
    fundLegacyId?: string | null;
    organizationId?: string | null;
    dealLegacyId?: string | null;
  },
): string | undefined {
  if (type === "PortCo" && ids.companyId) {
    return `/portfolio?focus=${encodeURIComponent(ids.companyId)}`;
  }
  if (type === "Fund" && ids.fundLegacyId) {
    return `/funds?focus=${encodeURIComponent(ids.fundLegacyId)}`;
  }
  if (type === "Deal" && ids.dealLegacyId) {
    return `/tracker?focus=${encodeURIComponent(ids.dealLegacyId)}`;
  }
  if (type === "Investment Firm") {
    return "/funds";
  }
  return undefined;
}
