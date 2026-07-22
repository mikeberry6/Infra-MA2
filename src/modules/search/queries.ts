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
  total: number;
  counts: Record<SearchResult["type"], number>;
}

// Each tier is independently bounded in Postgres. Exact and prefix candidates
// are fetched separately so a broad description/participant match cannot crowd
// a stronger name match out of the ranked result set. The selected values keep
// the maximum hydrated candidate set below 500 records while retaining enough
// exact/prefix rows to satisfy the public 20-result view deterministically.
const SEARCH_TIER_CAPS = {
  exact: 25,
  prefix: 40,
  contains: 90,
} as const;

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

/**
 * Preserve global relevance while reserving a fair share for every entity
 * type that has hydrated candidates. This prevents a broad deal match from
 * crowding companies or funds out of the grouped result view.
 */
export function selectFairSearchResults<T extends SearchResult>(
  rankedResults: T[],
  limit: number,
): T[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 20;
  if (safeLimit === 0 || rankedResults.length === 0) return [];
  const types = (["deal", "company", "fund"] as const)
    .filter((type) => rankedResults.some((result) => result.type === type));
  const quota = Math.floor(safeLimit / Math.max(types.length, 1));
  const selected = new Set<string>();
  const key = (result: SearchResult) => `${result.type}:${result.id}`;

  if (quota > 0) {
    for (const type of types) {
      for (const result of rankedResults.filter((candidate) => candidate.type === type).slice(0, quota)) {
        selected.add(key(result));
      }
    }
  }

  for (const result of rankedResults) {
    if (selected.size >= safeLimit) break;
    selected.add(key(result));
  }

  return rankedResults.filter((result) => selected.has(key(result))).slice(0, safeLimit);
}

export async function searchAllWithMeta(query: string, limit = 20): Promise<SearchResults> {
  const normalizedQuery = normalizeSearchQuery(query);
  const empty: SearchResults = { results: [], total: 0, counts: { deal: 0, company: 0, fund: 0 } };
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

  const [
    dealExact,
    dealPrefix,
    dealContains,
    companyExact,
    companyPrefix,
    companyContains,
    fundExact,
    fundPrefix,
    fundContains,
    dealTotal,
    companyTotal,
    fundTotal,
  ] = await Promise.all([
    prisma.deal.findMany({
      where: { status: "PUBLISHED", target: { equals: normalizedQuery, mode: "insensitive" } },
      select: DEAL_SEARCH_SELECT,
      orderBy: [{ target: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.exact,
    }),
    prisma.deal.findMany({
      where: { status: "PUBLISHED", target: { startsWith: normalizedQuery, mode: "insensitive" } },
      select: DEAL_SEARCH_SELECT,
      orderBy: [{ target: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.prefix,
    }),
    prisma.deal.findMany({
      where: dealContainsWhere,
      select: DEAL_SEARCH_SELECT,
      orderBy: [{ target: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.contains,
    }),
    prisma.company.findMany({
      where: { status: "PUBLISHED", name: { equals: normalizedQuery, mode: "insensitive" } },
      select: COMPANY_SEARCH_SELECT,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: SEARCH_TIER_CAPS.exact,
    }),
    prisma.company.findMany({
      where: { status: "PUBLISHED", name: { startsWith: normalizedQuery, mode: "insensitive" } },
      select: COMPANY_SEARCH_SELECT,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: SEARCH_TIER_CAPS.prefix,
    }),
    prisma.company.findMany({
      where: companyContainsWhere,
      select: COMPANY_SEARCH_SELECT,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: SEARCH_TIER_CAPS.contains,
    }),
    prisma.fund.findMany({
      where: { status: "PUBLISHED", fundName: { equals: normalizedQuery, mode: "insensitive" } },
      select: FUND_SEARCH_SELECT,
      orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.exact,
    }),
    prisma.fund.findMany({
      where: { status: "PUBLISHED", fundName: { startsWith: normalizedQuery, mode: "insensitive" } },
      select: FUND_SEARCH_SELECT,
      orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.prefix,
    }),
    prisma.fund.findMany({
      where: fundContainsWhere,
      select: FUND_SEARCH_SELECT,
      orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
      take: SEARCH_TIER_CAPS.contains,
    }),
    prisma.deal.count({ where: dealContainsWhere }),
    prisma.company.count({ where: companyContainsWhere }),
    prisma.fund.count({ where: fundContainsWhere }),
  ]);

  const deals = uniqueBy([...dealExact, ...dealPrefix, ...dealContains], (row) => row.legacyId);
  const companies = uniqueBy([...companyExact, ...companyPrefix, ...companyContains], (row) => row.id);
  const funds = uniqueBy([...fundExact, ...fundPrefix, ...fundContains], (row) => row.legacyId);

  const rankedResults: Array<SearchResult & { score: number }> = [
    ...deals.map((d): SearchResult & { score: number } => ({
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
    })),
    ...companies.map((c): SearchResult & { score: number } => ({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: c.country,
      sector: COMPANY_SECTOR_DISPLAY[c.sector],
      region: COMPANY_REGION_DISPLAY[c.region],
      score: matchScore(c.name, `${c.subsector} ${c.description}`, normalizedQuery),
    })),
    ...funds.map((f): SearchResult & { score: number } => ({
      type: "fund",
      id: f.legacyId,
      legacyId: f.legacyId,
      title: f.fundName,
      subtitle: f.manager.name,
      score: matchScore(f.fundName, `${f.manager.name} ${f.investmentStrategy}`, normalizedQuery),
    })),
  ];

  rankedResults.sort((a, b) => (
    a.score - b.score
    || a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true })
    || a.type.localeCompare(b.type)
    || a.id.localeCompare(b.id)
  ));

  const resultLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 20;
  const selectedResults = selectFairSearchResults(rankedResults, resultLimit);
  const counts: SearchResults["counts"] = {
    deal: dealTotal,
    company: companyTotal,
    fund: fundTotal,
  };

  return {
    results: selectedResults
      .map(({ score: _score, ...result }) => result),
    total: dealTotal + companyTotal + fundTotal,
    counts,
  };
}

export async function searchAll(query: string, limit = 20): Promise<SearchResult[]> {
  return (await searchAllWithMeta(query, limit)).results;
}
