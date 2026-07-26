import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import { DASHBOARD_METHODOLOGY_VERSIONS } from "@/modules/dashboard/methodology-cutover";
import type { DashboardProvider, DashboardProviderResult, DashboardSignal } from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type UsaSpendingAward = {
  internal_id?: number;
  "Award ID"?: string;
  "Recipient Name"?: string;
  "Award Amount"?: number;
  "Loan Value"?: number;
  "Start Date"?: string;
  "Issued Date"?: string;
  "Last Modified Date"?: string;
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
const AWARD_TYPE_GROUPS = [
  { id: "contracts", codes: ["A", "B", "C", "D"], amountField: "Award Amount", dateField: "Start Date" },
  { id: "loans", codes: ["07", "08", "F003", "F004"], amountField: "Loan Value", dateField: "Issued Date" },
  { id: "idvs", codes: ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"], amountField: "Award Amount", dateField: "Start Date" },
  { id: "grants", codes: ["02", "03", "04", "05", "F001", "F002"], amountField: "Award Amount", dateField: "Start Date" },
  { id: "other_financial_assistance", codes: ["06", "10", "F006", "F007"], amountField: "Award Amount", dateField: "Start Date" },
  { id: "direct_payments", codes: ["09", "11", "-1", "F005", "F008", "F009", "F010"], amountField: "Award Amount", dateField: "Start Date" },
] as const;
const AWARD_TYPE_CODES = AWARD_TYPE_GROUPS.flatMap((group) => group.codes);
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
        let observedAt: { value: string; basis: string };
        try {
          observedAt = officialAwardObservedAt(award, id, now);
        } catch (error) {
          warnings.push(error instanceof Error ? error.message : String(error));
          continue;
        }
        signals.push({
          signalKey: `usaspending-${id}`,
          section: "policy-regulatory",
          title: `${award["Recipient Name"] || "Unknown recipient"} | ${awardAmount(award).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
          summary: `${award["Awarding Agency"] || "Unknown agency"} award returned by the infrastructure keyword screen. The displayed amount is the award or loan's total value, not trailing-window obligations. ${award.Description || "Review award details for infrastructure relevance."}`,
          direction: "needs_review",
          severity: 1,
          observedAt: observedAt.value,
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: award.generated_internal_id
            ? `https://www.usaspending.gov/award/${encodeURIComponent(award.generated_internal_id)}`
            : source.url,
          reviewStatus: "PENDING",
          metadata: {
            awardId: award["Award ID"],
            startDate: award["Start Date"],
            issuedDate: award["Issued Date"],
            lastModifiedDate: award["Last Modified Date"],
            endDate: award["End Date"],
            observedAtBasis: observedAt.basis,
            matchBasis: "infrastructure-keyword",
          },
        });
      }

      return {
        observations: [
          observation("usaspending_infra_awards_30d", source.id, endDate, awardCount, {
            unit: "count",
            metadata: {
              methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
              lookbackDays: 30,
              countEndpoint: true,
              awardTypeCounts,
              awardTypeCodes: AWARD_TYPE_CODES,
            },
          }),
          observation("usaspending_infra_obligations_30d", source.id, endDate, Number((obligations / 1_000_000_000).toFixed(4)), {
            unit: "$bn",
            metadata: {
              methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingObligations30d,
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

function officialAwardObservedAt(
  award: UsaSpendingAward,
  id: string,
  now: Date,
): { value: string; basis: string } {
  const [basis, rawDate] = award["Start Date"]
    ? ["Start Date", award["Start Date"]]
    : award["Issued Date"]
      ? ["Issued Date", award["Issued Date"]]
      : ["Last Modified Date", award["Last Modified Date"]];
  const date = rawDate?.slice(0, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`USAspending award ${id} has no valid official award date.`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`USAspending award ${id} has no valid official award date.`);
  }
  if (parsed.getTime() < Date.UTC(1900, 0, 1) || parsed.getTime() > now.getTime() + 26 * 3_600_000) {
    throw new Error(`USAspending award ${id} has an unsupported official Start Date ${date}.`);
  }
  return { value: parsed.toISOString(), basis };
}

async function fetchLeadingAwards(filters: Record<string, unknown>): Promise<{
  awards: UsaSpendingAward[];
  warnings: string[];
}> {
  const awards = new Map<string, UsaSpendingAward>();
  const warnings: string[] = [];

  for (const group of AWARD_TYPE_GROUPS) {
    let hasNext = true;
    for (let page = 1; page <= MAX_CANDIDATE_PAGES && hasNext; page += 1) {
      const json = await fetchJson<UsaSpendingAwardsResponse>("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: { ...filters, award_type_codes: group.codes },
          fields: [
            "Award ID",
            "Recipient Name",
            group.amountField,
            group.dateField,
            "Last Modified Date",
            ...(group.dateField === "Start Date" ? ["End Date"] : []),
            "Awarding Agency",
            "Description",
          ],
          page,
          limit: CANDIDATE_PAGE_SIZE,
          sort: group.amountField,
          order: "desc",
        }),
      });
      if (!Array.isArray(json.results)) {
        throw new Error(`USAspending ${group.id} leading-awards response is missing a results array.`);
      }
      if (!json.page_metadata || typeof json.page_metadata.hasNext !== "boolean") {
        throw new Error(`USAspending ${group.id} leading-awards response has invalid pagination metadata.`);
      }
      for (const award of json.results) {
        const id = award.generated_internal_id || award["Award ID"] || String(award.internal_id ?? "");
        if (id) awards.set(id, award);
      }
      hasNext = json.page_metadata.hasNext;
    }
  }

  return {
    awards: Array.from(awards.values()).sort((a, b) => awardAmount(b) - awardAmount(a)),
    warnings,
  };
}

function awardAmount(award: UsaSpendingAward): number {
  const value = award["Award Amount"] ?? award["Loan Value"];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
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
