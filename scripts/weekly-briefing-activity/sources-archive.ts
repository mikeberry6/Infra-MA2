import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { FEBRUARY_21_RECOVERED_CITATIONS } from "./sources-citation-recovery";
import { normalizeSourceUrl, normalizeTarget, sha256Text } from "./sources-normalize";
import {
  DEAL_REGIONS,
  DEAL_SECTORS,
  type ArchiveCard,
  type ArchiveIssueSnapshot,
  type DealRegion,
  type DealSector,
  type FileDigest,
  type YtdControlRow,
} from "./sources-types";

const ISSUE_FILE_PATTERN = /^2026-\d{2}-\d{2}\.html$/;

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
  aacute: "á",
  auml: "ä",
  aring: "å",
  ccedil: "ç",
  eacute: "é",
  iacute: "í",
  ntilde: "ñ",
  ograve: "ò",
  oslash: "ø",
  ouml: "ö",
  uuml: "ü",
};

const CARD_PATTERN =
  /<td\s+style="[^"]*font-size:\s*14px;[^"]*font-weight:\s*700;[^"]*color:\s*#442142;[^"]*line-height:\s*1\.2;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td\s+style="[^"]*font-size:\s*12px;[^"]*line-height:\s*1\.2;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td\s+style="[^"]*font-size:\s*12px;[^"]*line-height:\s*1\.6;?[^"]*">([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*padding-top:\s*18px[^>]*>\s*<a\s+href="([^"]+)"/gi;

const SECTOR_HEADING_PATTERN =
  /<td[^>]*text-transform:\s*uppercase[^>]*>([\s\S]*?)<\/td>/gi;

const SECTOR_ALIASES: Record<string, DealSector> = {
  "Power & ET": "Power & ET",
  Utilities: "Utilities",
  Digital: "Digital",
  Midstream: "Midstream",
  Transportation: "Transportation",
  "Social Infra": "Social Infra",
  "Waste & ES": "Social Infra",
  "Waste & Environmental Services": "Social Infra",
};

export function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, numeric: string) => String.fromCodePoint(parseInt(numeric, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (entity, name: string) => HTML_ENTITIES[name] ?? entity);
}

export function htmlToText(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function fileDigest(repoRoot: string, absolutePath: string): FileDigest {
  const bytes = readFileSync(absolutePath);
  return {
    relativePath: relative(repoRoot, absolutePath),
    byteLength: statSync(absolutePath).size,
    sha256: sha256Text(bytes),
  };
}

function sectorAt(html: string, cardIndex: number): DealSector {
  const prefix = html.slice(0, cardIndex);
  let match: RegExpExecArray | null;
  let sector: DealSector | null = null;

  SECTOR_HEADING_PATTERN.lastIndex = 0;
  while ((match = SECTOR_HEADING_PATTERN.exec(prefix))) {
    const label = htmlToText(match[1]);
    if (SECTOR_ALIASES[label]) sector = SECTOR_ALIASES[label];
  }

  if (!sector) throw new Error(`Unable to determine sector for card at byte ${cardIndex}`);
  return sector;
}

function cardTarget(title: string): string {
  return title.split(/\s+\|\s+/)[0]?.trim() ?? title.trim();
}

function recoverPlaceholderCitation(issueDate: string, target: string) {
  if (issueDate !== "2026-02-21") return null;
  return FEBRUARY_21_RECOVERED_CITATIONS.find(
    (citation) => normalizeTarget(citation.target) === normalizeTarget(target),
  ) ?? null;
}

export function parseArchiveCards(issueDate: string, html: string): ArchiveCard[] {
  const cards: ArchiveCard[] = [];
  let match: RegExpExecArray | null;

  CARD_PATTERN.lastIndex = 0;
  while ((match = CARD_PATTERN.exec(html))) {
    const title = htmlToText(match[1]);
    if (!title || title === "Mike Berry") continue;

    const ordinal = cards.length + 1;
    const target = cardTarget(title);
    const archiveUrl = normalizeSourceUrl(decodeHtml(match[4]));
    const recovered = archiveUrl ? null : recoverPlaceholderCitation(issueDate, target);

    cards.push({
      appearanceId: `EMAIL-${issueDate}-${String(ordinal).padStart(3, "0")}`,
      issueDate,
      ordinal,
      title,
      target,
      metadata: htmlToText(match[2]),
      overview: htmlToText(match[3]),
      sector: sectorAt(html, match.index),
      sourceUrl: archiveUrl ?? recovered?.url ?? null,
      sourceUrlOrigin: archiveUrl ? "ARCHIVE" : recovered ? "RECOVERED" : "MISSING",
      recoveredCitationLegacyId: recovered?.legacyId ?? null,
    });
  }

  return cards;
}

function parseControlRows<T extends DealSector | DealRegion>(
  html: string,
  allowed: readonly T[],
): YtdControlRow[] {
  const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rows: Array<YtdControlRow & { sourceIndex: number }> = [];

  for (const label of allowed) {
    const encodedLabel = label.replace(/&/g, "&amp;");
    const labelPattern = new RegExp(
      `<td[^>]*>\\s*${escapePattern(encodedLabel)}\\s*<\\/td>`,
      "i",
    );
    const labelMatch = labelPattern.exec(html);
    if (!labelMatch) continue;

    // Chart rows contain nested presentation-table rows, so looking for the
    // first right-aligned numeric cell after the label is safer than treating
    // HTML table tags as a regular, non-nested grammar.
    const remainder = html.slice(labelMatch.index + labelMatch[0].length, labelMatch.index + 4_000);
    const countMatch = /<td[^>]*align="right"[^>]*>\s*(\d+)\s*<\/td>\s*<\/tr>/i.exec(remainder);
    if (countMatch) rows.push({ label, count: Number(countMatch[1]), sourceIndex: labelMatch.index });
  }

  return rows
    .sort((left, right) => left.sourceIndex - right.sourceIndex)
    .map(({ label, count }) => ({ label, count }));
}

export function parseYtdControls(html: string): {
  sectors: YtdControlRow[];
  regions: YtdControlRow[];
} {
  const marker = /Deal Count By Sector \(YTD\)/i.exec(html);
  if (!marker) return { sectors: [], regions: [] };
  const ytdHtml = html.slice(marker.index);
  return {
    sectors: parseControlRows(ytdHtml, DEAL_SECTORS),
    regions: parseControlRows(ytdHtml, DEAL_REGIONS),
  };
}

export function loadArchiveIssues(input: {
  repoRoot: string;
  cutoff: string;
}): ArchiveIssueSnapshot[] {
  const emailDir = join(input.repoRoot, "public", "email-format");
  const fileNames = readdirSync(emailDir)
    .filter((fileName) => ISSUE_FILE_PATTERN.test(fileName))
    .filter((fileName) => fileName.slice(0, 10) <= input.cutoff)
    .sort();

  return fileNames.map((fileName) => {
    const issueDate = fileName.slice(0, 10);
    const absolutePath = join(emailDir, fileName);
    const html = readFileSync(absolutePath, "utf8");
    const controls = parseYtdControls(html);
    return {
      issueDate,
      file: fileDigest(input.repoRoot, absolutePath),
      cards: parseArchiveCards(issueDate, html),
      ytdSectorControls: controls.sectors,
      ytdRegionControls: controls.regions,
    };
  });
}
