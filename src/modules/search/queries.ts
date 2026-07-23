import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";

export const MIN_SEARCH_QUERY_LENGTH = 2;
export const SEARCH_PAGE_SIZE = 20;

export type SearchResultType = "deal" | "company" | "fund";
export type SearchScope = "all" | "deals" | "companies" | "funds";
export type SearchMatchTier = "exact" | "prefix" | "body";

export interface SearchResult {
  type: SearchResultType;
  id: string; // company → cuid, deal/fund → legacyId
  legacyId?: string; // deal/fund only — used for stable links
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
  match: SearchMatchTier;
}

export interface SearchCounts {
  deals: number;
  companies: number;
  funds: number;
}

export interface SearchResponse {
  query: string;
  scope: SearchScope;
  results: SearchResult[];
  counts: SearchCounts;
  total: number;
  scopedTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchOptions {
  scope?: SearchScope;
  page?: number;
  pageSize?: number;
}

type TierResults = Record<SearchMatchTier, SearchResult[]>;

const MATCH_TIERS: SearchMatchTier[] = ["exact", "prefix", "body"];
const RESULT_TYPE_ORDER: SearchResultType[] = ["deal", "company", "fund"];
const INSENSITIVE = "insensitive" as const;
const EMPTY_COUNTS: SearchCounts = { deals: 0, companies: 0, funds: 0 };

const DEAL_SELECT = {
  legacyId: true,
  title: true,
  target: true,
  sector: true,
  region: true,
} satisfies Prisma.DealSelect;

const COMPANY_SELECT = {
  id: true,
  name: true,
  sector: true,
  region: true,
  country: true,
} satisfies Prisma.CompanySelect;

const FUND_SELECT = {
  legacyId: true,
  fundName: true,
  manager: { select: { name: true } },
} satisfies Prisma.FundSelect;

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function coerceSearchScope(scope: string | null | undefined): SearchScope {
  return scope === "deals" || scope === "companies" || scope === "funds" ? scope : "all";
}

export function searchResultHref(result: SearchResult): string {
  const focusKey = result.legacyId ?? result.id;
  switch (result.type) {
    case "deal":
      return `/tracker?focus=${encodeURIComponent(focusKey)}`;
    case "company":
      return `/portfolio?focus=${encodeURIComponent(focusKey)}`;
    case "fund":
      return `/funds?focus=${encodeURIComponent(focusKey)}`;
  }
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && (value ?? 0) > 0 ? value! : fallback;
}

function scopeTotal(counts: SearchCounts, scope: SearchScope): number {
  switch (scope) {
    case "deals":
      return counts.deals;
    case "companies":
      return counts.companies;
    case "funds":
      return counts.funds;
    case "all":
      return counts.deals + counts.companies + counts.funds;
  }
}

function dealMatchWhere(query: string): Prisma.DealWhereInput {
  return {
    status: "PUBLISHED",
    OR: [
      { target: { contains: query, mode: INSENSITIVE } },
      { title: { contains: query, mode: INSENSITIVE } },
      { description: { contains: query, mode: INSENSITIVE } },
      {
        participants: {
          some: {
            OR: [
              { displayName: { contains: query, mode: INSENSITIVE } },
              { organization: { name: { contains: query, mode: INSENSITIVE } } },
            ],
          },
        },
      },
    ],
  };
}

function dealTierWhere(query: string, tier: SearchMatchTier): Prisma.DealWhereInput {
  if (tier === "exact") {
    return {
      status: "PUBLISHED",
      target: { equals: query, mode: INSENSITIVE },
    };
  }
  if (tier === "prefix") {
    return {
      status: "PUBLISHED",
      AND: [
        { target: { startsWith: query, mode: INSENSITIVE } },
        { NOT: { target: { equals: query, mode: INSENSITIVE } } },
      ],
    };
  }
  return {
    status: "PUBLISHED",
    AND: [
      { OR: dealMatchWhere(query).OR },
      { NOT: { target: { startsWith: query, mode: INSENSITIVE } } },
    ],
  };
}

function companyMatchWhere(query: string): Prisma.CompanyWhereInput {
  return {
    status: "PUBLISHED",
    ...ACTIVE_COMPANY_WHERE,
    OR: [
      { name: { contains: query, mode: INSENSITIVE } },
      { description: { contains: query, mode: INSENSITIVE } },
      { subsector: { contains: query, mode: INSENSITIVE } },
    ],
  };
}

function companyTierWhere(query: string, tier: SearchMatchTier): Prisma.CompanyWhereInput {
  const publishedActive = {
    status: "PUBLISHED" as const,
    ...ACTIVE_COMPANY_WHERE,
  };
  if (tier === "exact") {
    return {
      ...publishedActive,
      name: { equals: query, mode: INSENSITIVE },
    };
  }
  if (tier === "prefix") {
    return {
      ...publishedActive,
      AND: [
        { name: { startsWith: query, mode: INSENSITIVE } },
        { NOT: { name: { equals: query, mode: INSENSITIVE } } },
      ],
    };
  }
  return {
    ...publishedActive,
    AND: [
      { OR: companyMatchWhere(query).OR },
      { NOT: { name: { startsWith: query, mode: INSENSITIVE } } },
    ],
  };
}

function fundMatchWhere(query: string): Prisma.FundWhereInput {
  return {
    status: "PUBLISHED",
    OR: [
      { fundName: { contains: query, mode: INSENSITIVE } },
      { investmentStrategy: { contains: query, mode: INSENSITIVE } },
      { manager: { name: { contains: query, mode: INSENSITIVE } } },
    ],
  };
}

function fundTierWhere(query: string, tier: SearchMatchTier): Prisma.FundWhereInput {
  if (tier === "exact") {
    return {
      status: "PUBLISHED",
      fundName: { equals: query, mode: INSENSITIVE },
    };
  }
  if (tier === "prefix") {
    return {
      status: "PUBLISHED",
      AND: [
        { fundName: { startsWith: query, mode: INSENSITIVE } },
        { NOT: { fundName: { equals: query, mode: INSENSITIVE } } },
      ],
    };
  }
  return {
    status: "PUBLISHED",
    AND: [
      { OR: fundMatchWhere(query).OR },
      { NOT: { fundName: { startsWith: query, mode: INSENSITIVE } } },
    ],
  };
}

async function searchDealTiers(query: string, take: number): Promise<TierResults> {
  const rows = await Promise.all(MATCH_TIERS.map((tier) => prisma.deal.findMany({
    where: dealTierWhere(query, tier),
    orderBy: [{ target: "asc" }, { legacyId: "asc" }],
    take,
    select: DEAL_SELECT,
  })));

  return Object.fromEntries(MATCH_TIERS.map((tier, index) => [
    tier,
    rows[index].map((deal): SearchResult => ({
      type: "deal",
      id: deal.legacyId,
      legacyId: deal.legacyId,
      title: deal.target,
      subtitle: deal.title,
      sector: DEAL_SECTOR_DISPLAY[deal.sector],
      region: DEAL_REGION_DISPLAY[deal.region],
      match: tier,
    })),
  ])) as TierResults;
}

async function searchCompanyTiers(query: string, take: number): Promise<TierResults> {
  const rows = await Promise.all(MATCH_TIERS.map((tier) => prisma.company.findMany({
    where: companyTierWhere(query, tier),
    orderBy: [{ name: "asc" }, { country: "asc" }, { id: "asc" }],
    take,
    select: COMPANY_SELECT,
  })));

  return Object.fromEntries(MATCH_TIERS.map((tier, index) => [
    tier,
    rows[index].map((company): SearchResult => ({
      type: "company",
      id: company.id,
      title: company.name,
      subtitle: company.country,
      sector: COMPANY_SECTOR_DISPLAY[company.sector],
      region: COMPANY_REGION_DISPLAY[company.region],
      match: tier,
    })),
  ])) as TierResults;
}

async function searchFundTiers(query: string, take: number): Promise<TierResults> {
  const rows = await Promise.all(MATCH_TIERS.map((tier) => prisma.fund.findMany({
    where: fundTierWhere(query, tier),
    orderBy: [{ fundName: "asc" }, { legacyId: "asc" }],
    take,
    select: FUND_SELECT,
  })));

  return Object.fromEntries(MATCH_TIERS.map((tier, index) => [
    tier,
    rows[index].map((fund): SearchResult => ({
      type: "fund",
      id: fund.legacyId,
      legacyId: fund.legacyId,
      title: fund.fundName,
      subtitle: fund.manager.name,
      match: tier,
    })),
  ])) as TierResults;
}

function selectedTypes(scope: SearchScope): SearchResultType[] {
  switch (scope) {
    case "deals":
      return ["deal"];
    case "companies":
      return ["company"];
    case "funds":
      return ["fund"];
    case "all":
      return RESULT_TYPE_ORDER;
  }
}

export async function searchAll(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
  const normalizedQuery = normalizeSearchQuery(query);
  const scope = coerceSearchScope(options.scope);
  const pageSize = Math.min(50, positiveInteger(options.pageSize, SEARCH_PAGE_SIZE));

  if (normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return {
      query: normalizedQuery,
      scope,
      results: [],
      counts: { ...EMPTY_COUNTS },
      total: 0,
      scopedTotal: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }

  const [deals, companies, funds] = await Promise.all([
    prisma.deal.count({ where: dealMatchWhere(normalizedQuery) }),
    prisma.company.count({ where: companyMatchWhere(normalizedQuery) }),
    prisma.fund.count({ where: fundMatchWhere(normalizedQuery) }),
  ]);
  const counts: SearchCounts = { deals, companies, funds };
  const total = deals + companies + funds;
  const scopedTotal = scopeTotal(counts, scope);
  const totalPages = scopedTotal === 0 ? 0 : Math.ceil(scopedTotal / pageSize);
  const requestedPage = positiveInteger(options.page, 1);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);

  if (scopedTotal === 0) {
    return {
      query: normalizedQuery,
      scope,
      results: [],
      counts,
      total,
      scopedTotal,
      page,
      pageSize,
      totalPages,
    };
  }

  const take = page * pageSize;
  const types = selectedTypes(scope);
  const loaded = new Map<SearchResultType, TierResults>();
  await Promise.all(types.map(async (type) => {
    const tiers = type === "deal"
      ? await searchDealTiers(normalizedQuery, take)
      : type === "company"
        ? await searchCompanyTiers(normalizedQuery, take)
        : await searchFundTiers(normalizedQuery, take);
    loaded.set(type, tiers);
  }));

  // Relevance is the primary ordering contract. Entity type is the stable
  // cross-database tie-break, followed by each query's explicit name/ID order.
  const ranked = MATCH_TIERS.flatMap((tier) => (
    types.flatMap((type) => loaded.get(type)?.[tier] ?? [])
  ));
  const start = (page - 1) * pageSize;

  return {
    query: normalizedQuery,
    scope,
    results: ranked.slice(start, start + pageSize),
    counts,
    total,
    scopedTotal,
    page,
    pageSize,
    totalPages,
  };
}
