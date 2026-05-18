import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider, DashboardProviderResult, DashboardSignal } from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type FederalRegisterDocument = {
  title: string;
  type: string;
  abstract?: string | null;
  document_number: string;
  html_url: string;
  publication_date: string;
  agencies?: Array<{ name?: string; raw_name?: string }>;
};

type FederalRegisterResponse = {
  count: number;
  results: FederalRegisterDocument[];
};

export function federalRegisterProvider(now = new Date()): DashboardProvider {
  return {
    source: DASHBOARD_SOURCES.federalRegister,
    async fetch(): Promise<DashboardProviderResult> {
      const startDate = isoDateDaysAgo(7, now);
      const endDate = todayIsoDate(now);
      const url = new URL("https://www.federalregister.gov/api/v1/documents.json");
      url.searchParams.set("conditions[term]", "infrastructure energy transmission pipeline broadband water transportation");
      url.searchParams.set("conditions[publication_date][gte]", startDate);
      url.searchParams.set("conditions[publication_date][lte]", endDate);
      url.searchParams.set("order", "newest");
      url.searchParams.set("per_page", "20");

      const json = await fetchJson<FederalRegisterResponse>(url.toString());
      const source = DASHBOARD_SOURCES.federalRegister;
      const signals: DashboardSignal[] = (json.results ?? []).slice(0, 20).map((item) => {
        const agency = item.agencies?.map((a) => a.name || a.raw_name).filter(Boolean).slice(0, 2).join(", ") || "Federal Register";
        return {
          signalKey: `federal-register-${item.document_number}`,
          section: "policy-regulatory",
          title: item.title,
          summary: `${item.type}${agency ? ` from ${agency}` : ""}. ${item.abstract || "Review the notice or rule for project, permitting, tariff, or approval implications."}`,
          direction: "needs_review",
          severity: item.type === "Rule" ? 2 : 1,
          observedAt: `${item.publication_date}T00:00:00.000Z`,
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: item.html_url,
          metadata: {
            documentNumber: item.document_number,
            type: item.type,
            agencies: item.agencies?.map((agencyItem) => agencyItem.name || agencyItem.raw_name).filter(Boolean) ?? [],
          },
        };
      });

      return {
        observations: [
          observation("federal_register_infra_notices", source.id, endDate, json.count ?? signals.length, {
            unit: "count",
            metadata: {
              lookbackDays: 7,
              resultLimit: 20,
              query: "infrastructure energy transmission pipeline broadband water transportation",
            },
          }),
        ],
        signals,
      };
    },
  };
}
