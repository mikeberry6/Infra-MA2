import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider, DashboardProviderResult, DashboardSignal } from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type UsaSpendingAward = {
  internal_id?: number;
  "Award ID"?: string;
  "Recipient Name"?: string;
  "Award Amount"?: number;
  "Start Date"?: string;
  "End Date"?: string;
  "Awarding Agency"?: string;
  Description?: string;
  generated_internal_id?: string;
};

type UsaSpendingAwardsResponse = {
  results?: UsaSpendingAward[];
  page_metadata?: {
    page?: number;
    hasNext?: boolean;
    last_record_unique_id?: number;
    last_record_sort_value?: string;
  };
  messages?: string[];
};

type UsaSpendingCountResponse = {
  results?: Record<string, number>;
  messages?: string[];
};

type UsaSpendingOverTimeResponse = {
  results?: Array<{ aggregated_amount?: number | null }>;
  messages?: string[];
};

const MAX_CANDIDATE_PAGES = 4;
const CANDIDATE_PAGE_SIZE = 25;
const AWARD_TYPE_CODES = [
  "02", "03", "04", "05",
  "06", "07", "08", "09", "10", "11",
  "A", "B", "C", "D",
  "IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E",
] as const;
const AWARD_COUNT_FIELDS = [
  "grants",
  "loans",
  "contracts",
  "direct_payments",
  "other",
  "idvs",
] as const;

export function usaSpendingProvider(now = new Date()): DashboardProvider {
  return {
    source: DASHBOARD_SOURCES.usaSpending,
    async fetch(): Promise<DashboardProviderResult> {
      const source = DASHBOARD_SOURCES.usaSpending;
      const startDate = isoDateDaysAgo(29, now);
      const endDate = todayIsoDate(now);
      const filters = {
        time_period: [{ start_date: startDate, end_date: endDate }],
        keywords: ["infrastructure"],
        award_type_codes: AWARD_TYPE_CODES,
      };

      const [countResponse, overTimeResponse, candidateResult] = await Promise.all([
        fetchJson<UsaSpendingCountResponse>("https://api.usaspending.gov/api/v2/search/spending_by_award_count/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        }),
        fetchJson<UsaSpendingOverTimeResponse>("https://api.usaspending.gov/api/v2/search/spending_over_time/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group: "month", filters }),
        }),
        fetchLeadingAwards(filters),
      ]);
      const awardTypeCounts = validatedAwardCounts(countResponse);
      const awardCount = Object.values(awardTypeCounts).reduce((total, value) => total + value, 0);
      const obligations = validatedObligations(overTimeResponse);
      const leadingAwards = candidateResult.awards;
      const warnings = [...candidateResult.warnings];
      const signals: DashboardSignal[] = [];
      for (const award of leadingAwards.slice(0, 15)) {
        const id = award.generated_internal_id || award["Award ID"] || String(award.internal_id ?? award["Recipient Name"] ?? "unknown");
        let observedAt: string;
        try {
          observedAt = officialAwardObservedAt(award, id, now);
        } catch (error) {
          warnings.push(error instanceof Error ? error.message : String(error));
          continue;
        }
        signals.push({
          signalKey: `usaspending-${id}`,
          section: "policy-regulatory",
          title: `${award["Recipient Name"] || "Unknown recipient"} | ${(award["Award Amount"] ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
          summary: `${award["Awarding Agency"] || "Unknown agency"} award returned by the infrastructure keyword screen. The displayed amount is the award's total value, not trailing-window obligations. ${award.Description || "Review award details for infrastructure relevance."}`,
          direction: "needs_review",
          severity: 1,
          observedAt,
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: award.generated_internal_id
            ? `https://www.usaspending.gov/award/${encodeURIComponent(award.generated_internal_id)}`
            : source.url,
          reviewStatus: "PENDING",
          metadata: {
            awardId: award["Award ID"],
            startDate: award["Start Date"],
            endDate: award["End Date"],
            observedAtBasis: "Start Date",
            matchBasis: "infrastructure-keyword",
          },
        });
      }

      return {
        observations: [
          observation("usaspending_infra_awards_30d", source.id, endDate, awardCount, {
            unit: "count",
            metadata: {
              lookbackDays: 30,
              countEndpoint: true,
              awardTypeCounts,
              awardTypeCodes: AWARD_TYPE_CODES,
            },
          }),
          observation("usaspending_infra_obligations_30d", source.id, endDate, Number((obligations / 1_000_000_000).toFixed(4)), {
            unit: "$bn",
            metadata: {
              lookbackDays: 30,
              sourceUnit: "USD",
              aggregation: "spending_over_time.aggregated_amount",
            },
          }),
        ],
        signals,
        warnings,
      };
    },
  };
}

function officialAwardObservedAt(award: UsaSpendingAward, id: string, now: Date): string {
  const date = award["Start Date"]?.slice(0, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`USAspending award ${id} has no valid official Start Date.`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`USAspending award ${id} has no valid official Start Date.`);
  }
  if (parsed.getTime() < Date.UTC(1900, 0, 1) || parsed.getTime() > now.getTime() + 26 * 3_600_000) {
    throw new Error(`USAspending award ${id} has an unsupported official Start Date ${date}.`);
  }
  return parsed.toISOString();
}

async function fetchLeadingAwards(filters: Record<string, unknown>): Promise<{
  awards: UsaSpendingAward[];
  warnings: string[];
}> {
  const awards = new Map<string, UsaSpendingAward>();
  const warnings: string[] = [];
  let hasNext = true;

  for (let page = 1; page <= MAX_CANDIDATE_PAGES && hasNext; page += 1) {
    const json = await fetchJson<UsaSpendingAwardsResponse>("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters,
        fields: [
          "Award ID",
          "Recipient Name",
          "Award Amount",
          "Start Date",
          "End Date",
          "Awarding Agency",
          "Description",
        ],
        page,
        limit: CANDIDATE_PAGE_SIZE,
        sort: "Award Amount",
        order: "desc",
      }),
    });
    if (!Array.isArray(json.results)) {
      throw new Error("USAspending leading-awards response is missing a results array.");
    }
    if (!json.page_metadata || typeof json.page_metadata.hasNext !== "boolean") {
      throw new Error("USAspending leading-awards response has invalid pagination metadata.");
    }
    for (const award of json.results) {
      const id = award.generated_internal_id || award["Award ID"] || String(award.internal_id ?? "");
      if (id) awards.set(id, award);
    }
    hasNext = json.page_metadata?.hasNext === true;
    if (page === MAX_CANDIDATE_PAGES && hasNext) {
      warnings.push(`USAspending candidate review is capped at the top ${MAX_CANDIDATE_PAGES * CANDIDATE_PAGE_SIZE} awards; aggregate count and obligations remain complete.`);
    }
  }

  return {
    awards: Array.from(awards.values()).sort((a, b) => (b["Award Amount"] ?? 0) - (a["Award Amount"] ?? 0)),
    warnings,
  };
}

function validatedAwardCounts(response: UsaSpendingCountResponse): Record<(typeof AWARD_COUNT_FIELDS)[number], number> {
  if (!response.results || typeof response.results !== "object" || Array.isArray(response.results)) {
    throw new Error("USAspending award-count response is missing aggregate results.");
  }
  return Object.fromEntries(AWARD_COUNT_FIELDS.map((field) => {
    const value = response.results?.[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
      throw new Error(`USAspending award-count response has an invalid ${field} total.`);
    }
    return [field, value];
  })) as Record<(typeof AWARD_COUNT_FIELDS)[number], number>;
}

function validatedObligations(response: UsaSpendingOverTimeResponse): number {
  if (!Array.isArray(response.results)) {
    throw new Error("USAspending spending-over-time response is missing aggregate results.");
  }
  return response.results.reduce((total, item, index) => {
    const value = item?.aggregated_amount;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`USAspending spending-over-time response has an invalid aggregate at index ${index}.`);
    }
    return total + value;
  }, 0);
}
