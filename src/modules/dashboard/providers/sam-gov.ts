import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type {
  DashboardProvider,
  DashboardProviderResult,
  DashboardSignal,
} from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, keyMissingProvider, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type SamOpportunity = {
  noticeId?: string;
  title?: string;
  solicitationNumber?: string;
  fullParentPathName?: string;
  postedDate?: string;
  type?: string;
  baseType?: string;
  responseDeadLine?: string | null;
  naicsCode?: string | null;
  active?: string;
  uiLink?: string | null;
  placeOfPerformance?: {
    city?: { name?: string };
    state?: { code?: string };
    country?: { code?: string; name?: string };
  } | null;
};

type SamResponse = {
  totalRecords?: number;
  limit?: number;
  offset?: number;
  opportunitiesData?: SamOpportunity[];
};

const SAM_ENDPOINT = "https://api.sam.gov/opportunities/v2/search";
const TITLE_KEYWORDS = [
  "infrastructure",
  "transmission",
  "pipeline",
  "broadband",
  "water",
  "transportation",
  "renewable",
  "data center",
] as const;
const PAGE_SIZE = 1_000;
const MAX_PAGES_PER_KEYWORD = 5;

export function samGovProvider(
  apiKey = process.env.SAM_API_KEY,
  now = new Date(),
): DashboardProvider {
  if (!apiKey) return keyMissingProvider(DASHBOARD_SOURCES.samGov, "SAM_API_KEY");

  return {
    source: DASHBOARD_SOURCES.samGov,
    async fetch(): Promise<DashboardProviderResult> {
      const startDate = isoDateDaysAgo(6, now);
      const endDate = todayIsoDate(now);
      const opportunities = new Map<string, SamOpportunity>();
      const warnings: string[] = [];

      for (const keyword of TITLE_KEYWORDS) {
        let total = 0;
        for (let page = 0; page < MAX_PAGES_PER_KEYWORD; page += 1) {
          const response = await fetchSamPage(apiKey, keyword, startDate, endDate, page);
          const pageResult = validatedSamPage(response, keyword, page);
          total = pageResult.totalRecords;
          for (const item of pageResult.opportunities) {
            const id = item.noticeId || `${item.solicitationNumber ?? "unknown"}:${item.postedDate ?? "unknown"}`;
            opportunities.set(id, item);
          }
          if ((page + 1) * PAGE_SIZE >= total) break;
          if (pageResult.opportunities.length === 0) {
            throw new Error(`SAM.gov title query "${keyword}" returned an empty page before all ${total} records were available.`);
          }
          if (page === MAX_PAGES_PER_KEYWORD - 1) {
            throw new Error(`SAM.gov title query "${keyword}" exceeded the ${MAX_PAGES_PER_KEYWORD * PAGE_SIZE} record safety cap; preserving the prior complete observation.`);
          }
        }
      }

      const matched = Array.from(opportunities.entries())
        .sort(([, a], [, b]) => (b.postedDate ?? "").localeCompare(a.postedDate ?? ""));
      const signals: DashboardSignal[] = matched.map(([id, item]) => ({
        signalKey: `sam-opportunity-${id}`,
        section: "policy-regulatory",
        title: item.title?.trim() || "Untitled SAM.gov opportunity",
        summary: buildSummary(item),
        direction: "needs_review",
        severity: 1,
        observedAt: `${(item.postedDate || endDate).slice(0, 10)}T00:00:00.000Z`,
        sourceId: DASHBOARD_SOURCES.samGov.id,
        sourceName: DASHBOARD_SOURCES.samGov.name,
        sourceUrl: validSourceUrl(item.uiLink) ?? `https://sam.gov/opp/${id}/view`,
        reviewStatus: "PENDING",
        metadata: {
          noticeId: item.noticeId,
          solicitationNumber: item.solicitationNumber,
          naicsCode: item.naicsCode,
          responseDeadline: item.responseDeadLine,
          active: item.active,
          matchBasis: "title-keyword",
        },
      }));

      return {
        observations: [
          observation("sam_opportunities", DASHBOARD_SOURCES.samGov.id, endDate, matched.length, {
            unit: "count",
            metadata: {
              lookbackDays: 7,
              titleKeywords: TITLE_KEYWORDS,
              deduplicated: true,
            },
          }),
        ],
        signals,
        warnings,
      };
    },
  };
}

function validatedSamPage(
  response: SamResponse,
  keyword: string,
  page: number,
): { totalRecords: number; opportunities: SamOpportunity[] } {
  const totalRecords = response.totalRecords;
  if (typeof totalRecords !== "number" || !Number.isInteger(totalRecords) || totalRecords < 0) {
    throw new Error(`SAM.gov title query "${keyword}" returned an invalid totalRecords value on page ${page}.`);
  }
  if (!Array.isArray(response.opportunitiesData)) {
    throw new Error(`SAM.gov title query "${keyword}" returned no opportunitiesData array on page ${page}.`);
  }
  if (totalRecords === 0 && response.opportunitiesData.length > 0) {
    throw new Error(`SAM.gov title query "${keyword}" returned records with a zero total on page ${page}.`);
  }
  return { totalRecords, opportunities: response.opportunitiesData };
}

async function fetchSamPage(
  apiKey: string,
  keyword: string,
  startDate: string,
  endDate: string,
  offset: number,
): Promise<SamResponse> {
  const url = new URL(SAM_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("postedFrom", samDate(startDate));
  url.searchParams.set("postedTo", samDate(endDate));
  url.searchParams.set("title", keyword);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  return fetchJson<SamResponse>(url.toString());
}

function samDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function buildSummary(item: SamOpportunity): string {
  const location = [
    item.placeOfPerformance?.city?.name,
    item.placeOfPerformance?.state?.code,
    item.placeOfPerformance?.country?.name ?? item.placeOfPerformance?.country?.code,
  ].filter(Boolean).join(", ");
  return [
    item.type || item.baseType || "Opportunity",
    item.fullParentPathName,
    location ? `Place of performance: ${location}` : undefined,
    item.responseDeadLine ? `Response deadline: ${item.responseDeadLine}` : undefined,
  ].filter(Boolean).join(" · ");
}

function validSourceUrl(value: string | null | undefined): string | undefined {
  if (!value || value === "null") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
