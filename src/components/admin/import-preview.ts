export type ImportEntityType = "deals" | "funds" | "portfolio";

export interface ImportIssue {
  /** CSV row number returned by multipart preview validation. */
  row?: number;
  id?: string;
  legacyId?: string;
  fundId?: string;
  fundName?: string;
  name?: string;
  country?: string;
  status?: string;
  existingStatus?: string;
  code?: string;
  error?: string;
}

export interface ImportOwnershipChange {
  row: number;
  name: string;
  country: string;
  action: "create" | "replace" | "retire";
  from: string[];
  to?: string;
  code: "OWNERSHIP_CREATE" | "OWNERSHIP_REPLACE" | "OWNERSHIP_RETIRE";
  message: string;
}

function csvCell(value: string | number | undefined): string {
  const raw = value == null ? "" : String(value);
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function importIssueIdentifier(
  issue: ImportIssue,
  entityType: ImportEntityType,
): string {
  if (entityType === "funds") {
    return issue.fundId || issue.id || issue.legacyId || issue.fundName || "";
  }

  if (entityType === "portfolio") {
    if (issue.name && issue.country) return `${issue.name} | ${issue.country}`;
    return issue.name || issue.id || issue.legacyId || "";
  }

  return issue.id || issue.legacyId || issue.name || "";
}

/** Build an RFC-style row-level CSV report without inventing row numbers. */
export function buildImportErrorCsv(
  errors: ImportIssue[],
  entityType: ImportEntityType,
): string {
  const rows = errors.map((issue) => [
    issue.row,
    importIssueIdentifier(issue, entityType),
    issue.code,
    issue.error || "Validation error",
  ]);

  return [
    ["row", "identifier", "code", "error"],
    ...rows,
  ].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function importIssueLabel(
  issue: ImportIssue,
  entityType: ImportEntityType,
): string {
  const parts: string[] = [];
  if (issue.row != null) parts.push(`Row ${issue.row}`);
  const identifier = importIssueIdentifier(issue, entityType);
  if (identifier) parts.push(identifier);
  return parts.join(" · ") || "Unidentified row";
}
