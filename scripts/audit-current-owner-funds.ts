import fs from "fs";
import path from "path";
import { companies } from "../prisma/seed-data/companies.ts";
import { funds } from "../prisma/seed-data/funds.ts";
import type { PortCo, PortCoOwner, PortCoSource } from "../prisma/seed-data/portco-types.ts";

const AUDIT_DATE = "2026-05-11";
const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "audits");
const CSV_PATH = path.join(AUDIT_DIR, `portfolio-current-owner-fund-verification-${AUDIT_DATE}.csv`);
const SUMMARY_PATH = path.join(AUDIT_DIR, `portfolio-current-owner-fund-verification-${AUDIT_DATE}.md`);
const SUPPLEMENTAL_PATH = path.join(ROOT, "portfolio_companies_active_web.json");

type ResultStatus =
  | "Verified fund"
  | "Verified fund - missing from funds list"
  | "Disclosed but generic"
  | "n.a."
  | "Needs user review";

type Confidence = "High" | "Medium" | "Low";

interface SupplementalProfile {
  portfolioCompany?: string;
  profileCompanyName?: string;
  ownershipVehicle?: string;
  ownershipDetails?: string[];
  sources?: string[];
}

interface ParsedOwnershipDetail {
  raw: string;
  firm: string;
  fund: string;
  interest: string;
  profile: SupplementalProfile;
}

interface ActiveOwnerRow {
  company: PortCo;
  owner: PortCoOwner;
  rowKey: string;
}

interface AuditRow {
  company_name: string;
  country: string;
  current_owner_investment_firm: string;
  current_ownership_vehicle: string;
  investment_year: string;
  verified_fund_vehicle_result: string;
  result_status: ResultStatus;
  evidence_urls: string;
  evidence_type: string;
  confidence: Confidence;
  proposed_seed_data_action: string;
  notes: string;
}

const EXACT_FUND_NAMES = new Set(funds.map((fund) => fund.fundName.trim().toLowerCase()));
const NORMALIZED_FUND_NAMES = funds.map((fund) => normalizeForCompare(fund.fundName)).filter(Boolean);

const FIRM_ALIASES: Record<string, string[]> = {
  "3i infrastructure": ["3i", "3i group"],
  "adia infrastructure": ["adia", "abu dhabi investment authority"],
  "apg infrastructure": ["apg", "apg asset management"],
  "brookfield asset management": ["brookfield", "brookfield infrastructure", "brookfield renewable"],
  "cc&l": ["connor clark lunn", "ccl"],
  "cdpq": ["la caisse", "caisse de depot", "cdpq"],
  "cvc dif": ["cvc", "dif"],
  "ifm investors": ["ifm"],
  "msip": ["morgan stanley infrastructure partners", "morgan stanley infrastructure"],
  "quinbrook": ["quinbrook infrastructure", "quinbrook infrastructure partners"],
  "tpg": ["tpg rise climate"],
};

const STATUS_ORDER: ResultStatus[] = [
  "Verified fund",
  "Verified fund - missing from funds list",
  "Disclosed but generic",
  "n.a.",
  "Needs user review",
];

function loadSupplementalProfiles(): Map<string, SupplementalProfile[]> {
  if (!fs.existsSync(SUPPLEMENTAL_PATH)) return new Map();
  const raw = fs.readFileSync(SUPPLEMENTAL_PATH, "utf8");
  const parsed = JSON.parse(raw) as SupplementalProfile[];
  const byCompany = new Map<string, SupplementalProfile[]>();

  for (const profile of parsed) {
    const key = normalizeCompanyName(profile.profileCompanyName || profile.portfolioCompany || "");
    if (!key) continue;
    const current = byCompany.get(key) ?? [];
    current.push(profile);
    byCompany.set(key, current);
  }

  return byCompany;
}

function activeOwnerRows(): ActiveOwnerRow[] {
  const rows: ActiveOwnerRow[] = [];

  for (const company of companies) {
    const owners = company.owners?.length
      ? company.owners
      : [
          {
            investmentFirm: company.investmentFirm,
            ownershipVehicle: company.ownershipVehicle,
            investmentYear: company.investmentYear,
            status: company.status,
          },
        ];

    for (const [ownerIndex, owner] of owners.entries()) {
      if (owner.status !== "Active") continue;
      rows.push({
        company,
        owner,
        rowKey: `${company.name}|${company.country}|${owner.investmentFirm}|${owner.ownershipVehicle}|${ownerIndex}`,
      });
    }
  }

  return rows;
}

function normalizeCompanyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(inc|llc|ltd|plc|lp|l p|limited|corp|corporation|holdings|group|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(
      /\b(the|inc|llc|ltd|plc|lp|l p|limited|corp|corporation|holdings|group|partners|partner|capital|asset|management|infrastructure|infra|investment|investments|investors|fund|funds|company|co)\b/g,
      " ",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  return normalizeForCompare(value)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function overlapScore(first: string, second: string): number {
  const firstTokens = significantTokens(first);
  const secondTokens = new Set(significantTokens(second));
  if (!firstTokens.length || !secondTokens.size) return 0;
  const hits = firstTokens.filter((token) => secondTokens.has(token)).length;
  return hits / Math.min(firstTokens.length, secondTokens.size);
}

function aliasTerms(firm: string): string[] {
  const lower = firm.toLowerCase().trim();
  return [firm, ...(FIRM_ALIASES[lower] ?? [])];
}

function firmMatchScore(ownerFirm: string, detailFirm: string): number {
  if (!ownerFirm || !detailFirm) return 0;
  const ownerTerms = aliasTerms(ownerFirm);
  const detailTerms = aliasTerms(detailFirm);

  for (const ownerTerm of ownerTerms) {
    for (const detailTerm of detailTerms) {
      const owner = ownerTerm.toLowerCase();
      const detail = detailTerm.toLowerCase();
      if (owner === detail || owner.includes(detail) || detail.includes(owner)) return 1;
    }
  }

  let best = 0;
  for (const ownerTerm of ownerTerms) {
    for (const detailTerm of detailTerms) {
      best = Math.max(best, overlapScore(ownerTerm, detailTerm));
    }
  }
  return best;
}

function parseOwnershipDetail(raw: string, profile: SupplementalProfile): ParsedOwnershipDetail {
  const normalizedRaw = raw.trim();
  const firm = normalizedRaw.match(/Firm:\s*([^|]+)/i)?.[1]?.trim().replace(/\.$/, "") ?? "";
  const fund = normalizedRaw.match(/Fund:\s*([^|]+)/i)?.[1]?.trim().replace(/\.$/, "") ?? "";
  const interest = normalizedRaw.match(/Ownership Interest:\s*([^|]+)/i)?.[1]?.trim().replace(/\.$/, "") ?? "";

  if (!firm && !fund && /^not publicly disclosed\.?$/i.test(normalizedRaw)) {
    return {
      raw: normalizedRaw,
      firm: "",
      fund: "Not publicly disclosed",
      interest: "",
      profile,
    };
  }

  return { raw: normalizedRaw, firm, fund, interest, profile };
}

function selectSupplementalDetail(
  company: PortCo,
  owner: PortCoOwner,
  profiles: SupplementalProfile[],
): ParsedOwnershipDetail | null {
  const details = profiles.flatMap((profile) =>
    (profile.ownershipDetails ?? []).map((detail) => parseOwnershipDetail(detail, profile)),
  );
  if (!details.length) return null;

  const currentVehicle = owner.ownershipVehicle || "";
  let best: { detail: ParsedOwnershipDetail; score: number } | null = null;

  for (const detail of details) {
    const firmScore = detail.firm ? firmMatchScore(owner.investmentFirm, detail.firm) : details.length === 1 ? 0.35 : 0;
    const fundScore = detail.fund && currentVehicle ? overlapScore(currentVehicle, detail.fund) : 0;
    const currentVehicleMentionsFirm = currentVehicle ? firmMatchScore(owner.investmentFirm, currentVehicle) : 0;
    const rawScore =
      detail.raw && owner.investmentFirm ? Math.max(firmMatchScore(owner.investmentFirm, detail.raw), overlapScore(currentVehicle, detail.raw)) : 0;

    let score = firmScore * 2 + fundScore * 1.5 + rawScore * 0.5;
    if (fundScore > 0.8 && detail.fund && !isNoFundDisclosure(detail.fund)) score += 2;
    if (!detail.firm && isNoFundDisclosure(detail.fund) && details.length === 1 && currentVehicleMentionsFirm > 0.5) score += 0.25;
    if (!detail.firm && details.length > 1) score -= 1;

    if (!best || score > best.score) best = { detail, score };
  }

  if (!best) return null;
  const minimumScore = best.detail.firm || best.detail.fund ? 0.68 : 0.4;
  if (best.score < minimumScore) return null;
  return best.detail;
}

function isNoFundDisclosure(value: string): boolean {
  return /^(?:n\.?a\.?|not disclosed|undisclosed|not publicly disclosed|not applicable|none)$/i.test(value.trim().replace(/\.$/, ""));
}

function isPendingOrUnclear(value: string): boolean {
  return /\b(pending close|subject to|expected to close|announced acquisition|seller in announced|prior ownership|seller)\b/i.test(value);
}

function isProseDisclosure(value: string): boolean {
  return (
    value.length > 110 ||
    /\b(disclosed|acquired|owned through|holding|interest|stake|ownership|exact split|for clients|via its partnership|acquiring|remains|seller|prior)\b/i.test(
      value,
    )
  );
}

function isGenericVehicle(value: string): boolean {
  return /\b(funds? managed by|managed funds?|clients?|preferred equity|tax equity|direct stake|direct equity|co-investment|co-invest|consortium|pool|department|platform|strategy|account|sma|balance sheet|proprietary capital|managed vehicle|investment manager|control|jv|joint venture)\b/i.test(
    value,
  );
}

function looksLikeNamedFund(value: string): boolean {
  return (
    /\b(fund|funds|partners\s+[ivxlcdm]+|mip\s+[ivxlcdm]+|msip\s*[ivxlcdm]+|cip\s*[ivxlcdm]+|gif\s*[ivxlcdm]*|etif|dcif|sicav|plc|l\.p\.| lp\b|holdco|income fund|infrastructure trust|infrastructure investors\s+[ivxlcdm]+)\b/i.test(
      value,
    ) ||
    /\b(?:Infrastructure|Energy|Digital|Climate|Transition|Core|Infra|Power|Renewables|Credit|Value[- ]Add|Opportunistic|Growth|North American|Americas|Global|Sustainable Energies)\s+(?:[IVX]+|\d+)\b/i.test(
      value,
    )
  );
}

function fundEqualsOwnerFirm(fundName: string, ownerFirm: string): boolean {
  if (!fundName || !ownerFirm) return false;
  const fund = normalizeForCompare(fundName);
  const ownerTerms = aliasTerms(ownerFirm).map(normalizeForCompare).filter(Boolean);
  return !!fund && ownerTerms.some((term) => fund === term);
}

function isInFundList(value: string): boolean {
  const normalized = normalizeForCompare(value);
  if (EXACT_FUND_NAMES.has(value.trim().toLowerCase())) return true;
  if (NORMALIZED_FUND_NAMES.includes(normalized)) return true;
  if (normalized.length < 12) return false;
  return NORMALIZED_FUND_NAMES.some((fundName) => {
    if (fundName.length < 12) return false;
    return fundName.includes(normalized) || normalized.includes(fundName) || overlapScore(fundName, normalized) >= 0.9;
  });
}

function sourceText(source: PortCoSource): string {
  return `${source.label} ${source.evidenceLabel ?? ""} ${source.url} ${source.purpose ?? ""} ${source.type ?? ""}`;
}

function sourceRank(source: PortCoSource, owner: PortCoOwner, vehicle: string): number {
  const text = sourceText(source).toLowerCase();
  let score = 0;
  if (source.purpose === "OWNERSHIP_INVESTMENT") score += 80;
  if (source.purpose === "FINANCING_FILINGS") score += 50;
  if (source.purpose === "MILESTONE_EVENT") score += 45;
  if (source.purpose === "COMPANY_PROFILE") score += 25;
  if (source.type === "SEC_FILING") score += 20;
  if (source.type === "PRESS_RELEASE") score += 15;
  if (source.type === "WEBSITE") score += 5;

  for (const term of aliasTerms(owner.investmentFirm)) {
    for (const token of significantTokens(term)) {
      if (text.includes(token)) score += 5;
    }
  }
  for (const token of significantTokens(vehicle)) {
    if (text.includes(token)) score += 3;
  }
  return score;
}

function sourceTypeLabel(source: PortCoSource): string {
  if (source.type === "SEC_FILING") return "SEC/filing";
  if (source.type === "PRESS_RELEASE") return "press release";
  if (source.purpose === "OWNERSHIP_INVESTMENT") return "manager/company ownership source";
  if (source.purpose === "FINANCING_FILINGS") return "financing/filing source";
  if (source.purpose === "MILESTONE_EVENT") return "transaction source";
  if (source.purpose === "COMPANY_PROFILE") return "company/manager page";
  return "supporting source";
}

function supplementalSourceType(url: string, ownerFirm: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("sec.gov")) return "SEC/filing";
  if (lower.includes("businesswire") || lower.includes("prnewswire") || lower.includes("globenewswire")) return "press release";
  if (ownerFirm && overlapScore(url, ownerFirm) > 0.2) return "manager page";
  return "supplemental source";
}

function selectedEvidence(
  company: PortCo,
  owner: PortCoOwner,
  verifiedVehicle: string,
  supplementalDetail: ParsedOwnershipDetail | null,
): { urls: string[]; types: string[] } {
  const seedSources = (company.sources ?? [])
    .slice()
    .sort((a, b) => sourceRank(b, owner, verifiedVehicle || owner.ownershipVehicle || "") - sourceRank(a, owner, verifiedVehicle || owner.ownershipVehicle || ""))
    .slice(0, 3);

  const urls: string[] = [];
  const types: string[] = [];

  for (const source of seedSources) {
    if (!urls.includes(source.url)) urls.push(source.url);
    types.push(sourceTypeLabel(source));
  }

  for (const url of supplementalDetail?.profile.sources ?? []) {
    if (!urls.includes(url)) urls.push(url);
    types.push(supplementalSourceType(url, owner.investmentFirm));
    if (urls.length >= 5) break;
  }

  return {
    urls: urls.slice(0, 5),
    types: Array.from(new Set(types)).slice(0, 5),
  };
}

function classifyRow(
  company: PortCo,
  owner: PortCoOwner,
  supplementalDetail: ParsedOwnershipDetail | null,
  evidenceUrls: string[],
): Pick<AuditRow, "verified_fund_vehicle_result" | "result_status" | "confidence" | "proposed_seed_data_action" | "notes"> {
  const currentVehicle = owner.ownershipVehicle || "";
  const evidenceAvailable = evidenceUrls.length > 0;
  const candidate = supplementalDetail?.fund || currentVehicle;
  const hasSupplementalFund = !!supplementalDetail?.fund;
  const notes: string[] = [];

  if (supplementalDetail) {
    notes.push(`Matched supplemental ownership detail: ${supplementalDetail.raw}`);
  }

  if (!currentVehicle.trim()) {
    return {
      verified_fund_vehicle_result: "",
      result_status: "Needs user review",
      confidence: "Low",
      proposed_seed_data_action: "Manual source review required before changing seed data.",
      notes: appendNoEvidence(notes, evidenceAvailable, "Current ownershipVehicle is blank."),
    };
  }

  if (isPendingOrUnclear(currentVehicle)) {
    return {
      verified_fund_vehicle_result: candidate || currentVehicle,
      result_status: "Needs user review",
      confidence: "Low",
      proposed_seed_data_action: "Confirm current-owner status and transaction close before changing seed data.",
      notes: appendNoEvidence(notes, evidenceAvailable, "Current ownership trail appears pending, historical, or seller-related."),
    };
  }

  if (
    hasSupplementalFund &&
    (isNoFundDisclosure(candidate) || fundEqualsOwnerFirm(candidate, owner.investmentFirm)) &&
    (isNoFundDisclosure(currentVehicle) ||
      isGenericVehicle(currentVehicle) ||
      isProseDisclosure(currentVehicle) ||
      !looksLikeNamedFund(currentVehicle))
  ) {
    return {
      verified_fund_vehicle_result: "n.a.",
      result_status: "n.a.",
      confidence: evidenceAvailable ? "High" : "Medium",
      proposed_seed_data_action:
        currentVehicle.toLowerCase() === "n.a."
          ? "No seed-data action suggested."
          : 'Review replacing current ownershipVehicle with "n.a." if user approves the undisclosed-fund convention.',
      notes: appendNoEvidence(
        notes,
        evidenceAvailable,
        fundEqualsOwnerFirm(candidate, owner.investmentFirm)
          ? "Supplemental detail discloses only the owner/manager name, not a distinct fund."
          : "Supplemental detail states the fund was not publicly disclosed.",
      ),
    };
  }

  if (
    hasSupplementalFund &&
    (isNoFundDisclosure(candidate) || fundEqualsOwnerFirm(candidate, owner.investmentFirm)) &&
    looksLikeNamedFund(currentVehicle)
  ) {
    return {
      verified_fund_vehicle_result: currentVehicle,
      result_status: "Needs user review",
      confidence: "Low",
      proposed_seed_data_action: "Manual source review required before changing seed data.",
      notes: appendNoEvidence(
        notes,
        evidenceAvailable,
        "Supplemental detail is less specific than the current named vehicle, so the row is held for manual review instead of being normalized to n.a.",
      ),
    };
  }

  if (!hasSupplementalFund && isNoFundDisclosure(currentVehicle)) {
    return {
      verified_fund_vehicle_result: "n.a.",
      result_status: "n.a.",
      confidence: evidenceAvailable ? "High" : "Medium",
      proposed_seed_data_action: currentVehicle.toLowerCase() === "n.a." ? "No seed-data action suggested." : 'Review normalizing ownershipVehicle to "n.a.".',
      notes: appendNoEvidence(notes, evidenceAvailable, "Current ownershipVehicle already indicates the fund was not disclosed."),
    };
  }

  if (!hasSupplementalFund && isProseDisclosure(currentVehicle) && /not publicly disclosed|not disclosed/i.test(`${currentVehicle} ${company.description}`)) {
    return {
      verified_fund_vehicle_result: "n.a.",
      result_status: "n.a.",
      confidence: evidenceAvailable ? "Medium" : "Low",
      proposed_seed_data_action: 'Review replacing prose ownershipVehicle with "n.a." after user approval.',
      notes: appendNoEvidence(notes, evidenceAvailable, "Current field is ownership prose and describes non-disclosure rather than a named fund."),
    };
  }

  if (isGenericVehicle(candidate) && !looksLikeNamedFund(candidate)) {
    return {
      verified_fund_vehicle_result: candidate,
      result_status: "Disclosed but generic",
      confidence: evidenceAvailable ? "Medium" : "Low",
      proposed_seed_data_action: "Keep generic disclosure only if preferred; otherwise review whether n.a. is cleaner.",
      notes: appendNoEvidence(notes, evidenceAvailable, "Disclosure identifies a generic vehicle, account, client pool, or transaction structure rather than an exact fund."),
    };
  }

  if (isInFundList(candidate)) {
    return {
      verified_fund_vehicle_result: candidate,
      result_status: "Verified fund",
      confidence: supplementalDetail || evidenceAvailable ? "High" : "Medium",
      proposed_seed_data_action:
        normalizeForCompare(candidate) === normalizeForCompare(currentVehicle)
          ? "No seed-data action suggested."
          : `Review replacing current ownershipVehicle with "${candidate}".`,
      notes: appendNoEvidence(notes, evidenceAvailable, "Verified fund matches an existing fund-list entry."),
    };
  }

  if (hasSupplementalFund) {
    return {
      verified_fund_vehicle_result: candidate,
      result_status: "Verified fund - missing from funds list",
      confidence: evidenceAvailable ? "High" : "Medium",
      proposed_seed_data_action: `Review adding or aliasing "${candidate}" in fund data before updating ownershipVehicle.`,
      notes: appendNoEvidence(notes, evidenceAvailable, "Supplemental ownership detail discloses a distinct fund/vehicle that does not match funds.ts."),
    };
  }

  if (looksLikeNamedFund(candidate)) {
    return {
      verified_fund_vehicle_result: candidate,
      result_status: "Verified fund - missing from funds list",
      confidence: supplementalDetail && evidenceAvailable ? "High" : evidenceAvailable ? "Medium" : "Low",
      proposed_seed_data_action: `Review adding or aliasing "${candidate}" in fund data before updating ownershipVehicle.`,
      notes: appendNoEvidence(notes, evidenceAvailable, "Vehicle appears to be a named fund or listed vehicle but does not match funds.ts."),
    };
  }

  if (isProseDisclosure(candidate)) {
    return {
      verified_fund_vehicle_result: "n.a.",
      result_status: "n.a.",
      confidence: evidenceAvailable ? "Medium" : "Low",
      proposed_seed_data_action: 'Review replacing prose ownershipVehicle with "n.a." after user approval.',
      notes: appendNoEvidence(notes, evidenceAvailable, "Current field is ownership/stake prose, not a disclosed fund vehicle."),
    };
  }

  return {
    verified_fund_vehicle_result: candidate,
    result_status: "Needs user review",
    confidence: "Low",
    proposed_seed_data_action: "Manual source review required before changing seed data.",
    notes: appendNoEvidence(notes, evidenceAvailable, "No exact fund disclosure could be classified safely by the audit rules."),
  };
}

function appendNoEvidence(notes: string[], evidenceAvailable: boolean, note: string): string {
  const allNotes = [...notes, note];
  if (!evidenceAvailable) allNotes.push("No source URL is attached to this audit row.");
  return allNotes.join(" ");
}

function csvEscape(value: string | number | undefined): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows: AuditRow[]): string {
  const headers = [
    "company_name",
    "country",
    "current_owner_investment_firm",
    "current_ownership_vehicle",
    "investment_year",
    "verified_fund_vehicle_result",
    "result_status",
    "evidence_urls",
    "evidence_type",
    "confidence",
    "proposed_seed_data_action",
    "notes",
  ] satisfies (keyof AuditRow)[];

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
    "",
  ].join("\n");
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
  const header = rows[0];
  const body = rows.slice(1);
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function summaryMarkdown(auditRows: AuditRow[], workingRows: ActiveOwnerRow[]): string {
  const statusCounts = countBy(auditRows.map((row) => row.result_status));
  const confidenceCounts = countBy(auditRows.map((row) => row.confidence));
  const evidenceRows = auditRows.filter((row) => row.evidence_urls.length > 0).length;
  const noEvidenceRows = auditRows.length - evidenceRows;
  const uniqueFirms = new Set(auditRows.map((row) => row.current_owner_investment_firm)).size;
  const multiOwnerCompanies = new Set(
    companies
      .filter((company) => (company.owners ?? []).filter((owner) => owner.status === "Active").length > 1)
      .map((company) => `${company.name}|${company.country}`),
  ).size;

  const needsByFirm = Array.from(
    auditRows
      .filter((row) => row.result_status === "Needs user review")
      .reduce((map, row) => map.set(row.current_owner_investment_firm, (map.get(row.current_owner_investment_firm) ?? 0) + 1), new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const actionCounts = countBy(
    auditRows.map((row) => {
      if (row.proposed_seed_data_action.startsWith("No seed-data action")) return "No action";
      if (row.proposed_seed_data_action.startsWith("Review adding")) return "Review fund-list add/alias";
      if (row.proposed_seed_data_action.startsWith("Review replacing")) return "Review ownershipVehicle replacement";
      if (row.proposed_seed_data_action.startsWith("Review normalizing")) return "Review n.a. normalization";
      if (row.proposed_seed_data_action.startsWith("Keep generic")) return "Review generic disclosure";
      return "Manual review";
    }),
  );

  return `# Current Owner Fund Verification Audit - ${AUDIT_DATE}

## Scope And Reconciliation

This audit reviews active/current ownership periods from \`prisma/seed-data/companies.ts\`. It does not edit seed data, Prisma schema, migrations, UI code, or live database records.

| Check | Count |
| --- | ---: |
| Portfolio companies in seed data | ${companies.length} |
| Active owner records extracted | ${workingRows.length} |
| CSV audit rows produced | ${auditRows.length} |
| Unique current owners / investment firms | ${uniqueFirms} |
| Companies with multiple active owners | ${multiOwnerCompanies} |
| Rows with at least one evidence URL | ${evidenceRows} |
| Rows without evidence URL | ${noEvidenceRows} |

## Result Counts

${markdownTable([
  ["Result status", "Rows"],
  ...STATUS_ORDER.map((status) => [status, String(statusCounts[status] ?? 0)]),
])}

## Confidence Counts

${markdownTable([
  ["Confidence", "Rows"],
  ["High", String(confidenceCounts.High ?? 0)],
  ["Medium", String(confidenceCounts.Medium ?? 0)],
  ["Low", String(confidenceCounts.Low ?? 0)],
])}

## Proposed Action Buckets

${markdownTable([
  ["Action bucket", "Rows"],
  ...Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => [label, String(count)]),
])}

## Needs User Review Concentration

${markdownTable([
  ["Investment firm", "Rows"],
  ...needsByFirm.map(([firm, count]) => [firm, String(count)]),
])}

## Method Notes

- The working set is one row per active \`owners[]\` entry, with top-level owner fields used only as a fallback.
- Evidence URLs are drawn from company seed sources plus the matched local supplemental web-reference file \`portfolio_companies_active_web.json\` when it contains a matching company/owner detail.
- \`n.a.\` is used only when the matched ownership detail or current field indicates that no distinct fund was publicly disclosed, or when the field is ownership prose rather than a named vehicle.
- \`Verified fund - missing from funds list\` means the audit found a named fund/vehicle result that does not currently match \`prisma/seed-data/funds.ts\`.
- \`Needs user review\` rows were intentionally kept separate instead of being converted to \`n.a.\` when the source trail, owner match, or current-owner status was not strong enough.

## Recommended Follow-Up Batches

1. Review \`Needs user review\` rows by investment firm, starting with the concentration table above.
2. Review \`Verified fund - missing from funds list\` rows for fund-list additions or aliases so strategy badges can appear where appropriate.
3. Review \`Disclosed but generic\` rows and decide whether generic account/client-pool language should remain visible or become \`n.a.\`.
`;
}

function main() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const supplementalByCompany = loadSupplementalProfiles();
  const workingRows = activeOwnerRows();

  const auditRows: AuditRow[] = workingRows.map(({ company, owner }) => {
    const profiles = supplementalByCompany.get(normalizeCompanyName(company.name)) ?? [];
    const supplementalDetail = selectSupplementalDetail(company, owner, profiles);
    const provisionalVehicle = supplementalDetail?.fund || owner.ownershipVehicle || "";
    const evidence = selectedEvidence(company, owner, provisionalVehicle, supplementalDetail);
    const classification = classifyRow(company, owner, supplementalDetail, evidence.urls);

    return {
      company_name: company.name,
      country: company.country,
      current_owner_investment_firm: owner.investmentFirm,
      current_ownership_vehicle: owner.ownershipVehicle || "",
      investment_year: owner.investmentYear ? String(owner.investmentYear) : "",
      verified_fund_vehicle_result: classification.verified_fund_vehicle_result,
      result_status: classification.result_status,
      evidence_urls: evidence.urls.join("; "),
      evidence_type: evidence.types.join("; "),
      confidence: classification.confidence,
      proposed_seed_data_action: classification.proposed_seed_data_action,
      notes: classification.notes,
    };
  });

  fs.writeFileSync(CSV_PATH, toCsv(auditRows));
  fs.writeFileSync(SUMMARY_PATH, summaryMarkdown(auditRows, workingRows));

  const statusCounts = countBy(auditRows.map((row) => row.result_status));
  console.log(`Wrote ${path.relative(ROOT, CSV_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, SUMMARY_PATH)}`);
  console.log(JSON.stringify({ activeOwnerRows: workingRows.length, csvRows: auditRows.length, statusCounts }, null, 2));
}

main();
