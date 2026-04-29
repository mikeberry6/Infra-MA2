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
import { readFileSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";

const xlsxPath = process.argv[2];
const outPath = process.argv[3];
if (!xlsxPath) {
  console.error(
    "Usage: npx tsx scripts/convert-ownership-xlsx.ts <input.xlsx> [output.json]",
  );
  console.error("       (if no output.json, prints to stdout)");
  process.exit(1);
}

const wb = XLSX.read(readFileSync(xlsxPath));
const changesSheet = wb.Sheets["High Conviction Changes"];
const sourcesSheet = wb.Sheets["Sources"];
if (!changesSheet || !sourcesSheet) {
  console.error("Expected sheets: 'High Conviction Changes' and 'Sources'");
  process.exit(1);
}

// ── Parse Sources sheet ───────────────────────────────────────
// Header at row 4 (0-indexed row 3): Source Row | Company | Current Owner URL(s) | Past Owner URL(s) | ...
const sourcesByRow = new Map<string, string[]>();
const sourcesRows = XLSX.utils.sheet_to_json<unknown[]>(sourcesSheet, {
  header: 1,
  defval: "",
});
for (let i = 4; i < sourcesRows.length; i++) {
  const row = sourcesRows[i];
  if (!row || !row[0]) continue;
  const sourceRow = String(row[0]).trim();
  const ownerUrls = String(row[2] || "");
  const pastUrls = String(row[3] || "");
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

const changesRows = XLSX.utils.sheet_to_json<unknown[]>(changesSheet, {
  header: 1,
  defval: "",
});

const out: Out[] = [];
for (let i = 11; i < changesRows.length; i++) {
  const row = changesRows[i];
  if (!row) continue;
  const company = String(row[0] || "").trim();
  if (!company) continue;
  const sourceRow = String(row[9] || "").trim();
  out.push({
    sourceRow,
    company,
    changeType: changeTypeToken(String(row[1] || "")),
    originalFirm: String(row[2] || "").trim(),
    revisedOwnersRaw: String(row[3] || "").trim(),
    pastOwnersRaw: String(row[4] || "").trim(),
    rationale: String(row[5] || "").trim(),
    ownerEvidenceDate: String(row[6] || "").trim(),
    transactionDate: String(row[7] || "").trim(),
    confidence: String(row[8] || "").trim(),
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
