import { normalizeText } from "./lib";

export interface OwnershipAttributionRow {
  firm: string;
  vehicle?: string | null;
  fundName?: string | null;
  investmentYear?: number | null;
  exitYear?: number | null;
}

export interface MilestoneAttributionRow {
  date: string;
  event: string;
  category: string;
}

const GENERIC_IDENTITY_PHRASES = new Set([
  "",
  "co investors",
  "direct corporate ownership",
  "direct ownership",
  "n a",
  "not applicable",
  "not disclosed",
  "prior ownership",
  "undisclosed",
]);

const TRAILING_ORGANIZATION_SUFFIXES = new Set([
  "ag",
  "asset",
  "assets",
  "capital",
  "co",
  "company",
  "corp",
  "corporation",
  "fund",
  "funds",
  "group",
  "holding",
  "holdings",
  "inc",
  "incorporated",
  "infrastructure",
  "investment",
  "investments",
  "investor",
  "investors",
  "llc",
  "lp",
  "ltd",
  "limited",
  "management",
  "partner",
  "partners",
  "plc",
]);

const GENERIC_BRAND_HEADS = new Set([
  "abu",
  "american",
  "asset",
  "capital",
  "east",
  "global",
  "infrastructure",
  "international",
  "investment",
  "investors",
  "la",
  "management",
  "new",
  "north",
  "partners",
  "south",
  "the",
  "united",
  "west",
]);

interface VerifiedBrand {
  ownerPattern: RegExp;
  eventAliases: string[];
}

/**
 * These are deliberately narrow, verified organization brands whose display
 * punctuation or spacing varies in the source data. Short tokens are not
 * derived automatically: doing so would let generic manager words fan out to
 * unrelated milestones.
 */
const VERIFIED_BRANDS: VerifiedBrand[] = [
  {
    ownerPattern: /\b(?:h i g|hig)(?: capital| infrastructure)?\b/,
    eventAliases: ["h i g", "hig"],
  },
  {
    ownerPattern: /\bdigital ?bridge\b/,
    eventAliases: ["digital bridge", "digitalbridge"],
  },
  {
    ownerPattern: /\bsk capital(?: partners)?\b/,
    eventAliases: ["sk capital"],
  },
  { ownerPattern: /\b3i(?: group| infrastructure)?\b/, eventAliases: ["3i"] },
  {
    ownerPattern: /\bconnor clark and lunn\b/,
    eventAliases: ["cc and l", "ccl"],
  },
];

function yearsIn(value: string): number[] {
  return Array.from(value.matchAll(/\b(19\d{2}|20\d{2})\b/g), (match) =>
    Number(match[1]),
  );
}

function containsPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `);
}

function isMeaningfulIdentityPhrase(value: string): boolean {
  if (GENERIC_IDENTITY_PHRASES.has(value)) return false;
  if (/^\d+(?:\s+equity)?\s+interest(?:\s|$)/.test(value)) return false;
  return value.replaceAll(" ", "").length >= 3;
}

function addIdentityPhrase(phrases: Set<string>, value: string): void {
  const normalized = normalizeText(value);
  if (isMeaningfulIdentityPhrase(normalized)) phrases.add(normalized);
}

function addOrganizationBrandPhrases(
  phrases: Set<string>,
  value: string,
): void {
  const normalized = normalizeText(value);
  const tokens = normalized.split(" ").filter(Boolean);
  while (
    tokens.length > 1 &&
    TRAILING_ORGANIZATION_SUFFIXES.has(tokens.at(-1)!)
  )
    tokens.pop();
  addIdentityPhrase(phrases, tokens.join(" "));

  const head = tokens[0];
  if (head && !GENERIC_BRAND_HEADS.has(head)) addIdentityPhrase(phrases, head);

  for (const match of value.matchAll(/\(([^)]+)\)/g)) {
    if (match[1] && !/\d|\b(?:stake|interest|fund|managed)\b/i.test(match[1])) {
      addIdentityPhrase(phrases, match[1]);
    }
  }
}

/**
 * Return explicit owner/vehicle phrases only. Slash-delimited vehicle labels
 * and a trailing "via …" platform are structured aliases; individual words
 * are never treated as identities.
 */
export function ownerIdentityPhrases(owner: OwnershipAttributionRow): string[] {
  const phrases = new Set<string>();
  const rawValues = [owner.firm, owner.vehicle ?? "", owner.fundName ?? ""];

  for (const rawValue of rawValues) {
    addIdentityPhrase(phrases, rawValue);
    for (const component of rawValue.split(/\s*[/;]\s*/))
      addIdentityPhrase(phrases, component);

    const beforeParenthetical = rawValue.replace(/\s*\([^)]*\).*$/, "");
    if (beforeParenthetical !== rawValue)
      addIdentityPhrase(phrases, beforeParenthetical);

    const viaMatch = normalizeText(rawValue).match(/\bvia\s+(.+)$/);
    if (viaMatch?.[1]) addIdentityPhrase(phrases, viaMatch[1]);

    const priorPlatformMatch = normalizeText(rawValue).match(
      /^prior\s+(.+?)\s+ownership$/,
    );
    if (priorPlatformMatch?.[1])
      addIdentityPhrase(phrases, priorPlatformMatch[1]);
  }
  addOrganizationBrandPhrases(phrases, owner.firm);

  const normalizedOwner = rawValues.map(normalizeText).join(" ");
  for (const brand of VERIFIED_BRANDS) {
    if (!brand.ownerPattern.test(normalizedOwner)) continue;
    for (const alias of brand.eventAliases) phrases.add(alias);
  }

  return [...phrases].sort();
}

export function eventMentionsOwner(
  milestone: MilestoneAttributionRow,
  owner: OwnershipAttributionRow,
): boolean {
  const event = normalizeText(milestone.event);
  return ownerIdentityPhrases(owner).some((phrase) =>
    containsPhrase(event, phrase),
  );
}

function matchingIdentityPhrases(
  milestone: MilestoneAttributionRow,
  owner: OwnershipAttributionRow,
): string[] {
  const event = normalizeText(milestone.event);
  return ownerIdentityPhrases(owner).filter((phrase) =>
    containsPhrase(event, phrase),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function transactionRoleMatches(
  milestone: MilestoneAttributionRow,
  owner: OwnershipAttributionRow,
  role: "INCOMING" | "OUTGOING",
): boolean {
  const event = normalizeText(milestone.event);

  return matchingIdentityPhrases(milestone, owner).some((identity) => {
    const name = escapeRegExp(identity).replaceAll(" ", "\\s+");
    const boundedName = `(?:^|\\s)${name}(?=\\s|$)`;

    if (role === "INCOMING") {
      const explicitlyOutgoing = [
        new RegExp(`\\bfrom\\s+${name}(?=\\s|$)`),
        new RegExp(
          `\\b(?:acquisition|purchase)\\s+of\\s+${name}(?:\\s+s)?(?=\\s|$)`,
        ),
      ].some((pattern) => pattern.test(event));
      if (explicitlyOutgoing) return false;

      return [
        new RegExp(
          `${boundedName}.{0,120}\\b(?:acquir(?:e|ed|es|ing)|acquisition|invest(?:ed|ment)|purchas(?:e|ed|ing)|became|formed|established|launched|created)\\b`,
        ),
        new RegExp(
          `\\b(?:acquisition|investment|purchase)\\b.{0,100}\\bby\\s+${name}(?=\\s|$)`,
        ),
        new RegExp(
          `\\b(?:sold|transferred|divested)\\b.{0,100}\\bto\\s+${name}(?=\\s|$)`,
        ),
      ].some((pattern) => pattern.test(event));
    }

    return [
      new RegExp(`\\bfrom\\s+${name}(?=\\s|$)`),
      new RegExp(
        `${boundedName}.{0,120}\\b(?:sold|sell|divest(?:ed|iture)|exit(?:ed)?|disposed|transferred)\\b`,
      ),
      new RegExp(
        `\\b(?:acquisition|purchase)\\s+of\\s+${name}(?:\\s+s)?(?=\\s|$)`,
      ),
    ].some((pattern) => pattern.test(event));
  });
}

export function milestoneSupportsOwnerEntry(
  milestone: MilestoneAttributionRow,
  owner: OwnershipAttributionRow,
): boolean {
  if (milestone.category === "FINANCING") return true;
  if (milestone.category === "FOUNDING")
    return eventMentionsOwner(milestone, owner);
  if (milestone.category === "ACQUISITION")
    return eventMentionsOwner(milestone, owner);
  if (milestone.category === "DIVESTITURE") {
    return transactionRoleMatches(milestone, owner, "INCOMING");
  }
  return false;
}

export function milestoneSupportsOwnerExit(
  milestone: MilestoneAttributionRow,
  owner: OwnershipAttributionRow,
): boolean {
  if (milestone.category === "DIVESTITURE") return true;
  if (milestone.category === "IPO") return eventMentionsOwner(milestone, owner);
  if (milestone.category === "ACQUISITION") {
    return transactionRoleMatches(milestone, owner, "OUTGOING");
  }
  if (milestone.category === "OTHER") {
    const event = normalizeText(milestone.event);
    const isDocumentedRestructuring =
      /\b(?:administration|administrator|bankruptcy|chapter 11|liquidation|pre pack sale|receivership|restructuring)\b/.test(
        event,
      );
    return isDocumentedRestructuring && eventMentionsOwner(milestone, owner);
  }
  return false;
}

export function hasAttributableEntryMilestone(
  owner: OwnershipAttributionRow,
  milestones: MilestoneAttributionRow[],
): boolean {
  if (owner.investmentYear === null || owner.investmentYear === undefined)
    return true;
  return milestones.some(
    (milestone) =>
      yearsIn(milestone.date).includes(owner.investmentYear!) &&
      milestoneSupportsOwnerEntry(milestone, owner),
  );
}

export function hasAttributableExitMilestone(
  owner: OwnershipAttributionRow,
  milestones: MilestoneAttributionRow[],
): boolean {
  if (owner.exitYear === null || owner.exitYear === undefined) return true;
  return milestones.some(
    (milestone) =>
      yearsIn(milestone.date).includes(owner.exitYear!) &&
      milestoneSupportsOwnerExit(milestone, owner),
  );
}
