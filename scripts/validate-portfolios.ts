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

const errors: string[] = [];
const warnings: string[] = [];

const MONTHS =
  "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";
const VALID_MILESTONE_DATE_RE = new RegExp(
  `^(?:\\d{4}|${MONTHS}\\s+\\d{4}|${MONTHS}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
);
const TRANSACTIONAL_EVENT_RE =
  /\b(acquir\w*|invest\w*|financ\w*|funding|capital raise|equity raise|completed|closed|agreement|stake|sale|sold|divest\w*|ipo|joint venture|merger|merged)\b/i;

function addError(message: string) {
  errors.push(message);
}

function addWarning(message: string) {
  warnings.push(message);
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

for (const fundError of validateFundData()) {
  addError(`funds: ${fundError}`);
}

for (const [index, company] of companies.entries()) {
  const label = `${company.name || `(row ${index + 1})`} / ${company.country || "unknown country"}`;
  const key = `${company.name}||${company.country}`;
  seenCompanyKeys.set(key, (seenCompanyKeys.get(key) ?? 0) + 1);

  if (!company.name) addError(`${label}: missing name`);
  if (!company.investmentFirm) addError(`${label}: missing investmentFirm`);
  if (!company.ownershipVehicle) addWarning(`${label}: missing ownershipVehicle`);
  if (!company.description) addError(`${label}: missing description`);
  if (!company.country) addError(`${label}: missing country`);
  if (!PORTCO_SECTORS.includes(company.sector)) addError(`${label}: invalid sector "${company.sector}"`);
  if (!PORTCO_REGIONS.includes(company.region)) addError(`${label}: invalid region "${company.region}"`);
  if (!PORTCO_STATUSES.includes(company.status)) addError(`${label}: invalid status "${company.status}"`);

  if (!company.sources?.length) {
    addWarning(`${label}: no sources`);
  } else {
    for (const source of company.sources) {
      if (!source.label) addError(`${label}: source without label`);
      if (!source.url || !validUrl(source.url)) addError(`${label}: invalid source URL "${source.url}"`);
      if (source.type && !SOURCE_FORMATS.includes(source.type)) {
        addError(`${label}: invalid source type "${source.type}"`);
      }
      if (source.purpose && !SOURCE_PURPOSE_ORDER.includes(source.purpose)) {
        addError(`${label}: invalid source purpose "${source.purpose}"`);
      }
      if (source.url) seenSourceUrls.add(source.url);
    }
  }

  if (!company.milestones?.length) {
    addWarning(`${label}: no milestones`);
  } else {
    const milestoneKeys = new Set<string>();
    const otherCount = company.milestones.filter((milestone) => milestone.category === "Other").length;
    for (const milestone of company.milestones) {
      if (!milestone.date) addError(`${label}: milestone without date`);
      if (!milestone.event) addError(`${label}: milestone without event`);
      if (milestone.date && !VALID_MILESTONE_DATE_RE.test(milestone.date)) {
        addWarning(`${label}: milestone date is not in approved sortable format: "${milestone.date}"`);
      }
      const milestoneKey = `${milestone.date}|${milestone.event}`;
      if (milestoneKeys.has(milestoneKey)) addWarning(`${label}: duplicate milestone "${milestoneKey}"`);
      milestoneKeys.add(milestoneKey);
      if (
        milestone.category === "Other" &&
        TRANSACTIONAL_EVENT_RE.test(milestone.event) &&
        !/\bidentifies\b.*\bactive\b.*\bportfolio (company|investment)\b/i.test(milestone.event)
      ) {
        addWarning(`${label}: transactional milestone is categorized as Other: "${milestoneKey}"`);
      }
    }
    if (company.milestones.length > 8) {
      addWarning(`${label}: over-dense milestone scorecard (${company.milestones.length} milestones)`);
    }
    if (company.milestones.length <= 2) {
      addWarning(`${label}: thin milestone scorecard (${company.milestones.length} milestones)`);
    }
    if (otherCount > 3 || otherCount / company.milestones.length > 0.6) {
      addWarning(`${label}: high Other milestone usage (${otherCount}/${company.milestones.length})`);
    }
  }

  if (!company.management?.length) addWarning(`${label}: no management records`);

  for (const owner of ownersFor(company)) {
    if (!owner.investmentFirm) addError(`${label}: owner missing investmentFirm`);
    if (!owner.ownershipVehicle) addWarning(`${label}: owner missing ownershipVehicle`);
    if (!PORTCO_STATUSES.includes(owner.status)) addError(`${label}: owner has invalid status "${owner.status}"`);
    if (owner.ownershipVehicle && !fundNames.has(owner.ownershipVehicle)) {
      addWarning(`${label}: ownershipVehicle does not exactly match a fund name: "${owner.ownershipVehicle}"`);
    }
    if (!hasOwnerEntryMilestone(owner, company)) {
      addWarning(`${label}: owner investment year lacks matching entry milestone: ${owner.investmentFirm} ${owner.investmentYear}`);
    }
    if (!hasOwnerExitMilestone(owner, company)) {
      addWarning(`${label}: owner exit year lacks matching exit milestone: ${owner.investmentFirm} ${owner.exitYear}`);
    }
  }

  if (company.sources?.length && company.milestones?.some((milestone) => TRANSACTIONAL_EVENT_RE.test(milestone.event))) {
    const purposes = new Set(company.sources.map((source) => inferCitationPurpose(source)));
    if (!purposes.has("MILESTONE_EVENT") && !purposes.has("OWNERSHIP_INVESTMENT") && !purposes.has("FINANCING_FILINGS")) {
      addWarning(`${label}: transactional milestones lack milestone/ownership/filing source purpose coverage`);
    }
  }
}

for (const [key, count] of seenCompanyKeys) {
  if (count > 1) addError(`duplicate company name/country key: ${key} (${count} rows)`);
}

console.log("Portfolio Company Validation Report");
console.log("===================================");
console.log(`Companies: ${companies.length}`);
console.log(`Funds: ${funds.length}`);
console.log(`Unique source URLs: ${seenSourceUrls.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\nErrors:");
  for (const error of errors.slice(0, 80)) console.log(`  - ${error}`);
  if (errors.length > 80) console.log(`  ...and ${errors.length - 80} more`);
}

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings.slice(0, 80)) console.log(`  - ${warning}`);
  if (warnings.length > 80) console.log(`  ...and ${warnings.length - 80} more`);
}

if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("\nNo structural errors found.");
}
