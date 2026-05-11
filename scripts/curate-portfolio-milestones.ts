import { writeFileSync } from "node:fs";
import path from "node:path";
import { companies } from "../prisma/seed-data/companies.ts";
import type {
  MilestoneCategory,
  PortCo,
  PortCoMilestone,
  PortCoOwner,
  PortCoSource,
} from "../prisma/seed-data/portco-types.ts";
import { inferCitationPurpose, inferSourceType } from "../src/lib/source-utils.ts";

const OUT_FILE = path.join(process.cwd(), "prisma", "seed-data", "companies.ts");

const MONTHS =
  "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";
const VALID_DATE_RE = new RegExp(
  `^(?:\\d{4}|${MONTHS}\\s+\\d{4}|${MONTHS}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
);
const MONTH_YEAR_RE = new RegExp(`^(${MONTHS})\\s+(\\d{4})$`);
const FULL_DATE_RE = new RegExp(`^(${MONTHS})\\s+\\d{1,2},\\s+\\d{4}$`);
const QUARTER_RE = /^Q[1-4]\s+\d{4}$/;

const LOW_VALUE_RE =
  /\b(not publicly disclosed|not disclosed in reviewed|continued to (identify|list|describe|operate)|continued operating|remained active|remained an active|current page|public company materials continued|company materials continued|portfolio materials continued|public filings continued|power plant databases continued|historical milestones .* not comprehensively disclosed)\b/i;
const TRANSACTION_RE =
  /\b(acquir\w*|invest\w*|financ\w*|funding|capital raise|equity raise|completed|closed|agreement|stake|sale|sold|divest\w*|ipo|joint venture|merger|merged|financial close|commercial operation|commissioned|entered service)\b/i;
const CORPORATE_SUFFIX_RE =
  /\b(asset management|investment management|capital partners|capital management|capital|management|partners|investors|infrastructure|advisors|llc|lp|inc|ltd|plc|holdings|group|funds?)\b/gi;

const MANUAL_DROP_RULES: Record<string, RegExp[]> = {
  "DataBank": [
    /DigitalBridge acquired DataBank and launched its data center platform/i,
  ],
  "Dauntless Energy": [
    /Skyline Renewables was established as Ardian's United States renewables platform/i,
  ],
  "ExteNet Systems": [
    /ExteNet announced a capital restructuring involving Stonepeak/i,
    /Northleaf recorded its investment date for ExteNet/i,
    /ExteNet announced the closing of the Manulife-led investment representing approximately 30% ownership/i,
  ],
  "Generate Capital": [
    /Generate announced that the \$2 billion corporate equity raise had closed/i,
    /Harbert Infrastructure acquired an interest in Generate as part of the \$2 billion equity raise/i,
  ],
  "Phoenix Tower International": [
    /Grain Management and BlackRock joined Blackstone as investors in PTI/i,
  ],
  "Puget Sound Energy": [
    /Public filings described the investor consortium ownership of Puget Holdings/i,
    /An earlier investor consortium completed the take-private acquisition/i,
    /AIMCo increased its stake as the consortium acquired predecessor infrastructure-fund interests/i,
    /Macquarie Asset Management and Ontario Teachers' announced completion/i,
  ],
  "Sempra Infrastructure Partners, LP": [
    /Sempra announced the sale of a 20% non-controlling interest/i,
    /Sempra announced the sale of an additional 10% non-controlling interest/i,
    /Sempra completed the sale of the 30% combined non-controlling interest/i,
    /Sempra announced an agreement to sell an additional 45% equity interest/i,
  ],
};

interface CurationStats {
  companies: number;
  inputMilestones: number;
  outputMilestones: number;
  exactDuplicatesRemoved: number;
  nearDuplicatesRemoved: number;
  lowValueRemoved: number;
  malformedRemoved: number;
  datesNormalized: number;
  recategorized: number;
  foundingAdded: number;
  entryAdded: number;
  exitAdded: number;
  overDensePruned: number;
  sourcesTagged: number;
}

const stats: CurationStats = {
  companies: companies.length,
  inputMilestones: 0,
  outputMilestones: 0,
  exactDuplicatesRemoved: 0,
  nearDuplicatesRemoved: 0,
  lowValueRemoved: 0,
  malformedRemoved: 0,
  datesNormalized: 0,
  recategorized: 0,
  foundingAdded: 0,
  entryAdded: 0,
  exitAdded: 0,
  overDensePruned: 0,
  sourcesTagged: 0,
};

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

function milestoneYears(milestone: PortCoMilestone): number[] {
  return yearsIn(milestone.date);
}

function parseYear(milestone: PortCoMilestone): number {
  return milestoneYears(milestone)[0] ?? yearsIn(milestone.event)[0] ?? 9999;
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

function dateSpecificity(date: string): number {
  if (FULL_DATE_RE.test(date)) return 4;
  if (MONTH_YEAR_RE.test(date)) return 3;
  if (QUARTER_RE.test(date)) return 2;
  if (/^\d{4}$/.test(date)) return 1;
  return 0;
}

function categoryWeight(category: string): number {
  switch (category) {
    case "Divestiture":
    case "IPO":
      return 7;
    case "Acquisition":
    case "Financing":
      return 6;
    case "Founding":
      return 5;
    case "Expansion":
      return 4;
    case "Management":
      return 2;
    default:
      return 0;
  }
}

function milestoneQuality(milestone: PortCoMilestone): number {
  let score = categoryWeight(milestone.category) * 10 + dateSpecificity(milestone.date) * 4;
  if (TRANSACTION_RE.test(milestone.event)) score += 8;
  if (LOW_VALUE_RE.test(`${milestone.date} ${milestone.event}`)) score -= 40;
  if (!VALID_DATE_RE.test(milestone.date)) score -= 20;
  score += Math.min(12, Math.floor(milestone.event.length / 35));
  return score;
}

function normalizeFirm(value: string): string {
  return value
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

function isOwnerEntryMilestone(milestone: PortCoMilestone, owner: PortCoOwner): boolean {
  if (!owner.investmentYear || !milestoneYears(milestone).includes(owner.investmentYear)) return false;
  return milestone.category === "Financing" || milestone.category === "Acquisition" || milestoneMentionsOwner(milestone, owner);
}

function isOwnerExitMilestone(milestone: PortCoMilestone, owner: PortCoOwner): boolean {
  if (!owner.exitYear || !milestoneYears(milestone).includes(owner.exitYear)) return false;
  return milestone.category === "Divestiture" || milestoneMentionsOwner(milestone, owner);
}

function normalizeDate(date: string, event: string): string | null {
  const trimmed = date.trim().replace(/\s+/g, " ");
  if (VALID_DATE_RE.test(trimmed)) return trimmed;

  const seasonal = trimmed.match(/^(?:Early|Mid|Late)\s+(19\d{2}|20\d{2})$/i);
  if (seasonal) return seasonal[1];

  const compactQuarter = trimmed.match(/^Q([1-4])[-\s]*(19\d{2}|20\d{2})$/i);
  if (compactQuarter) return `Q${compactQuarter[1]} ${compactQuarter[2]}`;

  const labelYear = `${trimmed} ${event}`.match(/\b(?:expires?|expiry|through|until|by the end of|expected by|scheduled to expire in|runs? through)\D*(19\d{2}|20\d{2})\b/i);
  if (/^(contract term|concession term|ppa term|commercial operation target|program target)$/i.test(trimmed) && labelYear) {
    return labelYear[1];
  }

  if (/^\d{4}\s+to\s+\d{4}$/i.test(trimmed)) return null;
  if (/^\d{4}s(?:-\d{4}s)?$/i.test(trimmed)) return null;
  if (/^(founding date|historical founding date|not publicly disclosed\.?)$/i.test(trimmed)) return null;

  const firstYear = yearsIn(trimmed)[0];
  if (firstYear && !/[a-z]/i.test(trimmed.replace(String(firstYear), ""))) return String(firstYear);
  return null;
}

function cleanEvent(event: string): string {
  return event
    .replace(/\s+\((Founding|Acquisition|Financing|Expansion|Management|Divestiture|IPO|Strategic change)\)\.?$/i, ".")
    .replace(/\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function suggestedCategory(milestone: PortCoMilestone): MilestoneCategory | null {
  if (milestone.category !== "Other") return null;
  const event = milestone.event.toLowerCase();
  if (/\b(founded|was founded|established)\b/.test(event)) return "Founding";
  if (/\b(ipo|initial public offering|publicly listed|began trading)\b/.test(event)) return "IPO";
  if (/\b(divest\w*|sale|sold|sell|exit)\b/.test(event)) return "Divestiture";
  if (/\b(acquir\w*|purchase|purchased|bought|stake|take-private)\b/.test(event)) return "Acquisition";
  if (/\b(financ\w*|funding|capital raise|equity raise|investment|invested|commitment|financial close)\b/.test(event)) return "Financing";
  if (/\b(appointed|joined as|chief|ceo|cfo|coo|president)\b/.test(event)) return "Management";
  if (/\b(expand\w*|opened|entered service|commercial operation|commissioned|cod|capacity|portfolio grew|connected to the grid)\b/.test(event)) return "Expansion";
  return null;
}

function hasFoundingMilestone(company: PortCo, milestones: PortCoMilestone[]): boolean {
  if (!company.yearFounded) return true;
  return milestones.some(
    (milestone) =>
      milestone.category === "Founding" &&
      (milestoneYears(milestone).includes(company.yearFounded!) || yearsIn(milestone.event).includes(company.yearFounded!)),
  );
}

function entryCategory(owner: PortCoOwner): MilestoneCategory {
  const text = `${owner.ownershipVehicle} ${owner.stake ?? ""}`.toLowerCase();
  return /\b(acquisition|acquired|buyout|control|majority|100%|stake)\b/.test(text) ? "Acquisition" : "Financing";
}

function addStructuredMilestones(company: PortCo, milestones: PortCoMilestone[]): PortCoMilestone[] {
  const next = [...milestones];
  if (company.yearFounded && !hasFoundingMilestone(company, next)) {
    next.push({
      date: String(company.yearFounded),
      event: `${company.name} was founded.`,
      category: "Founding",
    });
    stats.foundingAdded++;
  }

  for (const owner of ownersFor(company)) {
    if (owner.investmentYear && !next.some((milestone) => isOwnerEntryMilestone(milestone, owner))) {
      const vehicle = owner.ownershipVehicle ? ` through ${owner.ownershipVehicle}` : "";
      next.push({
        date: String(owner.investmentYear),
        event: `${owner.investmentFirm} invested in ${company.name}${vehicle}.`,
        category: entryCategory(owner),
      });
      stats.entryAdded++;
    }
    if (owner.exitYear && !next.some((milestone) => isOwnerExitMilestone(milestone, owner))) {
      next.push({
        date: String(owner.exitYear),
        event: `${owner.investmentFirm} exited its investment in ${company.name}.`,
        category: "Divestiture",
      });
      stats.exitAdded++;
    }
  }

  if (next.length === 0 && company.sources?.length) {
    next.push({
      date: "2026",
      event: `${company.investmentFirm} identifies ${company.name} as an active ${company.sector.toLowerCase()} portfolio company.`,
      category: "Other",
    });
    stats.foundingAdded++;
  }

  return next;
}

function isDistinctFollowOnPair(first: PortCoMilestone, second: PortCoMilestone): boolean {
  const text = `${first.event} ${second.event}`.toLowerCase();
  if (/\b(follow-on|additional|second|subsequent)\b/.test(text) && /\b(initial|first)\b/.test(text)) return true;
  if (/\b(announced|agreement|agreed)\b/.test(text) && /\b(closed|closing|completed|completion)\b/.test(text)) return true;
  return false;
}

function dedupeMilestones(milestones: PortCoMilestone[]): PortCoMilestone[] {
  const byExact = new Map<string, PortCoMilestone>();
  for (const milestone of milestones) {
    const key = `${milestone.date}|${normalizeEvent(milestone.event)}`;
    const existing = byExact.get(key);
    if (!existing || milestoneQuality(milestone) > milestoneQuality(existing)) {
      if (existing) stats.exactDuplicatesRemoved++;
      byExact.set(key, milestone);
    } else {
      stats.exactDuplicatesRemoved++;
    }
  }

  const kept = Array.from(byExact.values());
  const removed = new Set<number>();
  for (let i = 0; i < kept.length; i++) {
    if (removed.has(i)) continue;
    for (let j = i + 1; j < kept.length; j++) {
      if (removed.has(j)) continue;
      const first = kept[i];
      const second = kept[j];
      const firstNorm = normalizeEvent(first.event);
      const secondNorm = normalizeEvent(second.event);
      const sameYear = milestoneYears(first).some((year) => milestoneYears(second).includes(year));
      const sameEvent = firstNorm.length >= 18 && firstNorm === secondNorm;
      const nestedEvent =
        Math.min(firstNorm.length, secondNorm.length) >= 45 &&
        (firstNorm.includes(secondNorm) || secondNorm.includes(firstNorm));
      const duplicateFounding =
        first.category === "Founding" &&
        second.category === "Founding" &&
        milestoneYears(first).some((year) => milestoneYears(second).includes(year));
      const sameDate = first.date === second.date;
      const strongTokenOverlap =
        sameYear &&
        jaccard(eventTokens(first.event), eventTokens(second.event)) >= 0.72 &&
        (sameDate || first.category === second.category || first.category === "Other" || second.category === "Other") &&
        !isDistinctFollowOnPair(first, second);

      if (!sameEvent && !nestedEvent && !duplicateFounding && !strongTokenOverlap) continue;

      const firstScore = milestoneQuality(first);
      const secondScore = milestoneQuality(second);
      removed.add(firstScore >= secondScore ? j : i);
      stats.nearDuplicatesRemoved++;
      if (removed.has(i)) break;
    }
  }

  return kept.filter((_, index) => !removed.has(index));
}

function isLowValue(milestone: PortCoMilestone): boolean {
  if (!LOW_VALUE_RE.test(`${milestone.date} ${milestone.event}`)) return false;
  if (/\bcontinued to (identify|list|describe|operate)|continued operating|remained active|remained an active|current page|public company materials continued|company materials continued|portfolio materials continued|public filings continued|power plant databases continued\b/i.test(milestone.event)) {
    return true;
  }
  if (milestone.category !== "Other" && milestone.category !== "Expansion") return false;
  return true;
}

function isEssential(milestone: PortCoMilestone, company: PortCo): boolean {
  const owners = ownersFor(company);
  if (owners.some((owner) => isOwnerEntryMilestone(milestone, owner) || isOwnerExitMilestone(milestone, owner))) {
    return true;
  }
  if (milestone.category === "Founding" && (!company.yearFounded || milestoneYears(milestone).includes(company.yearFounded))) {
    return true;
  }
  return milestone.category === "IPO" || milestone.category === "Divestiture";
}

function addUniqueMilestone(list: PortCoMilestone[], milestone: PortCoMilestone | undefined): void {
  if (!milestone) return;
  const key = `${milestone.date}|${milestone.event}`;
  if (!list.some((existing) => `${existing.date}|${existing.event}` === key)) {
    list.push(milestone);
  }
}

function manualDrop(company: PortCo, milestones: PortCoMilestone[]): PortCoMilestone[] {
  const rules = MANUAL_DROP_RULES[company.name];
  if (!rules?.length) return milestones;
  const next = milestones.filter((milestone) => !rules.some((rule) => rule.test(milestone.event)));
  stats.nearDuplicatesRemoved += milestones.length - next.length;
  return next;
}

function bestMilestone(milestones: PortCoMilestone[]): PortCoMilestone | undefined {
  return [...milestones].sort((a, b) => {
    const scoreDiff = milestoneQuality(b) - milestoneQuality(a);
    if (scoreDiff) return scoreDiff;
    return dateSpecificity(b.date) - dateSpecificity(a.date);
  })[0];
}

function baselineMilestones(company: PortCo, milestones: PortCoMilestone[]): PortCoMilestone[] {
  const keep: PortCoMilestone[] = [];
  addUniqueMilestone(keep, bestMilestone(milestones.filter((milestone) => milestone.category === "Founding")));

  const owners = ownersFor(company);
  for (const owner of owners) {
    if (owner.investmentYear) {
      addUniqueMilestone(keep, bestMilestone(milestones.filter((milestone) => isOwnerEntryMilestone(milestone, owner))));
    }
    if (owner.exitYear) {
      addUniqueMilestone(keep, bestMilestone(milestones.filter((milestone) => isOwnerExitMilestone(milestone, owner))));
    }
  }
  return keep;
}

function pruneOverDense(company: PortCo, milestones: PortCoMilestone[]): PortCoMilestone[] {
  const owners = ownersFor(company);
  const target = owners.length > 3 ? 8 : 6;
  if (milestones.length <= target) return milestones;

  const baseline = baselineMilestones(company, milestones);
  const essential = milestones.filter((milestone) => isEssential(milestone, company));
  for (const milestone of essential) addUniqueMilestone(baseline, milestone);

  let keep = baseline;
  if (keep.length > target) {
    const founding = bestMilestone(keep.filter((milestone) => milestone.category === "Founding"));
    const rest = keep
      .filter((milestone) => `${milestone.date}|${milestone.event}` !== (founding ? `${founding.date}|${founding.event}` : ""))
      .sort((a, b) => milestoneQuality(b) - milestoneQuality(a));
    keep = founding ? [founding, ...rest.slice(0, target - 1)] : rest.slice(0, target);
  }

  const keepKeys = new Set(keep.map((milestone) => `${milestone.date}|${milestone.event}`));
  const candidates = milestones
    .filter((milestone) => !keepKeys.has(`${milestone.date}|${milestone.event}`))
    .sort((a, b) => {
      const scoreDiff = milestoneQuality(b) - milestoneQuality(a);
      if (scoreDiff) return scoreDiff;
      return parseYear(b) - parseYear(a);
    });

  for (const candidate of candidates) {
    if (keep.length >= target) break;
    keep.push(candidate);
  }

  if (keep.length < milestones.length) stats.overDensePruned += milestones.length - keep.length;
  return keep;
}

function curateMilestones(company: PortCo): PortCoMilestone[] | undefined {
  stats.inputMilestones += company.milestones?.length ?? 0;
  const normalized: PortCoMilestone[] = [];

  for (const milestone of company.milestones ?? []) {
    const date = normalizeDate(milestone.date, milestone.event);
    if (!date) {
      if (isLowValue(milestone) || !VALID_DATE_RE.test(milestone.date)) {
        if (isLowValue(milestone)) stats.lowValueRemoved++;
        else stats.malformedRemoved++;
        continue;
      }
      stats.malformedRemoved++;
      continue;
    }
    if (date !== milestone.date) stats.datesNormalized++;

    let event = cleanEvent(milestone.event);
    let category = milestone.category;
    if (/\bidentifies\b.*\bactive\b.*\bportfolio investment\b/i.test(event)) {
      event = event.replace(/\bportfolio investment\b/i, "portfolio company");
      category = "Other";
    }
    const suggested = suggestedCategory(milestone);
    if (suggested && suggested !== category) {
      category = suggested;
      stats.recategorized++;
    }

    const curated = { date, event, category };
    if (isLowValue(curated)) {
      stats.lowValueRemoved++;
      continue;
    }
    normalized.push(curated);
  }

  let next = dedupeMilestones(normalized);
  next = addStructuredMilestones(company, next);
  next = manualDrop(company, next);
  next = dedupeMilestones(next);
  next = pruneOverDense(company, next);
  next = next.sort((a, b) => parseYear(a) - parseYear(b) || dateSpecificity(a.date) - dateSpecificity(b.date));
  stats.outputMilestones += next.length;
  return next.length ? next : undefined;
}

function hasTransactionalMilestones(company: PortCo): boolean {
  return (company.milestones ?? []).some(
    (milestone) =>
      milestone.category === "Acquisition" ||
      milestone.category === "Financing" ||
      milestone.category === "Divestiture" ||
      milestone.category === "IPO" ||
      TRANSACTION_RE.test(milestone.event),
  );
}

function curateSources(company: PortCo): PortCoSource[] | undefined {
  const sources = company.sources;
  if (!sources?.length) return sources;
  const nextSources = sources.map((source) => {
    const next: PortCoSource = { ...source };
    if (!next.type) {
      next.type = inferSourceType(next);
      stats.sourcesTagged++;
    }
    if (!next.purpose) {
      const purpose = inferCitationPurpose(next);
      if (purpose !== "SUPPORTING_CONTEXT") {
        next.purpose = purpose;
        stats.sourcesTagged++;
      }
    }
    return next;
  });

  if (
    hasTransactionalMilestones(company) &&
    !nextSources.some((source) =>
      source.purpose === "MILESTONE_EVENT" ||
      source.purpose === "OWNERSHIP_INVESTMENT" ||
      source.purpose === "FINANCING_FILINGS"
    )
  ) {
    const index = nextSources.findIndex((source) => source.purpose !== "COMPANY_PROFILE");
    const fallbackIndex = index >= 0 ? index : 0;
    nextSources[fallbackIndex] = { ...nextSources[fallbackIndex], purpose: "MILESTONE_EVENT" };
    stats.sourcesTagged++;
  }

  return nextSources;
}

function curateCompany(company: PortCo): PortCo {
  const curated: PortCo = {
    ...company,
    milestones: curateMilestones(company),
  };
  return {
    ...curated,
    sources: curateSources(curated),
  };
}

function q(value: string): string {
  return JSON.stringify(value);
}

function emitArray(values: string[]): string {
  return `[${values.map(q).join(", ")}]`;
}

function emitMilestone(milestone: PortCoMilestone): string {
  return `      { date: ${q(milestone.date)}, event: ${q(milestone.event)}, category: ${q(milestone.category)} }`;
}

function emitExecutive(exec: NonNullable<PortCo["management"]>[number]): string {
  return `      { name: ${q(exec.name)}, title: ${q(exec.title)} }`;
}

function emitSource(source: PortCoSource): string {
  const fields = [`label: ${q(source.label)}`, `url: ${q(source.url)}`];
  if (source.type) fields.push(`type: ${q(source.type)}`);
  if (source.purpose) fields.push(`purpose: ${q(source.purpose)}`);
  if (source.evidenceLabel) fields.push(`evidenceLabel: ${q(source.evidenceLabel)}`);
  return `      { ${fields.join(", ")} }`;
}

function emitOwner(owner: PortCoOwner): string {
  const fields = [
    `investmentFirm: ${q(owner.investmentFirm)}`,
    `ownershipVehicle: ${q(owner.ownershipVehicle)}`,
  ];
  if (owner.investmentYear != null) fields.push(`investmentYear: ${owner.investmentYear}`);
  if (owner.exitYear != null) fields.push(`exitYear: ${owner.exitYear}`);
  if (owner.stake) fields.push(`stake: ${q(owner.stake)}`);
  fields.push(`status: ${q(owner.status)}`);
  return `      { ${fields.join(", ")} }`;
}

function emitCompany(company: PortCo): string {
  const lines = ["  {"];
  lines.push(`    name: ${q(company.name)},`);
  lines.push(`    investmentFirm: ${q(company.investmentFirm)},`);
  lines.push(`    sector: ${q(company.sector)},`);
  lines.push(`    subsector: ${q(company.subsector)},`);
  lines.push(`    region: ${q(company.region)},`);
  lines.push(`    country: ${q(company.country)},`);
  lines.push(`    ownershipVehicle: ${q(company.ownershipVehicle)},`);
  lines.push(`    description: ${q(company.description)},`);
  lines.push(`    status: ${q(company.status)},`);
  lines.push(`    countryTags: ${emitArray(company.countryTags)},`);
  if (company.website) lines.push(`    website: ${q(company.website)},`);
  if (company.yearFounded != null) lines.push(`    yearFounded: ${company.yearFounded},`);
  if (company.investmentYear != null) lines.push(`    investmentYear: ${company.investmentYear},`);
  if (company.headquarters) lines.push(`    headquarters: ${q(company.headquarters)},`);
  if (company.milestones?.length) {
    lines.push("    milestones: [");
    lines.push(company.milestones.map(emitMilestone).join(",\n") + ",");
    lines.push("    ],");
  }
  if (company.management?.length) {
    lines.push("    management: [");
    lines.push(company.management.map(emitExecutive).join(",\n") + ",");
    lines.push("    ],");
  }
  if (company.sources?.length) {
    lines.push("    sources: [");
    lines.push(company.sources.map(emitSource).join(",\n") + ",");
    lines.push("    ],");
  }
  if (company.owners?.length) {
    lines.push("    owners: [");
    lines.push(company.owners.map(emitOwner).join(",\n") + ",");
    lines.push("    ],");
  }
  lines.push("  }");
  return lines.join("\n");
}

const curated = companies.map(curateCompany);
const file = `import type { PortCo } from "./portco-types";

export const companies: PortCo[] = [
${curated.map(emitCompany).join(",\n")}
];
`;

writeFileSync(OUT_FILE, file);
console.log("Portfolio milestone curation complete.");
console.log(JSON.stringify(stats, null, 2));
