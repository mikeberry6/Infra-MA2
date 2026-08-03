import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { toCsv } from "../src/lib/csv";
import {
  REPO_ROOT,
  loadFundEvidenceManifest,
  loadFundManifest,
  parseCliArgs,
  type FundEvidenceManifest,
  type FundManifest,
} from "./fund-refresh/lib";

const COLUMNS = [
  "fundId", "manager", "fundName", "status", "size", "sizeUsdMm", "vintage", "structure",
  "strategies", "sectors", "regions", "sourceId", "sourceUrl", "sourceTier", "scope", "evidenceType",
  "evidenceLabel", "publishedAt", "retrievedAt", "supportedFields", "confidence", "strategyUrl", "gaps",
  "recommendedDataEdits",
];

export function buildFundSourceAudit(
  manifest: FundManifest = loadFundManifest(),
  evidenceManifest: FundEvidenceManifest = loadFundEvidenceManifest(),
) {
  const evidenceById = new Map<string, FundEvidenceManifest["records"]>();
  for (const record of evidenceManifest.records) {
    const records = evidenceById.get(record.legacyId) ?? [];
    records.push(record);
    evidenceById.set(record.legacyId, records);
  }
  const notesById = new Map(evidenceManifest.fundNotes.map((note) => [note.legacyId, note]));
  const baseRow = (fund: FundManifest["funds"][number]) => ({
      fundId: fund.id,
      manager: fund.managerName,
      fundName: fund.fundName,
      status: fund.status,
      size: fund.size,
      sizeUsdMm: fund.sizeUsdMm ?? "",
      vintage: fund.vintage,
      structure: fund.structure,
      strategies: fund.strategies.join(" | "),
      sectors: fund.sectors.join(" | "),
      regions: fund.regions.join(" | "),
  });
  const missing = manifest.funds.filter((fund) => !evidenceById.has(fund.id));
  const rows = manifest.funds.flatMap((fund) => {
    const evidence = evidenceById.get(fund.id) ?? [];
    const note = notesById.get(fund.id);
    if (evidence.length === 0) {
      return [{
        ...baseRow(fund),
        sourceId: "",
        sourceUrl: "",
        sourceTier: "Missing evidence record",
        scope: "",
        evidenceType: "Unreconciled baseline",
        evidenceLabel: "Evidence required before verification or application",
        publishedAt: "",
        retrievedAt: "",
        supportedFields: "",
        confidence: "Unverified",
        strategyUrl: fund.strategyUrl,
        gaps: "No migrated evidence record; reconcile this fund individually.",
        recommendedDataEdits: "Do not publish or modify from automation until reviewed evidence is added.",
      }];
    }
    return evidence.map((record) => ({
      ...baseRow(fund),
      sourceId: record.sourceId,
      sourceUrl: record.url,
      sourceTier: record.sourceTier,
      scope: record.scope,
      evidenceType: note?.evidenceType ?? "Reviewed source",
      evidenceLabel: record.evidenceLabel,
      publishedAt: record.publishedAt ?? "",
      retrievedAt: record.retrievedAt,
      supportedFields: record.supportedFields.join("; "),
      confidence: record.confidence[0] + record.confidence.slice(1).toLowerCase(),
      strategyUrl: note?.strategyUrl ?? fund.strategyUrl,
      gaps: note?.gaps ?? "",
      recommendedDataEdits: note?.recommendedDataEdits ?? "",
    }));
  });
  const evidenceFunds = new Set(evidenceManifest.records.map((record) => record.legacyId));
  const programRows = evidenceManifest.records.filter((record) => record.scope === "PROGRAM_EXCEPTION");
  const fallbackFunds = new Set(evidenceManifest.fundNotes
    .filter((note) => note.legacyMigration?.aggregateSourceTier === "MANAGER_FALLBACK")
    .map((note) => note.legacyId));
  const csv = toCsv(rows, COLUMNS);
  const markdown = `# Fund Source Audit Matrix

Generated from \`prisma/seed-data/funds.manifest.json\` and \`prisma/seed-data/fund-evidence.manifest.json\`.

As-of date for migrated evidence: ${evidenceManifest.asOf}

## Coverage Summary

- Manifest funds: ${manifest.funds.length}
- Funds with migrated evidence: ${evidenceFunds.size}
- Normalized per-source evidence rows: ${evidenceManifest.records.length}
- Funds missing migrated evidence: ${missing.length}
- Program-exception-scope evidence rows: ${programRows.length}
- Unresolved manager-level fallback funds: ${fallbackFunds.size}

${missing.length > 0 ? `## Missing Evidence Records

${missing.map((fund) => `- ${fund.id} — ${fund.managerName}, ${fund.fundName}`).join("\n")}

` : ""}## Matrix

The complete generated matrix is in \`docs/fund-source-audit.csv\`. Do not edit either audit file by hand; update the fund or evidence manifest and regenerate them.
`;
  return {
    csv,
    markdown,
    rows,
    summary: {
      manifestFunds: manifest.funds.length,
      evidenceFunds: evidenceFunds.size,
      evidenceRows: evidenceManifest.records.length,
      missingFunds: missing.length,
    },
  };
}

function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const csvPath = path.resolve(REPO_ROOT, typeof args.get("csv") === "string" ? String(args.get("csv")) : "docs/fund-source-audit.csv");
  const markdownPath = path.resolve(REPO_ROOT, typeof args.get("markdown") === "string" ? String(args.get("markdown")) : "docs/fund-source-audit.md");
  const generated = buildFundSourceAudit();
  if (args.has("check")) {
    const stale = readFileSync(csvPath, "utf8") !== generated.csv || readFileSync(markdownPath, "utf8") !== generated.markdown;
    console.log(JSON.stringify({ ...generated.summary, stale }, null, 2));
    if (stale) process.exitCode = 1;
    return;
  }
  mkdirSync(path.dirname(csvPath), { recursive: true });
  mkdirSync(path.dirname(markdownPath), { recursive: true });
  writeFileSync(csvPath, generated.csv);
  writeFileSync(markdownPath, generated.markdown);
  console.log(JSON.stringify(generated.summary, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
