import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  assertManifestArtifactIntegrity,
  computeActivityTotals,
  finalizeActivityManifest,
  sha256Text,
} from "./index";
import { computeNonChartSha256 } from "./render-charts";
import { sha256Canonical } from "./sources-normalize";
import { captureWeeklyActivityInputs } from "./sources-snapshot";
import { buildWorkflowArtifacts } from "./workflow-artifacts";
import {
  assertValidReviewedRecordExpansion,
  applyReviewDecisionFile,
  buildReviewPackets,
  currentApprovalSummary,
} from "./workflow-packets";

async function buildWorkflowFixture() {
  const repoRoot = process.cwd();
  const cutoff = "2026-08-07";
  const snapshot = await captureWeeklyActivityInputs({
    repoRoot,
    cutoff,
    production: {
      status: "NOT_CONFIGURED",
      cutoff,
      queryContract: "PUBLISHED_DEALS_THROUGH_CUTOFF_READ_ONLY",
      recordCount: 0,
      recordsHash: sha256Canonical([]),
      records: [],
      reason: "Unit test deliberately avoids a network query.",
    },
  });
  return buildWorkflowArtifacts({
    repoRoot,
    snapshot,
    generatedAt: "2026-08-08T12:00:00Z",
  });
}

describe("weekly activity review workflow", () => {
  let artifacts: Awaited<ReturnType<typeof buildWorkflowFixture>>;

  beforeAll(async () => {
    artifacts = await buildWorkflowFixture();
  }, 15_000);

  it("builds a hash-bound 403-candidate draft without pretending automation is approval", () => {
    const records = artifacts.manifest.records;
    const candidateCounts = records.reduce<Record<string, number>>((counts, record) => {
      const scope = record.candidateClassification?.candidateScope ?? "NONE";
      counts[scope] = (counts[scope] ?? 0) + 1;
      return counts;
    }, {});
    const dispositionCounts = records.reduce<Record<string, number>>((counts, record) => {
      counts[record.disposition] = (counts[record.disposition] ?? 0) + 1;
      return counts;
    }, {});

    expect(records).toHaveLength(403);
    expect(new Set(records.map((record) => record.transactionIdentityKey)).size).toBe(403);
    expect(candidateCounts).toEqual({
      PORTFOLIO_COMPANY: 90,
      UNRESOLVED: 73,
      DIRECT_FUND: 240,
    });
    expect(dispositionCounts).toEqual({ KEEP: 395, RECLASSIFY: 8 });
    expect(records.filter((record) => record.priorAuditEvidence.length > 0)).toHaveLength(204);
    expect(records.filter((record) => record.ambiguityFlags.length > 0)).toHaveLength(169);
    expect(currentApprovalSummary(artifacts.manifest)).toEqual({
      firstCurrent: 0,
      secondRequired: 169,
      secondCurrent: 0,
      unresolved: 403,
    });
    expect(artifacts.manifest.totals.grandTotal).toEqual({
      directFund: 0,
      portfolioCompany: 0,
      total: 0,
    });
    assertManifestArtifactIntegrity(artifacts.manifest);
  });

  it("creates balanced immutable first-review packets grouped by actor", () => {
    const packetSet = buildReviewPackets({
      manifest: artifacts.manifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    });

    expect(packetSet.packets).toHaveLength(17);
    expect(packetSet.packets.map((packet) => packet.recordCount)).toEqual([
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      23, 23, 23, 23, 23,
    ]);
    expect(packetSet.packets.flatMap((packet) => packet.records)).toHaveLength(403);
    expect(new Set(packetSet.packets.flatMap((packet) => packet.records.map((record) => record.recordId))).size).toBe(403);
    expect(packetSet.files.filter((file) => file.relativePath.endsWith(".packet.json"))).toHaveLength(17);
    expect(packetSet.files.filter((file) => file.relativePath.endsWith(".review.json"))).toHaveLength(17);
    const firstTemplate = JSON.parse(packetSet.files.find((file) =>
      file.relativePath.endsWith("first-001.review.json"))!.contents);
    expect(firstTemplate.decisions[0]).toMatchObject({
      baseRecordId: packetSet.packets[0].records[0].recordId,
      outputs: [{ notes: "" }],
    });
    expect(firstTemplate.decisions[0].outputs[0].reviewedRecord.recordId)
      .toBe(packetSet.packets[0].records[0].recordId);
  });

  it("allows only first review to expand a bundled candidate into unique suffixed legal transactions", () => {
    const baseRecord = structuredClone(artifacts.manifest.records[0]);
    const split = (suffix: string) => {
      const record = structuredClone(baseRecord);
      record.splitSuffix = suffix;
      record.recordId = `${record.legacyId}#${suffix}`;
      record.transactionIdentityKey = `${record.transactionIdentityKey}|${suffix}`;
      record.transactionStructure.isBundledAnnouncement = true;
      record.ambiguityFlags = [...new Set([
        ...record.ambiguityFlags,
        "BUNDLED_ANNOUNCEMENT" as const,
      ])];
      return record;
    };
    const outputs = [split("asset-a"), split("asset-b")];

    expect(() => assertValidReviewedRecordExpansion({
      baseRecord,
      stage: "FIRST",
      reviewedRecords: outputs,
    })).not.toThrow();
    expect(() => assertValidReviewedRecordExpansion({
      baseRecord,
      stage: "SECOND",
      reviewedRecords: outputs,
    })).toThrow(/only a first review/i);

    const duplicateSuffix = [outputs[0], structuredClone(outputs[0])];
    expect(() => assertValidReviewedRecordExpansion({
      baseRecord,
      stage: "FIRST",
      reviewedRecords: duplicateSuffix,
    })).toThrow(/unique/i);

    const changedIdentity = structuredClone(baseRecord);
    changedIdentity.legacyId = "INF-2026-999";
    changedIdentity.recordId = "INF-2026-999";
    expect(() => assertValidReviewedRecordExpansion({
      baseRecord,
      stage: "FIRST",
      reviewedRecords: [changedIdentity],
    })).toThrow(/preserve the candidate identity/i);
  });

  it("replaces one packet base record with separately approved split outputs", () => {
    const baseRecord = structuredClone(artifacts.manifest.records[0]);
    const sourceId = baseRecord.sourceEvidence[0].sourceId;
    baseRecord.scope = "DIRECT_FUND";
    baseRecord.scopeRationale = "The fund vehicle is the verified transaction principal.";
    baseRecord.actors.buyers = [{
      name: "TPG Rise Climate",
      entityKind: "FUND",
      isPrincipal: true,
      sponsorName: "TPG",
      sourceIds: [sourceId],
    }];
    baseRecord.actingEntity = {
      name: "TPG Rise Climate",
      entityKind: "FUND",
      side: "BUYER",
      isOperatingCompany: false,
      sourceIds: [sourceId],
    };
    baseRecord.sponsorLineage = [{
      sponsorName: "TPG",
      entityName: "TPG Rise Climate",
      relationship: "ADVISER",
      sourceIds: [sourceId],
      rationale: "The primary transaction source identifies the TPG fund vehicle.",
    }];
    baseRecord.classificationFacts = {
      principalActorKind: "FUND",
      fundVehicleActsAsPrincipal: true,
      portfolioCompanyActsAsPrincipal: false,
      fundSellsOrInvests: true,
      alreadyOwnedOperatingCompany: false,
    };
    const oneRecordManifest = finalizeActivityManifest({
      ...artifacts.manifest,
      expectedCandidateCount: 1,
      records: [baseRecord],
      totals: computeActivityTotals([baseRecord]),
    });
    const packet = buildReviewPackets({
      manifest: oneRecordManifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    const output = (suffix: string) => {
      const record = structuredClone(baseRecord);
      record.splitSuffix = suffix;
      record.recordId = `${record.legacyId}#${suffix}`;
      record.target = `${record.target} ${suffix}`;
      record.transactionIdentityKey = `${record.transactionIdentityKey}|${suffix}`;
      record.transactionStructure.isBundledAnnouncement = true;
      record.ambiguityFlags = ["BUNDLED_ANNOUNCEMENT"];
      return record;
    };

    const updated = applyReviewDecisionFile({
      manifest: oneRecordManifest,
      packet,
      decisionFile: {
        schemaVersion: 1,
        artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
        cutoffDate: oneRecordManifest.cutoffDate,
        stage: "FIRST",
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "Morgan Smith",
        reviewedAt: "2026-08-08T16:00:00.000Z",
        humanAttestation: {
          performedByHuman: true,
          evidenceOpened: true,
          dispositionVerified: true,
          classificationVerified: true,
        },
        decisions: [{
          baseRecordId: baseRecord.recordId,
          baseReviewedInputHash: packet.records[0].baseReviewedInputHash,
          outputs: [
            { reviewedRecord: output("asset-a"), notes: "Verified legal transaction A." },
            { reviewedRecord: output("asset-b"), notes: "Verified legal transaction B." },
          ],
        }],
      },
    });

    expect(updated.records.map((record) => record.recordId)).toEqual([
      `${baseRecord.legacyId}#asset-a`,
      `${baseRecord.legacyId}#asset-b`,
    ]);
    expect(currentApprovalSummary(updated)).toMatchObject({
      firstCurrent: 2,
      secondRequired: 2,
      secondCurrent: 0,
      unresolved: 0,
    });
    expect(updated.expectedCandidateCount).toBe(1);
  });

  it("freezes the exact non-chart email content independently of chart rendering", () => {
    const frozen = artifacts.manifest.frozenInputs.find(
      (input) => input.inputArtifactId === "protected-non-chart-email",
    );
    const file = artifacts.files.find(
      (candidate) => candidate.relativePath.endsWith("/inputs/protected-non-chart.html"),
    );
    const html = readFileSync(join(process.cwd(), "public/email-format/2026-08-07.html"), "utf8");

    expect(frozen).toBeDefined();
    expect(file).toBeDefined();
    expect(frozen?.sha256).toBe(sha256Text(file!.contents));
    expect(frozen?.sha256).toBe(computeNonChartSha256(html));
  });

  it("emits a fail-closed Outlook QA approval template", () => {
    const template = artifacts.files.find((file) =>
      file.relativePath.endsWith("/outlook-qa-approval.template.json"),
    );
    expect(template).toBeDefined();
    const parsed = JSON.parse(template!.contents) as {
      edition: string;
      reviewer: string;
      humanAttestation: Record<string, boolean>;
    };
    expect(parsed.edition).toBe("2026-08-07");
    expect(parsed.reviewer).toBe("REPLACE_WITH_HUMAN_NAME");
    expect(Object.values(parsed.humanAttestation)).toEqual(
      Array(Object.keys(parsed.humanAttestation).length).fill(false),
    );
  });
});
