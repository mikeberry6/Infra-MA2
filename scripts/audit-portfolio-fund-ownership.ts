import fs from "fs";
import path from "path";
import { companies } from "../prisma/seed-data/companies.ts";
import { funds } from "../prisma/seed-data/funds.ts";
import type { PortCo, PortCoOwner, PortCoSource } from "../prisma/seed-data/portco-types.ts";

type MatchStatus =
  | "exact_fund_match"
  | "normalized_fund_match"
  | "near_miss_fund_match"
  | "composite_fund_match"
  | "declared_na"
  | "probable_na"
  | "generic_vehicle"
  | "missing_vehicle"
  | "named_vehicle_missing_from_funds"
  | "unclassified_review";

type Priority = "ok" | "cleanup" | "review" | "fix";

interface OwnerAuditInput {
  company: PortCo;
  owner: PortCoOwner;
  ownerIndex: number;
  source: "owners[]" | "top-level fallback";
}

interface FundCandidate {
  fundName: string;
  managerName: string;
  score: number;
  reason: string;
}

interface AuditRow {
  priority: Priority;
  match_status: MatchStatus;
  company_name: string;
  country: string;
  company_status: string;
  owner_source: string;
  owner_index: string;
  investment_firm: string;
  owner_status: string;
  ownership_vehicle: string;
  investment_year: string;
  exact_fund_name: string;
  suggested_fund_name: string;
  candidate_score: string;
  suggested_action: string;
  rationale: string;
  evidence_urls: string;
}

const ROOT = process.cwd();
const REPORT_DATE = todayIso();
const REPORT_DIR = path.join(ROOT, "audits", "portfolio-fund-ownership");
const CSV_PATH = path.join(REPORT_DIR, `portfolio-fund-ownership-audit-${REPORT_DATE}.csv`);
const MD_PATH = path.join(REPORT_DIR, `portfolio-fund-ownership-audit-${REPORT_DATE}.md`);

const EXACT_FUND_BY_NAME = new Map(funds.map((fund) => [fund.fundName, fund]));
const NORMALIZED_FUND_BY_NAME = new Map<string, (typeof funds)[number][]>();

for (const fund of funds) {
  const normalized = normalizeFundLookup(fund.fundName);
  const existing = NORMALIZED_FUND_BY_NAME.get(normalized) ?? [];
  existing.push(fund);
  NORMALIZED_FUND_BY_NAME.set(normalized, existing);
}

const STATUS_ORDER: MatchStatus[] = [
  "missing_vehicle",
  "normalized_fund_match",
  "near_miss_fund_match",
  "named_vehicle_missing_from_funds",
  "probable_na",
  "generic_vehicle",
  "composite_fund_match",
  "declared_na",
  "unclassified_review",
  "exact_fund_match",
];

const PRIORITY_ORDER: Priority[] = ["fix", "cleanup", "review", "ok"];
const VALID_ROMAN_RE = /^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;
const FIRM_ALIASES: Record<string, string[]> = {
  "3i infrastructure": ["3i", "3i group"],
  "acadia infrastructure capital": ["acadia"],
  "adia infrastructure": ["adia", "abu dhabi investment authority"],
  "apg infrastructure": ["apg", "apg asset management"],
  "bernhard capital partners": ["bcp"],
  "blackrock (gip)": ["global infrastructure partners", "gip"],
  "brookfield asset management": ["brookfield", "brookfield infrastructure", "brookfield renewable"],
  "cvc dif": ["cvc", "dif"],
  ecp: ["energy capital partners"],
  "eqt infrastructure": ["eqt"],
  "global infrastructure partners": ["gip", "blackrock (gip)"],
  "msip": ["morgan stanley infrastructure partners", "morgan stanley infrastructure"],
  sdc: ["sdc capital partners"],
};

function todayIso(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

function ownersFor(company: PortCo): OwnerAuditInput[] {
  if (company.owners?.length) {
    return company.owners.map((owner, index) => ({
      company,
      owner,
      ownerIndex: index,
      source: "owners[]",
    }));
  }

  return [
    {
      company,
      owner: {
        investmentFirm: company.investmentFirm,
        ownershipVehicle: company.ownershipVehicle,
        investmentYear: company.investmentYear,
        status: company.status,
      },
      ownerIndex: 0,
      source: "top-level fallback",
    },
  ];
}

function normalizeFundLookup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSemantic(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bnorth american\b/g, "na")
    .replace(/&/g, " and ")
    .replace(
      /\b(the|a|an|inc|llc|ltd|plc|lp|l p|limited|corp|corporation|holdings|holding|company|co|partners|partner|capital|asset|assets|management|managed|investment|investments|investors|infrastructure|infra|fund|funds|vehicle|program|platform|portfolio)\b/g,
      " ",
    )
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalizeSemantic(value)
    .split(/\s+/)
    .filter((token) => token.length >= 2 || VALID_ROMAN_RE.test(token));
}

function tokenOverlap(first: string, second: string): number {
  const firstTokens = tokens(first);
  const secondTokens = new Set(tokens(second));
  if (!firstTokens.length || !secondTokens.size) return 0;
  const hits = firstTokens.filter((token) => secondTokens.has(token)).length;
  return hits / Math.max(firstTokens.length, secondTokens.size);
}

function levenshteinRatio(first: string, second: string): number {
  const a = normalizeFundLookup(first);
  const b = normalizeFundLookup(second);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  const distance = previous[b.length] ?? Math.max(a.length, b.length);
  return 1 - distance / Math.max(a.length, b.length);
}

function managerHintScore(ownerFirm: string, managerName: string): number {
  let best = 0;
  for (const ownerTerm of aliasTerms(ownerFirm)) {
    for (const managerTerm of aliasTerms(managerName)) {
      const owner = normalizeSemantic(ownerTerm);
      const manager = normalizeSemantic(managerTerm);
      if (!owner || !manager) continue;
      if (owner === manager) best = Math.max(best, 1);
      if (owner.includes(manager) || manager.includes(owner)) best = Math.max(best, 0.9);
      best = Math.max(best, tokenOverlap(ownerTerm, managerTerm));
    }
  }
  return best;
}

function aliasTerms(value: string): string[] {
  const lower = value.toLowerCase().trim();
  return [value, ...(FIRM_ALIASES[lower] ?? [])];
}

function vintageTokens(value: string): string[] {
  const normalized = normalizeFundLookup(value);
  return Array.from(normalized.matchAll(/\b(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|[1-9]|10)\b/gi), (match) => match[0].toLowerCase());
}

function hasConflictingVintage(first: string, second: string): boolean {
  const firstVintages = new Set(vintageTokens(first));
  const secondVintages = new Set(vintageTokens(second));
  if (!firstVintages.size || !secondVintages.size) return false;
  return !Array.from(firstVintages).some((token) => secondVintages.has(token));
}

function bestFundCandidate(vehicle: string, ownerFirm: string): FundCandidate | null {
  let best: FundCandidate | null = null;

  for (const fund of funds) {
    const lexical = Math.max(levenshteinRatio(vehicle, fund.fundName), tokenOverlap(vehicle, fund.fundName));
    const manager = managerHintScore(ownerFirm, fund.managerName);
    const baseScore = Math.max(lexical, lexical * 0.82 + manager * 0.18);
    const score = hasConflictingVintage(vehicle, fund.fundName) ? Math.min(baseScore, 0.84) : baseScore;
    const reason = lexical >= 0.95 ? "very high name similarity" : manager >= 0.7 ? "name similarity plus manager hint" : "name similarity";
    if (!best || score > best.score) {
      best = {
        fundName: fund.fundName,
        managerName: fund.managerName,
        score,
        reason,
      };
    }
  }

  return best;
}

function compositeParts(vehicle: string): string[] {
  return vehicle
    .split(/\s+(?:\/|;|\+)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isNoFundDisclosure(value: string): boolean {
  return /^(?:n\.?a\.?|n\/a|not applicable|not disclosed|undisclosed|not publicly disclosed|none)$/i.test(value.trim().replace(/\.$/, ""));
}

function describesNoFundDisclosure(value: string): boolean {
  return /\b(no|not|undisclosed|without)\b.{0,40}\b(disclosed\s+)?(fund|vehicle)\b|\b(fund|vehicle)\b.{0,40}\b(not disclosed|not publicly disclosed|undisclosed|was not disclosed|were not disclosed)\b|\bundisclosed fund\b|\bundisclosed vehicle\b/i.test(
    value,
  );
}

function isGenericVehicle(value: string): boolean {
  return /\b(preferred equity|tax equity|direct equity|direct investment|balance sheet|managed funds?|funds? managed by|clients?|client accounts?|separate accounts?|sma|co-invest(?:ment)?|joint venture|jv|consortium|partnership|platform|account|strategy|proprietary capital|sponsor equity|minority stake|majority stake|equity commitment)\b/i.test(
    value,
  );
}

function looksLikeNamedFund(value: string): boolean {
  return (
    /\b(fund|partners\s+[ivxlcdm]+|mip\s+[ivxlcdm]+|msip\s*[ivxlcdm]+|cip\s*[ivxlcdm]+|gif\s*[ivxlcdm]*|etif|dcif|sicav|plc|l\.p\.| lp\b|holdco|income fund|infrastructure trust|infrastructure investors\s+[ivxlcdm]+)\b/i.test(
      value,
    ) ||
    /\b(?:Infrastructure|Energy|Digital|Climate|Transition|Core|Infra|Power|Renewables|Credit|Value[- ]Add|Opportunistic|Growth|North American|Americas|Global|Sustainable Energies)\s+(?:[IVX]+|\d+)\b/.test(
      value,
    )
  );
}

function sourceUrls(company: PortCo): string {
  return (company.sources ?? [])
    .slice()
    .sort((a, b) => sourceRank(b) - sourceRank(a))
    .slice(0, 4)
    .map((source) => source.url)
    .join("; ");
}

function sourceRank(source: PortCoSource): number {
  let score = 0;
  if (source.purpose === "OWNERSHIP_INVESTMENT") score += 80;
  if (source.purpose === "FINANCING_FILINGS") score += 55;
  if (source.purpose === "MILESTONE_EVENT") score += 45;
  if (source.purpose === "COMPANY_PROFILE") score += 30;
  if (source.type === "SEC_FILING") score += 25;
  if (source.type === "PRESS_RELEASE") score += 15;
  if (source.type === "WEBSITE") score += 5;
  return score;
}

function classify(input: OwnerAuditInput): AuditRow {
  const { company, owner, ownerIndex, source } = input;
  const vehicle = owner.ownershipVehicle?.trim() ?? "";
  const evidence = sourceUrls(company);
  const base = {
    company_name: company.name,
    country: company.country,
    company_status: company.status,
    owner_source: source,
    owner_index: String(ownerIndex),
    investment_firm: owner.investmentFirm,
    owner_status: owner.status,
    ownership_vehicle: vehicle,
    investment_year: owner.investmentYear ? String(owner.investmentYear) : "",
    evidence_urls: evidence,
  };

  if (!vehicle) {
    return row(base, "fix", "missing_vehicle", "", "", "", "Add an ownershipVehicle or explicitly use n.a.", "Blank vehicle prevents the seed from linking an OwnershipPeriod to a Fund and leaves the N/A convention ambiguous.");
  }

  const exact = EXACT_FUND_BY_NAME.get(vehicle);
  if (exact) {
    return row(base, "ok", "exact_fund_match", exact.fundName, "", "1.000", "No action.", "ownershipVehicle exactly matches a fundName in prisma/seed-data/funds.ts.");
  }

  if (isNoFundDisclosure(vehicle)) {
    return row(base, "ok", "declared_na", "", "", "", "No action unless source review finds a disclosed fund.", "The row already follows the n.a. convention for no disclosed fund.");
  }

  const normalizedHits = NORMALIZED_FUND_BY_NAME.get(normalizeFundLookup(vehicle)) ?? [];
  if (normalizedHits.length === 1) {
    const hit = normalizedHits[0]!;
    return row(
      base,
      "cleanup",
      "normalized_fund_match",
      "",
      hit.fundName,
      "1.000",
      `Replace ownershipVehicle with exact fundName "${hit.fundName}".`,
      "The value normalizes to an existing fundName, but the seed process requires exact string equality to set fundId.",
    );
  }

  const parts = compositeParts(vehicle);
  if (parts.length > 1) {
    const matchedParts = parts.map((part) => EXACT_FUND_BY_NAME.get(part) ?? NORMALIZED_FUND_BY_NAME.get(normalizeFundLookup(part))?.[0]);
    if (matchedParts.every(Boolean)) {
      return row(
        base,
        "review",
        "composite_fund_match",
        "",
        matchedParts.map((fund) => fund!.fundName).join(" / "),
        "1.000",
        "Review whether this should be split into separate owners[] rows so each fund can link cleanly.",
        "The vehicle appears to contain multiple fundName matches in one field; a single OwnershipPeriod can only hold one fundId.",
      );
    }
  }

  const textForDisclosure = `${vehicle} ${company.description ?? ""} ${(company.milestones ?? []).map((milestone) => milestone.event).join(" ")}`;
  if (describesNoFundDisclosure(textForDisclosure)) {
    return row(
      base,
      "review",
      "probable_na",
      "",
      "n.a.",
      "",
      'Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed.',
      "The current value or company text indicates that the ownership vehicle/fund was not publicly disclosed.",
    );
  }

  if (isGenericVehicle(vehicle)) {
    return row(
      base,
      "review",
      "generic_vehicle",
      "",
      "n.a.",
      "",
      'Review whether this generic structure should remain as-is or become "n.a.".',
      "The vehicle describes a structure, account, client pool, or transaction form rather than an exact disclosed fund.",
    );
  }

  const candidate = bestFundCandidate(vehicle, owner.investmentFirm);
  if (
    candidate &&
    candidate.score >= 0.86 &&
    managerHintScore(owner.investmentFirm, candidate.managerName) >= 0.35 &&
    !hasConflictingVintage(vehicle, candidate.fundName)
  ) {
    return row(
      base,
      "cleanup",
      "near_miss_fund_match",
      "",
      candidate.fundName,
      candidate.score.toFixed(3),
      `Review replacing ownershipVehicle with "${candidate.fundName}".`,
      `Likely near-miss: ${candidate.reason}; manager candidate is ${candidate.managerName}.`,
    );
  }

  if (looksLikeNamedFund(vehicle)) {
    return row(
      base,
      "review",
      "named_vehicle_missing_from_funds",
      "",
      "",
      candidate ? candidate.score.toFixed(3) : "",
      "Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle.",
      candidate
        ? `The vehicle looks like a named fund but does not exactly match fundName. Nearest candidate is "${candidate.fundName}" (${candidate.score.toFixed(3)}).`
        : "The vehicle looks like a named fund but no close candidate was found.",
    );
  }

  return row(
    base,
    "review",
    "unclassified_review",
    "",
    candidate?.fundName ?? "",
    candidate ? candidate.score.toFixed(3) : "",
    "Manual source review required before changing seed data.",
    candidate
      ? `No rule classified this safely. Nearest fund candidate is "${candidate.fundName}" (${candidate.score.toFixed(3)}).`
      : "No exact fund, N/A signal, generic disclosure, or near-miss candidate was detected.",
  );
}

function row(
  base: Omit<
    AuditRow,
    "priority" | "match_status" | "exact_fund_name" | "suggested_fund_name" | "candidate_score" | "suggested_action" | "rationale"
  >,
  priority: Priority,
  matchStatus: MatchStatus,
  exactFundName: string,
  suggestedFundName: string,
  candidateScore: string,
  suggestedAction: string,
  rationale: string,
): AuditRow {
  return {
    priority,
    match_status: matchStatus,
    ...base,
    exact_fund_name: exactFundName,
    suggested_fund_name: suggestedFundName,
    candidate_score: candidateScore,
    suggested_action: suggestedAction,
    rationale,
  };
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: AuditRow[]): string {
  const headers = [
    "priority",
    "match_status",
    "company_name",
    "country",
    "company_status",
    "owner_source",
    "owner_index",
    "investment_firm",
    "owner_status",
    "ownership_vehicle",
    "investment_year",
    "exact_fund_name",
    "suggested_fund_name",
    "candidate_score",
    "suggested_action",
    "rationale",
    "evidence_urls",
  ] satisfies (keyof AuditRow)[];

  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")), ""].join("\n");
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

function markdownTable(rows: string[][]): string {
  if (!rows.length) return "";
  const [header, ...body] = rows;
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((cells) => `| ${cells.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function markdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function topRows(rows: AuditRow[], limit: number): AuditRow[] {
  return rows
    .filter((row) => row.priority !== "ok")
    .sort((a, b) => {
      const priorityDelta = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      if (priorityDelta !== 0) return priorityDelta;
      const statusDelta = STATUS_ORDER.indexOf(a.match_status) - STATUS_ORDER.indexOf(b.match_status);
      if (statusDelta !== 0) return statusDelta;
      return a.company_name.localeCompare(b.company_name);
    })
    .slice(0, limit);
}

function groupedRows(rows: AuditRow[], status: MatchStatus, limit: number): string[][] {
  return rows
    .filter((row) => row.match_status === status)
    .sort((a, b) => a.investment_firm.localeCompare(b.investment_firm) || a.company_name.localeCompare(b.company_name))
    .slice(0, limit)
    .map((row) => [
      row.company_name,
      row.investment_firm,
      row.ownership_vehicle || "(blank)",
      row.suggested_fund_name || row.exact_fund_name || "-",
      row.suggested_action,
    ]);
}

function summaryMarkdown(rows: AuditRow[], ownerRows: OwnerAuditInput[]): string {
  const priorityCounts = countBy(rows.map((row) => row.priority));
  const statusCounts = countBy(rows.map((row) => row.match_status));
  const activeRows = rows.filter((row) => row.owner_status === "Active").length;
  const ownerRowsFromOwnersArray = ownerRows.filter((row) => row.source === "owners[]").length;
  const ownerRowsFromFallback = ownerRows.length - ownerRowsFromOwnersArray;

  const byFirmNeedsWork = Array.from(
    rows
      .filter((row) => row.priority !== "ok")
      .reduce((map, row) => map.set(row.investment_firm, (map.get(row.investment_firm) ?? 0) + 1), new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 15);

  return `# Portfolio Fund Ownership Audit - ${REPORT_DATE}

## Scope

This report checks every portfolio-company ownership record from \`prisma/seed-data/companies.ts\` against fund names in \`prisma/seed-data/funds.ts\`, the current Prisma-backed source equivalent in this repo. It does not edit seed data or live database records.

| Check | Count |
| --- | ---: |
| Portfolio companies | ${companies.length} |
| Funds in fund data | ${funds.length} |
| Ownership rows audited | ${rows.length} |
| Active ownership rows | ${activeRows} |
| Rows sourced from owners[] | ${ownerRowsFromOwnersArray} |
| Rows sourced from top-level fallback | ${ownerRowsFromFallback} |

## Priority Counts

${markdownTable([
  ["Priority", "Rows"],
  ...PRIORITY_ORDER.map((priority) => [priority, String(priorityCounts[priority] ?? 0)]),
])}

## Match Status Counts

${markdownTable([
  ["Match status", "Rows"],
  ...STATUS_ORDER.map((status) => [status, String(statusCounts[status] ?? 0)]),
])}

## Highest Priority Rows

${markdownTable([
  ["Company", "Firm", "Current vehicle", "Suggested", "Action"],
  ...topRows(rows, 35).map((row) => [
    row.company_name,
    row.investment_firm,
    row.ownership_vehicle || "(blank)",
    row.suggested_fund_name || row.exact_fund_name || "-",
    row.suggested_action,
  ]),
])}

## Likely Exact-String Cleanup

These rows look like fund-list matches but will not link to \`Fund\` during seeding until the string is corrected.

${markdownTable([
  ["Company", "Firm", "Current vehicle", "Suggested fundName", "Action"],
  ...[
    ...groupedRows(rows, "normalized_fund_match", 25),
    ...groupedRows(rows, "near_miss_fund_match", 25),
  ].slice(0, 35),
])}

## N/A And Generic Candidates

These are the rows most likely to need either \`n.a.\` normalization or a deliberate decision to keep generic transaction structure text.

${markdownTable([
  ["Company", "Firm", "Current vehicle", "Suggested", "Action"],
  ...[
    ...groupedRows(rows, "probable_na", 25),
    ...groupedRows(rows, "generic_vehicle", 25),
    ...groupedRows(rows, "declared_na", 10),
  ].slice(0, 40),
])}

## Named Vehicles Missing From Fund Data

${markdownTable([
  ["Company", "Firm", "Current vehicle", "Nearest/suggested", "Action"],
  ...groupedRows(rows, "named_vehicle_missing_from_funds", 40),
])}

## Needs-Work Concentration

${markdownTable([
  ["Investment firm", "Rows"],
  ...byFirmNeedsWork.map(([firm, count]) => [firm, String(count)]),
])}

## Method Notes

- \`exact_fund_match\` requires exact string equality with \`fund.fundName\`.
- \`normalized_fund_match\` strips punctuation and whitespace only; these are high-confidence rename candidates.
- \`near_miss_fund_match\` uses edit distance, token overlap, and manager-name hints to surface likely typos or alias drift.
- \`declared_na\` means the field already follows the no-disclosed-fund convention.
- \`probable_na\` and \`generic_vehicle\` are review queues, not automatic edits.
- The full CSV includes all audited rows and evidence URLs for sorting/filtering the cleanup pass.
`;
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const ownerRows = companies.flatMap(ownersFor);
  const auditRows = ownerRows.map(classify).sort((a, b) => {
    const priorityDelta = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    if (priorityDelta !== 0) return priorityDelta;
    const statusDelta = STATUS_ORDER.indexOf(a.match_status) - STATUS_ORDER.indexOf(b.match_status);
    if (statusDelta !== 0) return statusDelta;
    return a.company_name.localeCompare(b.company_name);
  });

  fs.writeFileSync(CSV_PATH, toCsv(auditRows));
  fs.writeFileSync(MD_PATH, summaryMarkdown(auditRows, ownerRows));

  const priorityCounts = countBy(auditRows.map((row) => row.priority));
  const statusCounts = countBy(auditRows.map((row) => row.match_status));

  console.log(`Wrote ${path.relative(ROOT, CSV_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, MD_PATH)}`);
  console.log(JSON.stringify({ ownerRows: ownerRows.length, priorityCounts, statusCounts }, null, 2));
}

main();
