import {
  importFieldNames,
  type ImportEntityContract,
  type ImportFieldContract,
} from "./contracts";

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export type ImportRequestErrorStatus = 400 | 413 | 415;

export type ImportRequestErrorCode =
  | "INVALID_CONTENT_LENGTH"
  | "IMPORT_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "EMPTY_IMPORT"
  | "UNREADABLE_IMPORT"
  | "MALFORMED_JSON"
  | "INVALID_JSON_SHAPE"
  | "INVALID_JSON_ROW"
  | "INVALID_IMPORT_FIELDS"
  | "INVALID_IMPORT_VALUE"
  | "MALFORMED_MULTIPART"
  | "MISSING_IMPORT_FILE"
  | "UNSUPPORTED_FILE_TYPE"
  | "MALFORMED_CSV"
  | "INVALID_CSV_HEADERS"
  | "CSV_ROW_WIDTH_MISMATCH"
  | "TOO_MANY_ROWS";

export class ImportRequestError extends Error {
  readonly code: ImportRequestErrorCode;
  readonly status: ImportRequestErrorStatus;

  constructor(
    code: ImportRequestErrorCode,
    status: ImportRequestErrorStatus,
    message: string,
  ) {
    super(message);
    this.name = "ImportRequestError";
    this.code = code;
    this.status = status;
  }
}

export function isImportRequestError(
  error: unknown,
): error is ImportRequestError {
  return error instanceof ImportRequestError;
}

export type ImportRequestRow = Record<string, unknown> & {
  __row: number;
};

export interface ParsedImportRequest {
  rows: ImportRequestRow[];
  format: "csv" | "json";
  byteLength: number;
  fileName?: string;
  rowErrors?: ImportRequestRowError[];
  totalRows?: number;
}

export interface ImportRequestRowError {
  row: number;
  code: ImportRequestErrorCode;
  message: string;
}

export interface ParseImportRequestOptions {
  bodyKey: string;
  fileField?: string;
  contract?: ImportEntityContract;
}

type CsvState = "field-start" | "unquoted" | "quoted" | "after-quote";

const JSON_MEDIA_TYPE = /^application\/(?:[a-z0-9!#$&^_.+-]+\+)?json$/i;
const CSV_MEDIA_TYPES = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

function payloadTooLarge(): ImportRequestError {
  return new ImportRequestError(
    "IMPORT_TOO_LARGE",
    413,
    "Import requests cannot exceed 5 MiB.",
  );
}

function tooManyRows(): ImportRequestError {
  return new ImportRequestError(
    "TOO_MANY_ROWS",
    413,
    `Imports cannot exceed ${MAX_IMPORT_ROWS} rows.`,
  );
}

function assertDeclaredSize(request: Request): void {
  const value = request.headers.get("content-length");
  if (value === null) {
    return;
  }

  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new ImportRequestError(
      "INVALID_CONTENT_LENGTH",
      400,
      "The Content-Length header is invalid.",
    );
  }

  const declaredLength = Number(normalized);
  if (!Number.isSafeInteger(declaredLength)) {
    throw payloadTooLarge();
  }
  if (declaredLength > MAX_IMPORT_BYTES) {
    throw payloadTooLarge();
  }
}

async function readRequestBytes(request: Request): Promise<Uint8Array> {
  let buffer: ArrayBuffer;
  try {
    buffer = await request.arrayBuffer();
  } catch {
    throw new ImportRequestError(
      "UNREADABLE_IMPORT",
      400,
      "The import request could not be read.",
    );
  }

  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength > MAX_IMPORT_BYTES) {
    throw payloadTooLarge();
  }
  if (bytes.byteLength === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import request is empty.",
    );
  }

  return bytes;
}

function decodeUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new ImportRequestError(
      "UNREADABLE_IMPORT",
      400,
      "The import file must contain valid UTF-8 text.",
    );
  }
}

function assertRowsWithinLimit(rows: unknown[]): void {
  if (rows.length > MAX_IMPORT_ROWS) {
    throw tooManyRows();
  }
  if (rows.length === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import must contain at least one row.",
    );
  }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseJsonRows(
  text: string,
  bodyKey: string,
  contract?: ImportEntityContract,
): ParsedRows {
  if (text.trim().length === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import request is empty.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportRequestError(
      "MALFORMED_JSON",
      400,
      "The import request contains malformed JSON.",
    );
  }

  const candidate = Array.isArray(parsed)
    ? parsed
    : isJsonObject(parsed)
      ? parsed[bodyKey] ?? parsed.data
      : undefined;

  if (!Array.isArray(candidate)) {
    throw new ImportRequestError(
      "INVALID_JSON_SHAPE",
      400,
      `JSON import data must be an array or an object containing a "${bodyKey}" array.`,
    );
  }

  assertRowsWithinLimit(candidate);

  const rows: ImportRequestRow[] = [];
  const rowErrors: ImportRequestRowError[] = [];
  candidate.forEach((value, index) => {
    const rowNumber = index + 1;
    if (!isJsonObject(value)) {
      if (contract) {
        rowErrors.push({
          row: rowNumber,
          code: "INVALID_JSON_ROW",
          message: `JSON import row ${rowNumber} must be an object.`,
        });
        return;
      }
      throw new ImportRequestError(
        "INVALID_JSON_ROW",
        400,
        `JSON import row ${rowNumber} must be an object.`,
      );
    }

    const row = {
      ...value,
      __row: rowNumber,
    };
    if (!contract) {
      rows.push(row);
      return;
    }
    try {
      rows.push(normalizeContractRow(row, contract, "json"));
    } catch (error) {
      if (!isRowLevelContractError(error)) throw error;
      rowErrors.push({
        row: rowNumber,
        code: error.code,
        message: error.message,
      });
    }
  });
  return { rows, rowErrors, totalRows: candidate.length };
}

function malformedCsv(): ImportRequestError {
  return new ImportRequestError(
    "MALFORMED_CSV",
    400,
    "The CSV import contains malformed quoting.",
  );
}

/**
 * Parse CSV with strict RFC 4180-style quote placement.
 *
 * Newlines inside quoted fields remain part of the field and do not advance
 * the logical row number used by import error reports.
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let state: CsvState = "field-start";
  let endedWithRecordSeparator = false;

  const finishField = () => {
    row.push(field);
    field = "";
    state = "field-start";
  };

  const finishRow = () => {
    finishField();
    rows.push(row);
    row = [];
    endedWithRecordSeparator = true;
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (state === "quoted") {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          state = "after-quote";
        }
      } else {
        field += character;
      }
      endedWithRecordSeparator = false;
      continue;
    }

    const isCarriageReturn = character === "\r";
    const isLineFeed = character === "\n";

    if (state === "after-quote") {
      if (character === ",") {
        finishField();
        endedWithRecordSeparator = false;
        continue;
      }
      if (isCarriageReturn || isLineFeed) {
        finishRow();
        if (isCarriageReturn && text[index + 1] === "\n") {
          index += 1;
        }
        continue;
      }
      throw malformedCsv();
    }

    if (isCarriageReturn || isLineFeed) {
      finishRow();
      if (isCarriageReturn && text[index + 1] === "\n") {
        index += 1;
      }
      continue;
    }

    if (character === ",") {
      finishField();
      endedWithRecordSeparator = false;
      continue;
    }

    if (character === '"') {
      if (state !== "field-start") {
        throw malformedCsv();
      }
      state = "quoted";
      endedWithRecordSeparator = false;
      continue;
    }

    field += character;
    state = "unquoted";
    endedWithRecordSeparator = false;
  }

  if (state === "quoted") {
    throw malformedCsv();
  }

  if (!endedWithRecordSeparator) {
    finishField();
    rows.push(row);
  }

  return rows;
}

function parseCsvImport(
  text: string,
  contract?: ImportEntityContract,
): ParsedRows {
  if (text.trim().length === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import file is empty.",
    );
  }

  const parsedRows = parseCsvRows(text);
  if (parsedRows.length === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import file is empty.",
    );
  }

  const headers = parsedRows[0].map((header, index) => {
    const withoutBom =
      index === 0 && header.charCodeAt(0) === 0xfeff
        ? header.slice(1)
        : header;
    return withoutBom.trim();
  });

  const normalizedHeaders = headers.map((header) => header.toLowerCase());
  const uniqueHeaders = new Set(normalizedHeaders);
  if (
    headers.length === 0 ||
    headers.some((header) => header.length === 0) ||
    uniqueHeaders.size !== headers.length ||
    normalizedHeaders.includes("__row")
  ) {
    throw new ImportRequestError(
      "INVALID_CSV_HEADERS",
      400,
      "CSV headers must be non-empty and unique; __row is reserved.",
    );
  }
  if (contract) {
    assertContractFields(headers, contract, "CSV header");
  }

  const dataRows = parsedRows.slice(1);
  assertRowsWithinLimit(dataRows);

  const rows: ImportRequestRow[] = [];
  const rowErrors: ImportRequestRowError[] = [];
  dataRows.forEach((values, index) => {
    const logicalRow = index + 2;
    if (values.length !== headers.length) {
      throw new ImportRequestError(
        "CSV_ROW_WIDTH_MISMATCH",
        400,
        `CSV row ${logicalRow} has a different number of columns than the header.`,
      );
    }

    const row: ImportRequestRow = { __row: logicalRow };
    for (let column = 0; column < headers.length; column += 1) {
      row[headers[column]] = values[column];
    }
    if (!contract) {
      rows.push(row);
      return;
    }
    try {
      rows.push(normalizeContractRow(row, contract, "csv"));
    } catch (error) {
      if (!isRowLevelContractError(error)) throw error;
      rowErrors.push({
        row: logicalRow,
        code: error.code,
        message: error.message,
      });
    }
  });
  return { rows, rowErrors, totalRows: dataRows.length };
}

interface ParsedRows {
  rows: ImportRequestRow[];
  rowErrors: ImportRequestRowError[];
  totalRows: number;
}

function isRowLevelContractError(
  error: unknown,
): error is ImportRequestError {
  return error instanceof ImportRequestError
    && (
      error.code === "INVALID_IMPORT_FIELDS"
      || error.code === "INVALID_IMPORT_VALUE"
    );
}

function invalidImportFields(
  context: string,
  missing: string[],
  unknown: string[],
): ImportRequestError {
  const summarizeFields = (items: string[]) => {
    const shown = items.slice(0, 8).map((item) =>
      item.replace(/[^A-Za-z0-9_.:-]/g, "?").slice(0, 64)
    );
    const remaining = items.length - shown.length;
    return `${shown.join(", ")}${remaining > 0 ? ` (+${remaining} more)` : ""}`;
  };
  const details = [
    missing.length > 0 ? `missing: ${summarizeFields(missing)}` : "",
    unknown.length > 0 ? `unknown: ${summarizeFields(unknown)}` : "",
  ].filter(Boolean).join("; ");
  return new ImportRequestError(
    "INVALID_IMPORT_FIELDS",
    400,
    `${context} does not match the import template (${details}).`,
  );
}

function assertContractFields(
  actual: readonly string[],
  contract: ImportEntityContract,
  context: string,
): void {
  const expected = importFieldNames(contract);
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((field) => !actualSet.has(field));
  const unknown = actual
    .filter((field) => field !== "__row" && !expectedSet.has(field))
    .sort((left, right) => left.localeCompare(right));
  if (missing.length > 0 || unknown.length > 0) {
    throw invalidImportFields(context, missing, unknown);
  }
}

function invalidImportValue(
  row: number,
  field: string,
  expected: string,
): ImportRequestError {
  return new ImportRequestError(
    "INVALID_IMPORT_VALUE",
    400,
    `Import row ${row} field "${field}" must be ${expected}.`,
  );
}

function normalizeStringArray(
  value: unknown,
  source: "csv" | "json",
  row: number,
  field: string,
): string[] {
  const values =
    source === "csv"
      ? typeof value === "string"
        ? value.split(";")
        : null
      : Array.isArray(value) && value.every((item) => typeof item === "string")
        ? value
        : null;
  if (values === null) {
    throw invalidImportValue(
      row,
      field,
      source === "csv"
        ? "a semicolon-separated string"
        : "an array containing only strings",
    );
  }

  const seen = new Set<string>();
  return values.flatMap((item) => {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) return [];
    seen.add(normalized);
    return [normalized];
  });
}

function normalizeField(
  field: ImportFieldContract,
  value: unknown,
  source: "csv" | "json",
  row: number,
): string | number | null | string[] {
  switch (field.kind) {
    case "string":
      if (typeof value !== "string") {
        throw invalidImportValue(row, field.name, "a string");
      }
      return value.trim();
    case "nullable-string":
      if (value === null) return null;
      if (typeof value !== "string") {
        throw invalidImportValue(row, field.name, "a string or null");
      }
      return value.trim() || null;
    case "string-array":
      return normalizeStringArray(value, source, row, field.name);
    case "nullable-number": {
      if (value === null) return null;
      if (source === "json") {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw invalidImportValue(row, field.name, "a finite number or null");
        }
        return value;
      }
      if (typeof value !== "string") {
        throw invalidImportValue(row, field.name, "a number or a blank field");
      }
      const normalized = value.trim();
      if (!normalized) return null;
      const number = Number(normalized);
      if (!Number.isFinite(number)) {
        throw invalidImportValue(row, field.name, "a number or a blank field");
      }
      return number;
    }
  }
}

/**
 * Validate exact field presence and return a newly allocated, allowlisted row
 * in contract order. The resulting object is safe to persist as the
 * authoritative preview payload: no unrecognized input key can survive.
 */
export function normalizeContractRow(
  row: ImportRequestRow,
  contract: ImportEntityContract,
  source: "csv" | "json",
): ImportRequestRow {
  const rowNumber =
    Number.isInteger(row.__row) && row.__row > 0 ? row.__row : 1;
  assertContractFields(Object.keys(row), contract, `Import row ${rowNumber}`);

  const normalized: ImportRequestRow = { __row: rowNumber };
  for (const field of contract.fields) {
    normalized[field.name] = normalizeField(
      field,
      row[field.name],
      source,
      rowNumber,
    );
  }
  return normalized;
}

function getMediaType(contentType: string): string {
  return contentType.split(";", 1)[0].trim().toLowerCase();
}

function getFileExtension(fileName: string): string | undefined {
  const match = /\.([^.]+)$/.exec(fileName.trim());
  return match?.[1].toLowerCase();
}

function classifyImportFile(file: File): "csv" | "json" {
  const mediaType = getMediaType(file.type);
  const extension = getFileExtension(file.name);
  const mediaFormat = CSV_MEDIA_TYPES.has(mediaType)
    ? "csv"
    : JSON_MEDIA_TYPE.test(mediaType)
      ? "json"
      : undefined;
  const extensionFormat =
    extension === "csv" ? "csv" : extension === "json" ? "json" : undefined;

  if (
    (mediaFormat && extensionFormat && mediaFormat !== extensionFormat) ||
    (!mediaFormat && !extensionFormat)
  ) {
    throw new ImportRequestError(
      "UNSUPPORTED_FILE_TYPE",
      415,
      "The import file must be CSV or JSON.",
    );
  }

  return mediaFormat ?? extensionFormat!;
}

async function parseMultipartImport(
  bytes: Uint8Array,
  contentType: string,
  options: ParseImportRequestOptions,
): Promise<ParsedImportRequest> {
  let formData: FormData;
  try {
    formData = await new Response(bytes, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    throw new ImportRequestError(
      "MALFORMED_MULTIPART",
      400,
      "The multipart import request is malformed.",
    );
  }

  const files = formData.getAll(options.fileField ?? "file");
  if (files.length !== 1 || typeof files[0] === "string") {
    throw new ImportRequestError(
      "MISSING_IMPORT_FILE",
      400,
      "Multipart imports must include exactly one file.",
    );
  }

  const file = files[0];
  if (file.size > MAX_IMPORT_BYTES) {
    throw payloadTooLarge();
  }
  if (file.size === 0) {
    throw new ImportRequestError(
      "EMPTY_IMPORT",
      400,
      "The import file is empty.",
    );
  }

  let fileBytes: Uint8Array;
  try {
    fileBytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new ImportRequestError(
      "UNREADABLE_IMPORT",
      400,
      "The import file could not be read.",
    );
  }
  if (fileBytes.byteLength > MAX_IMPORT_BYTES) {
    throw payloadTooLarge();
  }

  const format = classifyImportFile(file);
  const text = decodeUtf8(fileBytes);
  const rows =
    format === "csv"
      ? parseCsvImport(text, options.contract)
      : parseJsonRows(text, options.bodyKey, options.contract);

  return {
    rows: rows.rows,
    format,
    byteLength: fileBytes.byteLength,
    fileName: file.name,
    ...(rows.rowErrors.length > 0
      ? { rowErrors: rows.rowErrors, totalRows: rows.totalRows }
      : {}),
  };
}

export async function parseImportRequest(
  request: Request,
  options: ParseImportRequestOptions,
): Promise<ParsedImportRequest> {
  assertDeclaredSize(request);

  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = getMediaType(contentType);

  if (
    !JSON_MEDIA_TYPE.test(mediaType) &&
    mediaType !== "multipart/form-data"
  ) {
    throw new ImportRequestError(
      "UNSUPPORTED_MEDIA_TYPE",
      415,
      "Import requests must use application/json or multipart/form-data.",
    );
  }

  const bytes = await readRequestBytes(request);
  if (JSON_MEDIA_TYPE.test(mediaType)) {
    const text = decodeUtf8(bytes);
    const parsed = parseJsonRows(text, options.bodyKey, options.contract);
    return {
      rows: parsed.rows,
      format: "json",
      byteLength: bytes.byteLength,
      ...(parsed.rowErrors.length > 0
        ? { rowErrors: parsed.rowErrors, totalRows: parsed.totalRows }
        : {}),
    };
  }

  return parseMultipartImport(bytes, contentType, options);
}
