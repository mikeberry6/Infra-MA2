import { createHash } from "node:crypto";

export const PORTFOLIO_REVIEW_SCHEMA_VERSION = 1 as const;

export type ReviewSeverity = "ERROR" | "REVIEW" | "WARNING" | "INFO";

export type ReviewArea =
  | "IDENTITY"
  | "CORE_FIELDS"
  | "OWNERSHIP"
  | "MILESTONES"
  | "SOURCES"
  | "MANAGEMENT"
  | "DEAL_SYNC"
  | "SEED_SYNC";

export type ReviewOutcome =
  | "IDENTITY_REVIEW_REQUIRED"
  | "RESEARCH_REQUIRED"
  | "DEAL_SYNC_REQUIRED"
  | "DATA_CORRECTION_REQUIRED"
  | "SEED_SYNC_REQUIRED"
  | "ENRICHMENT_RECOMMENDED"
  | "PASS";

export interface ReviewIssue {
  code: string;
  severity: ReviewSeverity;
  area: ReviewArea;
  message: string;
  evidence?: string[];
}

export function ownershipVehicleIssueSeverity(owner: {
  fundId: string | null;
  organizationId: string | null;
}): ReviewSeverity {
  return owner.fundId || owner.organizationId ? "WARNING" : "ERROR";
}

const OUTCOME_PRIORITY: ReviewOutcome[] = [
  "IDENTITY_REVIEW_REQUIRED",
  "RESEARCH_REQUIRED",
  "DEAL_SYNC_REQUIRED",
  "DATA_CORRECTION_REQUIRED",
  "SEED_SYNC_REQUIRED",
  "ENRICHMENT_RECOMMENDED",
  "PASS",
];

const RESEARCH_CODES = new Set([
  "AMBIGUOUS_IDENTITY",
  "GENERIC_COMPANY_NAME",
  "MISSING_INVESTMENT_YEAR",
  "NO_CITATIONS",
  "REALIZED_WITH_ACTIVE_FUND_OWNER",
  "UNRESOLVED_DESCRIPTION",
]);

const DEAL_SYNC_CODES = new Set([
  "EXACT_DEAL_MATCH_NOT_LINKED",
  "LINKED_DEAL_MILESTONE_GAP",
  "LINKED_DEAL_SOURCE_PURPOSE_GAP",
]);

const SEED_SYNC_CODES = new Set([
  "LIVE_COMPANY_MISSING_FROM_SEED",
  "SEED_CORE_FIELD_DRIFT",
  "SEED_OWNER_NOT_LIVE",
  "SEED_MILESTONE_NOT_LIVE",
  "SEED_SOURCE_NOT_LIVE",
]);

export function outcomeForIssues(issues: ReviewIssue[]): ReviewOutcome {
  const candidates = new Set<ReviewOutcome>();
  if (issues.some((issue) => issue.code === "AMBIGUOUS_IDENTITY")) {
    candidates.add("IDENTITY_REVIEW_REQUIRED");
  }
  if (issues.some((issue) => RESEARCH_CODES.has(issue.code))) {
    candidates.add("RESEARCH_REQUIRED");
  }
  if (issues.some((issue) => DEAL_SYNC_CODES.has(issue.code))) {
    candidates.add("DEAL_SYNC_REQUIRED");
  }
  if (
    issues.some(
      (issue) => issue.severity === "ERROR" && !SEED_SYNC_CODES.has(issue.code),
    )
  ) {
    candidates.add("DATA_CORRECTION_REQUIRED");
  }
  if (issues.some((issue) => SEED_SYNC_CODES.has(issue.code))) {
    candidates.add("SEED_SYNC_REQUIRED");
  }
  if (
    issues.some(
      (issue) => issue.severity === "WARNING" || issue.severity === "INFO",
    )
  ) {
    candidates.add("ENRICHMENT_RECOMMENDED");
  }
  candidates.add("PASS");
  return OUTCOME_PRIORITY.find((outcome) => candidates.has(outcome)) ?? "PASS";
}

export function canonicalJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (value === null || typeof value !== "object")
    return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizedCompanyCountryKey(
  name: string,
  country: string,
): string {
  return `${normalizeText(name)}|${normalizeText(country)}`;
}

export function normalizedOwnerKey(input: {
  firm: string;
  vehicle: string | null | undefined;
  investmentYear: number | null | undefined;
  exitYear: number | null | undefined;
  isActive: boolean;
}): string {
  return [
    normalizeText(input.firm),
    normalizeText(input.vehicle ?? ""),
    input.investmentYear ?? "",
    input.exitYear ?? "",
    input.isActive ? "active" : "former",
  ].join("|");
}

const UNDISCLOSED_VEHICLES = new Set([
  "",
  "n a",
  "not applicable",
  "not disclosed",
  "not publicly disclosed",
  "undisclosed",
]);

/**
 * Returns true when a live ownership row faithfully covers a seed ownership
 * fact. The seed is the replay baseline, so an undisclosed seed vehicle is a
 * wildcard: a more specific live vehicle is enrichment, not a missing owner.
 * A specific seed vehicle must still match exactly and cannot be hidden by a
 * generic live value.
 */
export function liveOwnerCoversSeed(input: {
  live: {
    firm: string;
    vehicle: string | null | undefined;
    investmentYear: number | null | undefined;
    exitYear: number | null | undefined;
    isActive: boolean;
  };
  seed: {
    firm: string;
    vehicle: string | null | undefined;
    investmentYear: number | null | undefined;
    exitYear: number | null | undefined;
    isActive: boolean;
  };
}): boolean {
  const { live, seed } = input;
  if (normalizeText(live.firm) !== normalizeText(seed.firm)) return false;
  if ((live.investmentYear ?? null) !== (seed.investmentYear ?? null))
    return false;
  if ((live.exitYear ?? null) !== (seed.exitYear ?? null)) return false;
  if (live.isActive !== seed.isActive) return false;

  const seedVehicle = normalizeText(seed.vehicle ?? "");
  if (UNDISCLOSED_VEHICLES.has(seedVehicle)) return true;
  return normalizeText(live.vehicle ?? "") === seedVehicle;
}

export function isAllowedMilestoneDate(value: string): boolean {
  const months =
    "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";
  return new RegExp(
    `^(?:\\d{4}|${months}\\s+\\d{4}|${months}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
  ).test(value);
}

const ASSET_TERMS =
  /\b(project|portfolio|facility|facilities|pipeline|road|highway|bridge|tunnel|terminal|airport|hospital|campus|concession|wind farm|solar farm|solar park|battery storage|energy park|rail line|transmission line|data center campus|utility system|district energy system)\b/i;

export function isAssetLike(
  name: string,
  subsector: string,
  description: string,
): boolean {
  if (ASSET_TERMS.test(`${name} ${subsector}`)) return true;
  return (
    ASSET_TERMS.test(description) &&
    !/\b(company|business|operator|provider|platform)\b/i.test(
      description.slice(0, 280),
    )
  );
}

export function escapeCsv(value: unknown): string {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function countBy<T>(
  items: T[],
  key: (item: T) => string,
): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
