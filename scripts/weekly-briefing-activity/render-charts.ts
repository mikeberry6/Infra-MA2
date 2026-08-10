import { createHash } from "node:crypto";
import type { ActivityAuditManifest } from "./schema";

export const DIRECT_ACTIVITY_COLOR = "#442142";
export const PORTFOLIO_ACTIVITY_COLOR = "#8F7C4D";
export const PORTFOLIO_ACTIVITY_LABEL_COLOR = "#766B43";
export const ACTIVITY_BAR_BACKGROUND_COLOR = "#F0F1F3";

export const SECTOR_ACTIVITY_TIE_BREAK_ORDER = [
  "Power & ET",
  "Digital",
  "Transportation",
  "Utilities",
  "Midstream",
  "Social Infra",
] as const;

export const REGION_ACTIVITY_TIE_BREAK_ORDER = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
] as const;

export const CHART_BLOCK_START_MARKER = "<!-- YTD STATS -->";
export const CHART_BLOCK_END_MARKER = "<!-- FOOTER -->";
const NON_CHART_HASH_SENTINEL =
  "<!-- YTD STATS OMITTED --><!-- FOOTER -->";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export type ActivityChartKind = "sector" | "region";

export interface ActivityChartRow {
  label: string;
  direct: number;
  portfolio: number;
}

export interface ActivityChartBlockInput {
  sector: readonly ActivityChartRow[];
  region: readonly ActivityChartRow[];
  period?: string;
}

export interface StackedBarWidths {
  filled: number;
  direct: number;
  portfolio: number;
  remainder: number;
}

export interface ChartReplacementResult {
  html: string;
  nonChartSha256: string;
}

export interface DeterministicActivityEmailInput {
  sourceHtml: string;
  charts: ActivityChartBlockInput;
  expectedNonChartSha256: string;
}

export type ManifestChartSource = Pick<
  ActivityAuditManifest,
  "cutoffDate" | "totals"
>;

interface DelimitedChartBlock {
  contentStart: number;
  contentEnd: number;
  outsideCharts: string;
}

export function extractProtectedNonChartContent(sourceHtml: string): string {
  return splitDelimitedChartBlock(sourceHtml).outsideCharts;
}

export function extractActivityChartBlockContent(sourceHtml: string): string {
  const block = splitDelimitedChartBlock(sourceHtml);
  return sourceHtml.slice(block.contentStart, block.contentEnd);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
}

function validateRows(
  rows: readonly ActivityChartRow[],
  kind: ActivityChartKind,
): ActivityChartRow[] {
  if (rows.length === 0) {
    throw new Error(`${kind} chart must contain at least one row`);
  }

  const labels = new Set<string>();
  const validated = rows.map((row, index) => {
    const label = row.label.trim();
    if (!label) throw new Error(`${kind} row ${index + 1} has no label`);
    if (labels.has(label)) {
      throw new Error(`${kind} chart contains duplicate label: ${label}`);
    }
    labels.add(label);
    assertNonNegativeInteger(row.direct, `${kind} ${label} direct count`);
    assertNonNegativeInteger(
      row.portfolio,
      `${kind} ${label} portfolio count`,
    );
    if (row.direct + row.portfolio === 0) {
      throw new Error(`${kind} ${label} must contain at least one deal`);
    }
    return { label, direct: row.direct, portfolio: row.portfolio };
  });

  const tieBreak = new Map<string, number>(
    (kind === "sector"
      ? SECTOR_ACTIVITY_TIE_BREAK_ORDER
      : REGION_ACTIVITY_TIE_BREAK_ORDER
    ).map((label, index) => [label, index]),
  );
  const compareLabels = (left: string, right: string): number => {
    const leftOrder = tieBreak.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = tieBreak.get(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    if (left === right) return 0;
    return left < right ? -1 : 1;
  };

  return validated.sort((left, right) => {
    const totalDifference =
      right.direct + right.portfolio - (left.direct + left.portfolio);
    return totalDifference || compareLabels(left.label, right.label);
  });
}

/**
 * Preserves absolute magnitude while allocating each filled bar between its
 * two constituents. Integer segment widths use largest-remainder rounding, so
 * they always add back to the rounded total fill exactly.
 */
export function allocateStackedBarWidths({
  direct,
  portfolio,
  leadingTotal,
}: {
  direct: number;
  portfolio: number;
  leadingTotal: number;
}): StackedBarWidths {
  assertNonNegativeInteger(direct, "direct count");
  assertNonNegativeInteger(portfolio, "portfolio count");
  assertNonNegativeInteger(leadingTotal, "leading total");

  const total = direct + portfolio;
  if (total === 0) throw new Error("stacked bar total must be positive");
  if (leadingTotal === 0 || total > leadingTotal) {
    throw new Error("leading total must be positive and at least the row total");
  }

  const filled = Math.round((total / leadingTotal) * 100);
  const rawSegments = [
    { key: "direct" as const, raw: (filled * direct) / total, order: 0 },
    {
      key: "portfolio" as const,
      raw: (filled * portfolio) / total,
      order: 1,
    },
  ];
  const widths = {
    direct: Math.floor(rawSegments[0].raw),
    portfolio: Math.floor(rawSegments[1].raw),
  };
  let unallocated = filled - widths.direct - widths.portfolio;

  const largestRemainders = rawSegments
    .map((segment) => ({
      ...segment,
      remainder: segment.raw - Math.floor(segment.raw),
    }))
    .sort(
      (left, right) =>
        right.remainder - left.remainder || left.order - right.order,
    );

  for (const segment of largestRemainders) {
    if (unallocated === 0) break;
    widths[segment.key] += 1;
    unallocated -= 1;
  }

  if (widths.direct + widths.portfolio !== filled) {
    throw new Error("stacked-bar rounding failed to preserve filled width");
  }

  return {
    filled,
    direct: widths.direct,
    portfolio: widths.portfolio,
    remainder: 100 - filled,
  };
}

function renderSegment({
  name,
  width,
  color,
}: {
  name: "direct" | "portfolio" | "remainder";
  width: number;
  color: string;
}): string {
  if (width === 0) return "";
  return `<td data-activity-segment="${name}" width="${width}%" height="14" bgcolor="${color}" style="width: ${width}%; height: 14px; background-color: ${color}; font-size: 1px; line-height: 14px; mso-line-height-rule: exactly;">&nbsp;</td>`;
}

function renderStackLabels({
  direct,
  portfolio,
  rowSummary,
}: {
  direct: number;
  portfolio: number;
  rowSummary: string;
}): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" data-activity-stack-labels="true" aria-label="${rowSummary} constituent labels" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"><tr><td style="padding: 4px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 9px; line-height: 12px; color: #71717A; mso-line-height-rule: exactly;"><span data-activity-stack-label="direct" data-activity-count="${direct}"><span style="font-weight: 700; color: ${DIRECT_ACTIVITY_COLOR};">${direct}</span>&nbsp;Direct</span><span aria-hidden="true" style="color: #D1D5DB;">&nbsp;&nbsp;&#183;&nbsp;&nbsp;</span><span data-activity-stack-label="portfolio" data-activity-count="${portfolio}"><span style="font-weight: 700; color: ${PORTFOLIO_ACTIVITY_LABEL_COLOR};">${portfolio}</span>&nbsp;Portfolio</span></td></tr></table>`;
}

function renderActivityChart({
  kind,
  title,
  rows,
  period,
  lastRowBottomPadding = 28,
}: {
  kind: ActivityChartKind;
  title: string;
  rows: readonly ActivityChartRow[];
  period: string;
  lastRowBottomPadding?: number;
}): string {
  const sortedRows = validateRows(rows, kind);
  const leadingTotal = sortedRows[0].direct + sortedRows[0].portfolio;
  const rowMarkup = sortedRows
    .map((row, index) => {
      const total = row.direct + row.portfolio;
      const widths = allocateStackedBarWidths({
        direct: row.direct,
        portfolio: row.portfolio,
        leadingTotal,
      });
      const escapedLabel = escapeHtml(row.label);
      const rowSummary = escapeHtml(
        `${row.label}: ${row.direct} direct fund activity, ${row.portfolio} portfolio-company activity, ${total} total`,
      );
      const isLast = index === sortedRows.length - 1;
      const labelPadding = isLast
        ? `10px 0 ${lastRowBottomPadding}px 0`
        : "10px 0";
      const barPadding = isLast
        ? `10px 8px ${lastRowBottomPadding}px 8px`
        : "10px 8px";
      const countPadding = isLast
        ? `10px 0 ${lastRowBottomPadding}px 0`
        : "10px 0";
      const border = isLast ? "" : " border-bottom: 1px solid #F4F5F7;";
      const segments = [
        renderSegment({
          name: "direct",
          width: widths.direct,
          color: DIRECT_ACTIVITY_COLOR,
        }),
        renderSegment({
          name: "portfolio",
          width: widths.portfolio,
          color: PORTFOLIO_ACTIVITY_COLOR,
        }),
        renderSegment({
          name: "remainder",
          width: widths.remainder,
          color: ACTIVITY_BAR_BACKGROUND_COLOR,
        }),
      ].join("");
      const stackLabels = renderStackLabels({
        direct: row.direct,
        portfolio: row.portfolio,
        rowSummary,
      });

      return `              <tr data-activity-row="${escapedLabel}" data-direct="${row.direct}" data-portfolio="${row.portfolio}" data-total="${total}" data-original-fill="${widths.filled}" aria-label="${rowSummary}"><td width="30%" valign="middle" style="padding: ${labelPadding};${border} font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #3F3F46;">${escapedLabel}</td><td width="55%" valign="middle" style="padding: ${barPadding};${border}"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${ACTIVITY_BAR_BACKGROUND_COLOR}" aria-label="${rowSummary}" title="${rowSummary}" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"><tr>${segments}</tr></table>${stackLabels}</td><td width="15%" valign="middle" align="right" style="padding: ${countPadding};${border} font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; color: #442142;">${total}</td></tr>`;
    })
    .join("\n");

  return `            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" data-activity-chart="${kind}" data-activity-period="${escapeHtml(period)}">
              <tr><td colspan="3" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #442142; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB;">${escapeHtml(title)}</td></tr>
${rowMarkup}
            </table>`;
}

function renderLegend(): string {
  return `            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" data-activity-legend="true" aria-label="Activity chart legend" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
              <tr><td style="padding: 12px 0 0 0; border-top: 1px solid #E5E7EB;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"><tr><td width="44%" valign="top" style="padding: 0 8px 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"><tr><td width="8" valign="top" style="padding: 1px 0 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="8" height="8" bgcolor="${DIRECT_ACTIVITY_COLOR}" style="width: 8px; height: 8px; background-color: ${DIRECT_ACTIVITY_COLOR}; font-size: 1px; line-height: 8px; mso-line-height-rule: exactly;">&nbsp;</td></tr></table></td><td valign="top" style="padding: 0 0 0 6px; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 12px; color: #52525B; mso-line-height-rule: exactly;">Direct fund activity</td></tr></table></td><td width="56%" valign="top" style="padding: 0 0 0 12px; border-left: 1px solid #E5E7EB;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"><tr><td width="8" valign="top" style="padding: 1px 0 0 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="8" height="8" bgcolor="${PORTFOLIO_ACTIVITY_COLOR}" style="width: 8px; height: 8px; background-color: ${PORTFOLIO_ACTIVITY_COLOR}; font-size: 1px; line-height: 8px; mso-line-height-rule: exactly;">&nbsp;</td></tr></table></td><td valign="top" style="padding: 0 0 0 6px; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 12px; color: #52525B; mso-line-height-rule: exactly;">Portfolio-company activity</td></tr></table></td></tr></table></td></tr>
            </table>`;
}

export function renderActivityChartBlock(
  input: ActivityChartBlockInput,
): string {
  const period = input.period?.trim() || "2026-YTD";
  const sector = validateRows(input.sector, "sector");
  const region = validateRows(input.region, "region");
  const sumScope = (
    rows: readonly ActivityChartRow[],
    scope: "direct" | "portfolio",
  ) => rows.reduce((sum, row) => sum + row[scope], 0);
  const sectorDirect = sumScope(sector, "direct");
  const regionDirect = sumScope(region, "direct");
  const sectorPortfolio = sumScope(sector, "portfolio");
  const regionPortfolio = sumScope(region, "portfolio");
  if (
    sectorDirect !== regionDirect ||
    sectorPortfolio !== regionPortfolio
  ) {
    throw new Error(
      "sector and region charts must reconcile to the same direct and portfolio grand totals",
    );
  }

  const markup = `          <tr><td style="padding: 40px 40px 30px 40px;">
${renderActivityChart({
  kind: "sector",
  title: "Deal Count By Sector (YTD)",
  rows: sector,
  period,
})}

${renderActivityChart({
  kind: "region",
  title: "Deal Count By Region (YTD)",
  rows: region,
  period,
  lastRowBottomPadding: 10,
})}
${renderLegend()}
          </td></tr>`;

  assertOutlookSafeActivityChartMarkup(markup);
  return markup;
}

export function assertOutlookSafeActivityChartMarkup(markup: string): void {
  const forbidden = [
    /<(?:script|style|svg|canvas|div)\b/i,
    /\bclass\s*=/i,
    /display\s*:\s*(?:flex|grid)/i,
    /position\s*:\s*absolute/i,
    /(?:linear|radial)-gradient\s*\(/i,
    /var\s*\(--/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(markup)) {
      throw new Error(`chart markup is not Outlook-safe: ${pattern.source}`);
    }
  }
  if ((markup.match(/data-activity-chart=/g) ?? []).length !== 2) {
    throw new Error("chart block must contain exactly two activity charts");
  }
  if ((markup.match(/data-activity-legend=/g) ?? []).length !== 1) {
    throw new Error("chart block must contain exactly one activity legend");
  }
  const rowCount = (markup.match(/data-activity-row=/g) ?? []).length;
  if (
    rowCount === 0
    || (markup.match(/data-activity-stack-labels=/g) ?? []).length !== rowCount
    || (markup.match(/data-activity-stack-label="direct"/g) ?? []).length
      !== rowCount
    || (markup.match(/data-activity-stack-label="portfolio"/g) ?? []).length
      !== rowCount
  ) {
    throw new Error(
      "every activity row must label both stacked-bar constituents",
    );
  }
}

function splitDelimitedChartBlock(sourceHtml: string): DelimitedChartBlock {
  const start = sourceHtml.indexOf(CHART_BLOCK_START_MARKER);
  const end = sourceHtml.indexOf(CHART_BLOCK_END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(
      `email must contain ${CHART_BLOCK_START_MARKER} before ${CHART_BLOCK_END_MARKER}`,
    );
  }
  if (
    sourceHtml.indexOf(CHART_BLOCK_START_MARKER, start + 1) >= 0 ||
    sourceHtml.indexOf(CHART_BLOCK_END_MARKER, end + 1) >= 0
  ) {
    throw new Error("email must contain exactly one delimited chart block");
  }

  const contentStart = start + CHART_BLOCK_START_MARKER.length;
  return {
    contentStart,
    contentEnd: end,
    outsideCharts:
      sourceHtml.slice(0, start) +
      NON_CHART_HASH_SENTINEL +
      sourceHtml.slice(end + CHART_BLOCK_END_MARKER.length),
  };
}

export function computeNonChartSha256(sourceHtml: string): string {
  return createHash("sha256")
    .update(extractProtectedNonChartContent(sourceHtml))
    .digest("hex");
}

export function computeActivityChartBlockSha256(sourceHtml: string): string {
  return createHash("sha256")
    .update(extractActivityChartBlockContent(sourceHtml))
    .digest("hex");
}

/**
 * Replaces only the delimited YTD chart content. Callers must supply the hash
 * they reviewed for the surrounding email; a copy or editorial change outside
 * the chart block makes the operation fail closed.
 */
export function replaceDelimitedChartBlock({
  sourceHtml,
  chartMarkup,
  expectedNonChartSha256,
}: {
  sourceHtml: string;
  chartMarkup: string;
  expectedNonChartSha256: string;
}): ChartReplacementResult {
  if (!SHA256_PATTERN.test(expectedNonChartSha256)) {
    throw new Error("expected non-chart hash must be a lowercase SHA-256 digest");
  }
  assertOutlookSafeActivityChartMarkup(chartMarkup);
  if (
    chartMarkup.includes(CHART_BLOCK_START_MARKER) ||
    chartMarkup.includes(CHART_BLOCK_END_MARKER)
  ) {
    throw new Error("rendered chart markup must not contain block delimiters");
  }

  const block = splitDelimitedChartBlock(sourceHtml);
  const actualNonChartSha256 = createHash("sha256")
    .update(block.outsideCharts)
    .digest("hex");
  if (actualNonChartSha256 !== expectedNonChartSha256) {
    throw new Error(
      `non-chart hash mismatch: expected ${expectedNonChartSha256}, received ${actualNonChartSha256}`,
    );
  }

  const html =
    sourceHtml.slice(0, block.contentStart) +
    `\n${chartMarkup.trim()}\n\n          ` +
    sourceHtml.slice(block.contentEnd);
  if (computeNonChartSha256(html) !== expectedNonChartSha256) {
    throw new Error("chart replacement unexpectedly changed non-chart content");
  }

  return { html, nonChartSha256: actualNonChartSha256 };
}

/**
 * Produces the only chart replacement bytes eligible for publication. Keeping
 * block rendering and replacement together lets both `render` and `advance`
 * compare against the same deterministic output.
 */
export function renderDeterministicActivityEmail({
  sourceHtml,
  charts,
  expectedNonChartSha256,
}: DeterministicActivityEmailInput): ChartReplacementResult {
  return replaceDelimitedChartBlock({
    sourceHtml,
    chartMarkup: renderActivityChartBlock(charts),
    expectedNonChartSha256,
  });
}

export function activityChartInputFromManifest(
  manifest: ManifestChartSource,
): ActivityChartBlockInput {
  return {
    sector: manifest.totals.bySector
      .filter((row) => row.counts.total > 0)
      .map((row) => ({
        label: row.sector,
        direct: row.counts.directFund,
        portfolio: row.counts.portfolioCompany,
      })),
    region: manifest.totals.byRegion
      .filter((row) => row.counts.total > 0)
      .map((row) => ({
        label: row.region,
        direct: row.counts.directFund,
        portfolio: row.counts.portfolioCompany,
      })),
    period: `${manifest.cutoffDate.slice(0, 4)} YTD through ${manifest.cutoffDate}`,
  };
}

export function renderManifestActivityEmail({
  sourceHtml,
  manifest,
  expectedNonChartSha256,
}: {
  sourceHtml: string;
  manifest: ManifestChartSource;
  expectedNonChartSha256: string;
}): ChartReplacementResult {
  return renderDeterministicActivityEmail({
    sourceHtml,
    charts: activityChartInputFromManifest(manifest),
    expectedNonChartSha256,
  });
}
