import { prisma } from "@/lib/prisma";
import { FUND_NAME_ALIASES } from "@/lib/fund-name-utils";
import {
  COMPANY_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_SECTOR_DISPLAY,
} from "@/modules/shared/enum-maps";

const canonicalSponsorNames = new Map(Object.entries(FUND_NAME_ALIASES)
  .map(([alias, name]) => [alias.toLowerCase(), name.toLowerCase()]));

export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_MAX_QUERY_LENGTH = 120;

export const SEARCH_TYPES = ["deal", "company", "fund"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export interface SearchResult {
  type: SearchType;
  id: string;
  title: string;
  subtitle: string;
  sector?: string;
  region?: string;
}

interface SearchRow {
  type: SearchType;
  id: string;
  title: string;
  subtitle: string;
  sector: string | null;
  region: string | null;
}

interface SearchPageRow {
  results: SearchRow[];
  counts: Record<SearchType, number>;
  total: number;
  page: number;
  pageCount: number;
}

export interface SearchRequest {
  query: string;
  type: SearchType | null;
  page: number;
}

export interface SearchPageResult extends Omit<SearchPageRow, "results"> {
  results: SearchResult[];
}

export function parseSearchRequest(params: { q?: unknown; type?: unknown; page?: unknown }): SearchRequest {
  const query = typeof params.q === "string"
    ? params.q.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_QUERY_LENGTH)
    : "";
  const type = SEARCH_TYPES.find((candidate) => candidate === params.type) ?? null;
  const requestedPage = typeof params.page === "string" && /^\d+$/.test(params.page)
    ? Number(params.page)
    : 1;
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, Math.min(requestedPage, 2147483647)) : 1;
  return { query, type, page };
}

export async function searchAll({ query, type, page }: SearchRequest): Promise<SearchPageResult> {
  if (query.length < 2) {
    return { results: [], counts: { deal: 0, company: 0, fund: 0 }, total: 0, page: 1, pageCount: 1 };
  }

  const canonicalSponsor = canonicalSponsorNames.get(query.toLowerCase()) ?? null;
  const [row] = await prisma.$queryRaw<SearchPageRow[]>`
    WITH term AS (
      SELECT lower(${query}::text) AS value, ${canonicalSponsor}::text AS sponsor
    ), matching_organizations AS (
      SELECT org.id
      FROM "Organization" org
      CROSS JOIN term
      WHERE org.status = 'PUBLISHED' AND (
        strpos(lower(org.name), term.value) > 0 OR lower(org.name) = term.sponsor
        OR EXISTS (
          SELECT 1 FROM "Alias" alias
          WHERE alias."organizationId" = org.id AND strpos(lower(alias.alias), term.value) > 0
        )
      )
    ), matching_fund_names AS (
      SELECT fund.id
      FROM "Fund" fund
      CROSS JOIN term
      WHERE fund.status = 'PUBLISHED' AND (
        strpos(lower(fund."fundName"), term.value) > 0 OR lower(fund.ticker) = term.value
      )
    ), ranked AS (
      SELECT 'deal' AS type, deal."legacyId" AS id, deal.target AS title, deal.title AS subtitle,
        deal.sector::text, deal.region::text,
        CASE
          WHEN lower(deal.target) = term.value THEN 60
          WHEN starts_with(lower(deal.target), term.value) THEN 50
          WHEN strpos(lower(deal.target), term.value) > 0 THEN 40
          WHEN EXISTS (
            SELECT 1 FROM "DealParticipant" participant
            WHERE participant."dealId" = deal.id AND participant.role IN ('BUYER', 'SELLER')
              AND (participant."organizationId" IN (SELECT id FROM matching_organizations)
                OR strpos(lower(participant."displayName"), term.value) > 0)
          ) THEN 30
          WHEN strpos(lower(deal.title), term.value) > 0 THEN 20
          WHEN strpos(lower(deal.description), term.value) > 0
            OR strpos(lower(deal."targetDescription"), term.value) > 0 THEN 10
          ELSE 0
        END AS rank
      FROM "Deal" deal CROSS JOIN term
      WHERE deal.status = 'PUBLISHED'
      UNION ALL
      SELECT 'company', company.id, company.name, company.country, company.sector::text, company.region::text,
        CASE
          WHEN lower(company.name) = term.value OR EXISTS (
            SELECT 1 FROM unnest(company.aliases) AS alias(value) WHERE lower(alias.value) = term.value
          ) THEN 60
          WHEN starts_with(lower(company.name), term.value) THEN 50
          WHEN strpos(lower(company.name), term.value) > 0 OR EXISTS (
            SELECT 1 FROM unnest(company.aliases) AS alias(value) WHERE strpos(lower(alias.value), term.value) > 0
          ) THEN 40
          WHEN EXISTS (
            SELECT 1
            FROM "OwnershipPeriod" ownership
            LEFT JOIN "Fund" fund ON fund.id = ownership."fundId" AND fund.status = 'PUBLISHED'
            WHERE ownership."companyId" = company.id
              AND (ownership."organizationId" IN (SELECT id FROM matching_organizations)
                OR fund."managerId" IN (SELECT id FROM matching_organizations)
                OR fund.id IN (SELECT id FROM matching_fund_names)
                OR strpos(lower(ownership."vehicleName"), term.value) > 0
                OR strpos(lower(ownership."attributedFundName"), term.value) > 0)
          ) THEN 30
          WHEN strpos(lower(company.subsector), term.value) > 0
            OR strpos(lower(company.description), term.value) > 0 THEN 10
          ELSE 0
        END
      FROM "Company" company CROSS JOIN term
      WHERE company.status = 'PUBLISHED'
      UNION ALL
      SELECT 'fund', fund."legacyId", fund."fundName", manager.name, NULL, NULL,
        CASE
          WHEN lower(fund."fundName") = term.value OR lower(fund.ticker) = term.value THEN 60
          WHEN starts_with(lower(fund."fundName"), term.value) THEN 50
          WHEN fund.id IN (SELECT id FROM matching_fund_names) THEN 40
          WHEN fund."managerId" IN (SELECT id FROM matching_organizations) THEN 30
          WHEN strpos(lower(fund."investmentStrategy"), term.value) > 0 THEN 10
          ELSE 0
        END
      FROM "Fund" fund JOIN "Organization" manager ON manager.id = fund."managerId"
      CROSS JOIN term
      WHERE fund.status = 'PUBLISHED'
    ), matches AS (
      SELECT * FROM ranked WHERE rank > 0
    ), counts AS (
      SELECT jsonb_build_object(
          'deal', count(*) FILTER (WHERE type = 'deal'),
          'company', count(*) FILTER (WHERE type = 'company'),
          'fund', count(*) FILTER (WHERE type = 'fund')
        ) AS counts,
        (count(*) FILTER (WHERE ${type}::text IS NULL OR type = ${type}::text))::int AS total
      FROM matches
    ), pages AS (
      SELECT counts.*, greatest(1, ceil(total::numeric / ${SEARCH_PAGE_SIZE})::int) AS "pageCount"
      FROM counts
    ), selection AS (
      SELECT pages.*, least(${page}::int, "pageCount") AS page FROM pages
    ), page_rows AS (
      SELECT * FROM matches
      WHERE ${type}::text IS NULL OR type = ${type}::text
      ORDER BY rank DESC, lower(title), type, id
      LIMIT ${SEARCH_PAGE_SIZE}
      OFFSET (SELECT (page - 1) * ${SEARCH_PAGE_SIZE} FROM selection)
    )
    SELECT selection.*,
      (SELECT coalesce(jsonb_agg(to_jsonb(page_rows) - 'rank' ORDER BY rank DESC, lower(title), type, id),
        '[]'::jsonb) FROM page_rows) AS results
    FROM selection
  `;

  return {
    ...row,
    results: row.results.map((result) => ({
      ...result,
      sector: result.type === "deal"
        ? DEAL_SECTOR_DISPLAY[result.sector as keyof typeof DEAL_SECTOR_DISPLAY]
        : COMPANY_SECTOR_DISPLAY[result.sector as keyof typeof COMPANY_SECTOR_DISPLAY],
      region: result.type === "deal"
        ? DEAL_REGION_DISPLAY[result.region as keyof typeof DEAL_REGION_DISPLAY]
        : COMPANY_REGION_DISPLAY[result.region as keyof typeof COMPANY_REGION_DISPLAY],
    })),
  };
}
