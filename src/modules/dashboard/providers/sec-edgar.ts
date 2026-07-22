import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type {
  DashboardProvider,
  DashboardProviderResult,
  DashboardSignal,
} from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, keyMissingProvider, observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type SecRecentFilings = {
  accessionNumber?: string[];
  filingDate?: string[];
  acceptanceDateTime?: string[];
  form?: string[];
  items?: string[];
  primaryDocument?: string[];
  primaryDocDescription?: string[];
};

type SecSubmissions = {
  cik?: string;
  name?: string;
  filings?: { recent?: SecRecentFilings };
};

type SecFactUnit = {
  start?: string;
  end?: string;
  val?: number;
  accn?: string;
  form?: string;
  filed?: string;
  fp?: string;
};

type SecCompanyFacts = {
  entityName?: string;
  facts?: {
    "us-gaap"?: Record<string, {
      label?: string;
      units?: { USD?: SecFactUnit[] };
    }>;
  };
};

export type SecWatchlistEntity = { cik: string; name: string };

type FilingCandidate = {
  cik: string;
  companyName: string;
  accessionNumber: string;
  filingDate: string;
  acceptanceDateTime?: string;
  form: string;
  items?: string;
  primaryDocument?: string;
  primaryDocDescription?: string;
};

const DEFAULT_WATCHLIST: SecWatchlistEntity[] = [
  { cik: "0000789019", name: "Microsoft" },
  { cik: "0001652044", name: "Alphabet" },
  { cik: "0001018724", name: "Amazon" },
  { cik: "0001326801", name: "Meta Platforms" },
  { cik: "0001341439", name: "Oracle" },
  { cik: "0001101239", name: "Equinix" },
  { cik: "0001297996", name: "Digital Realty" },
  { cik: "0001053507", name: "American Tower" },
  { cik: "0001051470", name: "Crown Castle" },
  { cik: "0001034054", name: "SBA Communications" },
];

export const SEC_HYPERSCALER_WATCHLIST: SecWatchlistEntity[] = DEFAULT_WATCHLIST.slice(0, 5);

const CAPEX_FACT_TAGS = [
  "PaymentsToAcquirePropertyPlantAndEquipment",
  "PaymentsToAcquireProductiveAssets",
] as const;
const SEC_MIN_REQUEST_INTERVAL_MS = 125;

const TRANSACTION_FORMS = new Set([
  "8-K",
  "8-K/A",
  "PREM14A",
  "DEFM14A",
  "S-4",
  "S-4/A",
  "SC TO-T",
  "SC TO-T/A",
  "SC 14D9",
  "SC 14D9/A",
  "425",
]);

export function secEdgarProvider(
  userAgent = process.env.SEC_USER_AGENT,
  watchlistValue = process.env.SEC_WATCHLIST_CIKS,
  now = new Date(),
  hyperscalerWatchlist: SecWatchlistEntity[] = SEC_HYPERSCALER_WATCHLIST,
  minRequestIntervalMs = SEC_MIN_REQUEST_INTERVAL_MS,
): DashboardProvider {
  if (!userAgent) return keyMissingProvider(DASHBOARD_SOURCES.sec, "SEC_USER_AGENT");

  return {
    source: DASHBOARD_SOURCES.sec,
    async fetch(): Promise<DashboardProviderResult> {
      assertCompliantUserAgent(userAgent);
      const startDate = isoDateDaysAgo(6, now);
      const endDate = todayIsoDate(now);
      const watchlist = parseSecWatchlist(watchlistValue);
      const candidates = new Map<string, FilingCandidate>();
      const fetchSecJson = rateLimitedSecFetcher(userAgent, minRequestIntervalMs);

      for (const entity of watchlist) {
        try {
          const submissions = await fetchSecJson<SecSubmissions>(
            `https://data.sec.gov/submissions/CIK${entity.cik}.json`,
          );
          for (const filing of recentFilings(submissions, entity)) {
            if (filing.filingDate < startDate || filing.filingDate > endDate) continue;
            if (!isTransactionCandidate(filing)) continue;
            candidates.set(filing.accessionNumber, filing);
          }
        } catch (error) {
          throw new Error(`SEC submissions watchlist is incomplete for ${entity.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const capex = [];
      for (const entity of hyperscalerWatchlist) {
        try {
          const facts = await fetchSecJson<SecCompanyFacts>(
            `https://data.sec.gov/api/xbrl/companyfacts/CIK${entity.cik}.json`,
          );
          capex.push(latestAnnualCapex(facts, entity));
        } catch (error) {
          throw new Error(`SEC hyperscaler capex is incomplete for ${entity.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const filings = Array.from(candidates.values()).sort((a, b) =>
        (b.acceptanceDateTime ?? b.filingDate).localeCompare(a.acceptanceDateTime ?? a.filingDate),
      );
      const signals: DashboardSignal[] = filings.map((filing) => ({
        signalKey: `sec-${filing.accessionNumber}`,
        section: "deal-friction",
        title: `${filing.companyName} | ${filing.form}`,
        summary: [
          filing.primaryDocDescription || "SEC filing matched the configured transaction watchlist.",
          filing.items ? `Items: ${filing.items}.` : undefined,
          "Review the filing before classifying it as an infrastructure M&A signal.",
        ].filter(Boolean).join(" "),
        direction: "needs_review",
        severity: filing.form.startsWith("DEFM14A") || filing.form.startsWith("SC TO-T") ? 2 : 1,
        observedAt: filing.acceptanceDateTime
          ? normalizeSecTimestamp(filing.acceptanceDateTime)
          : `${filing.filingDate}T00:00:00.000Z`,
        sourceId: DASHBOARD_SOURCES.sec.id,
        sourceName: DASHBOARD_SOURCES.sec.name,
        sourceUrl: filingUrl(filing),
        reviewStatus: "PENDING",
        metadata: {
          cik: filing.cik,
          companyName: filing.companyName,
          accessionNumber: filing.accessionNumber,
          form: filing.form,
          items: filing.items,
          filingDate: filing.filingDate,
          matchBasis: filing.form.startsWith("8-K") ? "8-k-items-or-description" : "transaction-form",
        },
      }));

      return {
        observations: [
          observation(
            "hyperscaler_capex_backlog",
            DASHBOARD_SOURCES.sec.id,
            capex.map((item) => item.filed).sort().at(-1) ?? endDate,
            Number((capex.reduce((total, item) => total + item.valueUsd, 0) / 1_000_000_000).toFixed(3)),
            {
              unit: "$bn",
              metadata: {
                measure: "latest-reported-fiscal-year-capex",
                taxonomy: "us-gaap",
                entities: capex,
              },
            },
          ),
          observation("sec_ma_watchlist", DASHBOARD_SOURCES.sec.id, endDate, filings.length, {
            unit: "count",
            metadata: {
              lookbackDays: 7,
              configuredCiks: watchlist.length,
              forms: Array.from(TRANSACTION_FORMS),
            },
          }),
        ],
        signals,
      };
    },
  };
}

function rateLimitedSecFetcher(userAgent: string, minIntervalMs: number) {
  if (!Number.isFinite(minIntervalMs) || minIntervalMs < 0) {
    throw new Error("SEC request interval must be a non-negative number.");
  }
  let lastStartedAt = 0;
  return async function fetchSecJson<T>(url: string): Promise<T> {
    const waitMs = Math.max(0, lastStartedAt + minIntervalMs - Date.now());
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastStartedAt = Date.now();
    return fetchJson<T>(url, { headers: { "User-Agent": userAgent } });
  };
}

export function parseSecWatchlist(value?: string): SecWatchlistEntity[] {
  if (!value?.trim()) return DEFAULT_WATCHLIST;
  const parsed = value.split(",").map((item) => {
    const [rawCik, ...nameParts] = item.trim().split(":");
    const digits = rawCik.replace(/\D/g, "");
    if (!digits || digits.length > 10) throw new Error(`Invalid SEC watchlist CIK: ${rawCik}`);
    const cik = digits.padStart(10, "0");
    return { cik, name: nameParts.join(":").trim() || `CIK ${cik}` };
  });
  return Array.from(new Map(parsed.map((item) => [item.cik, item])).values());
}

function recentFilings(submissions: SecSubmissions, fallback: SecWatchlistEntity): FilingCandidate[] {
  const recent = submissions.filings?.recent;
  if (
    !recent
    || !Array.isArray(recent.accessionNumber)
    || !Array.isArray(recent.filingDate)
    || !Array.isArray(recent.form)
  ) {
    throw new Error("SEC submissions response is missing required recent-filing arrays.");
  }
  const length = recent.accessionNumber.length;
  if (recent.filingDate.length !== length || recent.form.length !== length) {
    throw new Error("SEC submissions response has misaligned recent-filing arrays.");
  }
  const result: FilingCandidate[] = [];
  for (let index = 0; index < length; index += 1) {
    const accessionNumber = recent.accessionNumber?.[index];
    const filingDate = recent.filingDate?.[index];
    const form = recent.form?.[index];
    if (!accessionNumber || !filingDate || !form) continue;
    result.push({
      cik: (submissions.cik || fallback.cik).replace(/\D/g, "").padStart(10, "0"),
      companyName: submissions.name || fallback.name,
      accessionNumber,
      filingDate,
      acceptanceDateTime: recent.acceptanceDateTime?.[index],
      form,
      items: recent.items?.[index],
      primaryDocument: recent.primaryDocument?.[index],
      primaryDocDescription: recent.primaryDocDescription?.[index],
    });
  }
  return result;
}

export function latestAnnualCapex(
  companyFacts: SecCompanyFacts,
  entity: SecWatchlistEntity,
): {
  cik: string;
  companyName: string;
  tag: string;
  valueUsd: number;
  periodStart: string;
  periodEnd: string;
  filed: string;
  accessionNumber?: string;
} {
  const candidates = CAPEX_FACT_TAGS.flatMap((tag) =>
    (companyFacts.facts?.["us-gaap"]?.[tag]?.units?.USD ?? [])
      .filter((item) => {
        if (item.form !== "10-K" || item.fp !== "FY" || !item.start || !item.end || !item.filed) return false;
        if (typeof item.val !== "number" || !Number.isFinite(item.val) || item.val < 0) return false;
        const durationDays = (Date.parse(item.end) - Date.parse(item.start)) / 86_400_000;
        return Number.isFinite(durationDays) && durationDays >= 300 && durationDays <= 400;
      })
      .map((item) => ({ tag, item })),
  ).sort((left, right) => {
    const periodOrder = (right.item.end ?? "").localeCompare(left.item.end ?? "");
    return periodOrder || (right.item.filed ?? "").localeCompare(left.item.filed ?? "");
  });
  const latest = candidates[0];
  if (!latest?.item.start || !latest.item.end || !latest.item.filed || typeof latest.item.val !== "number") {
    throw new Error(`No current fiscal-year capex fact was found for ${companyFacts.entityName || entity.name}.`);
  }
  return {
    cik: entity.cik,
    companyName: companyFacts.entityName || entity.name,
    tag: latest.tag,
    valueUsd: latest.item.val,
    periodStart: latest.item.start,
    periodEnd: latest.item.end,
    filed: latest.item.filed,
    accessionNumber: latest.item.accn,
  };
}

function isTransactionCandidate(filing: FilingCandidate): boolean {
  if (!TRANSACTION_FORMS.has(filing.form)) return false;
  if (!filing.form.startsWith("8-K")) return true;
  const description = `${filing.primaryDocDescription ?? ""} ${filing.items ?? ""}`.toLowerCase();
  return /\b1\.01\b|\b2\.01\b|merger|acquisition|disposition|purchase agreement/.test(description);
}

function filingUrl(filing: FilingCandidate): string {
  const cik = String(Number(filing.cik));
  const accession = filing.accessionNumber.replace(/-/g, "");
  const document = filing.primaryDocument || `${filing.accessionNumber}-index.html`;
  return `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}/${document}`;
}

function normalizeSecTimestamp(value: string): string {
  if (/^\d{8}\d{6}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}.000Z`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? `${value.slice(0, 10)}T00:00:00.000Z` : parsed.toISOString();
}

function assertCompliantUserAgent(value: string): void {
  if (value.trim().length < 12 || !value.includes("@")) {
    throw new Error("SEC_USER_AGENT must identify the application and include a monitored contact email.");
  }
}
