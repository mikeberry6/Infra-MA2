import type { AttributionApplyReceipt } from "./schema.ts";

export type AttributionReceiptRow = AttributionApplyReceipt["rows"][number];

export function selectAttributionVerificationRows(
  rows: AttributionReceiptRow[],
  verifyAll: boolean,
): AttributionReceiptRow[] {
  if (verifyAll) return [...rows];
  const samples: AttributionReceiptRow[] = [];
  const seen = new Set<string>();
  for (const status of ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"] as const) {
    const row = rows.find((candidate) => candidate.after.fundAttribution === status);
    if (row) {
      samples.push(row);
      seen.add(row.recordId);
    }
  }
  for (const row of rows.filter((candidate) => candidate.before.linkedFundName !== candidate.after.linkedFundName)) {
    if (!seen.has(row.recordId)) samples.push(row);
    if (samples.length >= 8) break;
  }
  return samples;
}

export function isExpectedNonPublicFormerRow(
  responseStatus: number,
  expectedIsActive: boolean | undefined,
): boolean {
  return responseStatus === 404 && expectedIsActive === false;
}
