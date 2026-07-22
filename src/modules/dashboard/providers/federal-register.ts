import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import {
  DASHBOARD_METHODOLOGY_VERSIONS,
  FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES,
} from "@/modules/dashboard/methodology-cutover";
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
  count?: number;
  results?: FederalRegisterDocument[];
};

type MatchedDocument = {
  document: FederalRegisterDocument;
  matchedTerms: Set<string>;
};

export const FEDERAL_REGISTER_TERMS = [
  "infrastructure",
  "energy",
  "transmission",
  "pipeline",
  "broadband",
  "water",
  "transportation",
] as const;

const PAGE_SIZE = 100;
const MAX_PAGES_PER_TERM = 100;
const INCLUDED_DOCUMENT_TYPES: ReadonlySet<string> = new Set(FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES);

export function federalRegisterProvider(
  now = new Date(),
  terms: readonly string[] = FEDERAL_REGISTER_TERMS,
): DashboardProvider {
  return {
    source: DASHBOARD_SOURCES.federalRegister,
    async fetch(): Promise<DashboardProviderResult> {
      const startDate = isoDateDaysAgo(6, now);
      const endDate = todayIsoDate(now);
      const documents = new Map<string, MatchedDocument>();

      for (const term of terms) {
        for (let page = 1; page <= MAX_PAGES_PER_TERM; page += 1) {
          const json = await fetchFederalRegisterPage(term, startDate, endDate, page);
          const count = json.count;
          if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
            throw new Error(`Federal Register returned an invalid result count for term "${term}".`);
          }

          if (!Array.isArray(json.results)) {
            throw new Error(`Federal Register returned no results array for term "${term}".`);
          }
          const results = json.results;
          for (const item of results) {
            if (
              !item.document_number
              || !item.title
              || !item.type
              || !item.html_url
              || !/^\d{4}-\d{2}-\d{2}$/.test(item.publication_date)
            ) {
              throw new Error(`Federal Register returned a malformed document for term "${term}".`);
            }
            if (!INCLUDED_DOCUMENT_TYPES.has(item.type)) continue;
            const current = documents.get(item.document_number);
            if (current) current.matchedTerms.add(term);
            else documents.set(item.document_number, { document: item, matchedTerms: new Set([term]) });
          }

          if (page * PAGE_SIZE >= count) break;
          if (results.length === 0) {
            throw new Error(`Federal Register pagination ended before all results were returned for term "${term}".`);
          }
          if (page === MAX_PAGES_PER_TERM) {
            throw new Error(`Federal Register term "${term}" exceeded the ${MAX_PAGES_PER_TERM * PAGE_SIZE} document safety cap.`);
          }
        }
      }

      const source = DASHBOARD_SOURCES.federalRegister;
      const matches = Array.from(documents.values()).sort((left, right) => {
        const dateOrder = right.document.publication_date.localeCompare(left.document.publication_date);
        return dateOrder || right.document.document_number.localeCompare(left.document.document_number);
      });
      const signals: DashboardSignal[] = matches.map(({ document: item, matchedTerms }) => {
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
          reviewStatus: "PENDING",
          metadata: {
            documentNumber: item.document_number,
            type: item.type,
            agencies: item.agencies?.map((agencyItem) => agencyItem.name || agencyItem.raw_name).filter(Boolean) ?? [],
            matchedTerms: Array.from(matchedTerms).sort(),
          },
        };
      });

      return {
        observations: [
          observation("federal_register_infra_notices", source.id, endDate, matches.length, {
            unit: "count",
            metadata: {
              methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
              lookbackDays: 7,
              queryTerms: terms,
              documentTypes: FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES,
              deduplicatedBy: "document_number",
            },
          }),
        ],
        signals,
      };
    },
  };
}

async function fetchFederalRegisterPage(
  term: string,
  startDate: string,
  endDate: string,
  page: number,
): Promise<FederalRegisterResponse> {
  const url = new URL("https://www.federalregister.gov/api/v1/documents.json");
  url.searchParams.set("conditions[term]", term);
  url.searchParams.set("conditions[publication_date][gte]", startDate);
  url.searchParams.set("conditions[publication_date][lte]", endDate);
  url.searchParams.set("order", "newest");
  url.searchParams.set("per_page", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));
  return fetchJson<FederalRegisterResponse>(url.toString());
}
