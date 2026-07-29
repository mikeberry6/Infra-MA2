import { createHash } from "node:crypto";

export type ImportEntityType = "deals" | "funds" | "portfolio";
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

export interface ImportSummary {
  total: number;
  valid: number;
  creates: number;
  updates: number;
  unchanged: number;
  quarantined: number;
  errors: number;
  eligible: number;
}

export interface ImportClassification<T> {
  prepared: T[];
  report: ImportReportRow[];
  summary: ImportSummary;
  stateHash: string;
  actions: Map<string, Exclude<ImportDisposition, "error">>;
}

export class ImportConflictError extends Error {
  constructor(
    message = "The database changed after this preview. Preview the file again before importing.",
  ) {
    super(message);
    this.name = "ImportConflictError";
  }
}

function canonicalJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (
    value === null
    || typeof value === "boolean"
    || typeof value === "string"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Import data contains a non-finite number");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }
  throw new Error("Import data contains an unsupported value");
}

export function hashImportValue(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function sameOrderedValues<T>(
  left: readonly T[],
  right: readonly T[],
): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function sameUnorderedStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return sameOrderedValues(
    [...left].sort((a, b) => a.localeCompare(b)),
    [...right].sort((a, b) => a.localeCompare(b)),
  );
}

export function sameDateValue(
  left: Date | null | undefined,
  rightIso: string | null,
): boolean {
  return (left?.toISOString() ?? null) === rightIso;
}

export function uniqueStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    output.push(trimmed);
  }
  return output;
}

export function mergeUniqueStrings(
  existing: readonly string[],
  incoming: readonly string[],
): string[] {
  return uniqueStrings([...existing, ...incoming]);
}

export function cleanString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((item) => String(item)));
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return uniqueStrings(value.split(";"));
}

export function partyArray(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.split(" / ")
      : [];
  return uniqueStrings(values).filter(
    (value) => value !== "N/A" && value !== "—",
  );
}

export function optionalNumber(value: unknown): unknown {
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

export function httpUrlOrEmpty(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function summarizeImportReport(
  total: number,
  valid: number,
  report: ImportReportRow[],
): ImportSummary {
  const count = (disposition: ImportDisposition) =>
    report.filter((row) => row.disposition === disposition).length;
  const creates = count("create");
  const updates = count("update");
  return {
    total,
    valid,
    creates,
    updates,
    unchanged: count("unchanged"),
    quarantined: count("quarantined"),
    errors: count("error"),
    eligible: creates + updates,
  };
}
