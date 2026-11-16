import { z } from "zod";
import {
  extractionSchema,
  screeningSchema,
  type Evidence,
  type ExtractedClaim,
  type GroundedClaim,
  type GroundedEvidence,
  type Screening,
  type SourceSection,
  type StoryClassification,
  type StoryExtraction,
} from "./contracts";

const IDENTITY_SEPARATORS = new RegExp("[^\\p{L}\\p{N}]+", "gu");
const QUALIFIED = new Set([
  "DIRECT_EXPLICIT_STRATEGY",
  "DIRECT_TRADITIONAL_ASSET",
  "PORTFOLIO_LINEAGE_CONFIRMED",
  "PORTFOLIO_LINEAGE_INDICATED",
]);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TRADITIONAL_ASSET = /\b(?:power|renewables?|solar|wind|battery storage|electric grid|transmission|distribution network|utility|utilities|electricity|water|wastewater|fiber|fibre|data cent(?:er|re)|tower|terminal|rail|airport|ports?|toll roads?|midstream|pipeline|LNG|transportation|social infrastructure|hospitals?|healthcare facilities|public schools?|student housing)\b/i;
const INFRA_STRATEGY = /\binfra(?:structure)?\b|\benergy[- ]transition\b/i;
const OWNERSHIP = /\b(?:own\w*|acqui\w*|invest\w*|capitaliz\w*|backed|parent|portfolio)\b/i;

const FORMAL_EVENTS: Partial<Record<StoryExtraction["eventKind"], readonly StoryExtraction["transactionForm"][]>> = {
  SIGNING: ["ACQUISITION", "DIVESTITURE", "EQUITY_INVESTMENT", "JOINT_VENTURE"],
  CLOSING: ["ACQUISITION", "DIVESTITURE", "EQUITY_INVESTMENT", "JOINT_VENTURE"],
  PLATFORM_LAUNCH: ["PLATFORM_LAUNCH"],
  JOINT_VENTURE: ["JOINT_VENTURE"],
  EQUITY_INVESTMENT: ["EQUITY_INVESTMENT"],
  IPO_FIRST_TRADE: ["IPO"],
};

const MONEY_CONTEXT = {
  ENTERPRISE_VALUE: /\benterprise values?\b|\bEV\b/i,
  EQUITY_VALUE: /\bequity (?:values?|valuation)\b|\bvalue of (?:the )?(?:outstanding )?equity\b/i,
  FINANCING_AMOUNT: /\bfinanc\w+\b|\bcredit (?:facility|line)\b|\bdebt\b|\bloan\b|\bprivate placement\b|\bequity issuance\b|\bbond\b/i,
  CAPITAL_COMMITMENT: /\bcommit\w+\b|\bpledge\w*\b/i,
  STAKE_CONSIDERATION: /\bpurchase price\b.{0,95}\baggregate (?:amount|consideration)\b|\bconsideration\b|\bpurchase price\b|\b(?:purchase|acquire|sell|sold|buy|bought)\w*\b.{1,45}\bfor\b/i,
  PER_SHARE_CONSIDERATION: /\bper (?:(?:common|ordinary|purchased|preferred|issued|outstanding|registered|voting|non-voting|class [a-z]) )*shares?\b|\b(?:each|every)\b.{0,42}\bshare\b/i,
};

const MAGNITUDE_POWERS = new Map([
  ["thousand", 3], ["thousands", 3], ["k", 3],
  ["million", 6], ["millions", 6], ["mm", 6], ["mn", 6], ["m", 6],
  ["billion", 9], ["billions", 9], ["bn", 9], ["b", 9],
  ["trillion", 12], ["trillions", 12], ["tn", 12],
]);

export class EvidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceValidationError";
  }
}

export function normalizeIdentityText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(IDENTITY_SEPARATORS, " ")
    .trim();
}

export function containsIdentity(text: string, name: string): boolean {
  const normalizedName = normalizeIdentityText(name);
  return normalizedName.length > 0
    && ` ${normalizeIdentityText(text)} `.includes(` ${normalizedName} `);
}

export function validateScreening(screening: Screening, sections: readonly SourceSection[]): Screening {
  const { stories } = screeningSchema.parse(screening);
  const sectionIndex = new Set(sections.map((section) => section.index));
  const ordered = stories.toSorted((a, b) => a.startSection - b.startSection);
  let lastEnd = -1;
  for (const story of ordered) {
    if (story.startSection > story.endSection || story.startSection <= lastEnd
      || !sectionIndex.has(story.startSection) || !sectionIndex.has(story.endSection)) {
      throw new EvidenceValidationError("Story ranges must be disjoint and refer to retained source sections.");
    }
    const retained = sections.filter(({ index }) => index >= story.startSection && index <= story.endSection);
    if (retained.length !== story.endSection - story.startSection + 1) {
      throw new EvidenceValidationError("Story range contains a missing source section.");
    }
    lastEnd = story.endSection;
  }
  return { stories: ordered };
}

export function groundEvidence(
  evidence: Evidence,
  sections: readonly SourceSection[],
  sourceVersionId: string,
): GroundedEvidence {
  const text = sections.find((section) => section.index === evidence.section)?.text;
  const start = text?.indexOf(evidence.quote) ?? -1;
  if (!text || start < 0 || text.indexOf(evidence.quote, start + 1) !== -1) {
    throw new EvidenceValidationError("Evidence must match one verbatim passage in its source section.");
  }
  return { ...evidence, sourceVersionId, start, end: start + evidence.quote.length };
}

export function sourceContainsDate(quote: string, value: string): boolean {
  const [year, month, day] = value.split("-");
  const monthName = MONTHS[Number(month) - 1];
  if (!year || !monthName || !day) return false;
  const dayNumber = Number(day);
  const names = [monthName];
  if (monthName !== "May") names.push(monthName.slice(0, 3));
  if (monthName === "September") names.push("Sept");
  return [
    value,
    `${Number(month)}/${dayNumber}/${year}`,
    `${month}/${day}/${year}`,
    ...names.flatMap((name) => [
      `${name} ${dayNumber} ${year}`,
      `${dayNumber} ${name} ${year}`,
      `${name} ${day} ${year}`,
      `${day} ${name} ${year}`,
    ]),
  ].some((rendered) => containsIdentity(quote, rendered));
}

function normalizeDecimal(value: string): string {
  const [integer, fraction = ""] = value.split(".");
  const decimals = fraction.replace(/0+$/, "");
  return decimals ? `${integer}.${decimals}` : integer;
}

function quoteAmounts(text: string): string[] {
  return Array.from(text.matchAll(/\b([0-9][0-9,]*)(?:\.([0-9]+))?(?:\s*((?:thousands?|millions?|billions?|trillions?|mm|mn|bn|tn|[kmb]))\b)?/gi), (match) => {
    const [, rawInteger, fraction = "", magnitude] = match;
    const integer = rawInteger.replace(/,/g, "");
    const power = MAGNITUDE_POWERS.get(magnitude?.toLowerCase() ?? "") ?? 0;
    const digits = `${integer}${fraction}`.padEnd(integer.length + power, "0");
    const decimalIndex = integer.length + power;
    const whole = digits.slice(0, decimalIndex).replace(/^0+(?=\d)/, "");
    return normalizeDecimal(`${whole}.${digits.slice(decimalIndex)}`);
  });
}

const CURRENCY_MARKERS: Readonly<Record<string, RegExp>> = {
  USD: /(?:\bUSD\b|\bU\.?S\.?\$)/i,
  CAD: /(?:\bCAD\b|\bC\$)/i,
  AUD: /(?:\bAUD\b|\bA\$)/i,
  NZD: /(?:\bNZD\b|\bNZ\$)/i,
  HKD: /(?:\bHKD\b|\bHK\$)/i,
  EUR: /(?:\bEUR\b|€)/i,
  GBP: /(?:\bGBP\b|£)/i,
  JPY: /(?:\bJPY\b|\bJapanese yen\b)/i,
  CNY: /(?:\bCNY\b|\bRMB\b|\byuan\b)/i,
};

type QuoteSpan = { start: number; end: number };

function spanDistance(a: QuoteSpan, b: QuoteSpan): number {
  return Math.max(0, a.start - b.end, b.start - a.end);
}

function basisDistance(quote: string, value: string, basis: RegExp, quotedAmounts: readonly QuoteSpan[]): number {
  const start = quote.indexOf(value);
  const selected = { start, end: start + value.length };
  let distance = Infinity;
  for (const match of quote.matchAll(new RegExp(basis.source, "gi"))) {
    const aggregate = basis === MONEY_CONTEXT.STAKE_CONSIDERATION
      ? /\baggregate (?:amount|consideration)\b/i.exec(match[0]) : null;
    const cue = { start: match.index + (aggregate?.index ?? 0), end: match.index + match[0].length };
    const selectedDistance = spanDistance(selected, cue);
    // A per-share label belongs with its own amount when the quote also gives
    // aggregate consideration or another monetary figure.
    if (basis === MONEY_CONTEXT.PER_SHARE_CONSIDERATION && quotedAmounts.some((amount) =>
      spanDistance(amount, cue) < selectedDistance && (amount.end <= selected.start || amount.start >= selected.end),
    )) continue;
    distance = Math.min(distance, selectedDistance);
  }
  return distance;
}

function validateClaimValue(claim: ExtractedClaim): void {
  const { kind, value, amount, currency, evidence: { quote } } = claim;
  if (kind === "OCCURRENCE_DATE" || kind === "FIRST_DISCLOSURE_DATE") {
    if (!z.iso.date().safeParse(value).success || !sourceContainsDate(quote, value)) {
      throw new EvidenceValidationError("A structured date is absent from its source passage.");
    }
  } else if (!quote.includes(value)) {
    throw new EvidenceValidationError("A material claim value is absent from its source passage.");
  }

  const monetary = MONEY_CONTEXT[kind as keyof typeof MONEY_CONTEXT];
  if (!monetary) {
    if (amount !== null || currency !== null) {
      throw new EvidenceValidationError("Only monetary claim categories may supply an amount or currency.");
    }
    return;
  }

  const numberText = quoteAmounts(value);
  const quotedAmounts = Array.from(
    quote.matchAll(/(?:[$€£¥]|\b[A-Z]{3}\s)\s*\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:thousands?|millions?|billions?|trillions?|mm|mn|bn|tn|[kmb])\b)?/g),
    ({ 0: text, index }) => ({ start: index, end: index + text.length }),
  );
  const distance = basisDistance(quote, value, monetary, quotedAmounts);
  if (!numberText.length || !Number.isFinite(distance)) {
    throw new EvidenceValidationError("The source passage needs the monetary value and its basis.");
  }
  if (quotedAmounts.length > 1 || kind === "STAKE_CONSIDERATION") {
    const competing = Object.entries(MONEY_CONTEXT).some(([otherKind, basis]) =>
      otherKind !== kind
        && !(kind === "PER_SHARE_CONSIDERATION" && otherKind === "STAKE_CONSIDERATION")
        && basisDistance(quote, value, basis, quotedAmounts) < distance,
    );
    if (competing) {
      throw new EvidenceValidationError("Use the part of the source passage that pairs the amount with its basis.");
    }
  }
  if (amount !== null && !numberText.includes(normalizeDecimal(amount))) {
    throw new EvidenceValidationError("The normalized amount does not match the source amount.");
  }
  if (currency !== null && !(CURRENCY_MARKERS[currency]?.test(quote) ?? containsIdentity(quote, currency))) {
    throw new EvidenceValidationError("The stated currency is absent from its source passage.");
  }
}

const FUND_DESCRIPTION = /^(?:an?|the|its) (?:(?:closed-end|open-end|evergreen|infrastructure|investment|private equity|private credit|energy transition|global|dedicated|listed) ){0,4}fund\b(?! (?:manager|advis(?:er|or)|services|administrator))/i;
const FUND_ROLE_BEFORE = /\b(?:the (?:buyer|acquirer|investor|purchaser) (?:is|was)|(?:acquired|purchased|bought) by|(?:invest(?:ed|s)?|commit(?:ted|s))\b.{0,65}\b(?:by|from|to))\s*$/i;
const FUND_ACTION = /\b(?:acquire[sd]?|purchase[sd]?|buy[s]?|bought|invest(?:s|ed|ing)?|commit(?:s|ted)? equity|provide[sd]? equity)\b/i;
const FUND_ROLE_AFTER = new RegExp(`^\\s*,?\\s*(?:(?:has|had|will)\\s+)?(?:(?:agreed to|is set to|entered into an agreement to)\\s+)?${FUND_ACTION.source}`, "i");

function supportsFundVehicle({ value, evidence: { quote } }: GroundedClaim): boolean {
  const start = quote.indexOf(value);
  const before = quote.slice(0, start);
  const after = quote.slice(start + value.length);
  const beforeLabel = /(?:\b(?:an?|the|its) (?:[\w-]+ ){0,4}fund(?: known as| named| called)?)[ ,:“"(]*$/i.test(before);
  const afterDescription = /^\s*[,(:–—]\s*([^,);]{1,110})[,);]/.exec(after);
  const afterLabel = afterDescription && FUND_DESCRIPTION.test(afterDescription[1]);
  const vehicleNamed = /\bfund\b(?! (?:manager|advis(?:er|or)|services|administrator))/i.test(value) || beforeLabel || afterLabel;
  if (!vehicleNamed) return false;

  const afterName = afterLabel ? after.slice(afterDescription[0].length) : after;
  return FUND_ROLE_BEFORE.test(before)
    || FUND_ROLE_AFTER.test(afterName)
    || (/\b(?:through|via|on behalf of)(?: its| the)?\s*$/i.test(before) && FUND_ACTION.test(quote));
}

export function groundExtraction(
  input: StoryExtraction,
  storySections: readonly SourceSection[],
  sourceVersionId: string,
  options: { officialDisclosure?: boolean } = {},
): { extraction: StoryExtraction; claims: GroundedClaim[] } {
  const extraction = extractionSchema.parse(input);
  if (new Set(extraction.claims.map(({ key }) => key)).size !== extraction.claims.length
    || new Set(extraction.entities.map(({ key }) => key)).size !== extraction.entities.length) {
    throw new EvidenceValidationError("Claim and entity keys must be unique within a story.");
  }
  const qualification = extraction.qualification;
  if (qualification.evidence) groundEvidence(qualification.evidence, storySections, sourceVersionId);
  const qualificationQuote = qualification.evidence?.quote ?? "";
  const evidenceFitsQualification =
    qualification.kind === "DIRECT_EXPLICIT_STRATEGY" ? INFRA_STRATEGY.test(qualificationQuote)
      : qualification.kind === "DIRECT_TRADITIONAL_ASSET" ? TRADITIONAL_ASSET.test(qualificationQuote)
        : qualification.kind === "PORTFOLIO_LINEAGE_CONFIRMED" || qualification.kind === "PORTFOLIO_LINEAGE_INDICATED"
          ? INFRA_STRATEGY.test(qualificationQuote) && OWNERSHIP.test(qualificationQuote) : true;
  if (!evidenceFitsQualification) {
    throw new EvidenceValidationError("Qualification evidence needs an infrastructure strategy, traditional asset, or ownership lineage.");
  }

  const evidencedFunds = new Set<string>();
  const claims = extraction.claims.map((claim): GroundedClaim => {
    validateClaimValue(claim);
    const grounded = {
      ...claim,
      attribution: options.officialDisclosure ? claim.attribution : "REPORTED" as const,
      evidence: groundEvidence(claim.evidence, storySections, sourceVersionId),
    };
    if (grounded.kind !== "FUND_VEHICLE") return grounded;
    if (!supportsFundVehicle(grounded)) return { ...grounded, kind: "ENTITY_ROLE" };
    evidencedFunds.add(normalizeIdentityText(grounded.value));
    return grounded;
  });
  for (const [kind, value] of [
    ["OCCURRENCE_DATE", extraction.occurredOn],
    ["FIRST_DISCLOSURE_DATE", extraction.firstDisclosedOn],
  ] as const) {
    if (value && !claims.some((claim) => claim.kind === kind && claim.value === value)) {
      throw new EvidenceValidationError("Each asserted event date needs a corresponding sourced claim.");
    }
  }
  for (const entity of extraction.entities) {
    groundEvidence(entity.evidence, storySections, sourceVersionId);
    if (!containsIdentity(entity.evidence.quote, entity.label)) {
      throw new EvidenceValidationError("A stated entity is absent from its source passage.");
    }
  }

  const mentionsFund = extraction.fundDisclosure !== "NOT_APPLICABLE"
    || extraction.claims.some(({ kind }) => kind === "FUND_VEHICLE")
    || extraction.entities.some(({ kind }) => kind === "FUND");
  return {
    extraction: {
      ...extraction,
      fundDisclosure: evidencedFunds.size ? "NAMED" : mentionsFund ? "UNDISCLOSED" : "NOT_APPLICABLE",
      entities: extraction.entities.filter(({ kind, label }) =>
        kind !== "FUND" || evidencedFunds.has(normalizeIdentityText(label)),
      ),
      claims: claims.map(({ evidence: { section, quote }, ...claim }) => ({
        ...claim,
        evidence: { section, quote },
      })),
    },
    claims,
  };
}

function evaluateDealEligibility(
  story: StoryExtraction,
  evidenceStatus: StoryClassification["evidenceStatus"],
): { eligibility: StoryClassification["dealEligibility"]; reason: string } {
  const forms = FORMAL_EVENTS[story.eventKind];
  if (!forms || story.novelty === "FOLLOW_UP" || story.novelty === "RECAP") {
    return { eligibility: "INELIGIBLE", reason: "This development does not represent a new formal transaction disclosure." };
  }
  if (story.transactionForm !== "UNKNOWN" && !forms.includes(story.transactionForm)) {
    return { eligibility: "INELIGIBLE", reason: "The transaction type falls outside the infrastructure equity protocol." };
  }
  if (story.qualification.kind === "DOES_NOT_QUALIFY" || story.qualification.kind === "NOT_APPLICABLE") {
    return { eligibility: "INELIGIBLE", reason: "The transaction fails the direct strategy or ownership lineage qualification." };
  }
  const countingDate = story.eventKind === "IPO_FIRST_TRADE" ? story.occurredOn : story.firstDisclosedOn;
  if (story.novelty !== "FIRST_FORMAL_DISCLOSURE" || !countingDate || story.transactionForm === "UNKNOWN"
    || evidenceStatus !== "DISCLOSED" || !QUALIFIED.has(story.qualification.kind)) {
    return { eligibility: "UNRESOLVED", reason: "Confirm first public disclosure, transaction form, and infrastructure qualification." };
  }
  return {
    eligibility: "ELIGIBLE",
    reason: story.qualification.kind === "PORTFOLIO_LINEAGE_INDICATED"
      ? "Official evidence indicates infrastructure lineage. Retain the documented uncertainty for review."
      : "The evidence supports a qualifying first formal transaction disclosure.",
  };
}

export function classifyStory(
  extraction: StoryExtraction,
  sourceAllowsPublic: boolean,
): StoryClassification {
  const coreClaims = extraction.claims.filter(({ kind }) => kind === "EVENT");
  const evidenceStatus: StoryClassification["evidenceStatus"] = coreClaims.some(({ attribution }) => attribution === "DISCLOSED")
    ? "DISCLOSED" : coreClaims.length ? "REPORTED" : "INSUFFICIENT";
  const { eligibility, reason } = evaluateDealEligibility(extraction, evidenceStatus);
  const canReviewForPublication = sourceAllowsPublic
    && extraction.relevance !== "IRRELEVANT"
    && evidenceStatus !== "INSUFFICIENT"
    && extraction.novelty !== "RECAP";
  return {
    relevance: extraction.relevance,
    qualification: extraction.qualification.kind,
    evidenceStatus,
    dealEligibility: eligibility,
    publicationEligibility: canReviewForPublication ? "READY_FOR_REVIEW" : "BLOCKED",
    reason,
  };
}
