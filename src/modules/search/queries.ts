import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";

export interface SearchResult {
  type: "deal" | "company" | "fund";
  id: string; // company → cuid, deal/fund → legacyId
  legacyId?: string; // deal/fund only — used for stable links
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
}

export interface SearchResults {
  results: SearchResult[];
  /** Total matches across every entity type. */
  total: number;
  /** Total matches in the selected entity scope. */
  scopeTotal: number;
  counts: Record<SearchResult["type"], number>;
  scope: SearchScope;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SearchScope = "all" | SearchResult["type"];

export interface SearchOptions {
  scope?: SearchScope;
  page?: number;
  pageSize?: number;
}

export interface SearchResultGroup {
  type: SearchResult["type"];
  results: Array<{ result: SearchResult; rank: number }>;
}

export const SEARCH_PAGE_SIZE = 20;
const MAX_SEARCH_PAGE_SIZE = 100;
const SEARCH_TYPE_ORDER: Record<SearchResult["type"], number> = {
  deal: 0,
  company: 1,
  fund: 2,
};

const DEAL_SEARCH_SELECT = {
  legacyId: true,
  title: true,
  target: true,
  description: true,
  sector: true,
  region: true,
  participants: {
    select: {
      displayName: true,
      organization: { select: { name: true } },
    },
  },
} as const;

const COMPANY_SEARCH_SELECT = {
  id: true,
  name: true,
  description: true,
  subsector: true,
  sector: true,
  region: true,
  country: true,
} as const;

const FUND_SEARCH_SELECT = {
  legacyId: true,
  fundName: true,
  investmentStrategy: true,
  manager: { select: { name: true } },
} as const;

function uniqueBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const value = key(row);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function matchScore(title: string, body: string, query: string): number {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  if (normalizedTitle.includes(normalizedQuery) || body.toLowerCase().includes(normalizedQuery)) return 2;
  return 3;
}

export function normalizeSearchQuery(value: string | string[] | undefined): string {
  const firstValue = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return firstValue.trim().slice(0, 200);
}

export function normalizeSearchScope(value: string | string[] | undefined): SearchScope {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue === "deal" || firstValue === "company" || firstValue === "fund"
    ? firstValue
    : "all";
}

export function normalizeSearchPage(value: string | string[] | undefined): number {
  const firstValue = Array.isArray(value) ? value[0] : value;
  if (!firstValue || !/^\d+$/.test(firstValue)) return 1;
  const parsed = Number(firstValue);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

/** Group one globally selected result page without losing its global rank. */
export function groupSearchPageResults(
  results: SearchResult[],
  firstRank = 1,
): SearchResultGroup[] {
  const safeFirstRank = Number.isFinite(firstRank)
    ? Math.max(1, Math.floor(firstRank))
    : 1;
  return (["deal", "company", "fund"] as const)
    .map((type) => ({
      type,
      results: results.flatMap((result, index) => result.type === type
        ? [{ result, rank: safeFirstRank + index }]
        : []),
    }))
    .filter((group) => group.results.length > 0);
}

function normalizedOptions(options: SearchOptions | number): Required<SearchOptions> {
  const requested = typeof options === "number" ? { pageSize: options } : options;
  const page = Number.isFinite(requested.page)
    ? Math.max(1, Math.floor(requested.page ?? 1))
    : 1;
  const pageSize = Number.isFinite(requested.pageSize)
    ? Math.min(MAX_SEARCH_PAGE_SIZE, Math.max(1, Math.floor(requested.pageSize ?? SEARCH_PAGE_SIZE)))
    : SEARCH_PAGE_SIZE;
  return {
    scope: requested.scope === "deal" || requested.scope === "company" || requested.scope === "fund"
      ? requested.scope
      : "all",
    page,
    pageSize,
  };
}

export async function searchAllWithMeta(
  query: string,
  options: SearchOptions | number = {},
): Promise<SearchResults> {
  const normalizedQuery = normalizeSearchQuery(query);
  const normalized = normalizedOptions(options);
  const empty: SearchResults = {
    results: [],
    total: 0,
    scopeTotal: 0,
    counts: { deal: 0, company: 0, fund: 0 },
    scope: normalized.scope,
    page: 1,
    pageSize: normalized.pageSize,
    totalPages: 1,
  };
  if (normalizedQuery.length < 2) return empty;

  const dealContainsWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: normalizedQuery, mode: "insensitive" as const } },
      { target: { contains: normalizedQuery, mode: "insensitive" as const } },
      { description: { contains: normalizedQuery, mode: "insensitive" as const } },
      {
        participants: {
          some: {
            OR: [
              { displayName: { contains: normalizedQuery, mode: "insensitive" as const } },
              { organization: { name: { contains: normalizedQuery, mode: "insensitive" as const } } },
            ],
          },
        },
      },
    ],
  };
  const companyContainsWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { name: { contains: normalizedQuery, mode: "insensitive" as const } },
      { description: { contains: normalizedQuery, mode: "insensitive" as const } },
      { subsector: { contains: normalizedQuery, mode: "insensitive" as const } },
    ],
  };
  const fundContainsWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { fundName: { contains: normalizedQuery, mode: "insensitive" as const } },
      { investmentStrategy: { contains: normalizedQuery, mode: "insensitive" as const } },
      { manager: { name: { contains: normalizedQuery, mode: "insensitive" as const } } },
    ],
  };

  const [dealTotal, companyTotal, fundTotal] = await Promise.all([
    prisma.deal.count({ where: dealContainsWhere }),
    prisma.company.count({ where: companyContainsWhere }),
    prisma.fund.count({ where: fundContainsWhere }),
  ]);
  const counts: SearchResults["counts"] = {
    deal: dealTotal,
    company: companyTotal,
    fund: fundTotal,
  };
  const total = dealTotal + companyTotal + fundTotal;
  const scopeTotal = normalized.scope === "all" ? total : counts[normalized.scope];
  const totalPages = Math.max(1, Math.ceil(scopeTotal / normalized.pageSize));
  const page = Math.min(normalized.page, totalPages);
  const resultEnd = page * normalized.pageSize;
  const selectedTypes = normalized.scope === "all"
    ? (["deal", "company", "fund"] as const)
    : ([normalized.scope] as const);

  // The three search tiers are mutually exclusive. Hydrating the first
  // `page * pageSize` rows from each selected entity/tier is sufficient to
  // produce the requested globally ranked page without loading the complete
  // search universe on the common first-page path.
  const [dealRows, companyRows, fundRows] = await Promise.all([
    selectedTypes.includes("deal") ? Promise.all([
      prisma.deal.findMany({
        where: { status: "PUBLISHED", target: { equals: normalizedQuery, mode: "insensitive" } },
        select: DEAL_SEARCH_SELECT,
        orderBy: [{ target: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
      prisma.deal.findMany({
        where: {
          status: "PUBLISHED",
          target: { startsWith: normalizedQuery, mode: "insensitive" },
          NOT: { target: { equals: normalizedQuery, mode: "insensitive" } },
        },
        select: DEAL_SEARCH_SELECT,
        orderBy: [{ target: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
      prisma.deal.findMany({
        where: {
          ...dealContainsWhere,
          NOT: { target: { startsWith: normalizedQuery, mode: "insensitive" } },
        },
        select: DEAL_SEARCH_SELECT,
        orderBy: [{ target: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
    ]) : Promise.resolve([[], [], []] as const),
    selectedTypes.includes("company") ? Promise.all([
      prisma.company.findMany({
        where: { status: "PUBLISHED", name: { equals: normalizedQuery, mode: "insensitive" } },
        select: COMPANY_SEARCH_SELECT,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: resultEnd,
      }),
      prisma.company.findMany({
        where: {
          status: "PUBLISHED",
          name: { startsWith: normalizedQuery, mode: "insensitive" },
          NOT: { name: { equals: normalizedQuery, mode: "insensitive" } },
        },
        select: COMPANY_SEARCH_SELECT,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: resultEnd,
      }),
      prisma.company.findMany({
        where: {
          ...companyContainsWhere,
          NOT: { name: { startsWith: normalizedQuery, mode: "insensitive" } },
        },
        select: COMPANY_SEARCH_SELECT,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: resultEnd,
      }),
    ]) : Promise.resolve([[], [], []] as const),
    selectedTypes.includes("fund") ? Promise.all([
      prisma.fund.findMany({
        where: { status: "PUBLISHED", fundName: { equals: normalizedQuery, mode: "insensitive" } },
        select: FUND_SEARCH_SELECT,
        orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
      prisma.fund.findMany({
        where: {
          status: "PUBLISHED",
          fundName: { startsWith: normalizedQuery, mode: "insensitive" },
          NOT: { fundName: { equals: normalizedQuery, mode: "insensitive" } },
        },
        select: FUND_SEARCH_SELECT,
        orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
      prisma.fund.findMany({
        where: {
          ...fundContainsWhere,
          NOT: { fundName: { startsWith: normalizedQuery, mode: "insensitive" } },
        },
        select: FUND_SEARCH_SELECT,
        orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
        take: resultEnd,
      }),
    ]) : Promise.resolve([[], [], []] as const),
  ]);

  const [dealExact, dealPrefix, dealContains] = dealRows;
  const [companyExact, companyPrefix, companyContains] = companyRows;
  const [fundExact, fundPrefix, fundContains] = fundRows;
  const deals = uniqueBy([...dealExact, ...dealPrefix, ...dealContains], (row) => row.legacyId);
  const companies = uniqueBy([...companyExact, ...companyPrefix, ...companyContains], (row) => row.id);
  const funds = uniqueBy([...fundExact, ...fundPrefix, ...fundContains], (row) => row.legacyId);

  // Preserve each tier query's database order when breaking equal-score ties.
  // Candidate queries are intentionally bounded to `resultEnd`; re-sorting a
  // truncated tier with a different JavaScript collation (for example natural
  // numeric title ordering) can otherwise duplicate rows across pages and omit
  // rows entirely. Type order provides a deterministic cross-entity merge,
  // while sourceOrder exactly matches the order used to select each bounded
  // per-type candidate set.
  const rankedResults: Array<SearchResult & { score: number; sourceOrder: number }> = [
    ...deals.map((d, sourceOrder): SearchResult & { score: number; sourceOrder: number } => ({
      type: "deal",
      id: d.legacyId,
      legacyId: d.legacyId,
      title: d.target,
      subtitle: d.title,
      sector: DEAL_SECTOR_DISPLAY[d.sector],
      region: DEAL_REGION_DISPLAY[d.region],
      score: matchScore(
        d.target,
        `${d.title} ${d.description} ${d.participants.map((participant) => `${participant.displayName ?? ""} ${participant.organization.name}`).join(" ")}`,
        normalizedQuery,
      ),
      sourceOrder,
    })),
    ...companies.map((c, sourceOrder): SearchResult & { score: number; sourceOrder: number } => ({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: c.country,
      sector: COMPANY_SECTOR_DISPLAY[c.sector],
      region: COMPANY_REGION_DISPLAY[c.region],
      score: matchScore(c.name, `${c.subsector} ${c.description}`, normalizedQuery),
      sourceOrder,
    })),
    ...funds.map((f, sourceOrder): SearchResult & { score: number; sourceOrder: number } => ({
      type: "fund",
      id: f.legacyId,
      legacyId: f.legacyId,
      title: f.fundName,
      subtitle: f.manager.name,
      score: matchScore(f.fundName, `${f.manager.name} ${f.investmentStrategy}`, normalizedQuery),
      sourceOrder,
    })),
  ];

  rankedResults.sort((a, b) => (
    a.score - b.score
    || SEARCH_TYPE_ORDER[a.type] - SEARCH_TYPE_ORDER[b.type]
    || a.sourceOrder - b.sourceOrder
  ));

  const resultStart = (page - 1) * normalized.pageSize;
  const selectedResults = rankedResults.slice(resultStart, resultEnd);

  return {
    results: selectedResults
      .map(({ score: _score, sourceOrder: _sourceOrder, ...result }) => result),
    total,
    scopeTotal,
    counts,
    scope: normalized.scope,
    page,
    pageSize: normalized.pageSize,
    totalPages,
  };
}

export async function searchAll(
  query: string,
  options: SearchOptions | number = {},
): Promise<SearchResult[]> {
  return (await searchAllWithMeta(query, options)).results;
}
