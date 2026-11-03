import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseHTML } from "linkedom";
import { z } from "zod";

export const digest = (value: unknown): string => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const textHash = (value: string): string => createHash("sha256").update(value).digest("hex");
export const normalizeName = (s: string): string => s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
export function sourceKey(value: string): string {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^fbclid$/.test(key)) url.searchParams.delete(key);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch { return ""; }
}
export const editionSchema = z.iso.date();
export const cardSchema = z.object({
  key: z.string(), position: z.number().int().positive(), title: z.string(), target: z.string(),
  sponsor: z.string(), metadata: z.string(), description: z.string(), sourceUrl: z.string(),
  announcementDate: editionSchema.nullable(), sector: z.string(), subsector: z.string(),
  country: z.string(), region: z.string().nullable(), transactionType: z.string(),
  scaleNote: z.string().nullable(),
}).strict();
export const issueSchema = z.object({
  edition: editionSchema, coverageStart: editionSchema, coverageEnd: editionSchema,
  archivePath: z.string(), contentHash: z.string(), cards: z.array(cardSchema),
}).strict();
export type Issue = z.infer<typeof issueSchema>;
export type Card = z.infer<typeof cardSchema>;
const sectors = new Set(["Power & ET", "Digital", "Transportation", "Utilities", "Midstream", "Social Infra"]);
const clean = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();

export function parseIssue(edition: string, html: string): Issue {
  editionSchema.parse(edition);
  const { document } = parseHTML(html);
  const cards: Card[] = [];
  let sector = "";
  // Walk the visible card title cells in document order, independently of style order.
  for (const td of Array.from(document.querySelectorAll("td"))) {
    const style = td.getAttribute("style") ?? "";
    const value = clean(td.textContent);
    if (/text-transform\s*:\s*uppercase/i.test(style) && sectors.has(value)) sector = value;
    if (!/font-weight\s*:\s*700/i.test(style) || !/color\s*:\s*#442142/i.test(style) || !/line-height\s*:\s*1\.2\d*\b/i.test(style)) continue;
    const table = td.closest("table");
    if (!table || !value || value === "Mike Berry") continue;
    const source = Array.from(table.querySelectorAll("a")).find(a => clean(a.textContent) === "Source");
    if (!source) continue;
    const rows = Array.from(table.children).flatMap(child => child.tagName === "TBODY" ? Array.from(child.children) : [child]).filter(child => child.tagName === "TR");
    const index = rows.findIndex(row => row.contains(td));
    const metadata = clean(rows[index + 1]?.textContent);
    const description = clean(rows[index + 2]?.textContent);
    const parts = metadata.split(/\s+·\s+/);
    const party = parts[0]?.match(/^(.*?)\s*\((.*)\)$/);
    const titleParts = value.split(/\s+\|\s+/);
    const sourceUrl = sourceKey(source.getAttribute("href") ?? "");
    const target = titleParts[0];
    const attrDate = table.getAttribute("data-announcement-date");
    const announcementDate = attrDate && editionSchema.safeParse(attrDate).success ? attrDate : null;
    const card: Card = {
      key: table.getAttribute("data-deal-id") || `legacy-${digest({ target: normalizeName(target), sourceUrl, metadata }).slice(0, 24)}`,
      position: cards.length + 1, title: value, target,
      sponsor: titleParts.slice(1).join(" / ") || party?.[1] || "",
      metadata, description, sourceUrl, announcementDate, sector,
      subsector: parts[1] ?? "", country: parts.slice(2).join(" / "),
      region: table.getAttribute("data-region"), transactionType: party?.[2] ?? "",
      scaleNote: table.getAttribute("data-scale-note"),
    };
    cards.push(cardSchema.parse(card));
  }
  const sourceLinks = Array.from(document.querySelectorAll("a")).filter(a => clean(a.textContent) === "Source").length;
  if (!cards.length || cards.length !== sourceLinks) throw new Error(`${edition}: extracted ${cards.length} cards but found ${sourceLinks} Source links`);
  if (new Set(cards.map(c => c.key)).size !== cards.length) throw new Error(`${edition}: duplicate card identity requires explicit resolution`);
  for (const section of Array.from(document.querySelectorAll("[data-weekly-sector]"))) {
    const label = section.getAttribute("data-weekly-sector");
    const count = Number(section.getAttribute("data-weekly-count"));
    if (cards.filter(c => c.sector === label).length !== count) throw new Error(`${edition}: sector count mismatch for ${label}`);
  }
  const preheader = Array.from(document.querySelectorAll("div")).find(e => /display\s*:\s*none/.test(e.getAttribute("style") ?? ""))?.textContent ?? "";
  const range = preheader.match(/([A-Z][a-z]+)\s+\d{1,2}\s*[-–—]\s*(?:([A-Z][a-z]+)\s+)?(\d{1,2}),?\s*(20\d{2})/);
  const parsedEnd = range ? new Date(`${range[2] || range[1]} ${range[3]}, ${range[4]} 00:00:00 GMT`) : null;
  const end = parsedEnd && Number.isFinite(parsedEnd.getTime()) ? parsedEnd : new Date(`${edition}T00:00:00Z`);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 6);
  return issueSchema.parse({ edition, coverageStart: start.toISOString().slice(0,10), coverageEnd: end.toISOString().slice(0,10),
    archivePath: `/email-format/${edition}.html`, contentHash: textHash(html), cards });
}

export function loadIssues(root: string, only?: string): Issue[] {
  if (only) editionSchema.parse(only);
  const dir = join(root, "public/email-format");
  return readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .filter(f => !only || f === `${only}.html`).sort()
    .map(f => parseIssue(f.slice(0,10), readFileSync(join(dir, f), "utf8")));
}
