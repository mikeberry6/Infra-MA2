import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { funds } from "../prisma/seed-data/funds.ts";
import { formatSafeErrorSummary } from "../src/lib/safe-error.ts";

const EMAIL_DIRECTORY = join(process.cwd(), "public", "email-format");
const DATED_ISSUE = /^\d{4}-\d{2}-\d{2}\.html$/;
const SECTOR_TIE_BREAK = [
  "Power & ET",
  "Digital",
  "Transportation",
  "Utilities",
  "Midstream",
  "Social Infra",
] as const;
const KNOWN_SECTORS = new Set<string>(SECTOR_TIE_BREAK);
const DEFAULT_LINK_TIMEOUT_MS = 5_000;
const DEFAULT_LINK_BUDGET_MS = 30_000;
const DEFAULT_MAX_LINKS = 80;
const MAX_LINK_CONCURRENCY = 4;
const SCALE_METADATA_CUTOVER = "2026-07-24";
const EDITORIAL_CONTRACT_CUTOVER = "2026-07-24";
const CONTROLLED_TRANSACTION_LABELS = new Set([
  "Buyout",
  "Minority Stake",
  "Majority Stake",
  "Joint Venture",
  "Platform Launch",
  "Bolt-On",
  "Portfolio Company Acquisition",
  "Portfolio Company Divestiture",
  "Primary Capital Raise",
  "Sale",
  "Co-Investment",
]);
const US_THEME_CATEGORIES = [
  "operating-asset",
  "platform",
  "portfolio-company",
] as const;
const EDITORIAL_FUND_MANAGER_ALIASES = [
  "ADIA",
  "Allianz",
  "Antin",
  "CBRE IM",
  "CIP",
  "ECP",
  "EIG",
  "EQT",
  "GIP",
  "GSAM",
  "IFM",
  "Igneo",
  "PSP Investments",
  "Swiss Life AM",
  "IMCO",
  "MEAG",
];

type Severity = "error" | "warning";
type ScaleKind = "economic" | "physical" | "undisclosed";
type UsThemeCategory = (typeof US_THEME_CATEGORIES)[number];
type UsClassification = "us" | "non-us" | "ambiguous" | "conflict";

export type ValidationFinding = {
  severity: Severity;
  code: string;
  message: string;
};

export type StaticCoverageDeal = {
  id?: string;
  target: string;
  sector?: string;
  country?: string;
  sourceUrl?: string;
};

export type WeeklyEmailValidationReport = {
  issue: string;
  status: "valid" | "invalid";
  exitCode: 0 | 1;
  summary: {
    deals: number;
    sectors: number;
    sources: number;
    staticCoverageMatched: number;
    contrastTextRunsChecked: number;
    linksRequested: number;
    linksSkipped: number;
  };
  findings: ValidationFinding[];
};

type Card = {
  sector: string;
  title: string;
  target: string;
  metadata: string;
  overview: string;
  sourceUrl: string;
  sourceCount: number;
  scale: ScaleMetric;
  usThemeCategory?: string;
  usThemePriority?: number;
  hasUsThemeCategory: boolean;
  hasUsThemePriority: boolean;
};

type SectorSection = {
  label: string;
  count: number;
  cards: Card[];
};

type ScaleMetric = {
  kind: ScaleKind;
  value?: number;
  unit?: string;
  rank?: number;
  explicit: boolean;
  evidence?: string;
};

type LinkCheckOptions = {
  enabled: boolean;
  timeoutMs: number;
  budgetMs: number;
  maxLinks: number;
  fetchImpl?: typeof fetch;
};

type LinkCandidate = {
  url: string;
  isSource: boolean;
};

export type ValidateWeeklyEmailOptions = {
  issuePath: string;
  html?: string;
  coverageDeals?: StaticCoverageDeal[];
  requireStaticCoverage?: boolean;
  requireScaleMetadata?: boolean;
  requireEditorialContract?: boolean;
  linkCheck?: Partial<LinkCheckOptions> & { enabled?: boolean };
};

type ParsedArguments = {
  issuePath: string;
  checkLinks: boolean;
  staticCoverage: boolean;
  coverageFile?: string;
  linkTimeoutMs: number;
  linkBudgetMs: number;
  maxLinks: number;
};

function decodeHtml(value: string): string {
  const document = new JSDOM(`<!doctype html><body>${value}</body>`).window.document;
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTarget(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeFundIdentity(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const RECOGNIZED_FUND_IDENTITIES = new Set(
  [
    ...funds.flatMap((fund) => [fund.managerName, fund.fundName]),
    ...EDITORIAL_FUND_MANAGER_ALIASES,
  ].map(normalizeFundIdentity),
);

function isRecognizedFundIdentity(value: string): boolean {
  const normalized = normalizeFundIdentity(value);
  if (!normalized) return false;
  if (RECOGNIZED_FUND_IDENTITIES.has(normalized)) return true;
  const identities = value.split(/\s+\/\s+/).map(normalizeFundIdentity).filter(Boolean);
  return identities.length > 1 && identities.every((identity) => RECOGNIZED_FUND_IDENTITIES.has(identity));
}

function targetsMatch(left: string, right: string): boolean {
  const a = normalizeTarget(left);
  const b = normalizeTarget(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.length >= 5 && longer.includes(shorter);
}

function normalizeSourceUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    return decodeURI(url.toString()).replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().replace(/\/$/, "").toLowerCase();
  }
}

type CoverageMatches = {
  dealByCard: Map<Card, StaticCoverageDeal>;
  cardByDeal: Map<StaticCoverageDeal, Card>;
};

function matchCardsToCoverageDeals(
  cards: Card[],
  coverageDeals: StaticCoverageDeal[] | undefined,
): CoverageMatches {
  const dealByCard = new Map<Card, StaticCoverageDeal>();
  const cardByDeal = new Map<StaticCoverageDeal, Card>();
  if (!coverageDeals) return { dealByCard, cardByDeal };

  const assignMutuallyUniqueTargetMatches = (exact: boolean) => {
    let assigned = true;
    while (assigned) {
      assigned = false;
      const candidates = cards
        .filter((card) => !dealByCard.has(card))
        .map((card) => {
          const normalizedCardTarget = normalizeTarget(card.target);
          const deals = coverageDeals.filter((deal) => {
            if (cardByDeal.has(deal) || (deal.sector && deal.sector !== card.sector)) return false;
            const normalizedDealTarget = normalizeTarget(deal.target);
            return exact
              ? normalizedCardTarget === normalizedDealTarget
              : normalizedCardTarget !== normalizedDealTarget && targetsMatch(card.target, deal.target);
          });
          return { card, deals };
        });
      const reverseCounts = new Map<StaticCoverageDeal, number>();
      candidates.forEach(({ deals }) => {
        deals.forEach((deal) => reverseCounts.set(deal, (reverseCounts.get(deal) ?? 0) + 1));
      });
      candidates.forEach(({ card, deals }) => {
        if (
          dealByCard.has(card) ||
          deals.length !== 1 ||
          reverseCounts.get(deals[0]) !== 1
        ) {
          return;
        }
        dealByCard.set(card, deals[0]);
        cardByDeal.set(deals[0], card);
        assigned = true;
      });
    }
  };

  // Exact target/sector identity is authoritative. Conservative fuzzy matching
  // is only attempted for still-unmatched records and must be unambiguous in
  // both directions so one email card can never satisfy two coverage rows.
  assignMutuallyUniqueTargetMatches(true);
  assignMutuallyUniqueTargetMatches(false);

  const unmatchedCards = cards.filter((card) => !dealByCard.has(card));
  const unmatchedDeals = coverageDeals.filter((deal) => !cardByDeal.has(deal));
  const cardsBySource = new Map<string, Card[]>();
  unmatchedCards.forEach((card) => {
    const source = normalizeSourceUrl(card.sourceUrl);
    if (!source) return;
    cardsBySource.set(source, [...(cardsBySource.get(source) ?? []), card]);
  });
  const dealsBySource = new Map<string, StaticCoverageDeal[]>();
  unmatchedDeals.forEach((deal) => {
    const source = normalizeSourceUrl(deal.sourceUrl ?? "");
    if (!source) return;
    dealsBySource.set(source, [...(dealsBySource.get(source) ?? []), deal]);
  });
  cardsBySource.forEach((sourceCards, source) => {
    const sourceDeals = dealsBySource.get(source) ?? [];
    if (sourceCards.length !== 1 || sourceDeals.length !== 1) return;
    if (sourceDeals[0].sector && sourceDeals[0].sector !== sourceCards[0].sector) return;
    dealByCard.set(sourceCards[0], sourceDeals[0]);
    cardByDeal.set(sourceDeals[0], sourceCards[0]);
  });

  return { dealByCard, cardByDeal };
}

function stripNegatedUsReferences(value: string): string {
  return normalizeText(value)
    .replace(
      /\b(?:outside(?:\s+of)?|excluding|except(?:\s+for)?|other\s+than|not\s+in)\s+(?:the\s+)?United States(?:\s+of America)?\b/gi,
      " ",
    )
    .replace(
      /\b(?:outside(?:\s+of)?|excluding|except(?:\s+for)?|other\s+than|not\s+in)\s+(?:the\s+)?U\.?S\.?(?:A\.?)?(?=$|[^a-zA-Z$])/gi,
      " ",
    )
    .replace(
      /\b(?:non|ex)[\-\u2010-\u2015\u2212\s]?(?:United States(?:\s+of America)?|U\.?S\.?(?:A\.?)?)(?=$|[^a-zA-Z$])/gi,
      " ",
    );
}

function hasNegatedUsReference(value: string): boolean {
  const text = normalizeText(value);
  return stripNegatedUsReferences(text) !== text;
}

function hasExplicitUsReference(value: string): boolean {
  const text = stripNegatedUsReferences(value)
    .replace(
      /\b(?:United States(?:\s+of America)?|U\.?S\.?(?:A\.?)?)[\-\u2010-\u2015\u2212\s]*(?:dollars?(?:[\-\u2010-\u2015\u2212\s]+denominated)?\b|\$\s*(?=[\d,.]))/gi,
      " ",
    )
    .replace(
      /\b(?:United States(?:\s+of America)?|U\.?S\.?(?:A\.?)?)[\-\u2010-\u2015\u2212\s]+(?:(?:based|headquartered|domiciled)[\-\u2010-\u2015\u2212\s]+)?(?:[a-z]+\s+){0,3}(?:sponsor|fund|manager|investor|buyer|seller|acquirer|firm|company|operator|developer|owner)\b/gi,
      " ",
    )
    .replace(
      /\b(?:[a-z]+\s+){0,3}(?:sponsor|fund|manager|investor|buyer|seller|acquirer|firm|company|operator|developer|owner)\s+(?:based|headquartered|domiciled)\s+in\s+(?:the\s+)?(?:United States(?:\s+of America)?|U\.?S\.?(?:A\.?)?)(?=$|[^a-zA-Z$])/gi,
      " ",
    );
  if (/\bUnited States(?: of America)?\b/i.test(text)) return true;
  // Keep bare abbreviations case-sensitive so normal prose such as “help us”
  // is not treated as a country reference. Exclude US$ currency notation.
  return /(?:^|[^a-zA-Z$])U\.?S\.?(?:A\.?)?(?=$|[^a-zA-Z$])/.test(text);
}

function isUsCountry(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return normalized === "us" ||
    normalized === "usa" ||
    normalized === "unitedstates" ||
    normalized === "unitedstatesofamerica";
}

function isNonSpecificCoverageCountry(value: string): boolean {
  const locations = value
    .split(/\s*(?:\/|,|;|\||&|\band\b)\s*/i)
    .map(normalizeTarget)
    .filter(Boolean);
  return locations.length > 0 && locations.every((location) =>
    /^(?:north america|americas|global|worldwide|multiple(?: countries| markets)?|various(?: countries| markets)?)$/.test(location)
  );
}

function classifyUsCard(
  card: Card,
  coverageDeal: StaticCoverageDeal | undefined,
): UsClassification {
  const coverageCountry = coverageDeal?.country;
  const metadataLocation = card.metadata.split("·").at(-1) ?? "";
  const hasCardUsEvidence =
    hasExplicitUsReference(metadataLocation) || hasExplicitUsReference(card.overview);
  if (coverageCountry) {
    if (isUsCountry(coverageCountry) || hasExplicitUsReference(coverageCountry)) return "us";
    if (!isNonSpecificCoverageCountry(coverageCountry)) {
      return hasCardUsEvidence ? "conflict" : "non-us";
    }
  }
  if (hasCardUsEvidence) return "us";
  if (coverageDeal && (!coverageCountry || isNonSpecificCoverageCountry(coverageCountry))) {
    if (
      normalizeText(metadataLocation) &&
      !isNonSpecificCoverageCountry(metadataLocation) &&
      !hasNegatedUsReference(metadataLocation)
    ) {
      return "non-us";
    }
    return "ambiguous";
  }
  return "non-us";
}

function addFinding(
  findings: ValidationFinding[],
  severity: Severity,
  code: string,
  message: string,
) {
  findings.push({ severity, code, message });
}

function canonicalSector(value: string): string {
  const normalized = decodeHtml(value)
    .replace(/^=+|=+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return SECTOR_TIE_BREAK.find((sector) => sector.toLowerCase() === normalized) ?? decodeHtml(value).trim();
}

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function economicMetric(text: string): ScaleMetric | undefined {
  const match = text.match(
    /(?:US\$|A\$|C\$|NZ\$|USD|EUR|GBP|€|£|\$)\s*([\d,.]+)\s*(billion|million|bn|mn|m|b)\b/i,
  );
  if (!match) return undefined;
  const rawValue = parseNumber(match[1]);
  if (rawValue === undefined) return undefined;
  const multiplier = /^(billion|bn|b)$/i.test(match[2]) ? 1_000 : 1;
  const currencyToken = match[0].slice(0, match[0].indexOf(match[1])).trim().toUpperCase();
  const currency = currencyToken.includes("€") || currencyToken.includes("EUR")
    ? "EUR-mm"
    : currencyToken.includes("£") || currencyToken.includes("GBP")
      ? "GBP-mm"
      : currencyToken.includes("A$")
        ? "AUD-mm"
        : currencyToken.includes("C$")
          ? "CAD-mm"
          : currencyToken.includes("NZ$")
            ? "NZD-mm"
            : "USD-mm";
  return {
    kind: "economic",
    value: rawValue * multiplier,
    unit: currency,
    explicit: false,
    evidence: match[0],
  };
}

const PHYSICAL_UNIT_FACTORS: Record<string, { unit: string; multiplier: number }> = {
  gw: { unit: "MW", multiplier: 1_000 },
  gwp: { unit: "MW", multiplier: 1_000 },
  mw: { unit: "MW", multiplier: 1 },
  mwp: { unit: "MW", multiplier: 1 },
  gwh: { unit: "MWh", multiplier: 1_000 },
  mwh: { unit: "MWh", multiplier: 1 },
  km: { unit: "km", multiplier: 1 },
  kilometers: { unit: "km", multiplier: 1 },
  miles: { unit: "miles", multiplier: 1 },
  sites: { unit: "sites", multiplier: 1 },
  facilities: { unit: "facilities", multiplier: 1 },
  projects: { unit: "projects", multiplier: 1 },
  assets: { unit: "assets", multiplier: 1 },
  vehicles: { unit: "vehicles", multiplier: 1 },
  customers: { unit: "customers", multiplier: 1 },
};

function physicalMetric(text: string): ScaleMetric | undefined {
  const matches = Array.from(
    text.matchAll(
      /\b([\d,.]+)\s*(GWp?|MWp?|GWh|MWh|km|kilometers|miles|sites|facilities|projects|assets|vehicles|customers)\b/gi,
    ),
  );
  const metrics = matches.flatMap((match) => {
    const rawValue = parseNumber(match[1]);
    const conversion = PHYSICAL_UNIT_FACTORS[match[2].toLowerCase()];
    if (rawValue === undefined || !conversion) return [];
    return [{
      kind: "physical" as const,
      value: rawValue * conversion.multiplier,
      unit: conversion.unit,
      explicit: false,
      evidence: match[0],
    }];
  });
  if (metrics.length === 0) return undefined;
  return metrics.reduce((largest, metric) => metric.value > largest.value ? metric : largest);
}

function inferScaleMetric(overview: string): ScaleMetric {
  return economicMetric(overview) ?? physicalMetric(overview) ?? {
    kind: "undisclosed",
    explicit: false,
    evidence: "no comparable economic or physical quantum detected",
  };
}

function explicitScaleMetric(element: Element | null): ScaleMetric | undefined {
  const host = element?.closest("[data-scale-kind]");
  if (!host) return undefined;
  const kind = host.getAttribute("data-scale-kind")?.toLowerCase();
  if (kind !== "economic" && kind !== "physical" && kind !== "undisclosed") {
    return { kind: "undisclosed", explicit: true, evidence: `invalid kind ${kind ?? "(missing)"}` };
  }
  return {
    kind,
    value: parseNumber(host.getAttribute("data-scale-value")),
    unit: normalizeText(host.getAttribute("data-scale-unit")) || undefined,
    rank: parseNumber(host.getAttribute("data-scale-rank")),
    explicit: true,
    evidence: normalizeText(host.getAttribute("data-scale-note")) || undefined,
  };
}

function parseCard(table: HTMLTableElement, sector: string): Card {
  const rows = Array.from(table.rows);
  const rowText = rows.map((row) => normalizeText(row.cells.item(0)?.textContent));
  const title = rowText[0] ?? "";
  const metadata = rowText[1] ?? "";
  const overview = rowText[2] ?? "";
  const target = title.split("|")[0]?.trim() ?? "";
  const sourceAnchors = Array.from(table.querySelectorAll<HTMLAnchorElement>("a"))
    .filter((anchor) => normalizeText(anchor.textContent).toLowerCase() === "source");
  return {
    sector,
    title,
    target,
    metadata,
    overview,
    sourceUrl: sourceAnchors[0]?.getAttribute("href")?.trim() ?? "",
    sourceCount: sourceAnchors.length,
    scale: explicitScaleMetric(table) ?? inferScaleMetric(overview),
    usThemeCategory: normalizeText(table.getAttribute("data-us-theme-category")).toLowerCase() || undefined,
    usThemePriority: parseNumber(table.getAttribute("data-us-theme-priority")),
    hasUsThemeCategory: table.hasAttribute("data-us-theme-category"),
    hasUsThemePriority: table.hasAttribute("data-us-theme-priority"),
  };
}

function parseSections(document: Document, findings: ValidationFinding[]): SectorSection[] {
  const sections: SectorSection[] = [];
  let activeSection: SectorSection | undefined;
  const walker = document.createTreeWalker(document, document.defaultView?.NodeFilter.SHOW_ALL ?? 0xffffffff);
  let node: Node | null = walker.currentNode;

  while (node) {
    if (node.nodeType === node.COMMENT_NODE) {
      const match = node.nodeValue?.match(/(?:=+\s*)?(.+?)\s*\((\d+)\s+Deals?\)\s*(?:=+)?/i);
      if (match) {
        const label = canonicalSector(match[1]);
        if (KNOWN_SECTORS.has(label)) {
          activeSection = { label, count: Number(match[2]), cards: [] };
          sections.push(activeSection);
        }
      } else if (/\b(?:YTD|FOOTER|PREVIOUS EDITIONS)\b/i.test(node.nodeValue ?? "")) {
        activeSection = undefined;
      }
    }

    if (
      node.nodeType === node.ELEMENT_NODE &&
      (node as Element).tagName === "TABLE" &&
      activeSection
    ) {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.rows);
      const firstCell = rows[0]?.cells.item(0);
      const title = normalizeText(firstCell?.textContent);
      if (rows.length >= 3 && firstCell && !firstCell.querySelector("table") && title.includes("|")) {
        activeSection.cards.push(parseCard(table, activeSection.label));
      }
    }
    node = walker.nextNode();
  }

  return sections;
}

function validateSectorOrder(sections: SectorSection[], findings: ValidationFinding[]) {
  if (sections.length === 0) {
    addFinding(findings, "error", "missing-sectors", "No active sector sections were found.");
    return;
  }
  const seen = new Set<string>();
  sections.forEach((section, index) => {
    if (seen.has(section.label)) {
      addFinding(findings, "error", "duplicate-sector", `${section.label} appears more than once.`);
    }
    seen.add(section.label);
    if (section.count <= 0) {
      addFinding(findings, "error", "zero-deal-sector", `${section.label} is a zero-deal section and must be omitted.`);
    }
    if (section.cards.length !== section.count) {
      addFinding(
        findings,
        "error",
        "sector-count",
        `${section.label} declares ${section.count} deal(s) but contains ${section.cards.length} complete Source-linked card(s).`,
      );
    }
    if (index === 0) return;
    const prior = sections[index - 1];
    if (section.count > prior.count) {
      addFinding(
        findings,
        "error",
        "sector-order",
        `${section.label} (${section.count}) appears after ${prior.label} (${prior.count}).`,
      );
    } else if (
      section.count === prior.count &&
      SECTOR_TIE_BREAK.indexOf(section.label as (typeof SECTOR_TIE_BREAK)[number]) <
        SECTOR_TIE_BREAK.indexOf(prior.label as (typeof SECTOR_TIE_BREAK)[number])
    ) {
      addFinding(
        findings,
        "error",
        "sector-tie-break",
        `${prior.label} / ${section.label} violates the fixed sector tie-break order.`,
      );
    }
  });
}

function validateCardStructure(
  cards: Card[],
  findings: ValidationFinding[],
  requireEditorialContract: boolean,
) {
  cards.forEach((card, index) => {
    const label = `${card.sector} card ${index + 1}`;
    const titleParts = card.title.split("|").map((part) => part.trim());
    if (titleParts.length !== 2 || titleParts.some((part) => !part)) {
      addFinding(findings, "error", "card-title", `${label} title must be “Target / Asset | fund manager”.`);
    } else if (requireEditorialContract && !isRecognizedFundIdentity(titleParts[1])) {
      addFinding(
        findings,
        "error",
        "card-title-fund",
        `${label} title suffix “${titleParts[1]}” is not a recognized infrastructure fund or fund manager.`,
      );
    }
    const metadataParts = card.metadata.split("·").map((part) => part.trim());
    const sponsorAndType = metadataParts[0]?.match(/^(.+?)\s+\(([^()]+)\)$/);
    if (metadataParts.length !== 3 || !sponsorAndType || metadataParts.some((part) => !part)) {
      addFinding(
        findings,
        "error",
        "card-metadata",
        `${label} metadata must be “Sponsor (transaction type) · subsector · region/country”.`,
      );
    }
    if (
      requireEditorialContract &&
      sponsorAndType &&
      !CONTROLLED_TRANSACTION_LABELS.has(sponsorAndType[2].trim())
    ) {
      addFinding(
        findings,
        "error",
        "transaction-label",
        `${label} uses unsupported transaction label “${sponsorAndType[2].trim()}”.`,
      );
    }
    if (!card.overview || card.overview.length < 40) {
      addFinding(findings, "error", "card-overview", `${label} needs a substantive overview paragraph.`);
    }
    if (card.sourceCount === 0 || !card.sourceUrl) {
      addFinding(findings, "error", "missing-source", `${label} is missing its Source URL.`);
    } else if (card.sourceCount > 1) {
      addFinding(findings, "error", "source-count", `${label} has ${card.sourceCount} links labelled Source; expected exactly one.`);
    } else {
      try {
        const url = new URL(card.sourceUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("unsupported protocol");
      } catch {
        addFinding(findings, "error", "invalid-source", `${label} has an invalid Source URL: ${card.sourceUrl}`);
      }
    }
  });
}

function collectHttpLinks(
  document: Document,
  cardSourceUrls: ReadonlySet<string>,
  findings: ValidationFinding[],
): LinkCandidate[] {
  const links = new Map<string, LinkCandidate>();
  Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).forEach((anchor) => {
    const rawHref = anchor.getAttribute("href")?.trim() ?? "";
    if (!/^https?:/i.test(rawHref)) return;
    const isSource = normalizeText(anchor.textContent).toLowerCase() === "source";
    try {
      const url = new URL(rawHref);
      if (url.protocol !== "https:" && url.protocol !== "http:") return;
      url.hash = "";
      const normalized = url.toString();
      const existing = links.get(normalized);
      links.set(normalized, {
        url: normalized,
        isSource: isSource || existing?.isSource === true,
      });
    } catch {
      if (!isSource || !cardSourceUrls.has(rawHref)) {
        addFinding(
          findings,
          "error",
          "invalid-link",
          `HTTP(S) anchor has an invalid URL: ${rawHref}`,
        );
      }
    }
  });
  return [...links.values()];
}

function scaleKindOrder(kind: ScaleKind): number {
  return kind === "economic" ? 0 : kind === "physical" ? 1 : 2;
}

function validateScaleOrder(
  section: SectorSection,
  findings: ValidationFinding[],
  requireScaleMetadata: boolean,
) {
  if (section.cards.length === 0) return;
  const explicitCount = section.cards.filter((card) => card.scale.explicit).length;
  const strict = explicitCount > 0;
  if (requireScaleMetadata && explicitCount !== section.cards.length) {
    addFinding(
      findings,
      "error",
      "missing-scale-metadata",
      `${section.label} must annotate every card with data-scale-kind and the applicable value/unit or rank.`,
    );
  } else if (strict && explicitCount !== section.cards.length) {
    addFinding(
      findings,
      "error",
      "partial-scale-metadata",
      `${section.label} mixes explicit and inferred scale metadata; annotate every card in the section.`,
    );
  } else if (!strict) {
    addFinding(
      findings,
      "warning",
      "inferred-scale",
      `${section.label} has no data-scale metadata; ordering was checked with a conservative text fallback.`,
    );
  }

  const ranks = section.cards.map((card) => card.scale.rank);
  if (ranks.some((rank) => rank !== undefined)) {
    if (ranks.some((rank) => rank === undefined) || new Set(ranks).size !== ranks.length) {
      addFinding(
        findings,
        "error",
        "scale-rank",
        `${section.label} data-scale-rank values must be present and unique for every card when used.`,
      );
    } else {
      ranks.forEach((rank, index) => {
        if (rank !== index + 1) {
          addFinding(
            findings,
            "error",
            "scale-rank-order",
            `${section.label} card ${index + 1} has data-scale-rank=${rank}; expected ${index + 1}.`,
          );
        }
      });
    }
  }

  section.cards.forEach((card, index) => {
    if (!card.scale.explicit) return;
    if (card.scale.kind !== "undisclosed" && (card.scale.value === undefined || !card.scale.unit)) {
      addFinding(
        findings,
        "error",
        "scale-metadata",
        `${section.label} card ${index + 1} needs non-negative data-scale-value and data-scale-unit.`,
      );
    }
    if (card.scale.kind === "undisclosed" && (card.scale.value !== undefined || card.scale.unit)) {
      addFinding(
        findings,
        "error",
        "scale-metadata",
        `${section.label} card ${index + 1} is undisclosed but includes a scale value or unit.`,
      );
    }
  });

  for (let index = 1; index < section.cards.length; index += 1) {
    const prior = section.cards[index - 1];
    const current = section.cards[index];
    const severity: Severity = strict ? "error" : "warning";
    if (scaleKindOrder(current.scale.kind) < scaleKindOrder(prior.scale.kind)) {
      addFinding(
        findings,
        severity,
        "scale-kind-order",
        `${section.label}: “${current.title}” has ${current.scale.kind} scale after “${prior.title}” (${prior.scale.kind}).`,
      );
      continue;
    }
    if (
      current.scale.kind === prior.scale.kind &&
      current.scale.kind !== "undisclosed" &&
      current.scale.unit === prior.scale.unit &&
      current.scale.value !== undefined &&
      prior.scale.value !== undefined &&
      current.scale.value > prior.scale.value
    ) {
      addFinding(
        findings,
        severity,
        "scale-value-order",
        `${section.label}: “${current.title}” (${current.scale.value} ${current.scale.unit}) is larger than the preceding “${prior.title}” (${prior.scale.value} ${prior.scale.unit}).`,
      );
    } else if (
      current.scale.kind === prior.scale.kind &&
      current.scale.kind !== "undisclosed" &&
      current.scale.unit !== prior.scale.unit &&
      current.scale.rank === undefined &&
      prior.scale.rank === undefined
    ) {
      addFinding(
        findings,
        "warning",
        "scale-incomparable",
        `${section.label}: “${prior.title}” and “${current.title}” use incomparable scale units; record data-scale-rank for the editorial judgment.`,
      );
    }
  }
}

function findYtdTable(document: Document, heading: string): HTMLTableElement | undefined {
  return Array.from(document.querySelectorAll("td"))
    .find((cell) => normalizeText(cell.textContent).toLowerCase() === heading.toLowerCase())
    ?.closest("table") ?? undefined;
}

function validateYtdTable(document: Document, heading: string, findings: ValidationFinding[]) {
  const table = findYtdTable(document, heading);
  if (!table) {
    addFinding(findings, "error", "missing-ytd-table", `${heading} is missing.`);
    return;
  }
  const rows = Array.from(table.rows).flatMap((row) => {
    if (row.cells.length !== 3) return [];
    const count = Number(normalizeText(row.cells.item(2)?.textContent).replace(/,/g, ""));
    const label = normalizeText(row.cells.item(0)?.textContent);
    const bar = row.cells.item(1)?.querySelector<HTMLElement>("td[bgcolor='#442142' i], td[style*='width']");
    const widthMatch = bar?.getAttribute("style")?.match(/width:\s*(\d+)%/i);
    if (!label || !Number.isFinite(count) || !widthMatch) return [];
    return [{ label, count, width: Number(widthMatch[1]) }];
  });
  if (rows.length < 2) {
    addFinding(findings, "error", "ytd-rows", `${heading} has fewer than two parseable rows.`);
    return;
  }
  const leader = rows[0].count;
  if (leader <= 0) {
    addFinding(findings, "error", "ytd-leader", `${heading} has a non-positive leading count.`);
    return;
  }
  rows.forEach((row, index) => {
    if (index > 0 && row.count > rows[index - 1].count) {
      addFinding(findings, "error", "ytd-order", `${heading} is not descending at ${row.label}.`);
    }
    const expectedWidth = Math.round(row.count / leader * 100);
    if (row.width !== expectedWidth) {
      addFinding(
        findings,
        "error",
        "ytd-width",
        `${heading} width for ${row.label} is ${row.width}%; expected ${expectedWidth}%.`,
      );
    }
  });
}

type Rgb = { r: number; g: number; b: number };

function parseColor(value: string | null | undefined): Rgb | undefined {
  const color = value?.trim();
  if (!color || color === "transparent") return undefined;
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? hex.split("").map((character) => character.repeat(2)).join("") : hex;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
    };
  }
  const rgb = color.match(/^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i);
  return rgb ? { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) } : undefined;
}

function relativeLuminance(color: Rgb): number {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(foreground: string, background: string): number | undefined {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return undefined;
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

function inheritedStyle(element: Element, property: "color" | "font-size" | "font-weight"): string | undefined {
  let current: Element | null = element;
  while (current) {
    const style = current.getAttribute("style") ?? "";
    const match = style.match(new RegExp(`${property}:\\s*([^;]+)`, "i"));
    if (match) return match[1].trim();
    current = current.parentElement;
  }
  return undefined;
}

function inheritedBackground(element: Element): string {
  let current: Element | null = element;
  while (current) {
    const style = current.getAttribute("style") ?? "";
    const match = style.match(/background(?:-color)?:\s*([^;]+)/i);
    const color = match?.[1].trim() || current.getAttribute("bgcolor") || undefined;
    if (parseColor(color)) return color as string;
    current = current.parentElement;
  }
  return "#FFFFFF";
}

function nearestReadableCopyRoot(element: Element, roots: Element[]): Element | undefined {
  return roots.find((root) => root === element || root.contains(element));
}

function isHidden(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    const style = current.getAttribute("style") ?? "";
    if (/display:\s*none/i.test(style) || /visibility:\s*hidden/i.test(style)) return true;
    current = current.parentElement;
  }
  return false;
}

function validateContrast(document: Document, findings: ValidationFinding[]): number {
  // Email HTML contains branding accents and hidden preheader text that are not
  // readable copy. Scope the release gate to the content called out by the
  // publishing contract: themes, deal cards, YTD tables, sources, and footer.
  const roots = new Set<Element>();
  document.querySelectorAll("a").forEach((anchor) => {
    const label = normalizeText(anchor.textContent).toLowerCase();
    if (label === "source") {
      const card = anchor.closest("table");
      if (card) roots.add(card);
    }
    if (anchor.getAttribute("href")?.startsWith("mailto:")) {
      const footer = anchor.closest("table");
      if (footer) roots.add(footer);
    }
  });
  const keyThemesLabel = Array.from(document.querySelectorAll("div, td"))
    .find((element) => normalizeText(element.textContent) === "KEY THEMES");
  const keyThemesRoot = keyThemesLabel?.closest("table");
  if (keyThemesRoot) roots.add(keyThemesRoot);
  const sectorYtd = findYtdTable(document, "Deal Count By Sector (YTD)");
  const regionYtd = findYtdTable(document, "Deal Count By Region (YTD)");
  if (sectorYtd) roots.add(sectorYtd);
  if (regionYtd) roots.add(regionYtd);

  const readableRoots = [...roots];
  const walker = document.createTreeWalker(document.body, document.defaultView?.NodeFilter.SHOW_TEXT ?? 4);
  let checked = 0;
  let node: Node | null = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const text = normalizeText(node.nodeValue);
    node = walker.nextNode();
    if (!parent || !text || ["STYLE", "SCRIPT", "TITLE"].includes(parent.tagName)) continue;
    if (!nearestReadableCopyRoot(parent, readableRoots) || isHidden(parent)) continue;
    if (!/[a-zA-Z0-9]/.test(text)) continue;
    if (text === "KEY THEMES") continue;
    const foreground = inheritedStyle(parent, "color");
    if (!foreground || !parseColor(foreground)) continue;
    const background = inheritedBackground(parent);
    const ratio = contrastRatio(foreground, background);
    if (ratio === undefined) continue;
    checked += 1;
    const size = Number.parseFloat(inheritedStyle(parent, "font-size") ?? "16");
    const weight = Number.parseInt(inheritedStyle(parent, "font-weight") ?? "400", 10);
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const minimum = isLarge ? 3 : 4.5;
    if (ratio + 0.01 < minimum) {
      const decorativeAccent = text.length <= 2 || (text.length <= 50 && text === text.toUpperCase());
      addFinding(
        findings,
        decorativeAccent ? "warning" : "error",
        "contrast",
        `“${text.slice(0, 70)}${text.length > 70 ? "…" : ""}” has ${ratio.toFixed(2)}:1 contrast (${foreground} on ${background}); WCAG AA requires ${minimum}:1.`,
      );
    }
  }
  return checked;
}

function keyThemeParagraphs(document: Document): string[] {
  const keyThemesLabel = Array.from(document.querySelectorAll("div, td"))
    .find((element) => normalizeText(element.textContent) === "KEY THEMES");
  const keyThemesRoot = keyThemesLabel?.closest("table");
  if (!keyThemesRoot) return [];
  return Array.from(keyThemesRoot.querySelectorAll("td"))
    .filter((cell) => !cell.querySelector("td"))
    .map((cell) => normalizeText(cell.textContent))
    .filter((text) => text && text !== "KEY THEMES");
}

function isUsThemeCategory(value: string | undefined): value is UsThemeCategory {
  return US_THEME_CATEGORIES.includes(value as UsThemeCategory);
}

function transactionLabel(card: Card): string | undefined {
  return card.metadata.split("·")[0]?.match(/^.+?\s+\(([^()]+)\)$/)?.[1]?.trim();
}

function requiredUsThemeCategory(card: Card): UsThemeCategory | undefined {
  const label = transactionLabel(card);
  if (label === "Platform Launch") return "platform";
  if (label === "Portfolio Company Acquisition" || label === "Portfolio Company Divestiture") {
    return "portfolio-company";
  }
  return undefined;
}

function validateUsThemePriorityOrder(
  category: UsThemeCategory,
  cards: Card[],
  findings: ValidationFinding[],
) {
  const ordered = [...cards].sort((left, right) =>
    (left.usThemePriority ?? Number.MAX_SAFE_INTEGER) -
    (right.usThemePriority ?? Number.MAX_SAFE_INTEGER)
  );
  for (let index = 1; index < ordered.length; index += 1) {
    const prior = ordered[index - 1];
    const current = ordered[index];
    if (scaleKindOrder(current.scale.kind) < scaleKindOrder(prior.scale.kind)) {
      addFinding(
        findings,
        "error",
        "us-theme-priority-order",
        `${category} priority ranks place “${current.target}” (${current.scale.kind}) behind “${prior.target}” (${prior.scale.kind}).`,
      );
      continue;
    }
    if (
      current.scale.kind === prior.scale.kind &&
      current.scale.kind !== "undisclosed" &&
      current.scale.unit === prior.scale.unit &&
      current.scale.value !== undefined &&
      prior.scale.value !== undefined &&
      current.scale.value > prior.scale.value
    ) {
      addFinding(
        findings,
        "error",
        "us-theme-priority-order",
        `${category} priority ranks place “${current.target}” (${current.scale.value} ${current.scale.unit}) behind the smaller “${prior.target}” (${prior.scale.value} ${prior.scale.unit}).`,
      );
    }
  }
}

function validateUsThemeMarkers(
  cards: Card[],
  usCards: Card[],
  finalParagraph: string,
  findings: ValidationFinding[],
) {
  const usSet = new Set(usCards);
  cards.filter((card) => !usSet.has(card)).forEach((card) => {
    if (card.hasUsThemeCategory || card.hasUsThemePriority) {
      addFinding(
        findings,
        "error",
        "us-theme-marker-non-us",
        `“${card.target}” has U.S. theme metadata but is not identified as a U.S. transaction.`,
      );
    }
  });

  const grouped = new Map<UsThemeCategory, Card[]>();
  usCards.forEach((card) => {
    if (!isUsThemeCategory(card.usThemeCategory)) {
      addFinding(
        findings,
        "error",
        "us-theme-category",
        `U.S. transaction “${card.target}” must set data-us-theme-category to operating-asset, platform, or portfolio-company.`,
      );
      return;
    }
    if (
      card.usThemePriority === undefined ||
      !Number.isInteger(card.usThemePriority) ||
      card.usThemePriority <= 0
    ) {
      addFinding(
        findings,
        "error",
        "us-theme-priority",
        `U.S. transaction “${card.target}” must set a positive integer data-us-theme-priority within its category.`,
      );
      return;
    }
    const requiredCategory = requiredUsThemeCategory(card);
    if (requiredCategory && card.usThemeCategory !== requiredCategory) {
      addFinding(
        findings,
        "error",
        "us-theme-category-label",
        `“${card.target}” uses ${transactionLabel(card)} and must use data-us-theme-category="${requiredCategory}".`,
      );
    }
    const categoryCards = grouped.get(card.usThemeCategory) ?? [];
    categoryCards.push(card);
    grouped.set(card.usThemeCategory, categoryCards);
  });

  const missingRepresentatives: Array<{ category: UsThemeCategory; target: string }> = [];
  grouped.forEach((categoryCards, category) => {
    const priorities = categoryCards.map((card) => card.usThemePriority as number);
    const sortedPriorities = [...priorities].sort((left, right) => left - right);
    const expectedPriorities = Array.from({ length: categoryCards.length }, (_, index) => index + 1);
    if (
      new Set(priorities).size !== priorities.length ||
      !sortedPriorities.every((priority, index) => priority === expectedPriorities[index])
    ) {
      addFinding(
        findings,
        "error",
        "us-theme-priority-sequence",
        `${category} U.S. theme priorities must be unique and contiguous from 1 through ${categoryCards.length}.`,
      );
    }
    validateUsThemePriorityOrder(category, categoryCards, findings);
    const representative = categoryCards.find((card) => card.usThemePriority === 1);
    if (representative && !targetsMatch(finalParagraph, representative.target)) {
      missingRepresentatives.push({ category, target: representative.target });
    }
  });

  if (missingRepresentatives.length > 0) {
    addFinding(
      findings,
      "error",
      "us-deployment-named-transactions",
      `The final Key Themes paragraph must name each priority-1 U.S. category representative: ${
        missingRepresentatives.map(({ category, target }) => `${category} “${target}”`).join("; ")
      }.`,
    );
  }
}

function validateThemes(
  document: Document,
  sections: SectorSection[],
  dealByCard: Map<Card, StaticCoverageDeal>,
  findings: ValidationFinding[],
  requireEditorialContract: boolean,
) {
  const bodyText = normalizeText(document.body.textContent);
  if (!/KEY THEMES/i.test(bodyText)) {
    addFinding(findings, "error", "key-themes", "Key Themes section is missing.");
    return;
  }
  const cards = sections.flatMap((section) => section.cards);
  if (!requireEditorialContract) {
    const hasLegacyUsDeal = cards.some((card) =>
      /(?:United States|U\.S\.)/i.test(card.metadata)
    );
    if (hasLegacyUsDeal && !/U\.S\. deployment/i.test(bodyText)) {
      addFinding(
        findings,
        "error",
        "us-deployment",
        "U.S. deals are present but Key Themes do not explicitly address U.S. deployment.",
      );
    }
    return;
  }
  const classifications = cards.map((card) => ({
    card,
    classification: classifyUsCard(card, dealByCard.get(card)),
  }));
  const usCards = classifications
    .filter(({ classification }) => classification === "us")
    .map(({ card }) => card);
  classifications
    .filter(({ classification }) => classification === "ambiguous")
    .forEach(({ card }) => {
      addFinding(
        findings,
        "error",
        "us-country-ambiguous",
        `“${card.target}” has only regional/global country coverage; provide a country-specific coverage value or explicit U.S./non-U.S. location evidence.`,
      );
    });
  classifications
    .filter(({ classification }) => classification === "conflict")
    .forEach(({ card }) => {
      addFinding(
        findings,
        "error",
        "us-country-conflict",
        `“${card.target}” contains explicit U.S. location evidence that conflicts with its non-U.S. coverage country.`,
      );
    });
  if (usCards.length === 0) {
    validateUsThemeMarkers(cards, [], "", findings);
    return;
  }

  const paragraphs = keyThemeParagraphs(document);
  const finalParagraph = paragraphs.at(-1) ?? "";
  if (!/U\.S\. deployment/i.test(finalParagraph)) {
    addFinding(
      findings,
      "error",
      "us-deployment-final-theme",
      "U.S. deals are present but the final Key Themes paragraph does not explicitly address U.S. deployment.",
    );
  }
  validateUsThemeMarkers(cards, usCards, finalParagraph, findings);
}

function sameOrder(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function splitHumanList(value: string): string[] {
  return value
    .split(/\s*,\s*(?:and\s+)?|\s+and\s+/i)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function validatePreheaderSectorOrder(
  document: Document,
  sections: SectorSection[],
  findings: ValidationFinding[],
) {
  const preheader = Array.from(document.querySelectorAll<HTMLElement>("div"))
    .find((element) => /display\s*:\s*none/i.test(element.getAttribute("style") ?? "") &&
      /Weekly Briefing/i.test(normalizeText(element.textContent)));
  if (!preheader) {
    addFinding(findings, "error", "missing-preheader", "The hidden Weekly Briefing preheader is missing.");
    return;
  }
  const text = normalizeText(preheader.textContent);
  const summary = text.match(/\b(\d+)\s+deals?\s+across\s+(.+)$/i);
  const sectorSummary = summary?.[2]?.split(/\s+[–—-]\s+/)[0]?.trim();
  if (!summary || !sectorSummary) {
    addFinding(
      findings,
      "error",
      "preheader-format",
      "The hidden preheader must include “N deals across {ordered active sectors} – {date range}”.",
    );
    return;
  }
  const entries = splitHumanList(sectorSummary);
  const actual = entries.map(canonicalSector);
  const unknown = actual.filter((sector) => !KNOWN_SECTORS.has(sector));
  if (unknown.length > 0) {
    addFinding(
      findings,
      "error",
      "preheader-sectors",
      `Preheader contains unknown sector(s): ${unknown.join(", ")}.`,
    );
  }
  if (new Set(actual).size !== actual.length) {
    addFinding(findings, "error", "preheader-sectors", "Preheader sector list contains duplicates.");
  }
  const expected = sections.map((section) => section.label);
  if (!sameOrder(actual, expected)) {
    addFinding(
      findings,
      "error",
      "preheader-sector-order",
      `Preheader sectors are “${actual.join(", ") || "(none)"}”; expected “${expected.join(", ")}”.`,
    );
  }
  const statedDeals = Number(summary[1]);
  const expectedDeals = sections.reduce((total, section) => total + section.count, 0);
  if (statedDeals !== expectedDeals) {
    addFinding(
      findings,
      "error",
      "preheader-deal-count",
      `Preheader states ${statedDeals} deal(s); active sections contain ${expectedDeals}.`,
    );
  }
}

function previousEditionsComment(document: Document): string | undefined {
  const walker = document.createTreeWalker(
    document,
    document.defaultView?.NodeFilter.SHOW_COMMENT ?? 128,
  );
  let node: Node | null = walker.nextNode();
  while (node) {
    if (/Previous Editions:/i.test(node.nodeValue ?? "")) return node.nodeValue ?? "";
    node = walker.nextNode();
  }
  return undefined;
}

function validatePreviousEditionSectorOrder(
  document: Document,
  sections: SectorSection[],
  findings: ValidationFinding[],
) {
  const comment = previousEditionsComment(document);
  if (!comment) {
    addFinding(findings, "error", "missing-previous-editions", "The Previous Editions summary comment is missing.");
    return;
  }
  const summaryLines = comment
    .split(/\r?\n/)
    .map((line) => decodeHtml(line))
    .map((line) => line.trim())
    .filter((line) => /\bdeals?\s*\(/i.test(line));
  if (summaryLines.length === 0) {
    addFinding(findings, "error", "missing-previous-editions", "The Previous Editions comment has no parseable summaries.");
    return;
  }

  summaryLines.forEach((line, lineIndex) => {
    const summary = line.match(/\b(\d+)\s+deals?\s*\(([^()]*)\)\s*$/i);
    if (!summary) {
      addFinding(
        findings,
        "error",
        "previous-editions-sectors",
        `Previous Editions summary ${lineIndex + 1} must end with “N deals (Sector N, …)”.`,
      );
      return;
    }
    const entries = splitHumanList(summary[2]);
    const counts = entries.flatMap((entry) => {
      const match = entry.match(/^(.+?)\s+(\d+)$/);
      if (!match) return [];
      return [{ label: canonicalSector(match[1]), count: Number(match[2]) }];
    });
    if (
      counts.length !== entries.length ||
      counts.length === 0 ||
      counts.some(({ label, count }) =>
        !KNOWN_SECTORS.has(label) || !Number.isInteger(count) || count <= 0
      )
    ) {
      addFinding(
        findings,
        "error",
        "previous-editions-sectors",
        `Previous Editions summary ${lineIndex + 1} has an unknown sector or an unparseable/non-positive sector count.`,
      );
      return;
    }
    if (new Set(counts.map(({ label }) => label)).size !== counts.length) {
      addFinding(
        findings,
        "error",
        "previous-editions-sectors",
        `Previous Editions summary ${lineIndex + 1} contains a duplicate sector.`,
      );
    }
    const statedTotal = Number(summary[1]);
    const sectorTotal = counts.reduce((total, { count }) => total + count, 0);
    if (statedTotal !== sectorTotal) {
      addFinding(
        findings,
        "error",
        "previous-editions-total",
        `Previous Editions summary ${lineIndex + 1} states ${statedTotal} deal(s), but its sector counts sum to ${sectorTotal}.`,
      );
    }
    const expected = [...counts].sort((left, right) =>
      right.count - left.count ||
      SECTOR_TIE_BREAK.indexOf(left.label as (typeof SECTOR_TIE_BREAK)[number]) -
        SECTOR_TIE_BREAK.indexOf(right.label as (typeof SECTOR_TIE_BREAK)[number])
    );
    if (!sameOrder(counts.map(({ label }) => label), expected.map(({ label }) => label))) {
      addFinding(
        findings,
        "error",
        "previous-editions-sector-order",
        `Previous Editions summary ${lineIndex + 1} does not order sectors by descending count and the fixed tie-break.`,
      );
    }
    if (lineIndex === 0) {
      const current = sections.map(({ label, count }) => ({ label, count }));
      const matchesCurrent = counts.length === current.length &&
        counts.every(({ label, count }, index) =>
          label === current[index]?.label && count === current[index]?.count
        );
      if (!matchesCurrent) {
        addFinding(
          findings,
          "error",
          "previous-editions-current-summary",
          "The first Previous Editions summary must exactly match the current issue’s active sector counts and order.",
        );
      }
    }
  });
}

function validateCanonicalSponsorNaming(document: Document, findings: ValidationFinding[]) {
  const bodyText = normalizeText(document.body.textContent);
  if (/\bGoldman Sachs (?:Asset Management|Alternatives)\b/i.test(bodyText)) {
    addFinding(
      findings,
      "error",
      "canonical-gsam",
      "Use the canonical sponsor name “GSAM” instead of Goldman Sachs Asset Management or Goldman Sachs Alternatives.",
    );
  }
}

function validateStaticCoverage(
  cards: Card[],
  coverageDeals: StaticCoverageDeal[] | undefined,
  matches: CoverageMatches,
  requireCoverage: boolean,
  findings: ValidationFinding[],
): number {
  if (!coverageDeals) {
    if (requireCoverage) {
      addFinding(findings, "error", "static-coverage-unavailable", "Static current-week coverage data could not be loaded.");
    } else {
      addFinding(findings, "warning", "static-coverage-unavailable", "Static current-week coverage data was not supplied.");
    }
    return 0;
  }
  cards.forEach((card) => {
    if (!matches.dealByCard.has(card)) {
      addFinding(
        findings,
        "error",
        "static-coverage",
        `${card.sector}: “${card.target}” is not represented in the current-week static/database coverage input.`,
      );
    }
  });
  coverageDeals.forEach((deal) => {
    if (!matches.cardByDeal.has(deal)) {
      addFinding(
        findings,
        "error",
        "missing-current-week-deal",
        `${deal.sector ? `${deal.sector}: ` : ""}“${deal.target}” is in current-week coverage but missing from the email.`,
      );
    }
  });
  return matches.dealByCard.size;
}

async function requestLink(
  url: string,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs);
  const request = (method: "HEAD" | "GET") => fetchImpl(url, {
    method,
    redirect: "follow",
    signal,
    headers: {
      "user-agent": "InfraSight-Link-Validator/2.0",
      ...(method === "GET" ? { range: "bytes=0-0" } : {}),
    },
  });
  const head = await request("HEAD");
  return [403, 405, 501].includes(head.status) ? request("GET") : head;
}

async function validateHttpLinks(
  candidates: LinkCandidate[],
  options: LinkCheckOptions,
  findings: ValidationFinding[],
): Promise<{ requested: number; skipped: number }> {
  if (!options.enabled) return { requested: 0, skipped: 0 };
  const sourceCandidates = candidates.filter((candidate) => candidate.isSource);
  const otherCandidates = candidates.filter((candidate) => !candidate.isSource);
  const availableOtherSlots = Math.max(0, options.maxLinks - sourceCandidates.length);
  const selected = [
    ...sourceCandidates,
    ...otherCandidates.slice(0, availableOtherSlots),
  ];
  const skippedByCap = Math.max(0, otherCandidates.length - availableOtherSlots);
  if (skippedByCap > 0) {
    addFinding(
      findings,
      "warning",
      "link-cap",
      `${skippedByCap} non-Source HTTP(S) link(s) were skipped by the ${options.maxLinks}-link safety cap; all ${sourceCandidates.length} Source link(s) remain mandatory.`,
    );
  }
  const deadline = Date.now() + options.budgetMs;
  const fetchImpl = options.fetchImpl ?? fetch;
  let cursor = 0;
  let requested = 0;
  const skippedByBudget: LinkCandidate[] = [];
  const workers = Array.from({ length: Math.min(MAX_LINK_CONCURRENCY, selected.length) }, async () => {
    while (cursor < selected.length) {
      const candidate = selected[cursor++];
      const { url } = candidate;
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        skippedByBudget.push(candidate);
        continue;
      }
      requested += 1;
      try {
        const response = await requestLink(url, Math.min(options.timeoutMs, remaining), fetchImpl);
        if (response.status === 404 || response.status === 410) {
          addFinding(
            findings,
            "error",
            candidate.isSource ? "broken-source" : "broken-link",
            `${response.status} ${url}`,
          );
        } else if (!response.ok) {
          addFinding(
            findings,
            "warning",
            candidate.isSource ? "inconclusive-source" : "inconclusive-link",
            `${response.status} ${url}`,
          );
        }
      } catch (error) {
        addFinding(
          findings,
          "warning",
          candidate.isSource ? "inconclusive-source" : "inconclusive-link",
          `${error instanceof Error ? error.message : "request failed"} ${url}`,
        );
      }
    }
  });
  await Promise.all(workers);
  const sourceLinksSkippedByBudget = skippedByBudget.filter((candidate) => candidate.isSource).length;
  const otherLinksSkippedByBudget = skippedByBudget.length - sourceLinksSkippedByBudget;
  if (sourceLinksSkippedByBudget > 0) {
    addFinding(
      findings,
      "error",
      "source-link-budget",
      `${sourceLinksSkippedByBudget} Source link(s) were not checked before the total network time budget expired.`,
    );
  }
  if (otherLinksSkippedByBudget > 0) {
    addFinding(
      findings,
      "warning",
      "link-budget",
      `${otherLinksSkippedByBudget} non-Source HTTP(S) link(s) were not checked before the total network time budget expired.`,
    );
  }
  return {
    requested,
    skipped: skippedByCap + skippedByBudget.length,
  };
}

export async function validateWeeklyEmail(
  options: ValidateWeeklyEmailOptions,
): Promise<WeeklyEmailValidationReport> {
  const findings: ValidationFinding[] = [];
  const html = options.html ?? readFileSync(options.issuePath, "utf8");
  const document = new JSDOM(html).window.document;
  const sections = parseSections(document, findings);
  const cards = sections.flatMap((section) => section.cards);
  const issueId = basename(options.issuePath, ".html");
  const requireScaleMetadata = options.requireScaleMetadata ?? (
    /^\d{4}-\d{2}-\d{2}$/.test(issueId) && issueId >= SCALE_METADATA_CUTOVER
  );
  const requireEditorialContract = options.requireEditorialContract ?? (
    /^\d{4}-\d{2}-\d{2}$/.test(issueId) && issueId >= EDITORIAL_CONTRACT_CUTOVER
  );
  const coverageMatches = matchCardsToCoverageDeals(cards, options.coverageDeals);

  validateSectorOrder(sections, findings);
  validateCardStructure(cards, findings, requireEditorialContract);
  sections.forEach((section) => validateScaleOrder(section, findings, requireScaleMetadata));
  validateThemes(document, sections, coverageMatches.dealByCard, findings, requireEditorialContract);
  if (requireEditorialContract) {
    validatePreheaderSectorOrder(document, sections, findings);
    validatePreviousEditionSectorOrder(document, sections, findings);
    validateCanonicalSponsorNaming(document, findings);
  }
  validateYtdTable(document, "Deal Count By Sector (YTD)", findings);
  validateYtdTable(document, "Deal Count By Region (YTD)", findings);
  const contrastTextRunsChecked = validateContrast(document, findings);
  const staticCoverageMatched = validateStaticCoverage(
    cards,
    options.coverageDeals,
    coverageMatches,
    options.requireStaticCoverage ?? false,
    findings,
  );
  const httpLinks = collectHttpLinks(
    document,
    new Set(cards.map((card) => card.sourceUrl).filter(Boolean)),
    findings,
  );

  const linkOptions: LinkCheckOptions = {
    enabled: options.linkCheck?.enabled ?? false,
    timeoutMs: options.linkCheck?.timeoutMs ?? DEFAULT_LINK_TIMEOUT_MS,
    budgetMs: options.linkCheck?.budgetMs ?? DEFAULT_LINK_BUDGET_MS,
    maxLinks: options.linkCheck?.maxLinks ?? DEFAULT_MAX_LINKS,
    fetchImpl: options.linkCheck?.fetchImpl,
  };
  const linkSummary = await validateHttpLinks(
    httpLinks,
    linkOptions,
    findings,
  );
  const invalid = findings.some((finding) => finding.severity === "error");

  return {
    issue: basename(options.issuePath),
    status: invalid ? "invalid" : "valid",
    exitCode: invalid ? 1 : 0,
    summary: {
      deals: cards.length,
      sectors: sections.length,
      sources: cards.filter((card) => card.sourceUrl).length,
      staticCoverageMatched,
      contrastTextRunsChecked,
      linksRequested: linkSummary.requested,
      linksSkipped: linkSummary.skipped,
    },
    findings,
  };
}

function latestIssuePath(): string {
  const latest = readdirSync(EMAIL_DIRECTORY).filter((file) => DATED_ISSUE.test(file)).sort().at(-1);
  if (!latest) throw new Error("No dated weekly email issue exists.");
  return join(EMAIL_DIRECTORY, latest);
}

function positiveInteger(value: string, option: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${option} must be a positive integer.`);
  return parsed;
}

function parseArguments(argv: string[]): ParsedArguments {
  let issuePath: string | undefined;
  let coverageFile: string | undefined;
  let checkLinks = false;
  let staticCoverage = true;
  let linkTimeoutMs = DEFAULT_LINK_TIMEOUT_MS;
  let linkBudgetMs = DEFAULT_LINK_BUDGET_MS;
  let maxLinks = DEFAULT_MAX_LINKS;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check-links") checkLinks = true;
    else if (argument === "--no-static-coverage") staticCoverage = false;
    else if (argument === "--coverage-file") {
      coverageFile = argv[++index];
      if (!coverageFile || coverageFile.startsWith("--")) throw new Error("--coverage-file requires a path.");
    }
    else if (argument.startsWith("--coverage-file=")) coverageFile = argument.slice("--coverage-file=".length);
    else if (argument.startsWith("--link-timeout-ms=")) linkTimeoutMs = positiveInteger(argument.split("=")[1], "--link-timeout-ms");
    else if (argument.startsWith("--link-budget-ms=")) linkBudgetMs = positiveInteger(argument.split("=")[1], "--link-budget-ms");
    else if (argument.startsWith("--max-links=")) maxLinks = positiveInteger(argument.split("=")[1], "--max-links");
    else if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    else if (!issuePath) issuePath = resolve(argument);
    else throw new Error(`Unexpected positional argument: ${argument}`);
  }
  if (coverageFile === "") throw new Error("--coverage-file requires a path.");
  return {
    issuePath: issuePath ?? latestIssuePath(),
    checkLinks,
    staticCoverage,
    coverageFile: coverageFile ? resolve(coverageFile) : undefined,
    linkTimeoutMs,
    linkBudgetMs,
    maxLinks,
  };
}

async function loadStaticCoverage(issuePath: string): Promise<StaticCoverageDeal[]> {
  const issueId = basename(issuePath, ".html");
  const weeklyModule = await import("../prisma/seed-data/weekly-briefing-deals.ts");
  return weeklyModule.weeklyBriefingDeals
    .filter((deal) => deal.id.startsWith(`WB-${issueId}-`))
    .map((deal) => ({
      id: deal.id,
      target: deal.target,
      sector: deal.sector,
      country: deal.country,
      sourceUrl: deal.sourceUrl,
    }));
}

function loadCoverageFile(path: string): StaticCoverageDeal[] {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { data?: unknown }).data)
      ? (parsed as { data: unknown[] }).data
      : undefined;
  if (!rows) throw new Error("Coverage file must be a JSON array or a { data: [] } envelope.");
  return rows.map((row, index) => {
    if (!row || typeof row !== "object" || typeof (row as { target?: unknown }).target !== "string") {
      throw new Error(`Coverage row ${index + 1} is missing a string target.`);
    }
    const value = row as Record<string, unknown>;
    return {
      id: typeof value.id === "string" ? value.id : undefined,
      target: value.target as string,
      sector: typeof value.sector === "string" ? value.sector : undefined,
      country: typeof value.country === "string" ? value.country : undefined,
      sourceUrl: typeof value.sourceUrl === "string" ? value.sourceUrl : undefined,
    };
  });
}

export async function runWeeklyEmailValidationCli(argv = process.argv.slice(2)): Promise<number> {
  let parsed: ParsedArguments;
  try {
    parsed = parseArguments(argv);
    if (!existsSync(parsed.issuePath)) throw new Error(`${parsed.issuePath} does not exist.`);
  } catch (error) {
    console.error(JSON.stringify({
      status: "usage-error",
      exitCode: 2,
      error: formatSafeErrorSummary(error),
    }, null, 2));
    return 2;
  }

  try {
    const coverageDeals = parsed.staticCoverage
      ? parsed.coverageFile
        ? loadCoverageFile(parsed.coverageFile)
        : await loadStaticCoverage(parsed.issuePath)
      : undefined;
    const report = await validateWeeklyEmail({
      issuePath: parsed.issuePath,
      coverageDeals,
      requireStaticCoverage: parsed.staticCoverage,
      linkCheck: {
        enabled: parsed.checkLinks,
        timeoutMs: parsed.linkTimeoutMs,
        budgetMs: parsed.linkBudgetMs,
        maxLinks: parsed.maxLinks,
      },
    });
    report.findings
      .filter((finding) => finding.severity === "warning")
      .forEach((finding) => console.warn(`[weekly-email:${finding.code}] ${finding.message}`));
    console.log(JSON.stringify(report, null, 2));
    return report.exitCode;
  } catch (error) {
    console.error(JSON.stringify({
      status: "validation-error",
      exitCode: 2,
      error: formatSafeErrorSummary(error),
    }, null, 2));
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await runWeeklyEmailValidationCli();
}
