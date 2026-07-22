import "dotenv/config";
import { createHash } from "crypto";
import { setDefaultResultOrder } from "dns";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  companyAliases,
  fundAliases,
  managerAliases,
  matchNewsCandidates,
  mergeNewsMentions,
  normalizeNewsText,
  type NewsMatchCandidate,
} from "../src/lib/news-utils";
import type { NewsConfidence, NewsMentionType, NewsMentionView } from "../src/modules/shared/types";
import { completePipelineRun, failPipelineRun, startPipelineRun } from "../src/modules/operations/pipeline-runs";

setDefaultResultOrder("ipv4first");

type DbNewsCategory =
  | "TRANSACTION_ACTIVITY"
  | "FUNDRAISING_ACTIVITY"
  | "PORTFOLIO_COMPANY_NEWS"
  | "INVESTMENT_FIRM_NEWS"
  | "RUMORED_SALES_PROCESS"
  | "LOW_CONFIDENCE_NEEDS_REVIEW";

type DbNewsConfidence = "HIGH" | "MEDIUM" | "LOW";
type DbNewsMentionType = "COMPANY" | "FUND_MANAGER" | "FUND" | "DEAL";
type ScanEntityType = "COMPANY" | "FUND_MANAGER" | "FUND";
type SeedKind = "official" | "source" | "sitemap" | "common-path" | "discovered";

type Options = {
  dryRun: boolean;
  sourceCrawl: boolean;
  newsSearch: boolean;
  targetTerms: string[];
  concurrency: number;
  requestDelayMs: number;
  maxCrawlDelayMs: number;
  maxPages: number;
  maxPagesPerSite: number;
  maxLinksPerPage: number;
  maxSitemapUrlsPerSite: number;
  searchConcurrency: number;
  searchDelayMs: number;
  searchMaxQueriesPerEntity: number;
  searchMaxResultsPerEntity: number;
  maxTargets?: number;
  sinceDays?: number;
};

type MentionCandidate = NewsMatchCandidate & {
  dbType: DbNewsMentionType;
  companyId?: string;
  organizationId?: string;
  fundId?: string;
  fundLegacyId?: string;
  dealId?: string;
  dealLegacyId?: string;
};

type TrackedEntity = {
  id: string;
  type: ScanEntityType;
  label: string;
  urls: EntityUrl[];
  mentionCandidates: MentionCandidate[];
  searchAliases: string[];
  searchContextTerms: string[];
  ambiguousLabel: boolean;
};

type EntityUrl = {
  url: string;
  expandSite: boolean;
};

type CrawlJob = {
  url: string;
  depth: number;
  kind: SeedKind;
  sourceEntities: TrackedEntity[];
};

type HtmlLink = {
  url: string;
  text: string;
};

type RobotsRules = {
  allow: string[];
  disallow: string[];
  crawlDelayMs?: number;
};

type ExtractedCandidate = {
  title: string;
  summary: string;
  category: DbNewsCategory;
  sourceName: string;
  sourceUrl: string;
  linkedinUrls: string[];
  publishedAt: Date;
  publishedAtInferred: boolean;
  isRumor: boolean;
  confidence: DbNewsConfidence;
  mentions: NewsMentionView[];
};

type CandidateClassification = {
  category: DbNewsCategory;
  confidence: DbNewsConfidence;
  isRumor: boolean;
};

type RunSummary = {
  runAt: string;
  dryRun: boolean;
  options: Options;
  tracked: {
    companies: number;
    fundManagers: number;
    funds: number;
    deals: number;
  };
  crawl: {
    queuedUrls: number;
    websites: number;
    pagesFetched: number;
    pagesSkipped: number;
    excessiveCrawlDelaySkipped: number;
    robotsDisallowed: number;
    nonHtmlSkipped: number;
    failedFetches: number;
    cappedByMaxPages: boolean;
  };
  search: {
    enabled: boolean;
    entitiesSearched: number;
    aliasesSearched: number;
    queriesRun: number;
    resultsFetched: number;
    candidateNewsItems: number;
    acceptedCandidates: number;
    rejectedCandidates: number;
    rejectionReasons: Record<string, number>;
    skippedLinkedInResults: number;
    failedQueries: number;
    sampleQueries: NewsSearchQuery[];
  };
  results: {
    candidateNewsItems: number;
    existingSourceUrlMatches: number;
    outsideDateWindow: number;
    created: number;
    updated: number;
    mentions: number;
  };
  sampleCandidates: Array<{
    title: string;
    category: DbNewsCategory;
    confidence: DbNewsConfidence;
    sourceUrl: string;
  }>;
};

const USER_AGENT = "Infra-MA2-NewsMonitor/1.0 (+public news review queue; no LinkedIn scraping)";
const COMMON_NEWS_PATHS = [
  "/news",
  "/newsroom",
  "/press",
  "/press-releases",
  "/press-release",
  "/media",
  "/media/news",
  "/media/press-releases",
  "/announcements",
  "/insights",
  "/blog",
  "/updates",
  "/about/news",
];

const NEWS_PATH_RE =
  /\b(news|newsroom|press|press-release|press-releases|media|announcement|announcements|insight|insights|blog|updates?|articles?|releases?)\b/i;
const TRANSACTION_RE =
  /\b(acquires?|acquired|acquisition|buyout|take-private|take private|merger|combine[s]? with|combination|divests?|divested|divestiture|sells?|sold|sale of|stake|majority|minority|joint venture|recapitalization|recapitali[sz]ation|strategic investment|invests? in|investment in)\b/i;
const TRANSACTION_HEADLINE_RE =
  /\b(acquires?|acquired|acquisition|buyout|take-private|take private|merger|combine[s]? with|combination|divests?|divested|divestiture|sells?|sold|sale of|majority stake|minority stake|takes? (?:a )?stake|stake in|joint venture|recapitalization|recapitali[sz]ation|strategic investment|invests? in|investment in)\b/i;
const FUNDRAISING_RE =
  /\b(final close|first close|fund close|closes? (?:its )?(?:[\w\s-]+ )?fund|raises? (?:[\w\s$€£.-]{0,60})?(?:fund|capital|commitments?)|raised (?:[\w\s$€£.-]{0,60})?(?:fund|capital|commitments?)|fundrais(?:e|ing)|capital commitments?|commitments? of|hard cap|form d|sec filing|new fund|flagship fund)\b/i;
const RUMOR_RE =
  /\b(rumou?red|sale process|sales process|explor(?:ed|ing|es) (?:a )?sale|strategic alternatives|auction|sell-side|mandate|solicit(?:ing)? bids|takeover interest)\b/i;
const COMPANY_NEWS_RE =
  /\b(appoints?|appointed|launches?|launched|expands?|expanded|opens?|opened|commences?|commenced|starts?|started|completes?|completed|financ(?:e|ing|ed)|award(?:ed|s)?|contract|partnership|rebrand|names? (?:a )?new|operations?|project|portfolio|capacity|facility|network)\b/i;
const GENERIC_TITLE_RE =
  /^(home|news|newsroom|press|press releases?|media|insights?|blog|updates?|about|team|portfolio|our portfolio|.*\bpress release news\b.*|.*\|\s*home)$/i;
const SKIP_EXTENSION_RE =
  /\.(?:pdf|docx?|xlsx?|pptx?|zip|rar|7z|jpg|jpeg|png|gif|webp|svg|ico|mp4|mov|avi|mp3|wav)(?:[?#].*)?$/i;
const BING_NEWS_RSS_URL = "https://www.bing.com/news/search";
const SEARCH_TRANSACTION_TERMS = ["acquisition", "sale", "investment", "stake"];
const SEARCH_FUND_TERMS = ["fund close", "capital commitments", "fundraising"];
const FUTURE_DATE_GRACE_MS = 6 * 60 * 60 * 1000;
const TRACKING_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
];

type NewsSearchArticle = {
  url?: string;
  title?: string;
  seendate?: string;
  description?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
};

type NewsSearchQuery = {
  query: string;
  alias: string;
  reason: string;
};

type SearchCandidateResult =
  | { candidate: ExtractedCandidate; rejectionReason?: never }
  | { candidate: null; rejectionReason: string };

function parseArgs(): Options {
  const args = new Set(process.argv.slice(2));
  const optionValue = (name: string, envName: string, fallback: number): number => {
    const arg = process.argv.find((value) => value.startsWith(`${name}=`));
    const raw = arg?.split("=")[1] ?? process.env[envName];
    const parsed = raw ? Number(raw) : fallback;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const booleanOption = (name: string, envName: string, fallback: boolean): boolean => {
    const arg = process.argv.find((value) => value === name || value.startsWith(`${name}=`));
    const raw = arg?.includes("=") ? arg.split("=")[1] : process.env[envName];
    if (arg && !arg.includes("=")) return true;
    if (!raw) return fallback;
    return !["0", "false", "no", "off"].includes(raw.toLowerCase());
  };
  const stringListOption = (name: string, envName: string): string[] => {
    const values = process.argv
      .filter((value) => value.startsWith(`${name}=`))
      .flatMap((value) => value.split("=").slice(1).join("=").split(","));
    const envValues = (process.env[envName] ?? "").split(",");
    return uniqueStrings([...values, ...envValues].map((value) => value.trim()).filter(Boolean));
  };

  const maxTargetsRaw = process.argv.find((value) => value.startsWith("--max-targets="))?.split("=")[1]
    ?? process.env.NEWS_SCAN_MAX_TARGETS;
  const maxTargets = maxTargetsRaw && Number(maxTargetsRaw) > 0 ? Number(maxTargetsRaw) : undefined;
  const sinceDaysRaw = process.argv.find((value) => value.startsWith("--since-days="))?.split("=")[1]
    ?? process.env.NEWS_SCAN_SINCE_DAYS;
  const sinceDays = sinceDaysRaw && Number(sinceDaysRaw) > 0 ? Number(sinceDaysRaw) : undefined;

  return {
    dryRun: args.has("--dry-run"),
    sourceCrawl: !args.has("--skip-source-crawl") && booleanOption("--source-crawl", "NEWS_SCAN_SOURCE_CRAWL", true),
    newsSearch: !args.has("--no-news-search") && booleanOption("--news-search", "NEWS_SCAN_SEARCH_ENABLED", true),
    targetTerms: stringListOption("--target", "NEWS_SCAN_TARGETS"),
    concurrency: optionValue("--concurrency", "NEWS_SCAN_CONCURRENCY", 3),
    requestDelayMs: optionValue("--delay-ms", "NEWS_SCAN_DELAY_MS", 900),
    maxCrawlDelayMs: optionValue("--max-crawl-delay-ms", "NEWS_SCAN_MAX_CRAWL_DELAY_MS", 30_000),
    maxPages: optionValue("--max-pages", "NEWS_SCAN_MAX_PAGES", 750),
    maxPagesPerSite: optionValue("--max-pages-per-site", "NEWS_SCAN_MAX_PAGES_PER_SITE", 6),
    maxLinksPerPage: optionValue("--max-links-per-page", "NEWS_SCAN_MAX_LINKS_PER_PAGE", 10),
    maxSitemapUrlsPerSite: optionValue("--max-sitemap-urls-per-site", "NEWS_SCAN_MAX_SITEMAP_URLS_PER_SITE", 12),
    searchConcurrency: optionValue("--search-concurrency", "NEWS_SCAN_SEARCH_CONCURRENCY", 1),
    searchDelayMs: optionValue("--search-delay-ms", "NEWS_SCAN_SEARCH_DELAY_MS", 500),
    searchMaxQueriesPerEntity: optionValue("--search-max-queries-per-entity", "NEWS_SCAN_SEARCH_MAX_QUERIES_PER_ENTITY", 3),
    searchMaxResultsPerEntity: optionValue("--search-max-results-per-entity", "NEWS_SCAN_SEARCH_MAX_RESULTS_PER_ENTITY", 5),
    maxTargets,
    sinceDays,
  };
}

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main() {
  const options = parseArgs();
  const prisma = createPrisma();
  const pipelineRunId = options.dryRun ? null : await startPipelineRun(prisma, "NEWS_SCAN", {
    sourceCrawl: options.sourceCrawl,
    newsSearch: options.newsSearch,
    sinceDays: options.sinceDays ?? null,
  });
  const summary: RunSummary = {
    runAt: new Date().toISOString(),
    dryRun: options.dryRun,
    options,
    tracked: { companies: 0, fundManagers: 0, funds: 0, deals: 0 },
    crawl: {
      queuedUrls: 0,
      websites: 0,
      pagesFetched: 0,
      pagesSkipped: 0,
      excessiveCrawlDelaySkipped: 0,
      robotsDisallowed: 0,
      nonHtmlSkipped: 0,
      failedFetches: 0,
      cappedByMaxPages: false,
    },
    search: {
      enabled: options.newsSearch,
      entitiesSearched: 0,
      aliasesSearched: 0,
      queriesRun: 0,
      resultsFetched: 0,
      candidateNewsItems: 0,
      acceptedCandidates: 0,
      rejectedCandidates: 0,
      rejectionReasons: {},
      skippedLinkedInResults: 0,
      failedQueries: 0,
      sampleQueries: [],
    },
    results: {
      candidateNewsItems: 0,
      existingSourceUrlMatches: 0,
      outsideDateWindow: 0,
      created: 0,
      updated: 0,
      mentions: 0,
    },
    sampleCandidates: [],
  };

  try {
    const context = await buildTrackedContext(prisma, options);
    summary.tracked = {
      companies: context.counts.companies,
      fundManagers: context.counts.fundManagers,
      funds: context.counts.funds,
      deals: context.counts.deals,
    };

    const extractedCandidates: ExtractedCandidate[] = [];

    if (options.sourceCrawl) {
      const crawl = await crawlTrackedSources(context.entities, context.candidates, context.candidateByKey, options);
      summary.crawl = { ...summary.crawl, ...crawl.crawlSummary };
      extractedCandidates.push(...crawl.candidates);
    }

    if (options.newsSearch) {
      const search = await searchTrackedNews(context.entities, context.candidates, options);
      summary.search = { ...summary.search, ...search.searchSummary };
      extractedCandidates.push(...search.candidates);
    }

    const mergedCandidates = mergeCandidates(extractedCandidates);
    const candidates = filterCandidatesByDateWindow(mergedCandidates, options);
    summary.results.candidateNewsItems = candidates.length;
    summary.results.outsideDateWindow = mergedCandidates.length - candidates.length;
    summary.results.mentions = candidates.reduce((total, item) => total + item.mentions.length, 0);
    summary.sampleCandidates = candidates.slice(0, 10).map((item) => ({
      title: item.title,
      category: item.category,
      confidence: item.confidence,
      sourceUrl: item.sourceUrl,
    }));

    const persisted = await persistCandidates(prisma, candidates, context.candidateByKey, options.dryRun);
    summary.results = {
      ...summary.results,
      ...persisted,
      mentions: summary.results.mentions,
    };
    if (pipelineRunId) {
      await completePipelineRun(prisma, pipelineRunId, {
        inserted: summary.results.created,
        updated: summary.results.updated,
        skipped: summary.results.existingSourceUrlMatches + summary.results.outsideDateWindow,
      }, {
        tracked: summary.tracked,
        failedFetches: summary.crawl.failedFetches,
        failedQueries: summary.search.failedQueries,
      });
    }
  } catch (error) {
    if (pipelineRunId) await failPipelineRun(prisma, pipelineRunId, error);
    throw error;
  } finally {
    await writeSummary(summary);
    await prisma.$disconnect();
  }

  console.log(JSON.stringify(summary, null, 2));
}

async function buildTrackedContext(prisma: PrismaClient, options: Options) {
  const [companies, managers, funds, deals] = await Promise.all([
    prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        citations: {
          select: {
            evidenceLabel: true,
            source: { select: { label: true, url: true } },
          },
        },
        ownershipPeriods: {
          select: {
            vehicleName: true,
            organization: { select: { name: true } },
            fund: {
              select: {
                fundName: true,
                manager: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.organization.findMany({
      where: { status: "PUBLISHED", types: { has: "FUND_MANAGER" } },
      select: {
        id: true,
        name: true,
        website: true,
        aliases: { select: { alias: true } },
        managedFunds: {
          where: { status: "PUBLISHED" },
          select: { sourceUrls: true, strategyUrl: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.fund.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        legacyId: true,
        fundName: true,
        sourceUrls: true,
        strategyUrl: true,
        manager: {
          select: {
            id: true,
            name: true,
            website: true,
            aliases: { select: { alias: true } },
          },
        },
      },
      orderBy: { fundName: "asc" },
    }),
    prisma.deal.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        legacyId: true,
        title: true,
        target: true,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const managerById = new Map<string, MentionCandidate>();
  const candidates: MentionCandidate[] = [];
  const entities: TrackedEntity[] = [];

  for (const company of companies) {
    const companySearchAliases = searchAliasesFromValues([
      company.name,
      ...knownCompanySearchAliases(company.name),
    ]);
    const companyContextTerms = searchAliasesFromValues([
      ...company.ownershipPeriods.flatMap((period) => [
        period.vehicleName,
        period.organization?.name,
        period.fund?.fundName,
        period.fund?.manager.name,
      ]),
      ...managerNamesFromText(company.description),
    ]);
    const candidate: MentionCandidate = {
      id: company.id,
      label: company.name,
      type: "PortCo",
      href: `/portfolio?focus=${encodeURIComponent(company.id)}`,
      aliases: companyAliases(company.name, knownCompanySearchAliases(company.name)),
      dbType: "COMPANY",
      companyId: company.id,
    };
    candidates.push(candidate);

    entities.push({
      id: company.id,
      type: "COMPANY",
      label: company.name,
      mentionCandidates: [candidate],
      urls: uniqueEntityUrls([
        company.website ? { url: company.website, expandSite: true } : null,
        ...company.citations.map((citation) => citation.source.url ? { url: citation.source.url, expandSite: false } : null),
      ]),
      searchAliases: companySearchAliases,
      searchContextTerms: companyContextTerms,
      ambiguousLabel: isAmbiguousSearchAlias(company.name),
    });
  }

  for (const manager of managers) {
    const candidate: MentionCandidate = {
      id: manager.id,
      label: manager.name,
      type: "Investment Firm",
      href: "/funds",
      aliases: managerAliases(manager.name, manager.aliases.map((alias) => alias.alias)),
      dbType: "FUND_MANAGER",
      organizationId: manager.id,
    };
    managerById.set(manager.id, candidate);
    candidates.push(candidate);

    const fundUrls = manager.managedFunds.flatMap((fund) => [
      fund.strategyUrl ? { url: fund.strategyUrl, expandSite: true } : null,
      ...fund.sourceUrls.map((url) => ({ url, expandSite: false })),
    ]);

    entities.push({
      id: manager.id,
      type: "FUND_MANAGER",
      label: manager.name,
      mentionCandidates: [candidate],
      urls: uniqueEntityUrls([
        manager.website ? { url: manager.website, expandSite: true } : null,
        ...fundUrls,
      ]),
      searchAliases: searchAliasesFromValues([
        manager.name,
        ...manager.aliases.map((alias) => alias.alias),
      ]),
      searchContextTerms: searchAliasesFromValues(manager.managedFunds.flatMap((fund) => [
        ...fund.sourceUrls.flatMap(searchAliasHintsFromUrl),
        ...searchAliasHintsFromUrl(fund.strategyUrl),
      ])),
      ambiguousLabel: isAmbiguousSearchAlias(manager.name),
    });
  }

  for (const fund of funds) {
    const managerCandidate = managerById.get(fund.manager.id);
    const fundCandidate: MentionCandidate = {
      id: fund.legacyId,
      label: fund.fundName,
      type: "Fund",
      href: `/funds?focus=${encodeURIComponent(fund.legacyId)}`,
      aliases: fundAliases(fund.fundName),
      dbType: "FUND",
      fundId: fund.id,
      fundLegacyId: fund.legacyId,
    };
    candidates.push(fundCandidate);

    entities.push({
      id: fund.id,
      type: "FUND",
      label: fund.fundName,
      mentionCandidates: managerCandidate ? [fundCandidate, managerCandidate] : [fundCandidate],
      urls: uniqueEntityUrls([
        fund.strategyUrl ? { url: fund.strategyUrl, expandSite: true } : null,
        fund.manager.website ? { url: fund.manager.website, expandSite: true } : null,
        ...fund.sourceUrls.map((url) => ({ url, expandSite: false })),
      ]),
      searchAliases: searchAliasesFromValues([fund.fundName]),
      searchContextTerms: searchAliasesFromValues([
        fund.manager.name,
        ...fund.manager.aliases.map((alias) => alias.alias),
        ...searchAliasHintsFromUrl(fund.strategyUrl),
        ...fund.sourceUrls.flatMap(searchAliasHintsFromUrl),
      ]),
      ambiguousLabel: isAmbiguousSearchAlias(fund.fundName),
    });
  }

  for (const deal of deals) {
    const aliases = [
      ...companyAliases(deal.target).map((alias) => ({ ...alias, confidence: "Medium" as NewsConfidence, reason: "Existing deal target" })),
      {
        term: normalizeNewsText(deal.title),
        confidence: "Medium" as NewsConfidence,
        reason: "Existing deal title",
      },
    ].filter((alias) => alias.term);

    candidates.push({
      id: deal.legacyId,
      label: deal.title,
      type: "Deal",
      href: `/tracker?focus=${encodeURIComponent(deal.legacyId)}`,
      aliases,
      dbType: "DEAL",
      dealId: deal.id,
      dealLegacyId: deal.legacyId,
    });
  }

  const targetFilteredEntities = options.targetTerms.length > 0
    ? entities.filter((entity) => entityMatchesTargets(entity, options.targetTerms))
    : entities;
  const selectedEntities = options.maxTargets ? targetFilteredEntities.slice(0, options.maxTargets) : targetFilteredEntities;
  const candidateByKey = new Map(candidates.map((candidate) => [`${candidate.type}:${candidate.id}`, candidate]));

  return {
    entities: selectedEntities,
    candidates,
    candidateByKey,
    counts: {
      companies: companies.length,
      fundManagers: managers.length,
      funds: funds.length,
      deals: deals.length,
    },
  };
}

function knownCompanySearchAliases(name: string): string[] {
  const normalized = normalizeNewsText(name);
  if (normalized === "iac") return ["International Aerospace Coatings"];
  return [];
}

function searchAliasesFromValues(values: Array<string | null | undefined>): string[] {
  const aliases = new Map<string, string>();
  for (const value of values) {
    const cleaned = cleanSearchTerm(value);
    if (!cleaned) continue;
    const normalized = normalizeNewsText(cleaned);
    if (!normalized || !isSearchableAlias(normalized)) continue;
    if (!aliases.has(normalized)) aliases.set(normalized, cleaned);
  }
  return Array.from(aliases.values()).slice(0, 12);
}

function searchAliasHintsFromUrl(value: string | null | undefined): string[] {
  const parsed = value ? safeUrl(value) : null;
  if (!parsed) return [];
  const slug = parsed.pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!slug || slug.length < 8) return [];
  return [slug];
}

function managerNamesFromText(value: string): string[] {
  const names = new Set<string>();
  const firmRe = /\b([A-Z][A-Za-z.&']+(?:\s+[A-Z][A-Za-z.&']+){0,3}\s+(?:Infrastructure|Capital|Partners|Management|Investments|Asset Managers?))\b/g;
  let match: RegExpExecArray | null;
  while ((match = firmRe.exec(value)) !== null) {
    names.add(match[1]);
  }
  return Array.from(names).slice(0, 8);
}

function cleanSearchTerm(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/^.*?[—–-]\s*/, "")
    .replace(/\b(?:pr newswire|globenewswire|newswire|article|website|press release)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSearchableAlias(normalized: string): boolean {
  if (!normalized) return false;
  if (["not disclosed", "n a", "na", "portfolio", "who we are"].includes(normalized)) return false;
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 1) return tokens[0].length >= 2;
  if (tokens.length > 12) return false;
  return normalized.length >= 5;
}

function isAmbiguousSearchAlias(value: string): boolean {
  const normalized = normalizeNewsText(value);
  const tokens = normalized.split(" ").filter(Boolean);
  return tokens.length === 1 && tokens[0].length <= 4;
}

function entityMatchesTargets(entity: TrackedEntity, targetTerms: string[]): boolean {
  const haystack = normalizeNewsText([
    entity.label,
    ...entity.searchAliases,
    ...entity.searchContextTerms,
    ...entity.mentionCandidates.flatMap((candidate) => candidate.aliases.map((alias) => alias.term)),
  ].join(" "));

  return targetTerms.some((target) => {
    const normalized = normalizeNewsText(target);
    return normalized && haystack.includes(normalized);
  });
}

function uniqueEntityUrls(urls: Array<EntityUrl | null>): EntityUrl[] {
  const seen = new Map<string, EntityUrl>();
  for (const entry of urls) {
    if (!entry) continue;
    const normalized = normalizeUrl(entry.url);
    if (!normalized || isLinkedInUrl(normalized)) continue;
    if (!seen.has(normalized)) {
      seen.set(normalized, { url: normalized, expandSite: entry.expandSite });
      continue;
    }
    if (entry.expandSite) {
      seen.set(normalized, { url: normalized, expandSite: true });
    }
  }
  return Array.from(seen.values());
}

async function crawlTrackedSources(
  entities: TrackedEntity[],
  candidates: MentionCandidate[],
  candidateByKey: Map<string, MentionCandidate>,
  options: Options,
) {
  const queue = buildInitialQueue(entities);
  const seen = new Set(queue.map((job) => job.url));
  const pagesByOrigin = new Map<string, number>();
  const sitemapAddsByOrigin = new Map<string, number>();
  const robotsByOrigin = new Map<string, Promise<RobotsRules>>();
  const originLocks = new Map<string, Promise<void>>();
  const lastFetchAt = new Map<string, number>();
  const extracted: ExtractedCandidate[] = [];
  const websiteOrigins = new Set(queue.map((job) => originOf(job.url)).filter((origin): origin is string => !!origin));
  let fetchBudgetUsed = 0;

  const crawlSummary = {
    queuedUrls: queue.length,
    websites: websiteOrigins.size,
    pagesFetched: 0,
    pagesSkipped: 0,
    excessiveCrawlDelaySkipped: 0,
    robotsDisallowed: 0,
    nonHtmlSkipped: 0,
    failedFetches: 0,
    cappedByMaxPages: false,
  };

  const enqueue = (job: CrawlJob) => {
    const normalized = normalizeUrl(job.url);
    if (!normalized || seen.has(normalized) || isLinkedInUrl(normalized)) return;
    if (SKIP_EXTENSION_RE.test(normalized)) return;
    seen.add(normalized);
    queue.push({ ...job, url: normalized });
    const origin = originOf(normalized);
    if (origin) websiteOrigins.add(origin);
  };

  const worker = async () => {
    while (queue.length > 0) {
      if (fetchBudgetUsed >= options.maxPages) {
        crawlSummary.cappedByMaxPages = queue.length > 0;
        queue.length = 0;
        return;
      }

      const job = queue.shift();
      if (!job) return;

      const origin = originOf(job.url);
      if (!origin) {
        crawlSummary.pagesSkipped++;
        continue;
      }

      const originCount = pagesByOrigin.get(origin) ?? 0;
      if (originCount >= options.maxPagesPerSite) {
        crawlSummary.pagesSkipped++;
        continue;
      }

      const robots = await getRobots(origin, robotsByOrigin);
      if (!isAllowedByRobots(job.url, robots)) {
        crawlSummary.robotsDisallowed++;
        continue;
      }
      if ((robots.crawlDelayMs ?? 0) > options.maxCrawlDelayMs && (originCount > 0 || lastFetchAt.has(origin))) {
        crawlSummary.excessiveCrawlDelaySkipped++;
        continue;
      }

      fetchBudgetUsed++;
      const response = await withOriginLock(origin, originLocks, async () => {
        const canFetch = await waitForPoliteSlot(
          origin,
          robots,
          lastFetchAt,
          options.requestDelayMs,
          options.maxCrawlDelayMs,
        );
        if (!canFetch) return { ok: false as const, skippedForCrawlDelay: true };
        return fetchPage(job.url);
      });

      if (!response.ok) {
        if ("skippedForCrawlDelay" in response) {
          crawlSummary.excessiveCrawlDelaySkipped++;
          continue;
        }
        crawlSummary.failedFetches++;
        continue;
      }

      pagesByOrigin.set(origin, originCount + 1);
      crawlSummary.pagesFetched++;

      if (response.kind === "sitemap") {
        for (const url of extractSitemapUrls(response.body)) {
          const normalized = normalizeUrl(url);
          if (!normalized || originOf(normalized) !== origin) continue;
          const added = sitemapAddsByOrigin.get(origin) ?? 0;
          if (added >= options.maxSitemapUrlsPerSite) break;

          if (isSitemapUrl(normalized)) {
            sitemapAddsByOrigin.set(origin, added + 1);
            enqueue({ url: normalized, depth: job.depth + 1, kind: "sitemap", sourceEntities: job.sourceEntities });
            continue;
          }

          if (isLikelyNewsUrl(normalized, "")) {
            sitemapAddsByOrigin.set(origin, added + 1);
            enqueue({ url: normalized, depth: job.depth + 1, kind: "discovered", sourceEntities: job.sourceEntities });
          }
        }
        continue;
      }

      if (response.kind !== "html") {
        crawlSummary.nonHtmlSkipped++;
        continue;
      }

      const candidate = extractCandidate(job, response.body, candidates, candidateByKey);
      if (candidate) extracted.push(candidate);

      if (job.depth >= 1) continue;
      const links = extractLinks(response.body, job.url)
        .filter((link) => originOf(link.url) === origin)
        .filter((link) => isLikelyNewsUrl(link.url, link.text))
        .slice(0, options.maxLinksPerPage);

      for (const link of links) {
        enqueue({ url: link.url, depth: job.depth + 1, kind: "discovered", sourceEntities: job.sourceEntities });
      }
    }
  };

  await Promise.all(Array.from({ length: options.concurrency }, () => worker()));

  crawlSummary.queuedUrls = seen.size;
  crawlSummary.websites = websiteOrigins.size;

  return { candidates: extracted, crawlSummary };
}

async function searchTrackedNews(
  entities: TrackedEntity[],
  candidates: MentionCandidate[],
  options: Options,
) {
  const queue = [...entities];
  const extracted: ExtractedCandidate[] = [];
  const searchSummary = {
    enabled: true,
    entitiesSearched: entities.length,
    aliasesSearched: 0,
    queriesRun: 0,
    resultsFetched: 0,
    candidateNewsItems: 0,
    acceptedCandidates: 0,
    rejectedCandidates: 0,
    rejectionReasons: {} as Record<string, number>,
    skippedLinkedInResults: 0,
    failedQueries: 0,
    sampleQueries: [] as NewsSearchQuery[],
  };
  const incrementRejection = (reason: string) => {
    searchSummary.rejectedCandidates++;
    searchSummary.rejectionReasons[reason] = (searchSummary.rejectionReasons[reason] ?? 0) + 1;
  };

  const worker = async () => {
    while (queue.length > 0) {
      const entity = queue.shift();
      if (!entity) return;

      const queries = newsSearchQueries(entity, options);
      if (queries.length === 0) continue;
      searchSummary.aliasesSearched += new Set(queries.map((query) => query.alias)).size;

      for (const query of queries) {
        if (searchSummary.sampleQueries.length < 20) {
          searchSummary.sampleQueries.push(query);
        }
        searchSummary.queriesRun++;
        const articles = await fetchNewsSearchArticles(query.query, options);
        if (!articles) {
          searchSummary.failedQueries++;
          await wait(options.searchDelayMs);
          continue;
        }

        searchSummary.resultsFetched += articles.length;
        for (const article of articles) {
          const sourceUrl = normalizeUrl(article.url);
          if (!sourceUrl) {
            incrementRejection("invalid-url");
            continue;
          }
          if (isLinkedInUrl(sourceUrl)) {
            searchSummary.skippedLinkedInResults++;
            incrementRejection("linkedin-result");
            continue;
          }
          const result = candidateFromNewsSearchArticle(article, entity, sourceUrl, candidates);
          if (!result.candidate) {
            incrementRejection(result.rejectionReason);
            continue;
          }
          searchSummary.acceptedCandidates++;
          extracted.push(result.candidate);
        }

        await wait(options.searchDelayMs);
      }
    }
  };

  await Promise.all(Array.from({ length: options.searchConcurrency }, () => worker()));

  searchSummary.candidateNewsItems = extracted.length;
  return { candidates: extracted, searchSummary };
}

function newsSearchQueries(entity: TrackedEntity, options: Options): NewsSearchQuery[] {
  const queries: NewsSearchQuery[] = [];
  const add = (query: string, alias: string, reason: string) => {
    const cleanedQuery = query.replace(/\s+/g, " ").trim();
    if (!cleanedQuery || queries.some((existing) => existing.query === cleanedQuery)) return;
    queries.push({ query: cleanedQuery, alias, reason });
  };

  const aliases = searchAliasesFromValues([
    entity.label,
    ...entity.searchAliases,
    ...entity.mentionCandidates.flatMap((candidate) => candidate.aliases.map((alias) => alias.term)),
  ]);
  const rankedAliases = aliases.sort((first, second) => aliasSearchRank(second) - aliasSearchRank(first));
  const contextTerms = searchAliasesFromValues(entity.searchContextTerms).slice(0, 3);
  const intentTerms = entity.type === "FUND" ? SEARCH_FUND_TERMS : SEARCH_TRANSACTION_TERMS;

  if (entity.ambiguousLabel) {
    const fullAliases = rankedAliases.filter((alias) => !isAmbiguousSearchAlias(alias)).slice(0, 2);
    const shortAliases = searchAliasesFromValues([
      entity.label,
      ...rankedAliases.filter((alias) => isAmbiguousSearchAlias(alias)),
    ]).slice(0, 2);

    for (const alias of shortAliases.slice(0, 2)) {
      const quotedAlias = quoteSearchTerm(alias);
      for (const intentTerm of intentTerms.slice(0, 3)) {
        add(`${quotedAlias} ${intentTerm}`, alias, "news-intent");
      }
      for (const contextTerm of contextTerms.slice(0, 2)) {
        add(`${quotedAlias} ${quoteSearchTerm(contextTerm)}`, alias, "entity-disambiguator");
      }
    }
    for (const alias of fullAliases.slice(0, 2)) {
      add(quoteSearchTerm(alias), alias, "known-full-alias");
    }
    for (const alias of fullAliases.slice(0, 2)) {
      const quotedAlias = quoteSearchTerm(alias);
      for (const intentTerm of intentTerms.slice(0, 2)) {
        add(`${quotedAlias} ${intentTerm}`, alias, "news-intent");
      }
    }

    return queries.slice(0, options.searchMaxQueriesPerEntity);
  }

  for (const alias of rankedAliases.slice(0, 2)) {
    const quotedAlias = quoteSearchTerm(alias);
    add(quotedAlias, alias, "exact-label");
    for (const contextTerm of contextTerms.slice(0, 2)) {
      add(`${quotedAlias} ${quoteSearchTerm(contextTerm)}`, alias, "entity-disambiguator");
    }
    for (const intentTerm of intentTerms.slice(0, 2)) {
      add(`${quotedAlias} ${intentTerm}`, alias, "news-intent");
    }
  }

  return queries.slice(0, options.searchMaxQueriesPerEntity);
}

function aliasSearchRank(value: string): number {
  const normalized = normalizeNewsText(value);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length >= 3) return 5;
  if (tokens.length === 2) return 4;
  if (tokens[0]?.length > 4) return 3;
  return 1;
}

function quoteSearchTerm(value: string): string {
  return `"${value.replace(/["“”]/g, " ").replace(/\s+/g, " ").trim()}"`;
}

async function fetchNewsSearchArticles(query: string, options: Options): Promise<NewsSearchArticle[] | null> {
  const params = new URLSearchParams({
    q: query,
    format: "rss",
    mkt: "en-US",
  });
  const url = `${BING_NEWS_RSS_URL}?${params.toString()}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/rss+xml,application/xml,text/xml",
        },
        signal: AbortSignal.timeout(30_000),
      });
      const xml = await response.text();

      if ((!response.ok || /limit requests|too many requests|rate/i.test(xml)) && attempt < 3) {
        await wait(Math.max(options.searchDelayMs, 6_000));
        continue;
      }
      if (!response.ok) return null;

      return parseBingNewsRss(xml, options.searchMaxResultsPerEntity);
    } catch {
      if (attempt < 3) {
        await wait(Math.max(options.searchDelayMs, 6_000));
        continue;
      }
      return null;
    }
  }

  return null;
}

function parseBingNewsRss(xml: string, maxResults: number): NewsSearchArticle[] {
  const articles: NewsSearchArticle[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null && articles.length < maxResults) {
    const item = match[1];
    const link = decodeHtml(firstMatch(item, /<link>([\s\S]*?)<\/link>/i));
    const url = directPublisherUrlFromBingLink(link);
    if (!url) continue;

    const pubDate = cleanText(firstMatch(item, /<pubDate>([\s\S]*?)<\/pubDate>/i));
    const title = cleanText(firstMatch(item, /<title>([\s\S]*?)<\/title>/i));
    const description = cleanText(firstMatch(item, /<description>([\s\S]*?)<\/description>/i));
    const source = cleanText(firstMatch(item, /<News:Source>([\s\S]*?)<\/News:Source>/i));
    const domain = safeUrl(url)?.hostname.replace(/^www\./, "");

    articles.push({
      url,
      title,
      description,
      seendate: pubDate,
      domain: source || domain,
      language: "English",
    });
  }

  return articles;
}

function directPublisherUrlFromBingLink(link: string): string | null {
  const normalized = normalizeUrl(link);
  if (!normalized) return null;
  const parsed = safeUrl(normalized);
  const target = parsed?.searchParams.get("url");
  return normalizeUrl(target ?? normalized);
}

function candidateFromNewsSearchArticle(
  article: NewsSearchArticle,
  entity: TrackedEntity,
  sourceUrl: string,
  candidates: MentionCandidate[],
): SearchCandidateResult {
  if (SKIP_EXTENSION_RE.test(sourceUrl)) return { candidate: null, rejectionReason: "non-html-result" };
  if (article.language && article.language.toLowerCase() !== "english") {
    return { candidate: null, rejectionReason: "non-english-result" };
  }

  const title = cleanText(article.title ?? "");
  if (!title || title.length < 8 || GENERIC_TITLE_RE.test(title)) {
    return { candidate: null, rejectionReason: "weak-title" };
  }
  const searchSummary = cleanText(article.description ?? "");
  const headlineText = `${title} ${searchSummary}`;
  if (!textMentionsEntity(headlineText, entity)) {
    return { candidate: null, rejectionReason: "entity-not-mentioned" };
  }

  const publishedAt = parseNewsSearchDate(article.seendate ?? "");
  if (!publishedAt) return { candidate: null, rejectionReason: "missing-date" };

  const titleHasEntity = textMentionsEntity(title, entity);
  const sourceMentions = entity.mentionCandidates.map((candidate) =>
    mentionFromCandidate(
      candidate,
      titleHasEntity ? "High" : "Medium",
      "Matched public-news search query",
    ),
  );
  const text = `${title} ${searchSummary} ${entity.label} ${article.domain ?? ""}`;
  const matchedMentions = matchNewsCandidates(text, candidates, 20);
  const mentions = mergeNewsMentions(sourceMentions, matchedMentions);
  if (mentions.length === 0) return { candidate: null, rejectionReason: "no-mentions" };

  const summary = [
    searchSummary || `Public news search result for ${entity.label}.`,
    article.domain ? `Source domain: ${article.domain}.` : "",
    article.sourcecountry ? `Source country: ${article.sourcecountry}.` : "",
  ].filter(Boolean).join(" ");

  const classification = classifyCandidate({
    title,
    summary,
    text,
    url: sourceUrl,
    mentions,
    hasParsedDate: true,
  });
  if (entity.ambiguousLabel && !hasAmbiguousEntityDisambiguator(headlineText, entity, mentions)) {
    return { candidate: null, rejectionReason: "ambiguous-entity-without-disambiguator" };
  }
  if (classification.category === "LOW_CONFIDENCE_NEEDS_REVIEW") {
    return { candidate: null, rejectionReason: "low-confidence-search-result" };
  }
  if (!isHeadlineSupportedPublicSearchCategory(classification.category, title)) {
    return { candidate: null, rejectionReason: "public-search-category-not-headline-supported" };
  }

  return {
    candidate: {
      title: trimTo(title, 220),
      summary: trimTo(summary || title, 500),
      category: classification.category,
      sourceName: article.domain ? trimTo(article.domain, 80) : sourceNameFromUrl(sourceUrl),
      sourceUrl,
      linkedinUrls: [],
      publishedAt,
      publishedAtInferred: false,
      isRumor: classification.isRumor,
      confidence: classification.confidence,
      mentions,
    },
  };
}

function isHeadlineSupportedPublicSearchCategory(category: DbNewsCategory, headlineText: string): boolean {
  if (category === "TRANSACTION_ACTIVITY") return TRANSACTION_HEADLINE_RE.test(headlineText);
  if (category === "FUNDRAISING_ACTIVITY") return FUNDRAISING_RE.test(headlineText);
  if (category === "RUMORED_SALES_PROCESS") return RUMOR_RE.test(headlineText);
  return false;
}

function textMentionsEntity(text: string, entity: TrackedEntity): boolean {
  const normalizedText = ` ${normalizeNewsText(text)} `;
  return entity.mentionCandidates.some((candidate) =>
    candidate.aliases.some((alias) => normalizedText.includes(` ${alias.term} `)),
  );
}

function hasAmbiguousEntityDisambiguator(
  text: string,
  entity: TrackedEntity,
  mentions: NewsMentionView[],
): boolean {
  const normalizedText = ` ${normalizeNewsText(text)} `;
  if (entity.searchAliases.some((alias) => !isAmbiguousSearchAlias(alias) && normalizedText.includes(` ${normalizeNewsText(alias)} `))) {
    return true;
  }
  if (entity.searchContextTerms.some((term) => normalizedText.includes(` ${normalizeNewsText(term)} `))) {
    return true;
  }
  if (TRANSACTION_RE.test(text) || RUMOR_RE.test(text)) {
    return mentions.some((mention) => (
      !entity.mentionCandidates.some((candidate) => candidate.id === mention.id && candidate.type === mention.type)
      && (mention.type === "Investment Firm" || mention.type === "Fund" || mention.type === "Deal")
    ));
  }
  return false;
}

function parseNewsSearchDate(value: string): Date | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return parseDate(value);
  const [, year, month, day, hour, minute, second] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildInitialQueue(entities: TrackedEntity[]): CrawlJob[] {
  const byUrl = new Map<string, CrawlJob>();

  const add = (url: string, sourceEntities: TrackedEntity[], kind: SeedKind, depth = 0) => {
    const normalized = normalizeUrl(url);
    if (!normalized || isLinkedInUrl(normalized) || SKIP_EXTENSION_RE.test(normalized)) return;
    const existing = byUrl.get(normalized);
    if (existing) {
      existing.sourceEntities = mergeEntities(existing.sourceEntities, sourceEntities);
      return;
    }
    byUrl.set(normalized, { url: normalized, depth, kind, sourceEntities });
  };

  for (const entity of entities) {
    for (const entry of entity.urls) {
      add(entry.url, [entity], entry.expandSite ? "official" : "source");

      if (!entry.expandSite) continue;
      const parsed = safeUrl(entry.url);
      if (!parsed) continue;
      const origin = parsed.origin;
      add(origin, [entity], "official");
      add(`${origin}/sitemap.xml`, [entity], "sitemap");
      for (const commonPath of COMMON_NEWS_PATHS) {
        add(`${origin}${commonPath}`, [entity], "common-path");
      }
    }
  }

  return Array.from(byUrl.values());
}

function mergeEntities(existing: TrackedEntity[], incoming: TrackedEntity[]): TrackedEntity[] {
  const byKey = new Map(existing.map((entity) => [`${entity.type}:${entity.id}`, entity]));
  for (const entity of incoming) byKey.set(`${entity.type}:${entity.id}`, entity);
  return Array.from(byKey.values());
}

async function getRobots(origin: string, cache: Map<string, Promise<RobotsRules>>): Promise<RobotsRules> {
  if (!cache.has(origin)) {
    cache.set(origin, fetchRobots(origin));
  }
  return cache.get(origin)!;
}

async function fetchRobots(origin: string): Promise<RobotsRules> {
  try {
    const response = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { allow: [], disallow: [] };
    return parseRobots(await response.text());
  } catch {
    return { allow: [], disallow: [] };
  }
}

function parseRobots(body: string): RobotsRules {
  const rules: RobotsRules = { allow: [], disallow: [] };
  let applies = false;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      const agent = value.toLowerCase();
      applies = agent === "*" || USER_AGENT.toLowerCase().includes(agent);
      continue;
    }

    if (!applies) continue;
    if (field === "allow" && value) rules.allow.push(value);
    if (field === "disallow" && value) rules.disallow.push(value);
    if (field === "crawl-delay") {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds > 0) {
        rules.crawlDelayMs = Math.max(rules.crawlDelayMs ?? 0, seconds * 1000);
      }
    }
  }

  return rules;
}

function isAllowedByRobots(url: string, rules: RobotsRules): boolean {
  const parsed = safeUrl(url);
  if (!parsed) return false;
  const pathAndQuery = `${parsed.pathname}${parsed.search}`;
  const disallow = longestRobotsMatch(pathAndQuery, rules.disallow);
  if (disallow === 0) return true;
  const allow = longestRobotsMatch(pathAndQuery, rules.allow);
  return allow >= disallow;
}

function longestRobotsMatch(pathAndQuery: string, patterns: string[]): number {
  let longest = 0;
  for (const pattern of patterns) {
    if (!pattern || pattern === "/") {
      if (pattern === "/" && pathAndQuery.startsWith("/")) longest = Math.max(longest, 1);
      continue;
    }
    if (pathAndQuery.startsWith(pattern)) longest = Math.max(longest, pattern.length);
  }
  return longest;
}

async function withOriginLock<T>(
  origin: string,
  locks: Map<string, Promise<void>>,
  task: () => Promise<T>,
): Promise<T> {
  const previous = locks.get(origin) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(origin, previous.then(() => current, () => current));
  await previous.catch(() => undefined);
  try {
    return await task();
  } finally {
    release();
  }
}

async function waitForPoliteSlot(
  origin: string,
  robots: RobotsRules,
  lastFetchAt: Map<string, number>,
  requestDelayMs: number,
  maxCrawlDelayMs: number,
): Promise<boolean> {
  const delayMs = Math.max(requestDelayMs, robots.crawlDelayMs ?? 0);
  const last = lastFetchAt.get(origin) ?? 0;
  const waitMs = delayMs - (Date.now() - last);
  if (waitMs > 0) {
    if ((robots.crawlDelayMs ?? 0) > maxCrawlDelayMs) return false;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastFetchAt.set(origin, Date.now());
  return true;
}

async function fetchPage(url: string): Promise<{ ok: true; kind: "html" | "sitemap" | "other"; body: string } | { ok: false }> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.4",
      },
      signal: AbortSignal.timeout(18_000),
    });
    if (!response.ok) return { ok: false };

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const finalUrl = normalizeUrl(response.url) ?? url;
    const body = await response.text();
    const trimmed = body.slice(0, 1_500_000);

    if (isSitemapUrl(finalUrl) || contentType.includes("xml")) {
      return { ok: true, kind: "sitemap", body: trimmed };
    }
    if (contentType.includes("html") || /<html[\s>]/i.test(trimmed)) {
      return { ok: true, kind: "html", body: trimmed };
    }
    return { ok: true, kind: "other", body: "" };
  } catch {
    return { ok: false };
  }
}

function extractCandidate(
  job: CrawlJob,
  html: string,
  candidates: MentionCandidate[],
  candidateByKey: Map<string, MentionCandidate>,
): ExtractedCandidate | null {
  const title = cleanText(
    firstMatch(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
    || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || "",
  );
  if (!title || GENERIC_TITLE_RE.test(title)) return null;

  const summary = cleanText(
    firstMatch(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || firstMatch(html, /<p[^>]*>([\s\S]{80,900}?)<\/p>/i)
    || "",
  );

  const bodyText = cleanText(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .slice(0, 80_000));
  const text = `${title} ${summary} ${bodyText.slice(0, 20_000)}`;
  const linkedinUrls = extractLinkedInUrls(html);
  const matchedMentions = matchNewsCandidates(text, candidates, 20);
  const sourceMentions = job.sourceEntities.flatMap((entity) =>
    entity.mentionCandidates.map((candidate) => mentionFromCandidate(candidate, "High", "Scanned tracked entity source")),
  );
  const mentions = mergeNewsMentions(sourceMentions, matchedMentions);
  if (mentions.length === 0) return null;

  const publishedAt = extractPublishedAt(html, job.url);
  const classification = classifyCandidate({
    title,
    summary,
    text,
    url: job.url,
    mentions,
    hasParsedDate: !!publishedAt,
  });

  if (!shouldKeepCandidate(job, title, summary, text, classification, linkedinUrls)) return null;

  return {
    title: trimTo(title, 220),
    summary: trimTo(summary || fallbackSummary(text, title), 500),
    category: classification.category,
    sourceName: sourceNameFromUrl(job.url),
    sourceUrl: job.url,
    linkedinUrls,
    publishedAt: publishedAt ?? new Date(),
    publishedAtInferred: !publishedAt,
    isRumor: classification.isRumor,
    confidence: classification.confidence,
    mentions,
  };
}

function classifyCandidate(input: {
  title: string;
  summary: string;
  text: string;
  url: string;
  mentions: NewsMentionView[];
  hasParsedDate: boolean;
}): CandidateClassification {
  const compactText = `${input.title} ${input.summary} ${input.text.slice(0, 5000)}`;
  const headlineText = `${input.title} ${input.summary}`;
  const hasCompanyMention = input.mentions.some((mention) => mention.type === "PortCo");
  const hasFirmMention = input.mentions.some((mention) => mention.type === "Investment Firm");
  const hasFundMention = input.mentions.some((mention) => mention.type === "Fund");

  let category: DbNewsCategory = "LOW_CONFIDENCE_NEEDS_REVIEW";
  if (RUMOR_RE.test(headlineText)) category = "RUMORED_SALES_PROCESS";
  else if (FUNDRAISING_RE.test(compactText)) category = "FUNDRAISING_ACTIVITY";
  else if (TRANSACTION_RE.test(compactText)) category = "TRANSACTION_ACTIVITY";
  else if (RUMOR_RE.test(compactText)) category = "RUMORED_SALES_PROCESS";
  else if (hasCompanyMention && COMPANY_NEWS_RE.test(compactText)) category = "PORTFOLIO_COMPANY_NEWS";
  else if ((hasFirmMention || hasFundMention) && COMPANY_NEWS_RE.test(compactText)) category = "INVESTMENT_FIRM_NEWS";

  let score = 0;
  if (category !== "LOW_CONFIDENCE_NEEDS_REVIEW") score += 2;
  if (input.hasParsedDate) score += 1;
  if (NEWS_PATH_RE.test(input.url)) score += 1;
  if (input.mentions.some((mention) => mention.confidence === "High")) score += 1;
  if (input.summary.length >= 80) score += 1;
  if (GENERIC_TITLE_RE.test(input.title)) score -= 2;

  const confidence: DbNewsConfidence = category === "LOW_CONFIDENCE_NEEDS_REVIEW"
    ? "LOW"
    : score >= 5
      ? "HIGH"
      : score >= 3
        ? "MEDIUM"
        : "LOW";

  if (confidence === "LOW") {
    return {
      category: "LOW_CONFIDENCE_NEEDS_REVIEW",
      confidence,
      isRumor: RUMOR_RE.test(compactText),
    };
  }

  return {
    category,
    confidence,
    isRumor: category === "RUMORED_SALES_PROCESS",
  };
}

function shouldKeepCandidate(
  job: CrawlJob,
  title: string,
  summary: string,
  text: string,
  classification: CandidateClassification,
  linkedinUrls: string[],
): boolean {
  const strongSignal = TRANSACTION_RE.test(`${title} ${summary}`)
    || FUNDRAISING_RE.test(`${title} ${summary}`)
    || RUMOR_RE.test(`${title} ${summary}`);
  const newsSurface = NEWS_PATH_RE.test(job.url)
    || /\/20\d{2}\/[01]?\d\//.test(safeUrl(job.url)?.pathname ?? "")
    || strongSignal;

  if (classification.category !== "LOW_CONFIDENCE_NEEDS_REVIEW") return newsSurface;
  if (job.kind === "source" && (TRANSACTION_RE.test(text) || FUNDRAISING_RE.test(text) || RUMOR_RE.test(text))) return true;
  if (linkedinUrls.length > 0 && NEWS_PATH_RE.test(job.url) && summary.length >= 60) return true;
  return NEWS_PATH_RE.test(job.url) && summary.length >= 100 && title.length >= 12;
}

function mentionFromCandidate(candidate: MentionCandidate, confidence: NewsConfidence, reason: string): NewsMentionView {
  return {
    id: candidate.id,
    label: candidate.label,
    type: candidate.type,
    href: candidate.href,
    confidence,
    reason,
  };
}

function mergeCandidates(candidates: ExtractedCandidate[]): ExtractedCandidate[] {
  const byUrl = new Map<string, ExtractedCandidate>();

  for (const candidate of candidates) {
    const key = candidateMergeKey(candidate);
    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, candidate);
      continue;
    }

    byUrl.set(key, {
      ...higherConfidenceItem(existing, candidate),
      linkedinUrls: uniqueStrings([...existing.linkedinUrls, ...candidate.linkedinUrls]),
      mentions: mergeNewsMentions(existing.mentions, candidate.mentions),
    });
  }

  return Array.from(byUrl.values())
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

function candidateMergeKey(candidate: ExtractedCandidate): string {
  const normalizedTitle = normalizeNewsText(candidate.title);
  if (normalizedTitle.length >= 25) {
    return `title:${candidate.publishedAt.toISOString().slice(0, 10)}:${normalizedTitle}`;
  }
  return normalizeUrl(candidate.sourceUrl) ?? candidate.sourceUrl;
}

function filterCandidatesByDateWindow(candidates: ExtractedCandidate[], options: Options): ExtractedCandidate[] {
  if (!options.sinceDays) return candidates;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - options.sinceDays);
  const latestAllowed = Date.now() + FUTURE_DATE_GRACE_MS;

  return candidates.filter((candidate) => (
    !candidate.publishedAtInferred
    && candidate.publishedAt.getTime() >= since.getTime()
    && candidate.publishedAt.getTime() <= latestAllowed
  ));
}

function higherConfidenceItem(first: ExtractedCandidate, second: ExtractedCandidate): ExtractedCandidate {
  const rank = (confidence: DbNewsConfidence) => confidence === "HIGH" ? 3 : confidence === "MEDIUM" ? 2 : 1;
  if (rank(second.confidence) > rank(first.confidence)) return second;
  if (rank(second.confidence) < rank(first.confidence)) return first;
  return second.summary.length > first.summary.length ? second : first;
}

async function persistCandidates(
  prisma: PrismaClient,
  candidates: ExtractedCandidate[],
  candidateByKey: Map<string, MentionCandidate>,
  dryRun: boolean,
) {
  if (candidates.length === 0) {
    return { existingSourceUrlMatches: 0, created: 0, updated: 0 };
  }

  const sourceUrls = candidates.map((candidate) => candidate.sourceUrl);
  const existing = await prisma.newsItem.findMany({
    where: { sourceUrl: { in: sourceUrls } },
    select: { id: true, sourceUrl: true },
  });
  const existingByUrl = new Map(existing.map((item) => [item.sourceUrl, item.id]));

  if (dryRun) {
    return {
      existingSourceUrlMatches: existing.length,
      created: candidates.length - existing.length,
      updated: existing.length,
    };
  }

  let created = 0;
  let updated = 0;

  for (const candidate of candidates) {
    const existingId = existingByUrl.get(candidate.sourceUrl);
    const data = {
      title: candidate.title,
      summary: candidate.summary,
      category: candidate.category,
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl,
      linkedinUrls: candidate.linkedinUrls,
      publishedAt: candidate.publishedAt,
      isRumor: candidate.isRumor,
      confidence: candidate.confidence,
      status: "PUBLISHED" as const,
    };

    const newsItem = existingId
      ? await prisma.newsItem.update({ where: { id: existingId }, data })
      : await prisma.newsItem.create({
        data: {
          legacyId: legacyIdFor(candidate),
          ...data,
        },
      });

    if (existingId) updated++;
    else created++;

    await prisma.newsMention.deleteMany({ where: { newsItemId: newsItem.id } });
    const mentions = candidate.mentions
      .map((mention) => mentionCreateInput(newsItem.id, mention, candidateByKey))
      .filter((mention): mention is NonNullable<ReturnType<typeof mentionCreateInput>> => !!mention);

    if (mentions.length > 0) {
      await prisma.newsMention.createMany({
        data: mentions,
        skipDuplicates: true,
      });
    }
  }

  return {
    existingSourceUrlMatches: existing.length,
    created,
    updated,
  };
}

function mentionCreateInput(
  newsItemId: string,
  mention: NewsMentionView,
  candidateByKey: Map<string, MentionCandidate>,
) {
  const candidate = candidateByKey.get(`${mention.type}:${mention.id}`);
  if (!candidate) return null;

  return {
    newsItemId,
    mentionType: candidate.dbType,
    label: mention.label,
    confidence: confidenceToDb(mention.confidence),
    reason: mention.reason,
    companyId: candidate.companyId,
    organizationId: candidate.organizationId,
    fundId: candidate.fundId,
    dealId: candidate.dealId,
  };
}

function confidenceToDb(confidence: NewsConfidence): DbNewsConfidence {
  if (confidence === "High") return "HIGH";
  if (confidence === "Medium") return "MEDIUM";
  return "LOW";
}

function extractLinks(html: string, baseUrl: string): HtmlLink[] {
  const links: HtmlLink[] = [];
  const seen = new Set<string>();
  const anchorRe = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^'"\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) !== null) {
    const href = decodeHtml(match[1] || match[2] || match[3] || "");
    const url = normalizeUrl(resolveUrl(href, baseUrl));
    if (!url || seen.has(url) || isLinkedInUrl(url) || SKIP_EXTENSION_RE.test(url)) continue;
    seen.add(url);
    links.push({
      url,
      text: cleanText(match[4] || ""),
    });
  }
  return links;
}

function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const locRe = /<loc[^>]*>\s*([\s\S]*?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRe.exec(xml)) !== null) {
    const url = normalizeUrl(decodeHtml(match[1]));
    if (url) urls.push(url);
  }
  return uniqueStrings(urls);
}

function extractLinkedInUrls(html: string): string[] {
  const urls = new Set<string>();
  const linkedInRe = /https?:\/\/(?:[\w.-]+\.)?linkedin\.com\/[^\s"'<>)]*/gi;
  let match: RegExpExecArray | null;
  while ((match = linkedInRe.exec(html)) !== null) {
    const normalized = normalizeUrl(decodeHtml(match[0]).replace(/[.,;]+$/, ""));
    if (normalized && isLinkedInUrl(normalized)) urls.add(normalized);
  }
  return Array.from(urls).slice(0, 12);
}

function extractPublishedAt(html: string, url: string): Date | null {
  const candidates = [
    firstMatch(html, /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i),
    firstMatch(html, /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i),
    firstMatch(html, /<meta[^>]+name=["']publishdate["'][^>]+content=["']([^"']+)["']/i),
    firstMatch(html, /<time[^>]+datetime=["']([^"']+)["']/i),
    firstMatch(html, /"datePublished"\s*:\s*"([^"]+)"/i),
    firstMatch(html, /"dateModified"\s*:\s*"([^"]+)"/i),
    firstMatch(url, /\/(20\d{2})\/([01]?\d)\/([0-3]?\d)(?:\/|$)/),
  ].filter(Boolean);

  for (const value of candidates) {
    const date = parseDate(value);
    if (date) return date;
  }
  return null;
}

function parseDate(value: string): Date | null {
  const slashDate = value.match(/^(20\d{2})\/([01]?\d)\/([0-3]?\d)$/);
  const date = slashDate
    ? new Date(Date.UTC(Number(slashDate[1]), Number(slashDate[2]) - 1, Number(slashDate[3]), 12))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function firstMatch(value: string, re: RegExp): string {
  const match = value.match(re);
  if (!match) return "";
  if (match.length === 4) return `${match[1]}/${match[2]}/${match[3]}`;
  return match[1] || "";
}

function isLikelyNewsUrl(url: string, text: string): boolean {
  const parsed = safeUrl(url);
  if (!parsed) return false;
  const haystack = `${parsed.pathname} ${text}`;
  if (NEWS_PATH_RE.test(haystack)) return true;
  if (TRANSACTION_RE.test(haystack) || FUNDRAISING_RE.test(haystack) || RUMOR_RE.test(haystack)) return true;
  return /\/20\d{2}\/[01]?\d\//.test(parsed.pathname);
}

function isSitemapUrl(url: string): boolean {
  return /\/sitemap(?:[-_\w]*)?\.xml(?:$|\?)/i.test(url);
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = safeUrl(value.trim());
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return null;
  parsed.hash = "";
  for (const param of TRACKING_QUERY_PARAMS) {
    parsed.searchParams.delete(param);
  }
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }
  return parsed.href;
}

function resolveUrl(href: string, baseUrl: string): string | null {
  if (!href || /^(?:mailto|tel|javascript):/i.test(href)) return null;
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    if (/^www\./i.test(value)) {
      try {
        return new URL(`https://${value}`);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function originOf(url: string): string | null {
  return safeUrl(url)?.origin ?? null;
}

function isLinkedInUrl(url: string): boolean {
  return safeUrl(url)?.hostname.toLowerCase().endsWith("linkedin.com") ?? false;
}

function sourceNameFromUrl(url: string): string {
  const parsed = safeUrl(url);
  if (!parsed) return "Source";
  const host = parsed.hostname.replace(/^www\./, "");
  const token = host.split(".")[0] || host;
  return token
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fallbackSummary(text: string, title: string): string {
  const cleaned = text.replace(title, "").replace(/\s+/g, " ").trim();
  return cleaned || title;
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function trimTo(value: string, max: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}...`;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function legacyIdFor(candidate: ExtractedCandidate): string {
  const date = candidate.publishedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha1").update(candidate.sourceUrl).digest("hex").slice(0, 10);
  return `NEWS-${date}-${hash}`;
}

async function writeSummary(summary: RunSummary) {
  const tmpDir = path.join(process.cwd(), "tmp");
  await mkdir(tmpDir, { recursive: true });
  await writeFile(
    path.join(tmpDir, "news-scan-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
