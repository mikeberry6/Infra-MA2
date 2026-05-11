import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { companies } from "../prisma/seed-data/companies.ts";
import type { PortCo, PortCoMilestone, PortCoOwner, PortCoSource } from "../prisma/seed-data/portco-types.ts";
import { inferCitationPurpose } from "../src/lib/source-utils.ts";

const OUT_DIR = path.join(process.cwd(), "audits", "portfolio-milestones");
const COMPANIES_FILE = path.join(process.cwd(), "prisma", "seed-data", "companies.ts");
const RUN_AT = new Date().toISOString();
const PACKET_SIZE = 30;

type Priority = "critical" | "high" | "medium" | "low" | "none";

interface NearDuplicate {
  first: string;
  second: string;
  reason: string;
}

interface RecategorizationCandidate {
  milestone: string;
  suggestedCategory: string;
}

interface CompanyAuditRow {
  auditId: string;
  sourceLine: number | "";
  company: string;
  country: string;
  investmentFirm: string;
  sector: string;
  status: string;
  ownerCount: number;
  milestoneCount: number;
  sourceCount: number;
  proposedTargetCount: string;
  priority: Priority;
  score: number;
  flags: string;
  malformedDates: string;
  exactDuplicates: string;
  nearDuplicates: string;
  lowValueMilestones: string;
  recategoryCandidates: string;
  missingEntryOwners: string;
  missingExitOwners: string;
  sourceCoverage: string;
  sourceUrls: string;
  reviewerDecision: string;
  reviewerNotes: string;
}

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

const MONTHS =
  "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";

const ALLOWED_DATE_RE = new RegExp(
  `^(?:\\d{4}|${MONTHS}\\s+\\d{4}|${MONTHS}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
);

const TRANSACTIONAL_EVENT_RE =
  /\b(acquir\w*|invest\w*|financ\w*|funding|capital raise|equity raise|formed|launched|created|completed|closed|signed|agreement|stake|sale|sold|divest\w*|ipo|public offering|joint venture|merger|merged)\b/i;

const LOW_VALUE_EVENT_RE =
  /\b(not publicly disclosed|continued to (identify|list|describe|operate)|continued operating|remained active|remained an active|current page|as of public|public company materials continued|company materials continued|portfolio materials continued|no public|not disclosed in reviewed)\b/i;

const CORPORATE_SUFFIX_RE =
  /\b(asset management|investment management|capital partners|capital management|capital|management|partners|investors|infrastructure|advisors|llc|lp|inc|ltd|plc|holdings|group|funds?)\b/gi;

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

function milestoneToText(milestone: PortCoMilestone): string {
  return `${milestone.date} | ${milestone.category} | ${milestone.event}`;
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: CompanyAuditRow[]): string {
  const headers: (keyof CompanyAuditRow)[] = [
    "auditId",
    "sourceLine",
    "company",
    "country",
    "investmentFirm",
    "sector",
    "status",
    "ownerCount",
    "milestoneCount",
    "sourceCount",
    "proposedTargetCount",
    "priority",
    "score",
    "flags",
    "malformedDates",
    "exactDuplicates",
    "nearDuplicates",
    "lowValueMilestones",
    "recategoryCandidates",
    "missingEntryOwners",
    "missingExitOwners",
    "sourceCoverage",
    "sourceUrls",
    "reviewerDecision",
    "reviewerNotes",
  ];
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
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

function normalizeEvent(event: string): string {
  return event
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|and|or|of|to|from|for|with|by|in|on|as|its|it|was|were|is|are)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function eventTokens(event: string): Set<string> {
  return new Set(
    normalizeEvent(event)
      .split(/\s+/)
      .filter((token) => token.length >= 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

function yearsIn(text: string): number[] {
  return Array.from(text.matchAll(/\b(19\d{2}|20\d{2})\b/g), (match) => Number(match[1]));
}

function milestoneDateYears(milestone: PortCoMilestone): number[] {
  return yearsIn(milestone.date);
}

function normalizeFirm(firm: string): string {
  return firm
    .toLowerCase()
    .replace(CORPORATE_SUFFIX_RE, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ownerTokens(owner: PortCoOwner): string[] {
  const tokens = new Set<string>();
  for (const value of [owner.investmentFirm, owner.ownershipVehicle]) {
    for (const token of normalizeFirm(value || "").split(/\s+/)) {
      if (token.length >= 3) tokens.add(token);
    }
  }
  return Array.from(tokens);
}

function milestoneMentionsOwner(milestone: PortCoMilestone, owner: PortCoOwner): boolean {
  const haystack = normalizeEvent(milestone.event);
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, "");
  return ownerTokens(owner).some((token) => {
    const compactToken = token.replace(/[^a-z0-9]+/g, "");
    return haystack.includes(token) || (compactToken.length >= 3 && compactHaystack.includes(compactToken));
  });
}

function hasEntryMilestone(owner: PortCoOwner, milestones: PortCoMilestone[]): boolean {
  if (!owner.investmentYear) return true;
  return milestones.some((milestone) => {
    if (!milestoneDateYears(milestone).includes(owner.investmentYear!)) return false;
    return milestone.category === "Financing" || milestone.category === "Acquisition" || milestoneMentionsOwner(milestone, owner);
  });
}

function hasExitMilestone(owner: PortCoOwner, milestones: PortCoMilestone[]): boolean {
  if (!owner.exitYear) return true;
  return milestones.some((milestone) => {
    if (!milestoneDateYears(milestone).includes(owner.exitYear!)) return false;
    return milestone.category === "Divestiture" || milestoneMentionsOwner(milestone, owner);
  });
}

function findExactDuplicates(milestones: PortCoMilestone[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const milestone of milestones) {
    const key = `${milestone.date}|${milestone.event}`.toLowerCase();
    if (seen.has(key)) duplicates.push(milestoneToText(milestone));
    seen.add(key);
  }
  return duplicates;
}

function findNearDuplicates(milestones: PortCoMilestone[]): NearDuplicate[] {
  const results: NearDuplicate[] = [];
  for (let i = 0; i < milestones.length; i++) {
    for (let j = i + 1; j < milestones.length; j++) {
      const first = milestones[i];
      const second = milestones[j];
      const firstNorm = normalizeEvent(first.event);
      const secondNorm = normalizeEvent(second.event);
      const sameYear = milestoneDateYears(first).some((year) => milestoneDateYears(second).includes(year));
      const tokenScore = jaccard(eventTokens(first.event), eventTokens(second.event));
      const sameEvent = firstNorm.length >= 18 && firstNorm === secondNorm;
      const nestedEvent =
        Math.min(firstNorm.length, secondNorm.length) >= 45 &&
        (firstNorm.includes(secondNorm) || secondNorm.includes(firstNorm));

      if (sameEvent || nestedEvent || (sameYear && tokenScore >= 0.72 && !isDistinctFollowOnPair(first, second))) {
        results.push({
          first: milestoneToText(first),
          second: milestoneToText(second),
          reason: sameEvent ? "same normalized event" : nestedEvent ? "nested event text" : `same-year token overlap ${tokenScore.toFixed(2)}`,
        });
      }
    }
  }
  return results;
}

function isDistinctFollowOnPair(first: PortCoMilestone, second: PortCoMilestone): boolean {
  const text = `${first.event} ${second.event}`.toLowerCase();
  if (/\b(follow-on|additional|second|subsequent)\b/.test(text) && /\b(initial|first)\b/.test(text)) return true;
  if (/\b(announced|agreement|agreed)\b/.test(text) && /\b(closed|closing|completed|completion)\b/.test(text)) return true;
  return false;
}

function suggestedCategory(milestone: PortCoMilestone): string | null {
  if (milestone.category !== "Other") return null;
  const event = milestone.event.toLowerCase();
  if (/\bidentifies\b.*\bactive\b.*\bportfolio (company|investment)\b/.test(event)) return null;
  if (/\b(founded|was founded|established)\b/.test(event)) return "Founding";
  if (/\b(ipo|initial public offering|publicly listed|began trading)\b/.test(event)) return "IPO";
  if (/\b(divest\w*|sale|sold|sell|exit)\b/.test(event)) return "Divestiture";
  if (/\b(acquir\w*|purchase|purchased|bought|stake|take-private)\b/.test(event)) return "Acquisition";
  if (/\b(financ\w*|funding|capital raise|equity raise|investment|invested|commitment|financial close)\b/.test(event)) return "Financing";
  if (/\b(appointed|joined as|chief|ceo|cfo|coo|president)\b/.test(event)) return "Management";
  if (/\b(expand\w*|opened|entered service|commercial operation|commissioned|cod|capacity|portfolio grew|connected to the grid)\b/.test(event)) return "Expansion";
  return null;
}

function findRecategorizationCandidates(milestones: PortCoMilestone[]): RecategorizationCandidate[] {
  return milestones.flatMap((milestone) => {
    const suggested = suggestedCategory(milestone);
    return suggested ? [{ milestone: milestoneToText(milestone), suggestedCategory: suggested }] : [];
  });
}

function sourceCoverage(company: PortCo, milestones: PortCoMilestone[]): string[] {
  const flags: string[] = [];
  const sources = company.sources ?? [];
  if (!sources.length) return ["no_sources"];

  const hasTransactionalMilestone = milestones.some(
    (milestone) =>
      milestone.category === "Acquisition" ||
      milestone.category === "Financing" ||
      milestone.category === "Divestiture" ||
      milestone.category === "IPO" ||
      TRANSACTIONAL_EVENT_RE.test(milestone.event),
  );
  if (!hasTransactionalMilestone) return flags;

  const purposes = new Set(
    sources.map((source: PortCoSource) => inferCitationPurpose(source)).filter((purpose) => purpose !== "SUPPORTING_CONTEXT"),
  );
  const hasMilestoneSupport =
    purposes.has("MILESTONE_EVENT") || purposes.has("OWNERSHIP_INVESTMENT") || purposes.has("FINANCING_FILINGS");
  if (!hasMilestoneSupport) flags.push("no_transaction_or_milestone_source_purpose");
  return flags;
}

function priorityAndScore(flags: Set<string>, milestoneCount: number, ownerCount: number): { priority: Priority; score: number } {
  const weights: Record<string, number> = {
    malformed_date_format: 80,
    exact_duplicate_milestone: 75,
    missing_owner_entry_milestone: 70,
    missing_owner_exit_milestone: 70,
    near_duplicate_milestone: 45,
    over_dense_scorecard: 40,
    recategorization_candidate: 35,
    thin_scorecard: 30,
    excessive_other_milestones: 25,
    low_value_milestone: 25,
    no_transaction_or_milestone_source_purpose: 15,
    no_sources: 15,
  };
  let score = milestoneCount > 8 ? milestoneCount : 0;
  if (ownerCount > 1) score += ownerCount * 2;
  for (const flag of flags) score += weights[flag] ?? 5;

  if (
    flags.has("malformed_date_format") ||
    flags.has("exact_duplicate_milestone") ||
    flags.has("missing_owner_entry_milestone") ||
    flags.has("missing_owner_exit_milestone")
  ) {
    return { priority: "critical", score };
  }
  if (flags.has("near_duplicate_milestone") || flags.has("over_dense_scorecard") || flags.has("recategorization_candidate")) {
    return { priority: "high", score };
  }
  if (flags.size) return { priority: "medium", score };
  return { priority: "none", score };
}

function proposedTargetCount(milestoneCount: number, ownerCount: number, hasThinFlag: boolean): string {
  if (hasThinFlag) return "4-6 after research";
  if (milestoneCount > 8) return ownerCount > 2 ? "6-8 after pruning" : "4-6 after pruning";
  if (milestoneCount > 6) return "4-6 if non-core items prune cleanly";
  return "current 4-6 target";
}

function auditCompany(company: PortCo, sourceLine: number | ""): CompanyAuditRow {
  const milestones = company.milestones ?? [];
  const owners = ownersFor(company);
  const flags = new Set<string>();

  const malformedDates = milestones.filter((milestone) => !ALLOWED_DATE_RE.test(milestone.date));
  const exactDuplicates = findExactDuplicates(milestones);
  const nearDuplicates = findNearDuplicates(milestones);
  const lowValueMilestones = milestones.filter((milestone) => LOW_VALUE_EVENT_RE.test(`${milestone.date} ${milestone.event}`));
  const recategoryCandidates = findRecategorizationCandidates(milestones);
  const missingEntryOwners = owners.filter((owner) => owner.investmentYear && !hasEntryMilestone(owner, milestones));
  const missingExitOwners = owners.filter((owner) => owner.exitYear && !hasExitMilestone(owner, milestones));
  const otherCount = milestones.filter((milestone) => milestone.category === "Other").length;
  const coverageFlags = sourceCoverage(company, milestones);

  if (malformedDates.length) flags.add("malformed_date_format");
  if (exactDuplicates.length) flags.add("exact_duplicate_milestone");
  if (missingEntryOwners.length) flags.add("missing_owner_entry_milestone");
  if (missingExitOwners.length) flags.add("missing_owner_exit_milestone");
  if (nearDuplicates.length) flags.add("near_duplicate_milestone");
  if (milestones.length > 8) flags.add("over_dense_scorecard");
  if (recategoryCandidates.length) flags.add("recategorization_candidate");
  if (milestones.length > 0 && milestones.length <= 2) flags.add("thin_scorecard");
  if (otherCount > 3 || (milestones.length >= 3 && otherCount / milestones.length > 0.6)) flags.add("excessive_other_milestones");
  if (lowValueMilestones.length) flags.add("low_value_milestone");
  for (const flag of coverageFlags) flags.add(flag);

  const { priority, score } = priorityAndScore(flags, milestones.length, owners.length);

  return {
    auditId: `${slug(company.name)}__${slug(company.country)}`,
    sourceLine,
    company: company.name,
    country: company.country,
    investmentFirm: company.investmentFirm,
    sector: company.sector,
    status: company.status,
    ownerCount: owners.length,
    milestoneCount: milestones.length,
    sourceCount: company.sources?.length ?? 0,
    proposedTargetCount: proposedTargetCount(milestones.length, owners.length, flags.has("thin_scorecard")),
    priority,
    score,
    flags: Array.from(flags).sort().join(" | "),
    malformedDates: malformedDates.map(milestoneToText).join(" || "),
    exactDuplicates: exactDuplicates.join(" || "),
    nearDuplicates: nearDuplicates.map((item) => `${item.reason}: ${item.first} <-> ${item.second}`).join(" || "),
    lowValueMilestones: lowValueMilestones.map(milestoneToText).join(" || "),
    recategoryCandidates: recategoryCandidates
      .map((item) => `${item.suggestedCategory}: ${item.milestone}`)
      .join(" || "),
    missingEntryOwners: missingEntryOwners
      .map((owner) => `${owner.investmentFirm} / ${owner.ownershipVehicle} / ${owner.investmentYear}`)
      .join(" || "),
    missingExitOwners: missingExitOwners
      .map((owner) => `${owner.investmentFirm} / ${owner.ownershipVehicle} / ${owner.exitYear}`)
      .join(" || "),
    sourceCoverage: coverageFlags.join(" | "),
    sourceUrls: (company.sources ?? []).map((source) => source.url).join(" | "),
    reviewerDecision: "",
    reviewerNotes: "",
  };
}

function sortRows(rows: CompanyAuditRow[]): CompanyAuditRow[] {
  return [...rows].sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDiff) return priorityDiff;
    if (b.score !== a.score) return b.score - a.score;
    return a.company.localeCompare(b.company);
  });
}

function countBy<T extends string | number>(items: T[]): Array<[T, number]> {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function md(value: string | number): string {
  return String(value || "").replace(/\|/g, "/").replace(/\n/g, " ");
}

function summarize(rows: CompanyAuditRow[], priorityRows: CompanyAuditRow[], packetRows: CompanyAuditRow[]): string {
  const totalMilestones = rows.reduce((sum, row) => sum + row.milestoneCount, 0);
  const otherMilestones = companies.reduce(
    (sum, company) => sum + (company.milestones ?? []).filter((milestone) => milestone.category === "Other").length,
    0,
  );
  const byPriority = new Map<Priority, number>();
  for (const row of rows) byPriority.set(row.priority, (byPriority.get(row.priority) ?? 0) + 1);
  const flagCounts = countBy(
    rows.flatMap((row) => row.flags.split(" | ").filter(Boolean)),
  ).slice(0, 25);
  const sectorCounts = countBy(priorityRows.map((row) => row.sector)).slice(0, 12);
  const firmCounts = countBy(priorityRows.map((row) => row.investmentFirm)).slice(0, 20);

  const priorityOrder: Priority[] = ["critical", "high", "medium", "low", "none"];
  const packetTable = packetRows
    .map(
      (row) =>
        `| ${row.priority} | ${row.sourceLine || ""} | ${md(row.company)} | ${row.milestoneCount} | ${md(row.proposedTargetCount)} | ${md(row.flags)} |`,
    )
    .join("\n");

  return `# Portfolio Milestone Audit

Run at: ${RUN_AT}

## Scope

- Company records: ${rows.length}
- Milestones reviewed by automated checks: ${totalMilestones}
- Average milestones per company: ${(totalMilestones / rows.length).toFixed(2)}
- Companies in priority queue: ${priorityRows.length}
- \`Other\` milestones: ${otherMilestones}

## Review Standard

- Target 4-6 curated milestones for most scorecards.
- Keep founding, sponsor entry, material M&A/financing, platform launch, major expansion, exit/divestiture, IPO, and defining contract/concession/FID/COD events.
- Prune duplicated, vague, stale, unsupported, or low-value context items.
- Allowed date formats: \`YYYY\`, \`Mon YYYY\`, \`Mon D, YYYY\`, and \`Q# YYYY\`.
- Owner entry/exit milestones should align with owner investment and exit years so drawer highlighting works.

## Priority Summary

${priorityOrder.map((priority) => `- ${priority}: ${byPriority.get(priority) ?? 0}`).join("\n")}

## Top Flags

${flagCounts.map(([flag, count]) => `- ${flag}: ${count}`).join("\n") || "- None"}

## Priority Queue By Sector

${sectorCounts.map(([sector, count]) => `- ${sector}: ${count}`).join("\n") || "- None"}

## Priority Queue By Firm

${firmCounts.map(([firm, count]) => `- ${firm}: ${count}`).join("\n") || "- None"}

## First Review Packet

| Priority | Line | Company | Current | Target | Flags |
|---|---:|---|---:|---|---|
${packetTable || "| none |  |  |  |  |  |"}

## Files

- \`master.csv\`: every company row with milestone-quality signals
- \`priority-queue.csv\`: flagged companies sorted for review
- \`findings.json\`: machine-readable audit output
- \`review-packet-001.md\`: first 30-company approval packet
`;
}

function packetAction(row: CompanyAuditRow): string {
  const actions: string[] = [];
  if (row.malformedDates) actions.push("Fix or remove non-standard date labels.");
  if (row.exactDuplicates || row.nearDuplicates) actions.push("Prune duplicate or near-duplicate milestones.");
  if (row.missingEntryOwners) actions.push("Research/add owner entry milestone aligned to investment year.");
  if (row.missingExitOwners) actions.push("Research/add owner exit milestone aligned to exit year.");
  if (row.recategoryCandidates) actions.push("Recategorize obvious non-Other transaction or event milestones.");
  if (row.flags.includes("over_dense_scorecard")) actions.push("Prune toward curated target while retaining owner history.");
  if (row.flags.includes("thin_scorecard")) actions.push("Research missing founding/investment/growth context.");
  if (row.lowValueMilestones) actions.push("Remove low-value placeholders or stale current-state context.");
  if (row.sourceCoverage) actions.push("Confirm source coverage for retained material milestones.");
  return actions.join(" ");
}

function buildPacket(rows: CompanyAuditRow[]): string {
  const table = rows
    .map(
      (row) =>
        `| ${row.priority} | ${row.sourceLine || ""} | ${md(row.company)} | ${row.milestoneCount} | ${md(row.proposedTargetCount)} | ${md(packetAction(row))} | ${md(row.flags)} | Review pending |`,
    )
    .join("\n");

  return `# Portfolio Milestone Review Packet 001

Run at: ${RUN_AT}

This packet is an approval surface only. It proposes review actions for the highest-priority companies; it does not implement data edits.

| Priority | Line | Company | Current Count | Proposed Count | Proposed Review Actions | Flags | Reviewer Decision |
|---|---:|---|---:|---|---|---|---|
${table}

## Detail Fields

Use \`priority-queue.csv\` or \`findings.json\` for the exact malformed dates, duplicate milestone pairs, recategorization candidates, missing owner entry/exit owners, and source URLs behind each row.
`;
}

mkdirSync(OUT_DIR, { recursive: true });

const sourceLineIndex = buildSourceLineIndex();
const rows = companies.map((company) => auditCompany(company, sourceLineIndex.get(company.name) ?? ""));
const priorityRows = sortRows(rows.filter((row) => row.priority !== "none"));
const packetRows = priorityRows.slice(0, PACKET_SIZE);

writeFileSync(path.join(OUT_DIR, "master.csv"), toCsv(rows) + "\n");
writeFileSync(path.join(OUT_DIR, "priority-queue.csv"), toCsv(priorityRows) + "\n");
writeFileSync(path.join(OUT_DIR, "findings.json"), JSON.stringify({ runAt: RUN_AT, rows }, null, 2) + "\n");
writeFileSync(path.join(OUT_DIR, "summary.md"), summarize(rows, priorityRows, packetRows));
writeFileSync(path.join(OUT_DIR, "review-packet-001.md"), buildPacket(packetRows));

console.log("Portfolio milestone audit complete.");
console.log(`Companies: ${rows.length}`);
console.log(`Priority queue: ${priorityRows.length}`);
console.log(`Output: ${OUT_DIR}`);
