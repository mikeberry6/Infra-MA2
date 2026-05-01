/**
 * One-shot converter: reads the curated
 * "Portfolio_High_Conviction_Owner_Changes.xlsx" spreadsheet and emits a
 * normalized JSON file that the ingest script consumes.
 *
 *   Usage:
 *     npx tsx scripts/convert-ownership-xlsx.ts \
 *       <path/to/Portfolio_High_Conviction_Owner_Changes.xlsx> \
 *       prisma/seed-data/ownership-corrections-2026-04.json
 *
 * The spreadsheet has two sheets:
 *   - "High Conviction Changes" — the 122 corrections, header at row 11
 *   - "Sources" — URL evidence keyed by the "Source Row" column (header row 4)
 *
 * Output is a JSON array; each element is shaped per the `Out` interface
 * below. Keeping this stage thin lets a human review the JSON before any
 * ingest runs — splitting prose into individual firms happens in
 * `ingest-ownership-corrections.ts`.
 */
import { writeFileSync } from "node:fs";
import ExcelJS from "exceljs";

const xlsxPath = process.argv[2];
const outPath = process.argv[3];
if (!xlsxPath) {
  console.error(
    "Usage: npx tsx scripts/convert-ownership-xlsx.ts <input.xlsx> [output.json]",
  );
  console.error("       (if no output.json, prints to stdout)");
  process.exit(1);
}

function stringifyCellValue(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== "object") return String(value);
  if ("richText" in value) {
    return value.richText.map((part) => part.text).join("");
  }
  if ("text" in value) return String(value.text ?? "");
  if ("result" in value) return stringifyCellValue(value.result as ExcelJS.CellValue);
  return String(value);
}

function cellText(row: ExcelJS.Row, column: number): string {
  return stringifyCellValue(row.getCell(column).value).trim();
}

// ── Parse Sources sheet ───────────────────────────────────────
// Header at row 4 (0-indexed row 3): Source Row | Company | Current Owner URL(s) | Past Owner URL(s) | ...
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(xlsxPath);

const changesSheet = workbook.getWorksheet("High Conviction Changes");
const sourcesSheet = workbook.getWorksheet("Sources");
if (!changesSheet || !sourcesSheet) {
  console.error("Expected sheets: 'High Conviction Changes' and 'Sources'");
  process.exit(1);
}

const sourcesByRow = new Map<string, string[]>();
for (let rowNumber = 5; rowNumber <= sourcesSheet.rowCount; rowNumber++) {
  const row = sourcesSheet.getRow(rowNumber);
  const sourceRow = cellText(row, 1);
  if (!sourceRow) continue;
  const ownerUrls = cellText(row, 3);
  const pastUrls = cellText(row, 4);
  const urls = new Set<string>();
  for (const blob of [ownerUrls, pastUrls]) {
    for (const part of blob.split(/[;\n]+/)) {
      const trimmed = part.trim();
      if (trimmed && /^https?:\/\//i.test(trimmed)) urls.add(trimmed);
    }
  }
  if (urls.size > 0) sourcesByRow.set(sourceRow, Array.from(urls));
}

// ── Parse High Conviction Changes sheet ──────────────────────
// Header at row 11 (0-indexed row 10):
//   Portfolio Company | Change Type | Original Investment Firm |
//   Revised Current Owner(s) | Past Owner(s) / Seller(s) | Short Rationale |
//   Owner Evidence Date | Transaction / Entry Date | Confidence | Source Row
function changeTypeToken(s: string): string {
  const t = s.trim().toLowerCase();
  if (t === "add co-owner / jv or retained stake") return "add-co-owner";
  if (t === "reclassify stake / minority or indirect exposure") return "reclassify-minority";
  if (t === "material ownership correction") return "material-correction";
  if (t === "replace / original firm not current owner") return "replace";
  return s.trim();
}

interface Out {
  sourceRow: string;
  company: string;
  changeType: string;
  originalFirm: string;
  revisedOwnersRaw: string;
  pastOwnersRaw: string;
  rationale: string;
  ownerEvidenceDate: string;
  transactionDate: string;
  confidence: string;
  sources: string[];
}

const out: Out[] = [];
for (let rowNumber = 12; rowNumber <= changesSheet.rowCount; rowNumber++) {
  const row = changesSheet.getRow(rowNumber);
  const company = cellText(row, 1);
  if (!company) continue;
  const sourceRow = cellText(row, 10);
  out.push({
    sourceRow,
    company,
    changeType: changeTypeToken(cellText(row, 2)),
    originalFirm: cellText(row, 3),
    revisedOwnersRaw: cellText(row, 4),
    pastOwnersRaw: cellText(row, 5),
    rationale: cellText(row, 6),
    ownerEvidenceDate: cellText(row, 7),
    transactionDate: cellText(row, 8),
    confidence: cellText(row, 9),
    sources: sourcesByRow.get(sourceRow) ?? [],
  });
}

const json = JSON.stringify(out, null, 2);
if (outPath) {
  writeFileSync(outPath, json + "\n");
  console.error(`Wrote ${out.length} entries to ${outPath}`);
} else {
  process.stdout.write(json + "\n");
  console.error(`Emitted ${out.length} entries`);
}
