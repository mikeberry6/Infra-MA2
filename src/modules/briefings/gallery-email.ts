import { parseHTML } from "linkedom";
import type { EditorialBriefing, EditorialChartRow } from "./editorial";

export type GalleryLayout = "executive" | "digest" | "research";
type Card = EditorialBriefing["cards"][number];

const plum = "#442142";
const gold = "#8F7C4D";
const ink = "#302B30";
const grey = "#5D565E";
const line = "#DBD5D7";
const paper = "#F8F5F0";
const sans = "Arial,Helvetica,sans-serif";
const serif = "Georgia,'Times New Roman',serif";
const attrs = 'role="presentation" cellspacing="0" cellpadding="0" border="0"';
const collapse = "border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;";
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const dateOf = (date: string) => new Date(`${date}T00:00:00Z`);

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function absoluteUrl(value: string, base: string): string | undefined {
  if (!value || value === "#") return;
  try {
    const url = new URL(value, base);
    if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return url.href;
  } catch { /* Old editions can have placeholders in place of a source. */ }
}

function anchor(label: string, href: string, description?: string) {
  return `<a href="${esc(href)}"${description ? ` aria-label="${esc(description)}"` : ""} style="color:${plum};text-decoration:underline;">${esc(label)}</a>`;
}

function table(rows: string, attributes = "", style = "") {
  return `<table ${attrs} width="100%" ${attributes} style="width:100%;${collapse}${style}">${rows}</table>`;
}

function row(content: string, style: string, attributes = "") {
  return `<tr><td ${attributes} style="font-family:${sans};color:${ink};${style}">${content}</td></tr>`;
}

function heading(level: number, label: string, style: string) {
  return `<h${level} style="margin:0;${style}">${esc(label)}</h${level}>`;
}

interface EmailLine { text: string; href?: string }
interface EmailExtras {
  notes: string[];
  contacts: EmailLine[];
  editions: EmailLine[];
  legend: string[];
}

const clean = (value: string | null) => (value ?? "").replace(/\s+/g, " ").trim();
const textCells = (element?: Element | null) => Array.from(element?.querySelectorAll("td") ?? [])
  .filter((cell) => !cell.querySelector("table") && clean(cell.textContent));

/** Footer and legend wording are editorial too, and vary between archived issues. */
export function readGalleryEmailExtras(html: string, origin: string): EmailExtras {
  const { document } = parseHTML(html);
  const links = Array.from(document.querySelectorAll("a[href]"));
  const emailBase = new URL("/email-format/", origin).href;
  const contactTable = document.querySelector('a[href^="mailto:"]')?.closest("table");
  const contactLines = textCells(contactTable);
  const notesTable = textCells(document.body).find((cell) =>
    /^This briefing tracks\b/i.test(clean(cell.textContent)))?.closest("table");
  const markedLegend = document.querySelector("[data-activity-legend]");
  // The July 31 transition edition explained its partial-year classifications inside its sector chart.
  const inChartLegend = document.querySelector('[data-activity-chart="sector"] td[colspan="3"] table');
  return {
    notes: notesTable === contactTable ? [] : textCells(notesTable).map((cell) => clean(cell.textContent)),
    contacts: contactLines.map((cell) => ({
      text: clean(cell.textContent),
      href: absoluteUrl(cell.querySelector("a")?.getAttribute("href") ?? "", emailBase),
    })),
    editions: links.filter((link) => /^(?:\.\/)?\d{4}-\d{2}-\d{2}\.html$/.test(link.getAttribute("href") ?? ""))
      .map((link) => ({ text: clean(link.textContent), href: absoluteUrl(link.getAttribute("href")!, emailBase) })),
    legend: textCells(markedLegend ?? inChartLegend).map((cell) => clean(cell.textContent)),
  };
}

function masthead(issue: EditorialBriefing, layout: GalleryLayout) {
  const coverage = dateFormat.formatRange(dateOf(issue.coverageStart), dateOf(issue.coverageEnd));
  const count = `${issue.cards.length} ${issue.cards.length === 1 ? "deal" : "deals"}`;
  const dark = layout === "digest";
  const foreground = dark ? "#FFFFFF" : plum;
  const accent = dark ? "#E0CFAD" : grey;
  const brand = `<p style="margin:0;color:${foreground};font:700 14px/19px ${sans};letter-spacing:2px;">GUGGENHEIM</p>
    <p style="margin:3px 0 0;color:${accent};font:11px/16px ${sans};">Infrastructure Coverage &amp; Advisory</p>`;
  const title = heading(1, issue.title, `font-family:${dark ? sans : serif};font-size:${layout === "research" ? 35 : dark ? 29 : 27}px;line-height:1.12;font-weight:${dark ? 700 : 400};color:${foreground};`);
  const info = `<p style="margin:9px 0 0;color:${accent};font:12px/18px ${sans};">Weekly briefing &nbsp;&middot;&nbsp; ${esc(coverage)} &nbsp;&middot;&nbsp; ${count}</p>`;
  const mastStyle = dark ? `background-color:${plum};border-top:4px solid ${gold};` :
    layout === "research" ? `border-top:5px solid ${plum};border-bottom:1px solid ${plum};` : `border-top:3px solid ${gold};`;
  return row(brand + `<div style="padding-top:${dark ? 18 : 12}px;">${title}${info}</div>`,
    `padding:${layout === "research" ? "24px 22px" : "17px 22px 19px"};${mastStyle}`, dark ? `bgcolor="${plum}"` : "");
}

function themes(issue: EditorialBriefing, layout: GalleryLayout) {
  if (!issue.themes.length) return "";
  const executive = layout === "executive";
  const label = heading(2, "Key themes", `font:700 ${executive ? 18 : 15}px/22px ${sans};color:${plum};`);
  const paragraphs = issue.themes.map((runs) => {
    const body = runs.map((run) => run.bold ? `<strong>${esc(run.text)}</strong>` : esc(run.text)).join("");
    return `<p style="margin:9px 0 0;font-family:${executive ? serif : sans};font-size:${executive ? 17 : 14}px;line-height:${executive ? 25 : 21}px;color:${ink};">${body}</p>`;
  }).join("");
  const inner = executive ? table(row(label + paragraphs, `padding:14px 16px 17px;border-left:3px solid ${gold};background-color:${paper};`, `bgcolor="${paper}"`)) : label + paragraphs;
  return row(inner, "padding:17px 22px 9px;");
}

function sectorSection(sector: string, cards: Card[], layout: GalleryLayout, origin: string) {
  const digest = layout === "digest";
  const research = layout === "research";
  const title = heading(2, sector, `font-family:${research ? serif : sans};font-size:${research ? 25 : 18}px;line-height:${research ? 29 : 23}px;color:${plum};`);
  const deals = cards.map((card, index) => {
    const prominent = layout === "executive" && index === 0;
    const cardTitle = heading(3, card.title, `font-family:${prominent ? serif : sans};font-size:${prominent ? 20 : 16}px;line-height:${prominent ? 25 : 21}px;color:${plum};font-weight:700;`);
    const body = `${cardTitle}
      <p style="margin:4px 0 0;font:12px/17px ${sans};color:${grey};">${esc(card.metadata)}</p>
      <p style="margin:${digest ? 5 : 8}px 0 0;font:14px/21px ${sans};color:${ink};">${esc(card.description)}</p>`;
    const url = absoluteUrl(card.sourceUrl, origin);
    const source = url ? `<p style="margin:6px 0 0;font:12px/17px ${sans};">${anchor("Source", url, `Source for ${card.title}`)}</p>` : "";
    return row(body + source, `padding:${prominent ? "17px 16px 21px" : digest ? "10px 12px" : "13px 16px"};border-bottom:1px solid ${line};`,
      `data-deal-id="${esc(card.key)}"`);
  }).join("");
  const headerStyle = digest ? `background-color:${paper};padding:6px 12px;` :
    `border-top:${research ? 2 : 1}px solid ${research ? plum : gold};padding:11px 16px 0;`;
  return row(table(row(title, headerStyle, digest ? `bgcolor="${paper}"` : "") + deals,
    `data-weekly-sector="${esc(sector)}" data-weekly-count="${cards.length}"`, `border:1px solid ${line};`), "padding:17px 22px 0;");
}

const series = [
  { key: "pending", label: "Prior YTD (scope pending)", color: "#A1A1AA" },
  { key: "direct", label: "Direct", color: plum },
  { key: "portfolio", label: "Portfolio", color: gold },
] as const;

function chartRow(item: EditorialChartRow, maximum: number) {
  const counts = series.flatMap((s) => item[s.key] === null ? [] : [{ ...s, count: item[s.key]! }]);
  const fill = maximum ? Math.round(item.total / maximum * 100) : 0;
  const segments = counts.length ? counts.filter((s) => s.count > 0) :
    [{ key: "total", count: item.total, color: plum }];
  // Rounded total length reflects the YTD ranking; constituent widths split that same length.
  const bars = segments.map((s) => ({
    key: s.key, color: s.color, width: item.total ? Number((fill * s.count / item.total).toFixed(4)) : 0,
  }));
  if (fill < 100) bars.push({ key: "remainder", color: "#EFECED", width: 100 - fill });
  const bands = bars.filter((s) => s.width > 0).map((s) =>
    `<td data-activity-segment="${s.key}" width="${s.width}%" height="8" bgcolor="${s.color}" style="width:${s.width}%;height:8px;background-color:${s.color};font-size:1px;line-height:8px;mso-line-height-rule:exactly;">&nbsp;</td>`).join("");
  const labels = counts.map((s) => `<span data-activity-stack-label="${s.key}" data-activity-count="${s.count}">${s.count} ${s.label}</span>`).join(" &middot; ");
  const countAttrs = counts.map((s) => `data-${s.key}="${s.count}"`).join(" ");
  const bar = table(`<tr>${bands}</tr>`, 'aria-hidden="true"');
  return `<tr data-activity-row="${esc(item.label)}" data-total="${item.total}" ${countAttrs}>
    <th scope="row" width="37%" align="left" valign="top" style="width:37%;border-bottom:1px solid ${line};padding:8px 6px 8px 0;color:${ink};font:13px/17px ${sans};">${esc(item.label)}</th>
    <td width="51%" style="width:51%;border-bottom:1px solid ${line};padding:8px 0;">${bar}${labels ? `<div style="padding-top:3px;color:${grey};font:11px/15px ${sans};">${labels}</div>` : ""}</td>
    <td width="12%" align="right" valign="top" style="width:12%;border-bottom:1px solid ${line};padding:8px 0;color:${plum};font:700 13px/17px ${sans};">${item.total}</td></tr>`;
}

function activityCharts(issue: EditorialBriefing, extras?: EmailExtras) {
  const charts = (["sector", "region"] as const).map((kind) => {
    const rows = issue.charts[kind];
    if (!rows.length) return "";
    const title = `Deal Count By ${kind === "sector" ? "Sector" : "Region"} (YTD)`;
    const maximum = Math.max(...rows.map((item) => item.total));
    return row(heading(2, title, `font:700 18px/24px ${sans};color:${plum};`) +
      `<table cellspacing="0" cellpadding="0" border="0" width="100%" data-activity-chart="${kind}" aria-label="${title}" style="width:100%;${collapse}">${rows.map((item) => chartRow(item, maximum)).join("")}</table>`, "padding:22px 22px 0;");
  }).join("");
  const rows = [...issue.charts.sector, ...issue.charts.region];
  const labels = extras?.legend.length ? extras.legend :
    series.filter((s) => rows.some((r) => r[s.key] !== null)).map((s) => s.label);
  if (!labels.length) return charts;
  const legend = labels.map((label) => {
    const swatch = /pending/i.test(label) ? "#A1A1AA" : /portfolio/i.test(label) ? gold : plum;
    return `<span style="color:${swatch};">&#9632;</span> ${esc(label)}`;
  }).join(" &nbsp; ");
  return charts + row(legend, `padding:10px 22px 0;color:${grey};font:12px/18px ${sans};`, 'data-activity-legend="true"');
}

function footer(issue: EditorialBriefing, origin: string, extras?: EmailExtras) {
  const notes = (extras?.notes ?? []).map((n) => `<p style="margin:0 0 6px;">${esc(n)}</p>`).join("");
  const contact = (extras?.contacts ?? []).map((c) => c.href ? anchor(c.text, c.href) : esc(c.text)).join("<br>");
  const archive = (extras?.editions ?? []).map((e) => e.href ? anchor(e.text, e.href) : esc(e.text));
  const editionUrl = absoluteUrl(issue.archivePath, origin);
  if (editionUrl) archive.push(anchor("View this edition online", editionUrl));
  return row(table(row(notes + contact, `padding:14px 0 0;border-top:2px solid ${gold};font:13px/19px ${sans};color:${grey};`) +
    row(archive.join(" &nbsp;&middot;&nbsp; "), `padding:10px 0 0;font:12px/18px ${sans};`)), "padding:22px;");
}

/** Only the fragment is copied. Widths, colors, spacing, and chart labels travel with it. */
export function renderGalleryEmail(issue: EditorialBriefing, layout: GalleryLayout, origin: string, extras?: EmailExtras): string {
  const groups = new Map<string, Card[]>();
  for (const card of issue.cards) {
    const sector = card.sector || "Other infrastructure";
    const group = groups.get(sector);
    if (group) group.push(card);
    else groups.set(sector, [card]);
  }
  const stories = Array.from(groups, ([sector, cards]) => sectorSection(sector, cards, layout, origin)).join("");
  const content = masthead(issue, layout) + themes(issue, layout) + stories + activityCharts(issue, extras) + footer(issue, origin, extras);
  return `<table ${attrs} width="600" align="center" bgcolor="#FFFFFF" data-email-layout="${layout}" style="width:600px;max-width:100%;margin:0 auto;background-color:#FFFFFF;table-layout:fixed;overflow-wrap:break-word;${collapse}">${content}</table>`;
}
