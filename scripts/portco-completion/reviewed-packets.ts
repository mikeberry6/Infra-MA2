/** Normalize historical packet shapes without merging facts or dropping owner decisions. */
import { z } from "zod";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { verifyHash } from "./batch";

const values = z.record(z.string(), z.unknown());
const rowSchema = z.object({ companyId: z.string().min(1), ownerId: z.string().min(1), recordId: z.string().min(1),
  current: values, recommended: values.optional(), recommendedAttribution: values.optional(),
  fieldDecisions: z.array(values).min(1), additionalFieldDecisions: z.array(values).optional() }).passthrough();
export const combinationSchema = z.strictObject({ companyId: z.string().min(1),
  reportSha256s: z.array(z.string().regex(/^[a-f0-9]{64}$/)).min(2), reason: z.string().trim().min(20) });
export const historicalTestSchema = z.strictObject({ path: z.string().regex(/^scripts\/portco-reconciliation\/[a-z0-9-]+\.test\.ts$/),
  frozenPath: z.string().startsWith("audits/"), originalSha256: z.string().regex(/^[a-f0-9]{64}$/),
  currentSha256: z.string().regex(/^[a-f0-9]{64}$/) });
export function verifyHistoricalTestMigration(original: string, current: string) {
  const oldImport = 'import { readFileSync } from "node:fs";\n';
  const newImport = 'import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";\n';
  if (!original.startsWith(oldImport) || current !== newImport + original.slice(oldImport.length)) throw Error("Historical test change exceeds frozen-reader import migration");
}
const reportSchema = z.object({ reportSha256: z.string(), productionSnapshotSha256: z.string(),
  executionManifestSha256: z.string(), ledgerSha256: z.string(), chronologySha256: z.string(),
  dependencies: z.array(z.object({ path: z.string(), sha256: z.string() })) }).passthrough();
export type ReviewedReport = z.infer<typeof reportSchema>;
export function assertMatchingAuthorityImages(images: unknown[]) {
  if (!images.length || images.some(i => !i || sha256Canonical(i) !== sha256Canonical(images[0]))) throw Error("Incompatible authority company images");
}
export function normalizeReport(input: unknown, companyId: string) {
  const report = reportSchema.parse(input); verifyHash(report, "reportSha256");
  if (report.rows !== undefined && report.ownershipPeriodId !== undefined) throw Error("Ambiguous authority envelope");
  const rows = z.array(rowSchema).min(1).parse(report.rows ?? [{ ...report, ownerId: report.ownershipPeriodId }]);
  if (!rows.some(r => r.companyId === companyId)) throw Error("Reviewed company rows missing");
  return { report, rows: rows.filter(r => r.companyId === companyId).map(row => {
    if (row.recommended && row.recommendedAttribution && sha256Canonical(row.recommended) !== sha256Canonical(row.recommendedAttribution)) throw Error("Conflicting recommended attribution aliases");
    const recommended = { ...(row.recommended ?? row.recommendedAttribution ?? {}) };
    for (const f of [...row.fieldDecisions, ...(row.additionalFieldDecisions ?? [])]) {
      const key = f.field === "fundName" ? "linkedFundName" : String(f.field);
      if (!["linkedFundName", "fundAttribution", "attributedFundName", "attributionConfidence", "attributionRationale"].includes(key)) throw Error("Unsupported reviewed field");
      const hasValue = Object.hasOwn(f, "recommended") || Object.hasOwn(f, "productionValue");
      const value = Object.hasOwn(f, "recommended") ? f.recommended : f.productionValue;
      if (hasValue && Object.hasOwn(recommended, key) && sha256Canonical(recommended[key]) !== sha256Canonical(value)) throw Error("Conflicting reviewed field recommendation");
      if (hasValue) recommended[key] = value;
    }
    return { ...row, recommended };
  }) };
}

/** All packet reports remain individually bound; explicit membership is required for a union. */
export function combineReports(companyId: string, inputs: unknown[], combination?: z.infer<typeof combinationSchema>) {
  if (!inputs.length) throw Error("Authority packet missing");
  const packets = inputs.map(input => normalizeReport(input, companyId));
  const hashes = packets.map(p => p.report.reportSha256);
  if (new Set(hashes).size !== hashes.length) throw Error("Duplicate authority packet");
  if (packets.length > 1) {
    const choice = combinationSchema.parse(combination);
    if (choice.companyId !== companyId || sha256Canonical([...choice.reportSha256s].sort()) !== sha256Canonical([...hashes].sort())) throw Error("Explicit authority combination membership differs");
    for (const key of ["executionManifestSha256", "ledgerSha256", "chronologySha256"] as const)
      if (packets.some(p => p.report[key] !== packets[0].report[key])) throw Error(`Incompatible authority ${key}`);
  } else if (combination) throw Error("Unused authority combination");
  const ownerIds = packets.flatMap(p => p.rows.map(r => r.ownerId));
  const recordIds = packets.flatMap(p => p.rows.map(r => r.recordId));
  if (new Set(ownerIds).size !== ownerIds.length || new Set(recordIds).size !== recordIds.length) throw Error("Overlapping owner or seed authority; explicit reconciliation required");
  return packets;
}
