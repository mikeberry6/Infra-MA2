import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { isInvestmentFirmCommentaryOnly, managerAliases, mergeNewsMentions } from "@/lib/news-utils";
import { NEWS_INGEST_SUCCEEDED, NEWS_PIPELINE } from "@/lib/news-pipeline";
import { isPublicSponsor, SPONSOR_IDENTITY_SELECT } from "@/lib/sponsor-profile";
import { newsEvidenceEnabled } from "@/modules/news-evidence/feature";
import { canPublishVersion, publicSourceMetadata } from "@/modules/news-evidence/policy";
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
  PORTFOLIO_COMPANY_NEWS: "PortCo News",
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
const FEED_LIMIT = 500;

async function getNewsRows(supersededIds: string[]) {
  return prisma.newsItem.findMany({
    where: {
      status: "PUBLISHED",
      confidence: { not: "LOW" },
      category: { not: "LOW_CONFIDENCE_NEEDS_REVIEW" },
      ...(supersededIds.length ? { id: { notIn: supersededIds } } : {}),
    },
    include: {
      mentions: {
        include: {
          company: { select: { id: true } },
          organization: { select: { ...SPONSOR_IDENTITY_SELECT, aliases: { select: { alias: true } } } },
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
    take: FEED_LIMIT,
  });
}

async function getEvidenceNewsRows() {
  const items = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT d.id
    FROM "NewsDevelopment" d
    JOIN "NewsRevision" r ON r.id = d."approvedRevisionId" AND r."developmentId" = d.id
    JOIN "NewsSourceVersion" v ON v.id = r."sourceVersionId"
    WHERE r.status = 'APPROVED' AND r."publicationEligibility" = 'READY_FOR_REVIEW'
      AND r."reviewedAt" IS NOT NULL AND r.confidence <> 'LOW'
      AND r.category <> 'LOW_CONFIDENCE_NEEDS_REVIEW'
    ORDER BY CASE
      WHEN r."correctsRevisionId" IS NOT NULL AND r."materialChange" THEN v."publishedAt"
      ELSE coalesce(r."firstDisclosedOn", v."publishedAt")
    END DESC, d.id ASC
    LIMIT ${FEED_LIMIT * 2}
  `;
  if (items.length === 0) return [];
  return prisma.newsDevelopment.findMany({
    where: { id: { in: items.map(({ id }) => id) }, approvedRevision: { is: { status: "APPROVED", publicationEligibility: "READY_FOR_REVIEW" } } },
    select: {
      id: true,
      legacyNewsItem: { select: { id: true, legacyId: true } },
      approvedRevision: {
        select: {
          developmentId: true,
          title: true,
          summary: true,
          category: true,
          confidence: true,
          isRumor: true,
          firstDisclosedOn: true,
          reviewedAt: true,
          correctsRevisionId: true,
          materialChange: true,
          sourceVersion: {
            select: {
              publishedAt: true,
              policyVersion: true,
              document: { select: { sourceKey: true, sourceName: true, canonicalUrl: true } },
            },
          },
          claims: {
            select: { evidence: { select: { version: { select: { policyVersion: true, document: { select: { sourceKey: true } } } } } } },
          },
          matches: {
            where: { status: "MATCHED", role: { notIn: ["FINANCIAL_ADVISER_BUYER", "FINANCIAL_ADVISER_SELLER", "LEGAL_ADVISER_BUYER", "LEGAL_ADVISER_SELLER"] } },
            select: {
              id: true,
              company: { select: { id: true, name: true, status: true } },
              organization: { select: SPONSOR_IDENTITY_SELECT },
              deal: { select: { legacyId: true, target: true, status: true } },
              fund: { select: { legacyId: true, fundName: true, status: true } },
            },
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });
}

type EvidenceRow = Awaited<ReturnType<typeof getEvidenceNewsRows>>[number];

function evidenceMention(mention: NonNullable<EvidenceRow["approvedRevision"]>["matches"][number]): NewsMentionView | null {
  if (mention.company?.status === "PUBLISHED") {
    const { id, name } = mention.company;
    return { id, label: name, type: "PortCo", confidence: "High", href: mentionHref("PortCo", { companyId: id }) };
  }
  if (mention.fund?.status === "PUBLISHED") {
    const { legacyId, fundName } = mention.fund;
    return { id: legacyId, label: fundName, type: "Fund", confidence: "High", href: mentionHref("Fund", { fundLegacyId: legacyId }) };
  }
  if (mention.deal?.status === "PUBLISHED") {
    const { legacyId, target } = mention.deal;
    return { id: legacyId, label: target, type: "Deal", confidence: "High", href: mentionHref("Deal", { dealLegacyId: legacyId }) };
  }
  if (mention.organization && isPublicSponsor(mention.organization)) {
    const { id, name } = mention.organization;
    return { id, label: name, type: "Investment Firm", confidence: "High", href: mentionHref("Investment Firm", { organizationId: id }) };
  }
  return null;
}

function evidenceNewsItem(row: EvidenceRow): NewsItemView | null {
  const revision = row.approvedRevision;
  if (!revision || revision.developmentId !== row.id || !revision.reviewedAt || revision.confidence === "LOW"
    || revision.category === "LOW_CONFIDENCE_NEEDS_REVIEW") return null;
  const { document, policyVersion, publishedAt } = revision.sourceVersion;
  const source = publicSourceMetadata(document.sourceKey, policyVersion, document);
  if (!source || !revision.claims.length || revision.claims.some(({ evidence }) =>
    !evidence.length || evidence.some(({ version }) => !canPublishVersion(version.document.sourceKey, version.policyVersion)))) return null;
  const originalDate = revision.firstDisclosedOn ?? publishedAt;
  const date = revision.correctsRevisionId && revision.materialChange ? publishedAt : originalDate;
  return {
    id: row.legacyNewsItem?.legacyId ?? row.legacyNewsItem?.id ?? `evidence:${row.id}`,
    title: revision.title,
    summary: revision.summary,
    category: CATEGORY_FROM_DB[revision.category],
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl ?? "",
    linkedinUrls: [],
    publishedAt: date.toISOString(),
    confidence: CONFIDENCE_FROM_DB[revision.confidence],
    isRumor: revision.isRumor,
    mentions: mergeNewsMentions(revision.matches.map(evidenceMention).filter((mention): mention is NewsMentionView => mention !== null)),
  };
}

async function getNewsFeedRaw(includeEvidence: boolean): Promise<NewsFeedView> {
  const evidenceRows = includeEvidence ? await getEvidenceNewsRows() : [];
  const evidence = evidenceRows.flatMap((row) => {
    const item = evidenceNewsItem(row);
    return item ? [{ item, legacyId: row.legacyNewsItem?.id }] : [];
  });
  const [rows, latestRun] = await Promise.all([
    getNewsRows(evidence.flatMap(({ legacyId }) => legacyId ? [legacyId] : [])),
    prisma.pipelineRun.findFirst({
      where: {
        pipeline: includeEvidence ? { in: [NEWS_PIPELINE, "evidence-news-capture"] } : NEWS_PIPELINE,
        status: NEWS_INGEST_SUCCEEDED,
        endedAt: { not: null },
      },
      orderBy: { endedAt: "desc" },
      select: { endedAt: true },
    }).catch((error) => {
      console.error("News ingest timestamp unavailable:", error);
      return null;
    }),
  ]);

  const legacy = rows.map(toNewsItemView).filter((item): item is NewsItemView => item !== null);
  return {
    items: [...evidence.map(({ item }) => item), ...legacy]
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .slice(0, FEED_LIMIT),
    lastSuccessfulIngestAt: latestRun?.endedAt?.toISOString() ?? null,
  };
}

const getNewsFeedCached = unstable_cache(
  getNewsFeedRaw,
  ["news:feed", "evidence-v1"],
  {
    tags: [CACHE_TAGS.news, CACHE_TAGS.deals, CACHE_TAGS.funds, CACHE_TAGS.companies],
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

export async function getNewsFeed(): Promise<NewsFeedView> {
  return getNewsFeedCached(newsEvidenceEnabled());
}

function toNewsItemView(item: DbNewsItem): NewsItemView | null {
  // Older scans may have classified analysts as subjects. Filter those
  // mentions at read time while preserving the underlying editorial records.
  const articleText = `${item.title}. ${item.summary}`;
  const relevant = item.mentions.filter((mention) => {
    if (mention.mentionType !== "FUND_MANAGER") return true;
    const aliases = managerAliases(
      mention.organization?.name ?? mention.label,
      [mention.label, ...(mention.organization?.aliases.map(({ alias }) => alias) ?? [])],
    );
    return !isInvestmentFirmCommentaryOnly(articleText, aliases);
  });
  if (item.mentions.length && !relevant.length) return null;
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
    mentions: mergeNewsMentions(relevant.map(toMentionView)),
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
    label: mention.organization?.name ?? mention.label,
    type,
    href: mentionHref(type, {
      companyId: mention.companyId,
      fundLegacyId: mention.fund?.legacyId,
      organizationId: isPublicSponsor(mention.organization) ? mention.organizationId : null,
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
  if (type === "Investment Firm" && ids.organizationId) {
    return `/sponsors/${encodeURIComponent(ids.organizationId)}`;
  }
  return undefined;
}
