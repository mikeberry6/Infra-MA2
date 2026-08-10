import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  activityAuditManifestSchema,
  assertManifestArtifactIntegrity,
  canonicalJson,
  deriveSecondReviewReasons,
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
  it("binds the evidence-backed 403-candidate classification and all packet files", () => {
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
    // One 403-row source candidate contains two legally distinct transactions,
    // so the record-level queue contains two suffixed outputs for that legacy ID.
    expect(manifest.records).toHaveLength(404);
    expect(new Set(manifest.records.map((record) => record.recordId)).size).toBe(404);
    expect(new Set(manifest.records.map((record) => record.legacyId)).size).toBe(403);
    expect(manifest.records.every((record) =>
      record.scope !== "UNRESOLVED"
      && record.review.firstReview === null
      && record.review.secondReview === null)).toBe(true);
    expect(manifest.records.filter((record) => record.splitSuffix !== null).map((record) => record.recordId))
      .toEqual([
        "INF-2026-077#substantial-group-acquisition",
        "INF-2026-077#youfibre-brsk-sale",
      ]);
    expect(manifest.totals).toEqual({
      grandTotal: { directFund: 285, portfolioCompany: 117, total: 402 },
      bySector: [
        { sector: "Power & ET", counts: { directFund: 100, portfolioCompany: 56, total: 156 } },
        { sector: "Utilities", counts: { directFund: 28, portfolioCompany: 10, total: 38 } },
        { sector: "Digital", counts: { directFund: 53, portfolioCompany: 20, total: 73 } },
        { sector: "Midstream", counts: { directFund: 19, portfolioCompany: 3, total: 22 } },
        { sector: "Transportation", counts: { directFund: 53, portfolioCompany: 22, total: 75 } },
        { sector: "Social Infra", counts: { directFund: 32, portfolioCompany: 6, total: 38 } },
      ],
      byRegion: [
        { region: "North America", counts: { directFund: 115, portfolioCompany: 52, total: 167 } },
        { region: "Europe", counts: { directFund: 110, portfolioCompany: 47, total: 157 } },
        { region: "Asia-Pacific", counts: { directFund: 44, portfolioCompany: 16, total: 60 } },
        { region: "Latin America", counts: { directFund: 11, portfolioCompany: 2, total: 13 } },
        { region: "Middle East & Africa", counts: { directFund: 5, portfolioCompany: 0, total: 5 } },
      ],
    });
    expect(currentApprovalSummary(manifest)).toEqual({
      firstCurrent: 0,
      secondReviewAssessmentPending: 404,
      secondRequired: 0,
      secondCurrent: 0,
      unresolved: 0,
    });

    const validation = validateManifestForPublication(manifest, {
      repositoryRoot: process.cwd(),
    });
    const codeCounts = validation.issues.reduce<Record<string, number>>((counts, issue) => {
      counts[issue.code] = (counts[issue.code] ?? 0) + 1;
      return counts;
    }, {});
    expect(validation.ok).toBe(false);
    expect(validation.issues).toHaveLength(421);
    expect(codeCounts).toEqual({
      MISSING_FIRST_REVIEW: 404,
      MISSING_SECOND_REVIEW: 15,
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
      recordCount: 404,
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

      const markdown = readFileSync(join(
        process.cwd(),
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.md`,
      ), "utf8");
      expect(markdown).toContain("**Recommended scope**");
      expect(markdown).toContain("Original automation candidate *(research prompt; not approval)*");
      expect(markdown).toContain("Acting entity");
      expect(markdown).toContain("Sponsor lineage");
      expect(markdown).toContain("Scope rationale");
      expect(markdown).toContain("Disposition rationale");
      expect(markdown).toContain("Evidence to open:");

      const worksheet = readJson(
        `${RUN_DIRECTORY}/reviews/first/${packetEntry.packetId}.worksheet.json`,
      ) as {
        artifactType: string;
        packetId: string;
        packetSha256: string;
        reviewer: string;
        reviewedAt: string;
        humanAttestation: Record<string, boolean>;
        decisions: Array<{
          baseRecordId: string;
          baseReviewedInputHash: string;
          evidenceOpened: boolean;
          decision: string;
          outputs: Array<{ notes: string }>;
        }>;
      };
      expect(worksheet).toMatchObject({
        artifactType: "WEEKLY_BRIEFING_ACTIVITY_COMPACT_REVIEW_WORKSHEET",
        packetId: packet.packetId,
        packetSha256: packet.packetSha256,
        reviewer: "REPLACE_WITH_HUMAN_NAME",
        reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      });
      expect(Object.values(worksheet.humanAttestation).every((value) => value === false)).toBe(true);
      expect(worksheet.decisions).toHaveLength(packet.recordCount);
      for (const decision of worksheet.decisions) {
        const packetRecord = packetById.get(decision.baseRecordId);
        expect(packetRecord).toBeDefined();
        expect(decision).toMatchObject({
          baseReviewedInputHash: packetRecord?.baseReviewedInputHash,
          evidenceOpened: false,
          decision: "REPLACE_WITH_ACCEPT_RECOMMENDATION_OR_EDITED_RECORD",
          outputs: [{ notes: "" }],
        });
      }
    }
    expect(queuedIds).toEqual(new Set(manifest.records.map((record) => record.recordId)));

    const canonicalExceptions = manifest.records
      .filter((record) => deriveSecondReviewReasons(record).length > 0);
    expect(canonicalExceptions).toHaveLength(15);
    const reviewIndex = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/reviews/index.md`),
      "utf8",
    );
    expect(reviewIndex).toContain("First approvals current | 0 / 404");
    expect(reviewIndex).toContain("NON-APPROVABLE PREVIEW — 15 canonical exception records");
    expect(reviewIndex).toContain("second-review-exception-preview.md");
    const exceptionPreview = readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/reviews/second-review-exception-preview.md`),
      "utf8",
    );
    expect(exceptionPreview).toContain("PLANNING ONLY — NOT A REVIEW PACKET, SIGNATURE, OR APPROVAL");
    expect(exceptionPreview.match(/^## \d+\./gm)).toHaveLength(15);
    for (const record of canonicalExceptions) {
      expect(exceptionPreview).toContain(`\`${record.recordId}\``);
    }
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
    expect(sha256Text(readFileSync(
      join(process.cwd(), `${RUN_DIRECTORY}/preview/2026-08-07.html`),
      "utf8",
    ))).toBe("d907dd7e64963d8d69ab1fb5e751c4ef5f54c80471b2d623389552ab48641064");
  });
});
