import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
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

type Severity = "error" | "warning";
type ScaleKind = "economic" | "physical" | "undisclosed";

export type ValidationFinding = {
  severity: Severity;
  code: string;
  message: string;
};

export type StaticCoverageDeal = {
  id?: string;
  target: string;
  sector?: string;
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

function validateCardStructure(cards: Card[], findings: ValidationFinding[]) {
  cards.forEach((card, index) => {
    const label = `${card.sector} card ${index + 1}`;
    const titleParts = card.title.split("|").map((part) => part.trim()).filter(Boolean);
    if (titleParts.length !== 2) {
      addFinding(findings, "error", "card-title", `${label} title must be “Target / Asset | fund manager”.`);
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

function validateThemes(document: Document, sections: SectorSection[], findings: ValidationFinding[]) {
  const bodyText = normalizeText(document.body.textContent);
  if (!/KEY THEMES/i.test(bodyText)) {
    addFinding(findings, "error", "key-themes", "Key Themes section is missing.");
    return;
  }
  const hasUsDeal = sections.some((section) =>
    section.cards.some((card) => /(?:United States|U\.S\.)/i.test(card.metadata)),
  );
  if (hasUsDeal && !/U\.S\. deployment/i.test(bodyText)) {
    addFinding(findings, "error", "us-deployment", "U.S. deals are present but Key Themes do not explicitly address U.S. deployment.");
  }
}

function validateStaticCoverage(
  cards: Card[],
  coverageDeals: StaticCoverageDeal[] | undefined,
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
  let matched = 0;
  cards.forEach((card) => {
    const source = normalizeSourceUrl(card.sourceUrl);
    const match = coverageDeals.find((deal) =>
      (source && deal.sourceUrl && normalizeSourceUrl(deal.sourceUrl) === source) ||
      (targetsMatch(card.target, deal.target) && (!deal.sector || deal.sector === card.sector)),
    );
    if (match) matched += 1;
    else {
      addFinding(
        findings,
        "error",
        "static-coverage",
        `${card.sector}: “${card.target}” is not represented in the current-week static/database coverage input.`,
      );
    }
  });
  coverageDeals.forEach((deal) => {
    const source = normalizeSourceUrl(deal.sourceUrl ?? "");
    const match = cards.find((card) =>
      (source && card.sourceUrl && normalizeSourceUrl(card.sourceUrl) === source) ||
      (targetsMatch(card.target, deal.target) && (!deal.sector || deal.sector === card.sector)),
    );
    if (!match) {
      addFinding(
        findings,
        "error",
        "missing-current-week-deal",
        `${deal.sector ? `${deal.sector}: ` : ""}“${deal.target}” is in current-week coverage but missing from the email.`,
      );
    }
  });
  return matched;
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
  const unique = candidates.slice(0, options.maxLinks);
  const skipped = Math.max(0, candidates.length - unique.length);
  if (skipped > 0) {
    addFinding(findings, "warning", "link-cap", `${skipped} HTTP(S) link(s) were skipped by the ${options.maxLinks}-link safety cap.`);
  }
  const deadline = Date.now() + options.budgetMs;
  const fetchImpl = options.fetchImpl ?? fetch;
  let cursor = 0;
  let requested = 0;
  let budgetWarningAdded = false;
  const workers = Array.from({ length: Math.min(MAX_LINK_CONCURRENCY, unique.length) }, async () => {
    while (cursor < unique.length) {
      const candidate = unique[cursor++];
      const { url } = candidate;
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        if (!budgetWarningAdded) {
          budgetWarningAdded = true;
          addFinding(findings, "warning", "link-budget", "HTTP(S) link checks stopped at the total network time budget; unverified links are warnings, not publish failures.");
        }
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
  return { requested, skipped: skipped + Math.max(0, unique.length - requested) };
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

  validateSectorOrder(sections, findings);
  validateCardStructure(cards, findings);
  sections.forEach((section) => validateScaleOrder(section, findings, requireScaleMetadata));
  validateThemes(document, sections, findings);
  validateYtdTable(document, "Deal Count By Sector (YTD)", findings);
  validateYtdTable(document, "Deal Count By Region (YTD)", findings);
  const contrastTextRunsChecked = validateContrast(document, findings);
  const staticCoverageMatched = validateStaticCoverage(
    cards,
    options.coverageDeals,
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
