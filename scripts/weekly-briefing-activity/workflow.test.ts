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
  buildReviewOverviewFiles,
  compileCompactReviewWorksheet,
  currentApprovalSummary,
  verifyReviewPacketIndex,
} from "./workflow-packets";

async function buildWorkflowFixture(generatedAt = "2026-08-08T12:00:00Z") {
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
    generatedAt,
  });
}

function verifiedDirectCandidate(value: Awaited<ReturnType<typeof buildWorkflowFixture>>["manifest"]["records"][number]) {
  const record = structuredClone(value);
  const sourceId = record.sourceEvidence[0].sourceId;
  const fundName = `Verified Fund ${record.legacyId}`;
  record.scope = "DIRECT_FUND";
  record.scopeRationale = "The cited fund vehicle is the verified legal acting entity.";
  record.actors = {
    buyers: [{
      name: fundName,
      entityKind: "FUND",
      isPrincipal: true,
      sponsorName: "Verified Sponsor",
      sourceIds: [sourceId],
    }],
    sellers: [],
    jointVentureParticipants: [],
  };
  record.actingEntity = {
    name: fundName,
    entityKind: "FUND",
    side: "BUYER",
    isOperatingCompany: false,
    sourceIds: [sourceId],
  };
  record.sponsorLineage = [{
    sponsorName: "Verified Sponsor",
    entityName: fundName,
    relationship: "ADVISER",
    sourceIds: [sourceId],
    rationale: "The transaction evidence identifies the advised fund vehicle.",
  }];
  record.transactionStructure.isBundledAnnouncement = false;
  record.transactionStructure.isMixedDirectPortfolio = false;
  record.transactionStructure.newPlatformWithInseparableSeedAcquisition = false;
  record.transactionStructure.primaryOnlyPortfolioCompanyIssuance = false;
  record.classificationFacts = {
    principalActorKind: "FUND",
    fundVehicleActsAsPrincipal: true,
    portfolioCompanyActsAsPrincipal: false,
    fundSellsOrInvests: true,
    alreadyOwnedOperatingCompany: false,
  };
  record.secondReviewRisks = [];
  return record;
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
    expect(records.filter((record) => record.secondReviewRisks.length > 0)).toHaveLength(0);
    expect(currentApprovalSummary(artifacts.manifest)).toEqual({
      firstCurrent: 0,
      secondReviewAssessmentPending: 403,
      secondRequired: 0,
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
    expect(packetSet.supportFiles.filter((file) => file.relativePath.endsWith(".worksheet.json"))).toHaveLength(17);
    expect(packetSet.supportFiles.map((file) => file.relativePath)).toContain(
      `${artifacts.runDirectory}/reviews/index.md`,
    );
    expect(packetSet.supportFiles.map((file) => file.relativePath)).toContain(
      `${artifacts.runDirectory}/reviews/second-review-exception-preview.md`,
    );
    expect(packetSet.files.every((file) => file.sha256 === sha256Text(file.contents))).toBe(true);
    expect(packetSet.supportFiles.every((file) => file.sha256 === sha256Text(file.contents))).toBe(true);
    const firstTemplate = JSON.parse(packetSet.files.find((file) =>
      file.relativePath.endsWith("first-001.review.json"))!.contents);
    expect(firstTemplate.decisions[0]).toMatchObject({
      baseRecordId: packetSet.packets[0].records[0].recordId,
      outputs: [{ notes: "" }],
    });
    expect(firstTemplate.decisions[0].outputs[0].reviewedRecord.recordId)
      .toBe(packetSet.packets[0].records[0].recordId);
    const compactTemplate = JSON.parse(packetSet.supportFiles.find((file) =>
      file.relativePath.endsWith("first-001.worksheet.json"))!.contents);
    expect(compactTemplate).toMatchObject({
      artifactType: "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET",
      reviewer: "REPLACE_WITH_HUMAN_NAME",
      humanAttestation: {
        performedByHuman: false,
        dispositionVerified: false,
        classificationVerified: false,
      },
    });
    expect(compactTemplate.decisions[0]).toMatchObject({
      baseRecordId: packetSet.packets[0].records[0].recordId,
      evidenceOpened: false,
      decision: "REPLACE_WITH_ACCEPT_RECOMMENDATION_OR_EDITED_RECORD",
      outputs: [{ notes: "" }],
    });
    const firstMarkdown = packetSet.files.find((file) =>
      file.relativePath.endsWith("first-001.md"))!.contents;
    expect(firstMarkdown).toContain("**Recommended scope**");
    expect(firstMarkdown).toContain("Original automation candidate *(research prompt; not approval)*");
    expect(firstMarkdown).toContain("Scope rationale");
    expect(firstMarkdown).toContain("Evidence to open:");
    const packetIndex = JSON.parse(packetSet.indexFile.contents);
    expect(verifyReviewPacketIndex(packetIndex).recordCount).toBe(403);
    expect(() => verifyReviewPacketIndex({ ...packetIndex, recordCount: 402 }))
      .toThrow(/hash|count/i);
  });

  it("approves an obvious evidence-backed batch while preserving record-level hashes", () => {
    const records = artifacts.manifest.records.slice(0, 2).map(verifiedDirectCandidate);
    const manifest = finalizeActivityManifest({
      ...artifacts.manifest,
      expectedCandidateCount: 2,
      records,
      totals: computeActivityTotals(records),
    });
    const packet = buildReviewPackets({
      manifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    const updated = applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        schemaVersion: 1,
        artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
        cutoffDate: manifest.cutoffDate,
        stage: "FIRST",
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "Morgan Smith",
        reviewedAt: "2026-08-09T16:00:00.000Z",
        humanAttestation: {
          performedByHuman: true,
          evidenceOpened: true,
          dispositionVerified: true,
          classificationVerified: true,
        },
        decisions: packet.records.map((item) => ({
          baseRecordId: item.recordId,
          baseReviewedInputHash: item.baseReviewedInputHash,
          outputs: [{
            reviewedRecord: item.record,
            notes: `Opened the evidence and verified ${item.recordId}.`,
          }],
        })),
      },
    });

    expect(currentApprovalSummary(updated)).toEqual({
      firstCurrent: 2,
      secondReviewAssessmentPending: 0,
      secondRequired: 0,
      secondCurrent: 0,
      unresolved: 0,
    });
    const hashes = updated.records.map((record) => record.review.firstReview?.reviewedInputHash);
    expect(new Set(hashes).size).toBe(2);
  });

  it("compiles explicit compact worksheet decisions through the unchanged full review gate", () => {
    const records = artifacts.manifest.records.slice(0, 2).map(verifiedDirectCandidate);
    const manifest = finalizeActivityManifest({
      ...artifacts.manifest,
      expectedCandidateCount: 2,
      records,
      totals: computeActivityTotals(records),
    });
    const packet = buildReviewPackets({
      manifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    const edited = structuredClone(packet.records[1].record);
    edited.scopeRationale = `${edited.scopeRationale} The human reviewer also confirmed the disclosed vehicle name.`;
    const worksheet = {
      schemaVersion: 1,
      artifactType: "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET",
      cutoffDate: manifest.cutoffDate,
      stage: "FIRST",
      packetId: packet.packetId,
      packetSha256: packet.packetSha256,
      reviewer: "Morgan Smith",
      reviewedAt: "2026-08-09T16:00:00.000Z",
      humanAttestation: {
        performedByHuman: true,
        dispositionVerified: true,
        classificationVerified: true,
      },
      decisions: [
        {
          baseRecordId: packet.records[0].recordId,
          baseReviewedInputHash: packet.records[0].baseReviewedInputHash,
          evidenceOpened: true,
          decision: "ACCEPT_RECOMMENDATION",
          outputs: [{
            notes: `Opened the cited evidence and confirmed the acting fund vehicle for ${packet.records[0].recordId}.`,
          }],
        },
        {
          baseRecordId: packet.records[1].recordId,
          baseReviewedInputHash: packet.records[1].baseReviewedInputHash,
          evidenceOpened: true,
          decision: "EDITED_RECORD",
          outputs: [{
            reviewedRecord: edited,
            notes: `Opened the cited evidence and refined the vehicle rationale for ${packet.records[1].recordId}.`,
          }],
        },
      ],
    };
    const compiled = compileCompactReviewWorksheet({ packet, worksheet });
    expect(compiled.artifactType).toBe("WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS");
    expect(compiled.humanAttestation.evidenceOpened).toBe(true);
    expect(compiled.decisions[0].outputs[0].reviewedRecord)
      .toEqual(packet.records[0].record);
    expect(compiled.decisions[1].outputs[0].reviewedRecord.scopeRationale)
      .toBe(edited.scopeRationale);

    const updated = applyReviewDecisionFile({ manifest, packet, decisionFile: compiled });
    expect(currentApprovalSummary(updated)).toMatchObject({
      firstCurrent: 2,
      secondReviewAssessmentPending: 0,
    });
    expect(updated.records[1].scopeRationale).toBe(edited.scopeRationale);
    const refreshedOverview = buildReviewOverviewFiles({
      manifest: updated,
      firstReviewPackets: [packet],
      runDirectory: artifacts.runDirectory,
    });
    const refreshedIndex = refreshedOverview.find((file) =>
      file.relativePath.endsWith("/reviews/index.md"))!.contents;
    expect(refreshedIndex).toContain("First approvals current | 2 / 2");
    expect(refreshedIndex).toContain("| first-001 | 2 | 2 | 0 |");
    expect(refreshedIndex).toContain(`Manifest hash: \`${updated.manifestSha256}\``);

    expect(() => compileCompactReviewWorksheet({
      packet,
      worksheet: {
        ...worksheet,
        decisions: worksheet.decisions.map((decision, index) => index === 0
          ? { ...decision, evidenceOpened: false }
          : decision),
      },
    })).toThrow();
    expect(() => compileCompactReviewWorksheet({
      packet,
      worksheet: { ...worksheet, reviewer: "REPLACE_WITH_HUMAN_NAME" },
    })).toThrow(/human|placeholder/i);
    expect(() => compileCompactReviewWorksheet({
      packet,
      worksheet: {
        ...worksheet,
        decisions: worksheet.decisions.map((decision, index) => index === 0
          ? { ...decision, outputs: [{ notes: "Verified." }] }
          : decision),
      },
    })).toThrow(/substantive record-level rationale/i);
  });

  it("queues only verified risk exceptions after first review and enforces independent second review", () => {
    const records = artifacts.manifest.records.slice(0, 2).map(verifiedDirectCandidate);
    const riskRecord = records[1];
    const firstSource = riskRecord.sourceEvidence[0];
    const conflictSourceId = `${firstSource.sourceId}-conflict`;
    riskRecord.sourceEvidence.push({
      ...structuredClone(firstSource),
      sourceId: conflictSourceId,
      title: "Conflicting primary transaction notice",
      url: "https://independent-primary.example/conflicting-notice",
    });
    riskRecord.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Two primary notices report different announcement dates.",
      sourceIds: [firstSource.sourceId, conflictSourceId],
    }];
    const manifest = finalizeActivityManifest({
      ...artifacts.manifest,
      expectedCandidateCount: 2,
      records,
      totals: computeActivityTotals(records),
    });

    const prematureSecond = buildReviewPackets({
      manifest,
      stage: "SECOND",
      runDirectory: artifacts.runDirectory,
    });
    expect(prematureSecond.packets).toHaveLength(0);
    expect(currentApprovalSummary(manifest)).toMatchObject({
      secondReviewAssessmentPending: 2,
      secondRequired: 0,
    });

    const firstPacket = buildReviewPackets({
      manifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    const firstReviewed = applyReviewDecisionFile({
      manifest,
      packet: firstPacket,
      decisionFile: {
        schemaVersion: 1,
        artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
        cutoffDate: manifest.cutoffDate,
        stage: "FIRST",
        packetId: firstPacket.packetId,
        packetSha256: firstPacket.packetSha256,
        reviewer: "Morgan Smith",
        reviewedAt: "2026-08-09T16:00:00.000Z",
        humanAttestation: {
          performedByHuman: true,
          evidenceOpened: true,
          dispositionVerified: true,
          classificationVerified: true,
        },
        decisions: firstPacket.records.map((item) => ({
          baseRecordId: item.recordId,
          baseReviewedInputHash: item.baseReviewedInputHash,
          outputs: [{
            reviewedRecord: item.record,
            notes: `Opened and verified the evidence for ${item.recordId}.`,
          }],
        })),
      },
    });
    expect(currentApprovalSummary(firstReviewed)).toMatchObject({
      firstCurrent: 2,
      secondReviewAssessmentPending: 0,
      secondRequired: 1,
      secondCurrent: 0,
    });

    const secondPacket = buildReviewPackets({
      manifest: firstReviewed,
      stage: "SECOND",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    expect(secondPacket.records.map((item) => item.recordId)).toEqual([riskRecord.recordId]);
    const secondDecision = {
      schemaVersion: 1,
      artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
      cutoffDate: firstReviewed.cutoffDate,
      stage: "SECOND",
      packetId: secondPacket.packetId,
      packetSha256: secondPacket.packetSha256,
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-09T18:00:00.000Z",
      humanAttestation: {
        performedByHuman: true,
        evidenceOpened: true,
        dispositionVerified: true,
        classificationVerified: true,
      },
      decisions: secondPacket.records.map((item) => ({
        baseRecordId: item.recordId,
        baseReviewedInputHash: item.baseReviewedInputHash,
        outputs: [{
          reviewedRecord: item.record,
          notes: "Independently reopened both conflicting sources and verified the final classification.",
        }],
      })),
    };
    expect(() => applyReviewDecisionFile({
      manifest: firstReviewed,
      packet: secondPacket,
      decisionFile: { ...secondDecision, reviewer: "Morgan Smith" },
    })).toThrow(/different human reviewer/i);
    const twiceReviewed = applyReviewDecisionFile({
      manifest: firstReviewed,
      packet: secondPacket,
      decisionFile: secondDecision,
    });
    expect(currentApprovalSummary(twiceReviewed)).toMatchObject({
      secondRequired: 1,
      secondCurrent: 1,
    });
  });

  it("rejects incomplete, duplicated, stale, or note-free batch decisions", () => {
    const records = artifacts.manifest.records.slice(0, 2).map(verifiedDirectCandidate);
    const manifest = finalizeActivityManifest({
      ...artifacts.manifest,
      expectedCandidateCount: 2,
      records,
      totals: computeActivityTotals(records),
    });
    const packet = buildReviewPackets({
      manifest,
      stage: "FIRST",
      runDirectory: artifacts.runDirectory,
    }).packets[0];
    const decision = (item: typeof packet.records[number]) => ({
      baseRecordId: item.recordId,
      baseReviewedInputHash: item.baseReviewedInputHash,
      outputs: [{
        reviewedRecord: item.record,
        notes: `Opened the sources and verified the legal parties for ${item.recordId}.`,
      }],
    });
    const envelope = {
      schemaVersion: 1,
      artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_DECISIONS",
      cutoffDate: manifest.cutoffDate,
      stage: "FIRST",
      packetId: packet.packetId,
      packetSha256: packet.packetSha256,
      reviewer: "Morgan Smith",
      reviewedAt: "2026-08-09T16:00:00.000Z",
      humanAttestation: {
        performedByHuman: true,
        evidenceOpened: true,
        dispositionVerified: true,
        classificationVerified: true,
      },
      decisions: packet.records.map(decision),
    };

    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: { ...envelope, decisions: [decision(packet.records[0])] },
    })).toThrow(/cover every packet record/i);
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: { ...envelope, decisions: [decision(packet.records[0]), decision(packet.records[0])] },
    })).toThrow(/duplicate review decision/i);
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        ...envelope,
        decisions: envelope.decisions.map((item, index) => index === 0
          ? { ...item, baseRecordId: "OUT-OF-PACKET-001" }
          : item),
      },
    })).toThrow(/out-of-packet/i);
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        ...envelope,
        decisions: envelope.decisions.map((item, index) => index === 0
          ? { ...item, baseReviewedInputHash: "a".repeat(64) }
          : item),
      },
    })).toThrow(/review base is stale/i);
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        ...envelope,
        decisions: envelope.decisions.map((item, index) => index === 0
          ? { ...item, outputs: [{ ...item.outputs[0], notes: "" }] }
          : item),
      },
    })).toThrow();
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        ...envelope,
        decisions: envelope.decisions.map((item, index) => index === 0
          ? { ...item, outputs: [{ ...item.outputs[0], notes: "Verified." }] }
          : item),
      },
    })).toThrow(/substantive record-level rationale/i);
    expect(() => applyReviewDecisionFile({
      manifest,
      packet,
      decisionFile: {
        ...envelope,
        decisions: envelope.decisions.map((item, index) => index === 1
          ? { ...item, outputs: [{ ...item.outputs[0], notes: envelope.decisions[0].outputs[0].notes }] }
          : item),
      },
    })).toThrow(/distinct record-specific review notes/i);
  });

  it("allows only first review to expand a bundled candidate into unique suffixed legal transactions", () => {
    const baseRecord = structuredClone(artifacts.manifest.records[0]);
    const split = (suffix: string) => {
      const record = structuredClone(baseRecord);
      record.splitSuffix = suffix;
      record.recordId = `${record.legacyId}#${suffix}`;
      record.transactionIdentityKey = `${record.transactionIdentityKey}|${suffix}`;
      record.transactionStructure.isBundledAnnouncement = true;
      record.secondReviewRisks = [{
        kind: "BUNDLED_LEGAL_TRANSACTIONS",
        detail: "The primary source contains two legally distinct transactions.",
        sourceIds: [record.sourceEvidence[0].sourceId],
      }];
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
      record.secondReviewRisks = [{
        kind: "BUNDLED_LEGAL_TRANSACTIONS",
        detail: "The primary source contains two legally distinct transactions.",
        sourceIds: [sourceId],
      }];
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
      secondReviewAssessmentPending: 0,
      secondRequired: 2,
      secondCurrent: 0,
      unresolved: 0,
    });
    expect(updated.expectedCandidateCount).toBe(1);
    const splitOverview = buildReviewOverviewFiles({
      manifest: updated,
      firstReviewPackets: [packet],
      runDirectory: artifacts.runDirectory,
    }).find((file) => file.relativePath.endsWith("/reviews/index.md"))!.contents;
    expect(splitOverview).toContain("First approvals current | 2 / 2");
    expect(splitOverview).toContain("| first-001 | 1 | 1 | 0 |");
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

  it("writes a stable frozen policy under inputs regardless of command timestamp", async () => {
    const laterArtifacts = await buildWorkflowFixture("2026-08-10T12:00:00Z");
    const currentPolicy = artifacts.files.find((file) =>
      file.relativePath.endsWith("/inputs/review-policy.json"));
    const laterPolicy = laterArtifacts.files.find((file) =>
      file.relativePath.endsWith("/inputs/review-policy.json"));
    expect(currentPolicy).toBeDefined();
    expect(laterPolicy).toBeDefined();
    expect(laterPolicy?.contents).toBe(currentPolicy?.contents);
    expect(laterPolicy?.sha256).toBe(currentPolicy?.sha256);
  }, 15_000);

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
