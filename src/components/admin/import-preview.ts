export type ImportDisposition =
  | "create"
  | "update"
  | "unchanged"
  | "quarantined"
  | "error";

export interface ImportReportRow {
  row: number;
  identifier: string;
  disposition: ImportDisposition;
  code?: string;
  message?: string;
}

export interface ImportPreviewSummary {
  total: number;
  valid: number;
  creates: number;
  updates: number;
  unchanged: number;
  quarantined: number;
  errors: number;
  eligible: number;
}

export interface ImportPreviewResult {
  preview: true;
  token: string;
  expiresAt: string;
  summary: ImportPreviewSummary;
  report: ImportReportRow[];
}

const DISPOSITIONS = new Set<ImportDisposition>([
  "create",
  "update",
  "unchanged",
  "quarantined",
  "error",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function readSummary(value: unknown): ImportPreviewSummary | null {
  if (!isRecord(value)) return null;

  const keys = [
    "total",
    "valid",
    "creates",
    "updates",
    "unchanged",
    "quarantined",
    "errors",
    "eligible",
  ] as const;

  if (!keys.every((key) => isCount(value[key]))) return null;

  return {
    total: value.total as number,
    valid: value.valid as number,
    creates: value.creates as number,
    updates: value.updates as number,
    unchanged: value.unchanged as number,
    quarantined: value.quarantined as number,
    errors: value.errors as number,
    eligible: value.eligible as number,
  };
}

function readReportRow(value: unknown): ImportReportRow | null {
  if (!isRecord(value)) return null;
  if (!Number.isInteger(value.row) || Number(value.row) < 1) return null;
  if (typeof value.identifier !== "string") return null;
  if (
    typeof value.disposition !== "string" ||
    !DISPOSITIONS.has(value.disposition as ImportDisposition)
  ) {
    return null;
  }
  if (value.code !== undefined && typeof value.code !== "string") return null;
  if (value.message !== undefined && typeof value.message !== "string") return null;

  return {
    row: value.row as number,
    identifier: value.identifier,
    disposition: value.disposition as ImportDisposition,
    ...(value.code === undefined ? {} : { code: value.code }),
    ...(value.message === undefined ? {} : { message: value.message }),
  };
}

/**
 * Validate the server response before offering a write action. A malformed
 * preview must never be treated as permission to commit.
 */
export function parseImportPreview(value: unknown): ImportPreviewResult | null {
  if (!isRecord(value) || value.preview !== true) return null;
  if (typeof value.token !== "string" || value.token.length === 0) return null;
  if (
    typeof value.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(value.expiresAt))
  ) {
    return null;
  }

  const summary = readSummary(value.summary);
  if (!summary || !Array.isArray(value.report)) return null;
  if (summary.total > 500) return null;

  const report: ImportReportRow[] = [];
  for (const item of value.report) {
    const row = readReportRow(item);
    if (!row) return null;
    report.push(row);
  }

  const count = (disposition: ImportDisposition) =>
    report.filter((row) => row.disposition === disposition).length;
  if (
    report.length !== summary.total ||
    count("create") !== summary.creates ||
    count("update") !== summary.updates ||
    count("unchanged") !== summary.unchanged ||
    count("quarantined") !== summary.quarantined ||
    count("error") !== summary.errors ||
    summary.valid !== summary.total - summary.errors ||
    summary.eligible !== summary.creates + summary.updates
  ) {
    return null;
  }

  return {
    preview: true,
    token: value.token,
    expiresAt: value.expiresAt,
    summary,
    report,
  };
}

/**
 * Prevent spreadsheet programs from executing cells as formulas. Prefixing
 * with an apostrophe preserves the text while neutralizing Excel/Sheets
 * formula prefixes, including prefixes hidden behind leading whitespace.
 */
export function makeFormulaSafe(value: string | number): string {
  const text = String(value);
  return /^(?:[\t\r]|\s*[=+\-@])/.test(text) ? `'${text}` : text;
}

function csvCell(value: string | number): string {
  const safe = makeFormulaSafe(value);
  return /[",\r\n]/.test(safe)
    ? `"${safe.replace(/"/g, '""')}"`
    : safe;
}

/** Build the complete, row-level preview report as an RFC 4180-style CSV. */
export function buildImportReportCsv(report: ImportReportRow[]): string {
  const rows: Array<Array<string | number>> = [
    ["row", "identifier", "disposition", "code", "message"],
    ...report.map((item) => [
      item.row,
      item.identifier,
      item.disposition,
      item.code ?? "",
      item.message ?? "",
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
