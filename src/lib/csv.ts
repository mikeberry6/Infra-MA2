/**
 * CSV utility functions for import/export operations.
 */

/**
 * Escape a single CSV field value according to RFC 4180.
 * Fields containing commas, double quotes, or newlines are quoted.
 * Double quotes within fields are escaped by doubling them.
 */
function escapeField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return escapeField(value.join("; "));
  }

  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 *
 * @param rows    Array of record objects
 * @param columns Optional explicit column order; if omitted, derived from first row's keys
 * @returns       CSV string with header row + data rows
 */
export function toCsv<T extends object>(rows: T[], columns?: string[]): string {
  if (rows.length === 0) {
    return columns ? columns.join(",") + "\n" : "";
  }

  const cols = columns ?? Object.keys(rows[0]);

  const headerRow = cols.map(escapeField).join(",");
  const dataRows = rows.map((row) => {
    const record = row as Record<string, unknown>;
    return cols.map((col) => escapeField(record[col])).join(",");
  });

  return [headerRow, ...dataRows].join("\n") + "\n";
}

/**
 * Parse a CSV string into an array of objects using the header row as keys.
 * Handles quoted fields and escaped double quotes.
 *
 * @param csvText Raw CSV text
 * @returns       Array of objects with string values keyed by header names
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const results: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty trailing rows
    if (row.length === 1 && row[0] === "") continue;

    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = j < row.length ? row[j] : "";
    }
    results.push(obj);
  }

  return results;
}

/**
 * Low-level CSV row parser. Handles quoted fields with embedded commas,
 * newlines, and escaped double quotes (doubled "").
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote (doubled)
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
        i++;
      } else if (char === "\r") {
        // Handle \r\n or standalone \r
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
        if (i < text.length && text[i] === "\n") {
          i++;
        }
      } else if (char === "\n") {
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Push final field/row if there's content
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}
