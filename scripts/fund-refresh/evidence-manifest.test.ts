import { describe, expect, it } from "vitest";
import { buildFundSourceAudit } from "../generate-fund-source-audit";
import {
  compareManifestEvidenceToRevision,
  evidenceSourceId,
  loadFundEvidenceManifest,
  loadFundManifest,
  validateFundEvidenceManifest,
} from "./lib";

describe("normalized fund evidence manifest", () => {
  const evidence = loadFundEvidenceManifest();

  it("stores one validated record per fund/source evidence relationship", () => {
    const evidenceFundIds = new Set(evidence.records.map((record) => record.legacyId));
    expect(evidence.schemaVersion).toBe(2);
    expect(evidence.records.length).toBeGreaterThanOrEqual(evidenceFundIds.size);
    expect(new Set(evidence.fundNotes.map((note) => note.legacyId))).toEqual(evidenceFundIds);
    expect(validateFundEvidenceManifest(evidence)).toEqual([]);
    for (const record of evidence.records) {
      expect(record.sourceId).toBe(evidenceSourceId(record.url));
      expect(record.supportedFields).toEqual([...new Set(record.supportedFields)].sort());
    }
  });

  it("generates a per-source matrix while keeping evidenceFunds as a fund count", () => {
    const manifest = loadFundManifest();
    const evidenceFundIds = new Set(evidence.records.map((record) => record.legacyId));
    const missingFunds = manifest.funds.filter((fund) => !evidenceFundIds.has(fund.id)).length;
    const generated = buildFundSourceAudit(manifest, evidence);
    expect(generated.summary).toEqual({
      manifestFunds: manifest.funds.length,
      evidenceFunds: evidenceFundIds.size,
      evidenceRows: evidence.records.length,
      missingFunds,
    });
    expect(generated.rows).toHaveLength(evidence.records.length + missingFunds);
    expect(generated.csv.split("\n")[0]).toContain("sourceId,sourceUrl,sourceTier,scope");
  });

  it("compares affected manifest evidence with revision-image semantics", () => {
    const record = evidence.records[0];
    const fundRecords = evidence.records.filter((item) => item.legacyId === record.legacyId);
    const matching = compareManifestEvidenceToRevision(evidence, record.legacyId, fundRecords.map((item) => ({
      url: item.url,
      evidenceLabel: item.evidenceLabel,
      existing: {
        supportedFields: item.supportedFields,
        sourceTier: item.sourceTier,
        scope: item.scope,
        publishedAt: item.publishedAt,
        retrievedAt: `${item.retrievedAt}T00:00:00.000Z`,
        confidence: item.confidence,
        pipelineRunId: "ignored-operational-metadata",
      },
    })));
    expect(matching.matches).toBe(true);

    const unexpected = compareManifestEvidenceToRevision(evidence, record.legacyId, [{
      url: record.url,
      evidenceLabel: record.evidenceLabel,
      existing: null,
    }]);
    expect(unexpected.matches).toBe(false);
  });

  it("rejects unstable source IDs and noncanonical supported fields", () => {
    const invalid = structuredClone(evidence);
    invalid.records[0].sourceId = "fundsrc_not_deterministic";
    invalid.records[0].supportedFields = ["notARealFundField"];
    expect(validateFundEvidenceManifest(invalid).map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "EVIDENCE_SOURCE_ID",
      "UNKNOWN_SUPPORTED_FIELD",
    ]));
  });
});
