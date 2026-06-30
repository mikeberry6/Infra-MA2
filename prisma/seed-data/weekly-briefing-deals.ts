import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Deal, DealCategory, DealRegion, DealSector, DealStatus } from "./deals";

const EMAIL_DIR = join(process.cwd(), "public", "email-format");
const EMAIL_FILE_PATTERN = /^2026-\d{2}-\d{2}\.html$/;

const DEAL_SECTORS = new Set<DealSector>([
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
]);

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  January: 0,
  Feb: 1,
  February: 1,
  Mar: 2,
  March: 2,
  Apr: 3,
  April: 3,
  May: 4,
  Jun: 5,
  June: 5,
  Jul: 6,
  July: 6,
  Aug: 7,
  August: 7,
  Sep: 8,
  Sept: 8,
  September: 8,
  Oct: 9,
  October: 9,
  Nov: 10,
  November: 10,
  Dec: 11,
  December: 11,
};

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
  rsquo: "'",
  lsquo: "'",
  ldquo: "\"",
  rdquo: "\"",
  ndash: "-",
  mdash: "-",
  bull: "·",
  euro: "EUR",
  pound: "GBP",
  dollar: "$",
  aacute: "\u00e1",
  auml: "\u00e4",
  aring: "\u00e5",
  ccedil: "\u00e7",
  eacute: "\u00e9",
  iacute: "\u00ed",
  ntilde: "\u00f1",
  ograve: "\u00f2",
  oslash: "\u00f8",
  ouml: "\u00f6",
  uuml: "\u00fc",
};

const SPONSOR_ALIASES: Record<string, string> = {
  ADIA: "ADIA Infrastructure",
  Allianz: "Allianz Global Investors",
  Antin: "Antin Infrastructure Partners",
  "CBRE IM": "CBRE Investment Management",
  CIP: "Copenhagen Infrastructure Partners",
  DWS: "DWS Infrastructure",
  ECP: "Energy Capital Partners",
  EIG: "EIG Global Energy Partners",
  EQT: "EQT Infrastructure",
  GIP: "Global Infrastructure Partners",
  GSAM: "Goldman Sachs Asset Management",
  IFM: "IFM Investors",
  Igneo: "Igneo Infrastructure Partners",
  InfraBridge: "DigitalBridge",
  "Swiss Life AM": "Swiss Life Asset Managers",
};

const BUYER_OVERRIDES: Record<string, string> = {
  "Air Liquide Biogas Assets": "IFM Investors (via Mobius Renewables)",
  "Nordergr\u00fcnde Offshore Wind Farm": "Global Infrastructure Partners (via Skyborn Renewables)",
  "117 MWp Sicily Agrivoltaic Portfolio": "Nuveen Infrastructure (via Verdian)",
  "BayWa r.e. Power Solutions": "Energy Infrastructure Partners (via Fervo)",
  bestUV: "Ember Infrastructure (via H2O Innovation)",
};

const CARD_PATTERN =
  /<td\s+style="[^"]*font-size:\s*14px;[^"]*font-weight:\s*700;[^"]*color:\s*#442142;[^"]*line-height:\s*1\.2;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td\s+style="[^"]*font-size:\s*12px;[^"]*line-height:\s*1\.2;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td\s+style="[^"]*font-size:\s*12px;[^"]*line-height:\s*1\.6;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*padding-top:\s*18px[^>]*>\s*<a\s+href="([^"]+)"/gi;

const SECTOR_HEADING_PATTERN =
  /<td[^>]*text-transform:\s*uppercase[^>]*>([\s\S]*?)<\/td>/gi;

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, numeric: string) => String.fromCodePoint(parseInt(numeric, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (entity, name: string) => HTML_ENTITIES[name] ?? entity);
}

function htmlToText(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackEndDate(fileName: string): Date {
  const [year, month, day] = fileName.replace(".html", "").split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
}

function parseIssueEndDate(fileName: string, html: string): Date {
  const preheader = htmlToText(
    html.match(/<div[^>]*display\s*:\s*none[\s\S]*?>([\s\S]*?)<\/div>/i)?.[1] ?? "",
  );
  const match = preheader.match(
    /([A-Z][a-z]+)\s+\d{1,2}\s*[-\u2013\u2014]\s*(?:(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+)?(\d{1,2}),\s*(\d{4})/,
  );

  if (!match) return fallbackEndDate(fileName);

  const endMonthName = match[2] ?? match[1];
  const month = MONTH_INDEX[endMonthName];
  if (month === undefined) return fallbackEndDate(fileName);

  return new Date(Date.UTC(Number(match[4]), month, Number(match[3]), 23, 59, 59));
}

function getLastSector(html: string, index: number): DealSector {
  const prefix = html.slice(0, index);
  let match: RegExpExecArray | null;
  let sector: DealSector | null = null;

  SECTOR_HEADING_PATTERN.lastIndex = 0;
  while ((match = SECTOR_HEADING_PATTERN.exec(prefix))) {
    const label = htmlToText(match[1]) as DealSector;
    if (DEAL_SECTORS.has(label)) sector = label;
  }

  return sector ?? "Digital";
}

function normalizeCountry(value: string): string {
  return value
    .replace(/\bUS\b/g, "United States")
    .replace(/\bU\.S\.\b/g, "United States")
    .replace(/\bUK\b/g, "United Kingdom")
    .replace(/\s*&\s*/g, " / ")
    .replace(/\s+\/\s+/g, " / ")
    .trim();
}

function regionFromCountry(country: string): DealRegion {
  const value = country.toLowerCase();
  if (/united states|canada|north america|mexico/.test(value)) return "North America";
  if (/united kingdom|ireland|europe|spain|germany|france|italy|netherlands|sweden|poland|luxembourg|romania|finland|croatia|portugal|greece|norway/.test(value)) {
    return "Europe";
  }
  if (/india|taiwan|south korea|korea|vietnam|philippines|japan|australia|new zealand|thailand|singapore|asia/.test(value)) {
    return "Asia-Pacific";
  }
  if (/brazil|uruguay|peru|latin america|chile|colombia/.test(value)) return "Latin America";
  if (/kenya|africa|middle east|uae|oman|saudi/.test(value)) return "Middle East & Africa";
  return "North America";
}

function parseMetadata(metadata: string): {
  sponsor: string;
  transactionType: string;
  subsector: string;
  country: string;
} {
  const parts = metadata.split(/\s+·\s+/).map((part) => part.trim());
  const first = parts[0] ?? "";
  const parenthetical = first.match(/^(.*?)\s*\((.*?)\)$/);

  let sponsor = first;
  let transactionType = "";

  if (parenthetical) {
    sponsor = parenthetical[1].trim();
    transactionType = parenthetical[2].trim();
  } else {
    const pipeParts = first.split(/\s+\|\s+/);
    if (pipeParts.length >= 2) {
      sponsor = pipeParts[0].trim();
      transactionType = pipeParts.slice(1).join(" / ").trim();
    }
  }

  return {
    sponsor,
    transactionType,
    subsector: parts[1] ?? "",
    country: normalizeCountry(parts.slice(2).join(" / ") || ""),
  };
}

function normalizeSponsor(rawSponsor: string, target: string): string {
  const override = BUYER_OVERRIDES[target];
  if (override) return override;

  const names = rawSponsor
    .split(/\s+(?:\/|&)\s+/)
    .map((name) => SPONSOR_ALIASES[name.trim()] ?? name.trim())
    .filter(Boolean);

  return Array.from(new Set(names)).join(" / ") || rawSponsor.trim();
}

function mapCategory(transactionType: string): DealCategory {
  const value = transactionType.toLowerCase();

  if (value.includes("ipo")) return "IPO";
  if (/joint venture|\bjv\b|strategic partnership/.test(value)) return "Joint Venture";
  if (value.includes("platform launch") || value === "launch") return "Platform Launch";
  if (value.includes("portfolio company divestiture")) return "Sale (Buyout)";
  if (value.includes("minority stake sale")) return "Sale (Minority Stake)";
  if (value.includes("majority stake sale")) return "Sale (Majority Stake)";
  if (value.includes("divestiture") || value.includes("sale") || value.includes("exit")) {
    if (value.includes("minority")) return "Sale (Minority Stake)";
    if (value.includes("majority")) return "Sale (Majority Stake)";
    if (value.includes("carve")) return "Sale (Carve-Out)";
    return "Sale (Buyout)";
  }
  if (value.includes("portfolio company acquisition")) return "Acquisition (Bolt-On)";
  if (value.includes("bolt")) return "Acquisition (Bolt-On)";
  if (value.includes("secondary acquisition") || value.includes("secondaries")) return "Acquisition (Minority Stake)";
  if (value.includes("co-investment")) return "Acquisition (Minority Stake)";
  if (value.includes("majority")) return "Acquisition (Majority Stake)";
  if (
    value.includes("minority") ||
    value.includes("stake") ||
    value.includes("equity") ||
    value.includes("preferred") ||
    value.includes("growth") ||
    value.includes("investment") ||
    value.includes("capital raise") ||
    value.includes("financing")
  ) {
    return "Acquisition (Minority Stake)";
  }
  if (value.includes("acquisition") || value.includes("buyout") || value.includes("take-private")) return "Acquisition (Buyout)";

  return "Acquisition (Buyout)";
}

function sourceNameFromUrl(sourceUrl: string): string {
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    if (host.includes("businesswire")) return "Business Wire";
    if (host.includes("globenewswire")) return "GlobeNewswire";
    if (host.includes("prnewswire")) return "PR Newswire";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("investegate")) return "Investegate";
    if (host.includes("datacenterdynamics")) return "Data Center Dynamics";
    if (host.includes("pv-magazine")) return "PV Magazine";

    const label = host.split(".")[0].replace(/-/g, " ");
    return label.replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "Source";
  }
}

function findStake(description: string): string | null {
  return description.match(/\b\d+(?:\.\d+)?%\s+(?:stake|interest|ownership|voting power|equity interest)?/i)?.[0] ?? null;
}

function findAssetScale(description: string): string | null {
  const match = description.match(
    /\b\d+(?:[,.]\d+)?\s*(?:GW|MWp?|MWh|GWh|mtpa|circuit kilometers|kilometers|km|miles|sites|facilities|terminals|airports|projects|assets|pallet positions|cubic feet)\b[^.;,)]*/i,
  );
  return match?.[0].trim() ?? null;
}

function statusFromDescription(description: string): DealStatus {
  return /\b(closed|completed)\b/i.test(description) ? "Closed" : "Announced";
}

function parseWeeklyEmail(fileName: string): Deal[] {
  const html = readFileSync(join(EMAIL_DIR, fileName), "utf8");
  const issueEndDate = parseIssueEndDate(fileName, html);
  const deals: Deal[] = [];
  let match: RegExpExecArray | null;

  CARD_PATTERN.lastIndex = 0;
  while ((match = CARD_PATTERN.exec(html))) {
    const cardTitle = htmlToText(match[1]);
    if (!cardTitle || cardTitle === "Mike Berry") continue;

    const metadata = parseMetadata(htmlToText(match[2]));
    const overview = htmlToText(match[3]);
    const sourceUrl = decodeHtml(match[4]);
    const titleParts = cardTitle.split(/\s+\|\s+/);
    const target = titleParts[0].trim();
    const rawSponsor = titleParts.slice(1).join(" / ").trim() || metadata.sponsor;
    const sponsor = normalizeSponsor(rawSponsor, target);
    const country = metadata.country || "Global";
    const category = mapCategory(metadata.transactionType);
    const isSale = category.startsWith("Sale");
    const date = new Date(issueEndDate);
    date.setUTCHours(Math.min(23, 8 + deals.length), 0, 0, 0);

    deals.push({
      id: `WB-${fileName.replace(".html", "")}-${String(deals.length + 1).padStart(3, "0")}`,
      title: cardTitle.includes("|") ? cardTitle : `${target} | ${sponsor}`,
      target,
      buyer: isSale ? "Undisclosed Buyer" : sponsor,
      seller: isSale ? sponsor : "N/A",
      sector: getLastSector(html, match.index),
      subsector: metadata.subsector,
      region: regionFromCountry(country),
      category: [category],
      date: date.toISOString(),
      description: overview,
      targetDescription: `${target}, a ${metadata.subsector || "infrastructure"} business or asset in ${country}.`,
      sourceName: sourceNameFromUrl(sourceUrl),
      sourceUrl,
      enterpriseValue: null,
      equityValue: null,
      stake: findStake(overview),
      status: statusFromDescription(overview),
      closingDate: null,
      financialAdvisorBuyer: null,
      financialAdvisorSeller: null,
      legalAdvisorBuyer: null,
      legalAdvisorSeller: null,
      country,
      assetScale: findAssetScale(overview),
      valuationMultiple: null,
      fundVehicle: null,
      keyHighlights: [overview],
    });
  }

  return deals;
}

function loadWeeklyBriefingDeals(): Deal[] {
  if (!existsSync(EMAIL_DIR)) return [];

  return readdirSync(EMAIL_DIR)
    .filter((fileName) => EMAIL_FILE_PATTERN.test(fileName))
    .sort()
    .flatMap(parseWeeklyEmail);
}

export const weeklyBriefingDeals: Deal[] = loadWeeklyBriefingDeals();
