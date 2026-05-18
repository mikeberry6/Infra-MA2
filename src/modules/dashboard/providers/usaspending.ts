import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider, DashboardProviderResult, DashboardSignal } from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type UsaSpendingAward = {
  "Award ID"?: string;
  "Recipient Name"?: string;
  "Award Amount"?: number;
  "Start Date"?: string;
  "End Date"?: string;
  "Awarding Agency"?: string;
  Description?: string;
  generated_internal_id?: string;
};

type UsaSpendingResponse = {
  results?: UsaSpendingAward[];
  page_metadata?: { hasNext?: boolean };
  messages?: string[];
};

export function usaSpendingProvider(now = new Date()): DashboardProvider {
  return {
    source: DASHBOARD_SOURCES.usaSpending,
    async fetch(): Promise<DashboardProviderResult> {
      const source = DASHBOARD_SOURCES.usaSpending;
      const startDate = isoDateDaysAgo(30, now);
      const endDate = todayIsoDate(now);
      const json = await fetchJson<UsaSpendingResponse>("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            time_period: [{ start_date: startDate, end_date: endDate }],
            keywords: ["infrastructure"],
            award_type_codes: ["A", "B", "C", "D"],
          },
          fields: [
            "Award ID",
            "Recipient Name",
            "Award Amount",
            "Start Date",
            "End Date",
            "Awarding Agency",
            "Description",
          ],
          page: 1,
          limit: 25,
          sort: "Award Amount",
          order: "desc",
        }),
      });

      const awards = json.results ?? [];
      const observedAt = `${endDate}T00:00:00.000Z`;
      const signals: DashboardSignal[] = awards.slice(0, 10).map((award) => ({
        signalKey: `usaspending-${award.generated_internal_id || award["Award ID"] || award["Recipient Name"]}`,
        section: "policy-regulatory",
        title: `${award["Recipient Name"] || "Unknown recipient"} | ${(award["Award Amount"] ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
        summary: `${award["Awarding Agency"] || "Unknown agency"} award tagged by infrastructure keyword. ${award.Description || "Review award details for infrastructure relevance."}`,
        direction: "supportive",
        severity: 1,
        observedAt,
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl: source.url,
        metadata: {
          awardId: award["Award ID"],
          startDate: award["Start Date"],
          endDate: award["End Date"],
          limited: json.page_metadata?.hasNext ?? false,
        },
      }));

      return {
        observations: [
          observation("usaspending_infra_awards_30d", source.id, endDate, awards.length, {
            unit: "count",
            metadata: {
              lookbackDays: 30,
              returnedAwards: awards.length,
              hasNext: json.page_metadata?.hasNext ?? false,
              messages: json.messages ?? [],
            },
          }),
        ],
        signals,
        warnings: json.page_metadata?.hasNext ? ["USAspending returned a limited first page; metric is returned-count, not total universe count."] : [],
      };
    },
  };
}
