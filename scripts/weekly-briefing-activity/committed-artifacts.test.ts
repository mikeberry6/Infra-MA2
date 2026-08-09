import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  activityAuditManifestSchema,
  assertManifestArtifactIntegrity,
  canonicalJson,
  hashCanonical,
  sha256Text,
  validateManifestForPublication,
} from "./index";
import {
  currentApprovalSummary,
  verifyReviewPacket,
  type ReviewPacket,
} from "./workflow-packets";

const RUN_DIRECTORY = "audits/weekly-briefing-activity/2026-08-07";

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8")) as unknown;
}

describe("committed August 7 V2 audit artifacts", () => {
  it("binds the frozen policy, 403-record review queue, and all packet files", () => {
    const manifest = activityAuditManifestSchema.parse(readJson(`${RUN_DIRECTORY}/manifest.json`));
    assertManifestArtifactIntegrity(manifest);
    expect(manifest).toMatchObject({
      schemaVersion: 2,
      methodologyVersion: "WEEKLY_BRIEFING_ACTIVITY_V2",
      cutoffDate: "2026-08-07",
      status: "IN_REVIEW",
      expectedCandidateCount: 403,
      publicationApproval: null,
    });
    expect(manifest.records).toHaveLength(403);
    expect(new Set(manifest.records.map((record) => record.recordId)).size).toBe(403);
    expect(manifest.records.every((record) =>
      record.scope === "UNRESOLVED"
      && record.secondReviewRisks.length === 0
      && record.review.firstReview === null
      && record.review.secondReview === null)).toBe(true);
    expect(currentApprovalSummary(manifest)).toEqual({
      firstCurrent: 0,
      secondReviewAssessmentPending: 403,
      secondRequired: 0,
      secondCurrent: 0,
      unresolved: 403,
    });

    const validation = validateManifestForPublication(manifest, {
      repositoryRoot: process.cwd(),
    });
    const codeCounts = validation.issues.reduce<Record<string, number>>((counts, issue) => {
      counts[issue.code] = (counts[issue.code] ?? 0) + 1;
      return counts;
    }, {});
    expect(validation.ok).toBe(false);
    expect(validation.issues).toHaveLength(2678);
    expect(codeCounts).toEqual({
      PORTFOLIO_PRINCIPAL_FACT_MISMATCH: 54,
      PRINCIPAL_ACTOR_KIND_MISMATCH: 403,
      UNRESOLVED_SCOPE: 403,
      MISSING_SPONSOR_LINEAGE: 368,
      INCLUDED_UNRESOLVED: 403,
      MISSING_FIRST_REVIEW: 403,
      MISSING_ACTING_ENTITY: 349,
      FUND_PRINCIPAL_FACT_MISMATCH: 261,
      INVALID_RELIABLE_SECONDARY_FALLBACK: 8,
      UNEXPLAINED_SECONDARY_EVIDENCE: 8,
      MISSING_PRINCIPAL_ACTOR_EVIDENCE: 15,
      MISSING_ACTING_ENTITY_EVIDENCE: 1,
      MANIFEST_NOT_APPROVED: 1,
      FINAL_CONTROL_MISMATCH: 1,
    });

    const index = readJson(`${RUN_DIRECTORY}/reviews/first/index.json`) as {
      indexSha256: string;
      packetCount: number;
      recordCount: number;
      baseManifestSha256: string;
      packets: Array<{ packetId: string; packetSha256: string; recordCount: number }>;
    };
    const { indexSha256, ...indexWithoutHash } = index;
    expect(indexSha256).toBe(hashCanonical(
      "weekly-briefing-activity-review-packet-index-v2",
      indexWithoutHash,
    ));
    expect(index).toMatchObject({
      packetCount: 17,
      recordCount: 403,
      baseManifestSha256: manifest.manifestSha256,
    });

    const queuedIds = new Set<string>();
    for (const packetEntry of index.packets) {
      const packetPath = `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.packet.json`;
      const packet = verifyReviewPacket(readJson(packetPath));
      expect(packet.packetSha256).toBe(packetEntry.packetSha256);
      expect(packet.recordCount).toBe(packetEntry.recordCount);
      expect(packet.baseManifestSha256).toBe(manifest.manifestSha256);
      for (const record of packet.records) {
        expect(queuedIds.has(record.recordId)).toBe(false);
        queuedIds.add(record.recordId);
      }

      const review = readJson(
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.review.json`,
      ) as {
        packetId: string;
        packetSha256: string;
        reviewer: string;
        reviewedAt: string;
        humanAttestation: Record<string, boolean>;
        decisions: Array<{
          baseRecordId: string;
          baseReviewedInputHash: string;
          outputs: Array<{ reviewedRecord: ReviewPacket["records"][number]["record"]; notes: string }>;
        }>;
      };
      expect(review).toMatchObject({
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "REPLACE_WITH_HUMAN_NAME",
        reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      });
      expect(Object.keys(review.humanAttestation).sort()).toEqual([
        "classificationVerified",
        "dispositionVerified",
        "evidenceOpened",
        "performedByHuman",
      ]);
      expect(Object.values(review.humanAttestation).every((value) => value === false)).toBe(true);
      expect(review.decisions).toHaveLength(packet.recordCount);
      const packetById = new Map(packet.records.map((record) => [record.recordId, record]));
      for (const decision of review.decisions) {
        const packetRecord = packetById.get(decision.baseRecordId);
        expect(packetRecord).toBeDefined();
        expect(decision.baseReviewedInputHash).toBe(packetRecord?.baseReviewedInputHash);
        expect(decision.outputs).toHaveLength(1);
        expect(decision.outputs[0].notes).toBe("");
        expect(canonicalJson(decision.outputs[0].reviewedRecord)).toBe(canonicalJson(packetRecord?.record));
      }
    }
    expect(queuedIds).toEqual(new Set(manifest.records.map((record) => record.recordId)));
  });

  it("preserves both public emails and keeps August 7 out of the approved index", () => {
    expect(sha256Text(readFileSync(join(process.cwd(), "public/email-format/2026-08-07.html"), "utf8")))
      .toBe("b06039ee477a9c53ea28b5cb86807634f4d73adb131bbf1d4c19b7185b09b936");
    expect(sha256Text(readFileSync(join(process.cwd(), "public/email-format/2026-07-31.html"), "utf8")))
      .toBe("17ae39249677e8f57db1038641cbb582357576ac6465b92bea2dc3f71c58388e");
    const approvedIndexRaw = readFileSync(
      join(process.cwd(), "public/email-format/approved-editions.json"),
      "utf8",
    );
    expect(sha256Text(approvedIndexRaw))
      .toBe("a7910df95097388350d167fb4ab36acc5e7cd29c1e1a3c0106bc7c8db884dfee");
    const approvedIndex = JSON.parse(approvedIndexRaw) as { entries: Array<{ edition: string }> };
    expect(approvedIndex.entries.some((entry) => entry.edition === "2026-08-07")).toBe(false);
  });
});
