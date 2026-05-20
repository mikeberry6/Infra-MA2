/**
 * Portfolio company validation for the current seed-data architecture.
 *
 * This replaces the retired `src/data/portfolios` validator. It validates the
 * canonical seed files under `prisma/seed-data` and reports known enrichment
 * gaps separately from hard structural failures.
 */

import { companies } from "../prisma/seed-data/companies.ts";
import { funds, validateFundData } from "../prisma/seed-data/funds.ts";
import {
  PORTCO_REGIONS,
  PORTCO_SECTORS,
  PORTCO_STATUSES,
  type PortCo,
  type PortCoOwner,
} from "../prisma/seed-data/portco-types.ts";
import { inferCitationPurpose, SOURCE_FORMATS, SOURCE_PURPOSE_ORDER } from "../src/lib/source-utils.ts";

type DiagnosticSeverity = "error" | "warning" | "info";

interface Diagnostic {
  severity: DiagnosticSeverity;
  category: string;
  message: string;
}

const diagnostics: Diagnostic[] = [];

const MONTHS =
  "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";
const VALID_MILESTONE_DATE_RE = new RegExp(
  `^(?:\\d{4}|${MONTHS}\\s+\\d{4}|${MONTHS}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
);
const TRANSACTIONAL_EVENT_RE =
  /\b(acquir\w*|invest\w*|financ\w*|funding|capital raise|equity raise|completed|closed|agreement|stake|sale|sold|divest\w*|ipo|joint venture|merger|merged)\b/i;
const LOW_VALUE_MILESTONE_RE =
  /\b(not publicly disclosed|continued\b|remained\b|active portfolio (company|investment)|current page|(?:public|company|project|portfolio|fund|industry|regulatory|filing|filings|materials|disclosures|sources|reporting|website) (?:described|stated|identified|listed|reported|cited|said|highlighted|referenced)|public company materials continued|company materials continued|portfolio materials continued|public disclosures reviewed|reviewed public materials do not|not disclosed in reviewed)\b/i;
const ASSET_LIKE_NAME_RE =
  /\b(project|portfolio|facility|farm|plant|park|pipeline|transmission|storage|battery|solar|wind|hydro|airport|terminal|garage|courthouse|school|hospital|road|bridge|concession|grid|substation)\b/i;
const OPERATING_PLATFORM_RE =
  /\b(platform|developer|provider|operator|services|company|business|manufacturer|network|systems)\b/i;
const GENERIC_OWNERSHIP_VEHICLE_RE =
  /\b(preferred equity|tax equity|joint venture|\bjv\b|co-?investment|co invest|sidecar|sleeve|separate(?:ly)? managed account|sma|consortium|partnership|balance sheet|direct investment|equity commitment|project finance)\b/i;

function addDiagnostic(severity: DiagnosticSeverity, category: string, message: string) {
  diagnostics.push({ severity, category, message });
}

function addError(message: string, category = "Structural fields") {
  addDiagnostic("error", category, message);
}

function addWarning(message: string, category = "Curation review") {
  addDiagnostic("warning", category, message);
}

function addInfo(message: string, category = "Informational") {
  addDiagnostic("info", category, message);
}

function validUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
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
  return Array.from(text.matchAll(/\b(19\d{2}|20\d{2})\b/g), (match) => Number(match[1]));
}

function ownerTokenText(owner: PortCoOwner): string {
  return `${owner.investmentFirm} ${owner.ownershipVehicle}`
    .toLowerCase()
    .replace(/\b(asset management|investment management|capital partners|capital management|capital|management|partners|investors|infrastructure|advisors|llc|lp|inc|ltd|plc|holdings|group|funds?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function milestoneMentionsOwner(event: string, owner: PortCoOwner): boolean {
  const haystack = event.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, "");
  return ownerTokenText(owner)
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .some((token) => haystack.includes(token) || compactHaystack.includes(token));
}

function hasOwnerEntryMilestone(owner: PortCoOwner, company: PortCo): boolean {
  if (!owner.investmentYear) return true;
  return (company.milestones ?? []).some((milestone) => {
    if (!yearsIn(milestone.date).includes(owner.investmentYear!)) return false;
    return milestone.category === "Financing" || milestone.category === "Acquisition" || milestoneMentionsOwner(milestone.event, owner);
  });
}

function hasOwnerExitMilestone(owner: PortCoOwner, company: PortCo): boolean {
  if (!owner.exitYear) return true;
  return (company.milestones ?? []).some((milestone) => {
    if (!yearsIn(milestone.date).includes(owner.exitYear!)) return false;
    return milestone.category === "Divestiture" || milestoneMentionsOwner(milestone.event, owner);
  });
}

const fundNames = new Set(funds.map((fund) => fund.fundName));
const seenCompanyKeys = new Map<string, number>();
const seenSourceUrls = new Set<string>();

function isUndisclosedVehicle(vehicle: string): boolean {
  return /^n\.?a\.?$/i.test(vehicle.trim());
}

function isGenericOwnershipVehicle(vehicle: string): boolean {
  const trimmed = vehicle.trim();
  return isUndisclosedVehicle(trimmed) || GENERIC_OWNERSHIP_VEHICLE_RE.test(trimmed);
}

function isAssetLikeRecord(company: PortCo): boolean {
  if (ASSET_LIKE_NAME_RE.test(company.name)) return true;
  const subsector = company.subsector ?? "";
  return /\b(project|asset|facility)\b/i.test(subsector) && !OPERATING_PLATFORM_RE.test(subsector);
}

for (const fundError of validateFundData()) {
  addError(`funds: ${fundError}`, "Fund seed data");
}

for (const [index, company] of companies.entries()) {
  const label = `${company.name || `(row ${index + 1})`} / ${company.country || "unknown country"}`;
  const key = `${company.name}||${company.country}`;
  seenCompanyKeys.set(key, (seenCompanyKeys.get(key) ?? 0) + 1);

  if (!company.name) addError(`${label}: missing name`, "Required fields");
  if (!company.investmentFirm) addError(`${label}: missing investmentFirm`, "Required fields");
  if (!company.ownershipVehicle) addWarning(`${label}: missing ownershipVehicle`, "Ownership metadata");
  if (!company.description) addError(`${label}: missing description`, "Required fields");
  if (!company.country) addError(`${label}: missing country`, "Required fields");
  if (!PORTCO_SECTORS.includes(company.sector)) addError(`${label}: invalid sector "${company.sector}"`, "Controlled vocabularies");
  if (!PORTCO_REGIONS.includes(company.region)) addError(`${label}: invalid region "${company.region}"`, "Controlled vocabularies");
  if (!PORTCO_STATUSES.includes(company.status)) addError(`${label}: invalid status "${company.status}"`, "Controlled vocabularies");

  if (!company.sources?.length) {
    addWarning(`${label}: no sources`, "Source coverage");
  } else {
    for (const source of company.sources) {
      if (!source.label) addError(`${label}: source without label`, "Source integrity");
      if (!source.url || !validUrl(source.url)) addError(`${label}: invalid source URL "${source.url}"`, "Source integrity");
      if (source.type && !SOURCE_FORMATS.includes(source.type)) {
        addError(`${label}: invalid source type "${source.type}"`, "Source integrity");
      }
      if (source.purpose && !SOURCE_PURPOSE_ORDER.includes(source.purpose)) {
        addError(`${label}: invalid source purpose "${source.purpose}"`, "Source integrity");
      }
      if (source.url) seenSourceUrls.add(source.url);
    }
  }

  if (!company.milestones?.length) {
    addWarning(`${label}: no milestones`, "Milestone coverage");
  } else {
    const milestoneKeys = new Set<string>();
    const otherCount = company.milestones.filter((milestone) => milestone.category === "Other").length;
    for (const milestone of company.milestones) {
      if (!milestone.date) addError(`${label}: milestone without date`, "Milestone structure");
      if (!milestone.event) addError(`${label}: milestone without event`, "Milestone structure");
      if (milestone.date && !VALID_MILESTONE_DATE_RE.test(milestone.date)) {
        addWarning(`${label}: milestone date is not in approved sortable format: "${milestone.date}"`, "Milestone quality");
      }
      const milestoneKey = `${milestone.date}|${milestone.event}`;
      if (milestoneKeys.has(milestoneKey)) addWarning(`${label}: duplicate milestone "${milestoneKey}"`, "Milestone quality");
      milestoneKeys.add(milestoneKey);
      if (
        milestone.category === "Other" &&
        TRANSACTIONAL_EVENT_RE.test(milestone.event) &&
        !/\bidentifies\b.*\bactive\b.*\bportfolio (company|investment)\b/i.test(milestone.event)
      ) {
        addWarning(`${label}: transactional milestone is categorized as Other: "${milestoneKey}"`, "Milestone quality");
      }
      if (LOW_VALUE_MILESTONE_RE.test(`${milestone.date} ${milestone.event}`)) {
        addWarning(`${label}: low-value milestone should be removed: "${milestoneKey}"`, "Milestone quality");
      }
    }
    if (company.milestones.length > 6) {
      addWarning(`${label}: over-dense milestone scorecard (${company.milestones.length} milestones)`, "Milestone density");
    }
    if (company.milestones.length === 1) {
      addWarning(`${label}: thin milestone scorecard (${company.milestones.length} milestones)`, "Milestone density");
    }
    if (otherCount > 2 || otherCount / company.milestones.length > 0.5) {
      addWarning(`${label}: high Other milestone usage (${otherCount}/${company.milestones.length})`, "Milestone quality");
    }
  }

  if (!company.management?.length) {
    if (isAssetLikeRecord(company)) {
      addInfo(`${label}: no management records on asset/project-style record`, "Management coverage");
    } else {
      addWarning(`${label}: no management records`, "Management coverage");
    }
  }

  for (const owner of ownersFor(company)) {
    if (!owner.investmentFirm) addError(`${label}: owner missing investmentFirm`, "Ownership structure");
    if (!owner.ownershipVehicle) addWarning(`${label}: owner missing ownershipVehicle`, "Ownership metadata");
    if (!PORTCO_STATUSES.includes(owner.status)) addError(`${label}: owner has invalid status "${owner.status}"`, "Ownership structure");
    if (owner.ownershipVehicle && !isUndisclosedVehicle(owner.ownershipVehicle) && !fundNames.has(owner.ownershipVehicle)) {
      if (isGenericOwnershipVehicle(owner.ownershipVehicle)) {
        addInfo(`${label}: non-fund ownership vehicle is not checked against fund names: "${owner.ownershipVehicle}"`, "Ownership vehicle classification");
      } else {
        addWarning(`${label}: ownershipVehicle does not exactly match a fund name: "${owner.ownershipVehicle}"`, "Fund linkage");
      }
    }
    if (!hasOwnerEntryMilestone(owner, company)) {
      addWarning(`${label}: owner investment year lacks matching entry milestone: ${owner.investmentFirm} ${owner.investmentYear}`, "Ownership milestones");
    }
    if (!hasOwnerExitMilestone(owner, company)) {
      addWarning(`${label}: owner exit year lacks matching exit milestone: ${owner.investmentFirm} ${owner.exitYear}`, "Ownership milestones");
    }
  }

  if (company.sources?.length && company.milestones?.some((milestone) => TRANSACTIONAL_EVENT_RE.test(milestone.event))) {
    const purposes = new Set(company.sources.map((source) => inferCitationPurpose(source)));
    if (!purposes.has("MILESTONE_EVENT") && !purposes.has("OWNERSHIP_INVESTMENT") && !purposes.has("FINANCING_FILINGS")) {
      addWarning(`${label}: transactional milestones lack milestone/ownership/filing source purpose coverage`, "Source coverage");
    }
  }
}

for (const [key, count] of seenCompanyKeys) {
  if (count > 1) addError(`duplicate company name/country key: ${key} (${count} rows)`, "Duplicate records");
}

function diagnosticsFor(severity: DiagnosticSeverity): Diagnostic[] {
  return diagnostics.filter((diagnostic) => diagnostic.severity === severity);
}

function printDiagnostics(title: string, items: Diagnostic[], sampleLimit = 12) {
  if (!items.length) return;

  console.log(`\n${title}:`);
  const groups = new Map<string, Diagnostic[]>();
  for (const item of items) {
    const group = groups.get(item.category) ?? [];
    group.push(item);
    groups.set(item.category, group);
  }

  for (const [category, group] of Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))) {
    console.log(`  ${category} (${group.length})`);
    for (const item of group.slice(0, sampleLimit)) {
      console.log(`    - ${item.message}`);
    }
    if (group.length > sampleLimit) {
      console.log(`    ...and ${group.length - sampleLimit} more`);
    }
  }
}

const errors = diagnosticsFor("error");
const warnings = diagnosticsFor("warning");
const info = diagnosticsFor("info");

console.log("Portfolio Company Validation Report");
console.log("===================================");
console.log(`Companies: ${companies.length}`);
console.log(`Funds: ${funds.length}`);
console.log(`Unique source URLs: ${seenSourceUrls.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Info: ${info.length}`);

printDiagnostics("Errors by category", errors);
printDiagnostics("Warnings by category", warnings);
printDiagnostics("Info by category", info, 8);

if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("\nNo structural errors found.");
}
