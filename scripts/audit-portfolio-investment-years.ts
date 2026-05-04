import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { companies } from "../prisma/seed-data/companies.ts";
import type { PortCo, PortCoMilestone, PortCoOwner } from "../prisma/seed-data/portco-types.ts";

const OUT_DIR = path.join(process.cwd(), "audits", "portfolio-investment-years");
const COMPANIES_FILE = path.join(process.cwd(), "prisma", "seed-data", "companies.ts");
const RUN_AT = new Date().toISOString();

const ACTION_RE =
  /\b(acquir\w*|invest\w*|financ\w*|formed|launched|created|completed|closed|signed|agreement|stake|partnership|joint venture|committed|commitment|equity|sale|sold|purchase|minority|majority|take-private)\b/i;

const CLOSE_RE =
  /\b(closed|closing|completed|completion|financial close|commercial close|reached financial close|achieved financial close|became the disclosed owner|acquired|invested)\b/i;

const ANNOUNCEMENT_RE =
  /\b(announced|agreed|agreement|signed|selected|expected to close|would acquire|would buy|would sell|to acquire|to buy|to sell|committed|commitment|launched|formed|created)\b/i;

const WEAK_ATTRIBUTION_RE =
  /\b(portfolio materials|continued to (identify|list|describe)|current page|stated that|described .* as|as of|reported|year of investment|not publicly disclosed)\b/i;

const FIRM_STOPWORDS = new Set([
  "asset",
  "assets",
  "acs",
  "acquire",
  "acquired",
  "acquiring",
  "acquisition",
  "affiliate",
  "aggregator",
  "alongside",
  "america",
  "and",
  "backed",
  "capital",
  "company",
  "companies",
  "compass",
  "contract",
  "contracted",
  "contracts",
  "business",
  "branded",
  "center",
  "centers",
  "data",
  "energy",
  "fiber",
  "fund",
  "funds",
  "fluor",
  "global",
  "group",
  "holding",
  "holdings",
  "acciona",
  "consortium",
  "desjardins",
  "direct",
  "disclosed",
  "equity",
  "interest",
  "infra",
  "infrastructure",
  "invest",
  "invested",
  "investing",
  "investment",
  "investments",
  "investor",
  "investors",
  "jv",
  "led",
  "listed",
  "llc",
  "long",
  "lp",
  "last",
  "management",
  "manager",
  "managed",
  "midstream",
  "memphis",
  "majority",
  "minority",
  "not",
  "mstreet",
  "network",
  "networks",
  "now",
  "partners",
  "partner",
  "partnered",
  "partnership",
  "platform",
  "portfolio",
  "ports",
  "private",
  "publicly",
  "puget",
  "purchaser",
  "rai",
  "real",
  "royal",
  "supply",
  "risk",
  "sound",
  "stake",
  "the",
  "term",
  "transaction",
  "undisclosed",
  "via",
  "water",
  "with",
]);

const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

type Priority = "critical" | "high" | "medium" | "low" | "none";

interface AuditRow {
  auditId: string;
  sourceLine: number | "";
  company: string;
  country: string;
  ownerIndex: number;
  investmentFirm: string;
  ownershipVehicle: string;
  ownerInvestmentYear: number | "";
  topLevelInvestmentYear: number | "";
  exitYear: number | "";
  status: string;
  dateBasis: string;
  priority: Priority;
  flags: string;
  evidenceMilestones: string;
  earlierSignals: string;
  sourceUrls: string;
  proposedYear: string;
  evidenceUrl: string;
  reviewerNotes: string;
}

function ownersFor(company: PortCo): PortCoOwner[] {
  if (company.owners?.length) return company.owners;
  return [
    {
      investmentFirm: company.investmentFirm,
      ownershipVehicle: company.ownershipVehicle,
      investmentYear: company.investmentYear,
      status: company.status,
    },
  ];
}

function yearsIn(text: string): number[] {
  return Array.from(text.matchAll(/\b(19\d{2}|20\d{2})\b/g), (m) => Number(m[1]));
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function firmTokens(firm: string): string[] {
  const rawTokens = firm
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => (token.length >= 3 || /[a-z]\d|\d[a-z]/.test(token)) && !/^\d+$/.test(token));
  const tokens = rawTokens.filter((token) => !FIRM_STOPWORDS.has(token));
  if (!tokens.length && rawTokens.length > 1) {
    const acronym = rawTokens.map((token) => token[0]).join("");
    if (acronym.length >= 3 && !FIRM_STOPWORDS.has(acronym)) tokens.push(acronym);
  }
  if (!tokens.length) {
    const compactFirm = firm.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (compactFirm.length >= 3) tokens.push(compactFirm);
  }
  return unique(tokens);
}

function milestoneDateYears(milestone: PortCoMilestone): number[] {
  return yearsIn(milestone.date);
}

function milestoneAllYears(milestone: PortCoMilestone): number[] {
  return unique(yearsIn(`${milestone.date} ${milestone.event}`));
}

function milestoneMentionsFirm(milestone: PortCoMilestone, firm: string): boolean {
  const haystack = milestone.event.toLowerCase();
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, "");
  return firmTokens(firm).some((token) => {
    const compactToken = token.replace(/[^a-z0-9]+/g, "");
    return haystack.includes(token) || (compactToken.length >= 3 && compactHaystack.includes(compactToken));
  });
}

function milestoneMentionsOwner(milestone: PortCoMilestone, owner: PortCoOwner): boolean {
  const haystack = milestone.event.toLowerCase();
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, "");
  const ownerTokens = unique([...firmTokens(owner.investmentFirm), ...firmTokens(owner.ownershipVehicle)]);
  return ownerTokens.some((token) => {
    const compactToken = token.replace(/[^a-z0-9]+/g, "");
    return haystack.includes(token) || (compactToken.length >= 3 && compactHaystack.includes(compactToken));
  });
}

function isTransactionalMilestone(milestone: PortCoMilestone): boolean {
  return milestone.category === "Financing" || milestone.category === "Acquisition" || ACTION_RE.test(milestone.event);
}

function isCloseMilestone(milestone: PortCoMilestone): boolean {
  if (!isTransactionalMilestone(milestone)) return false;
  const event = milestone.event.toLowerCase();
  if (/\b(announced|agreed|agreement|signed|selected|expected to close|would acquire|would buy|would sell|to acquire|to buy|to sell)\b/i.test(event)) {
    return /\b(closed|closing|completed|completion|financial close|commercial close|reached financial close|achieved financial close)\b/i.test(event);
  }
  return CLOSE_RE.test(event);
}

function isAnnouncementMilestone(milestone: PortCoMilestone): boolean {
  if (!isTransactionalMilestone(milestone)) return false;
  return ANNOUNCEMENT_RE.test(milestone.event);
}

function milestoneToText(milestone: PortCoMilestone): string {
  return `${milestone.date} | ${milestone.category} | ${milestone.event}`;
}

function isFutureMilestone(milestone: PortCoMilestone): boolean {
  const year = milestoneDateYears(milestone)[0];
  if (!year) return false;
  if (year >= 2027) return true;

  // Current audit date is intentionally static for this project run.
  // It avoids machine-clock drift changing the flag set.
  const currentYear = 2026;
  const currentMonth = 5;
  if (year < currentYear) return false;

  const monthMatch = milestone.date.toLowerCase().match(/\b([a-z]+)\b/);
  if (!monthMatch) return false;
  const month = MONTH_INDEX[monthMatch[1]];
  return Boolean(month && month > currentMonth);
}

function hasVagueRangeDate(milestone: PortCoMilestone): boolean {
  return /\b(19\d{2}|20\d{2})\s*[-/]\s*(19\d{2}|20\d{2})\b/.test(milestone.date);
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: AuditRow[]): string {
  const headers: (keyof AuditRow)[] = [
    "auditId",
    "sourceLine",
    "company",
    "country",
    "ownerIndex",
    "investmentFirm",
    "ownershipVehicle",
    "ownerInvestmentYear",
    "topLevelInvestmentYear",
    "exitYear",
    "status",
    "dateBasis",
    "priority",
    "flags",
    "evidenceMilestones",
    "earlierSignals",
    "sourceUrls",
    "proposedYear",
    "evidenceUrl",
    "reviewerNotes",
  ];
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function buildSourceLineIndex(): Map<string, number> {
  const source = readFileSync(COMPANIES_FILE, "utf8");
  const lines = source.split("\n");
  const byName = new Map<string, number>();
  for (const [index, line] of lines.entries()) {
    const match = line.match(/^\s+name: "(.+)",$/);
    if (match && !byName.has(match[1])) {
      byName.set(match[1], index + 1);
    }
  }
  return byName;
}

function priorityFor(flags: Set<string>): Priority {
  if (flags.has("missing_investment_year") || flags.has("top_level_primary_owner_year_mismatch")) return "critical";
  if (
    flags.has("earlier_firm_investment_signal") ||
    flags.has("close_date_after_stored_announcement_year") ||
    flags.has("no_same_year_milestone")
  ) {
    return "high";
  }
  if (
    flags.has("no_transactional_same_year_milestone") ||
    flags.has("firm_not_named_in_same_year_milestone") ||
    flags.has("future_dated_milestone") ||
    flags.has("vague_range_milestone_date")
  ) {
    return "medium";
  }
  if (flags.has("weak_same_year_attribution") || flags.has("no_sources")) return "low";
  return "none";
}

function auditCompany(company: PortCo, companyIndex: number, sourceLine: number | ""): AuditRow[] {
  const owners = ownersFor(company);
  const milestones = company.milestones ?? [];
  const sourceUrls = (company.sources ?? []).map((source) => source.url).join(" | ");
  const futureMilestones = milestones.filter(isFutureMilestone);
  const vagueRangeMilestones = milestones.filter(hasVagueRangeDate);

  return owners.map((owner, ownerIndex) => {
    const flags = new Set<string>();
    const ownerYear = owner.investmentYear;

    if (!ownerYear) {
      flags.add("missing_investment_year");
    }

    if (ownerIndex === 0 && company.investmentYear !== owner.investmentYear) {
      flags.add("top_level_primary_owner_year_mismatch");
    }

    if (ownerIndex > 0 && company.investmentYear !== owner.investmentYear) {
      flags.add("secondary_owner_year_differs_from_display_year");
    }

    if (!company.sources?.length) {
      flags.add("no_sources");
    }

    if (futureMilestones.length) {
      flags.add("future_dated_milestone");
    }

    if (vagueRangeMilestones.length) {
      flags.add("vague_range_milestone_date");
    }

    let evidenceMilestones: PortCoMilestone[] = [];
    let earlierSignals: PortCoMilestone[] = [];
    let dateBasis = "";

    if (ownerYear) {
      const sameYearMilestones = milestones.filter((milestone) => {
        const dateYears = milestoneDateYears(milestone);
        const fallbackYears = milestoneAllYears(milestone);
        return dateYears.includes(ownerYear) || (!dateYears.length && fallbackYears.includes(ownerYear));
      });

      evidenceMilestones = sameYearMilestones.filter(isTransactionalMilestone);
      const sameYearCloseMilestones = evidenceMilestones.filter(isCloseMilestone);
      const sameYearAnnouncementMilestones = evidenceMilestones.filter(isAnnouncementMilestone);

      if (sameYearCloseMilestones.some((milestone) => milestoneMentionsOwner(milestone, owner))) {
        dateBasis = "close";
      } else if (sameYearCloseMilestones.length) {
        dateBasis = "close_unattributed";
      } else if (sameYearAnnouncementMilestones.some((milestone) => milestoneMentionsOwner(milestone, owner))) {
        dateBasis = "announced";
      } else if (sameYearAnnouncementMilestones.length) {
        dateBasis = "announced_unattributed";
      } else if (evidenceMilestones.length) {
        dateBasis = "transactional_unspecified";
      }

      if (!sameYearMilestones.length) {
        flags.add("no_same_year_milestone");
      } else if (!evidenceMilestones.length) {
        flags.add("no_transactional_same_year_milestone");
      }

      if (evidenceMilestones.length && !evidenceMilestones.some((milestone) => milestoneMentionsFirm(milestone, owner.investmentFirm))) {
        flags.add("firm_not_named_in_same_year_milestone");
      }

      if (
        evidenceMilestones.length &&
        evidenceMilestones.every((milestone) => WEAK_ATTRIBUTION_RE.test(milestone.event))
      ) {
        flags.add("weak_same_year_attribution");
      }

      earlierSignals = milestones.filter((milestone) => {
        const earliestYear = Math.min(...milestoneDateYears(milestone));
        if (!Number.isFinite(earliestYear) || earliestYear >= ownerYear) return false;
        if (!isTransactionalMilestone(milestone) || !milestoneMentionsOwner(milestone, owner)) return false;

        // Audit standard: close/completion/financial-close year wins.
        // Earlier signing or announcement is not a defect when the stored
        // year is supported by later close evidence for this owner.
        if (
          isAnnouncementMilestone(milestone) &&
          !isCloseMilestone(milestone) &&
          sameYearCloseMilestones.some((candidate) => milestoneMentionsOwner(candidate, owner))
        ) {
          return false;
        }

        return true;
      });

      if (earlierSignals.length) {
        flags.add("earlier_firm_investment_signal");
      }

      const laterCloseMilestones = milestones.filter((milestone) => {
        const years = milestoneDateYears(milestone);
        if (!years.some((year) => year > ownerYear)) return false;
        return isCloseMilestone(milestone) && milestoneMentionsOwner(milestone, owner);
      });

      if (sameYearAnnouncementMilestones.length && !sameYearCloseMilestones.length && laterCloseMilestones.length) {
        flags.add("close_date_after_stored_announcement_year");
      }
    }

    const priority = priorityFor(flags);

    return {
      auditId: `${slug(company.name)}__owner-${ownerIndex + 1}__${slug(owner.investmentFirm)}`,
      sourceLine,
      company: company.name,
      country: company.country,
      ownerIndex: ownerIndex + 1,
      investmentFirm: owner.investmentFirm,
      ownershipVehicle: owner.ownershipVehicle,
      ownerInvestmentYear: owner.investmentYear ?? "",
      topLevelInvestmentYear: company.investmentYear ?? "",
      exitYear: owner.exitYear ?? "",
      status: owner.status,
      dateBasis,
      priority,
      flags: Array.from(flags).sort().join(" | "),
      evidenceMilestones: evidenceMilestones.map(milestoneToText).join(" || "),
      earlierSignals: earlierSignals.map(milestoneToText).join(" || "),
      sourceUrls,
      proposedYear: "",
      evidenceUrl: "",
      reviewerNotes: "",
    };
  });
}

function summarize(rows: AuditRow[]): string {
  const byPriority = new Map<Priority, number>();
  const byFlag = new Map<string, number>();
  const byFirmCriticalHigh = new Map<string, number>();
  const years = new Map<string, number>();

  for (const row of rows) {
    byPriority.set(row.priority, (byPriority.get(row.priority) ?? 0) + 1);
    const year = row.ownerInvestmentYear ? String(row.ownerInvestmentYear) : "missing";
    years.set(year, (years.get(year) ?? 0) + 1);
    for (const flag of row.flags.split(" | ").filter(Boolean)) {
      byFlag.set(flag, (byFlag.get(flag) ?? 0) + 1);
    }
    if (row.priority === "critical" || row.priority === "high") {
      byFirmCriticalHigh.set(row.investmentFirm, (byFirmCriticalHigh.get(row.investmentFirm) ?? 0) + 1);
    }
  }

  const priorityOrder: Priority[] = ["critical", "high", "medium", "low", "none"];
  const flaggedRows = rows.filter((row) => row.priority !== "none");
  const criticalHigh = rows.filter((row) => row.priority === "critical" || row.priority === "high");

  const topFlags = Array.from(byFlag.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20);

  const topFirms = Array.from(byFirmCriticalHigh.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 25);

  const yearDistribution = Array.from(years.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => `- ${year}: ${count}`)
    .join("\n");

  const urgentTable = criticalHigh
    .slice(0, 80)
    .map(
      (row) =>
        `| ${row.priority} | ${row.sourceLine || ""} | ${row.investmentFirm.replace(/\|/g, "/")} | ${row.company.replace(/\|/g, "/")} | ${row.ownerInvestmentYear || ""} | ${row.flags.replace(/\|/g, ",")} |`,
    )
    .join("\n");

  return `# Portfolio Investment-Year Audit

Run at: ${RUN_AT}

## Scope

- Company records: ${companies.length}
- Owner-company rows: ${rows.length}
- Flagged rows: ${flaggedRows.length}

## Date Standard

- Use the public close/completion/financial-close year when it exists.
- Use the public announcement/signing year only when no close evidence is available.
- Earlier announcement milestones are suppressed as issue signals when the stored year is backed by close evidence for the same owner.

## Priority Summary

${priorityOrder.map((priority) => `- ${priority}: ${byPriority.get(priority) ?? 0}`).join("\n")}

## Top Flags

${topFlags.map(([flag, count]) => `- ${flag}: ${count}`).join("\n") || "- None"}

## Firms With Most Critical/High Rows

${topFirms.map(([firm, count]) => `- ${firm}: ${count}`).join("\n") || "- None"}

## Year Distribution

${yearDistribution}

## Critical/High Review Queue

| Priority | Line | Firm | Company | Current Year | Flags |
|---|---:|---|---|---:|---|
${urgentTable || "| none |  |  |  |  |  |"}

## Files

- master.csv: every owner-company row
- flagged.csv: only rows with at least one review flag
- findings.json: machine-readable rows for follow-up sourcing and correction work
`;
}

mkdirSync(OUT_DIR, { recursive: true });

const sourceLineIndex = buildSourceLineIndex();
const rows = companies.flatMap((company, companyIndex) =>
  auditCompany(company, companyIndex, sourceLineIndex.get(company.name) ?? ""),
);
const flaggedRows = rows.filter((row) => row.priority !== "none");

writeFileSync(path.join(OUT_DIR, "master.csv"), toCsv(rows) + "\n");
writeFileSync(path.join(OUT_DIR, "flagged.csv"), toCsv(flaggedRows) + "\n");
writeFileSync(path.join(OUT_DIR, "findings.json"), JSON.stringify({ runAt: RUN_AT, rows }, null, 2) + "\n");
writeFileSync(path.join(OUT_DIR, "summary.md"), summarize(rows));

console.log(`Portfolio investment-year audit complete.`);
console.log(`Rows: ${rows.length}`);
console.log(`Flagged: ${flaggedRows.length}`);
console.log(`Output: ${OUT_DIR}`);
