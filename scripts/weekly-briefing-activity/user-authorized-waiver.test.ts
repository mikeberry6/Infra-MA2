import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sha256Bytes } from "./hash";
import type { ActivityAuditManifest } from "./schema";
import {
  assertUserAuthorizedManifestEligible,
  assertUserAuthorizedPublicationWaiverMatches,
  computeUserAuthorizedPublicationWaiverSha256,
  computeUserAuthorizedWaiverIssueFingerprint,
  finalizeUserAuthorizedPublicationWaiver,
  parseUserAuthorizedPublicationWaiver,
  USER_AUTHORIZED_RETAINED_GATES,
  USER_AUTHORIZED_WAIVED_GATES,
  USER_AUTHORIZED_WAIVER_ISSUE_CODE_COUNTS,
  USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT,
  USER_AUTHORIZED_WAIVER_MANIFEST_FILE_SHA256,
  USER_AUTHORIZED_WAIVER_MANIFEST_PATH,
  USER_AUTHORIZED_WAIVER_MANIFEST_SHA256,
  USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256,
  USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
  USER_AUTHORIZED_WAIVER_TOTALS,
  USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_PATH,
  USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_SHA256,
  type UserAuthorizedPublicationWaiver,
} from "./user-authorized-waiver";

const REPOSITORY_ROOT = process.cwd();

function manifestFixture(): ActivityAuditManifest {
  return JSON.parse(readFileSync(
    USER_AUTHORIZED_WAIVER_MANIFEST_PATH,
    "utf8",
  )) as ActivityAuditManifest;
}

function waiverFixture(): UserAuthorizedPublicationWaiver {
  return finalizeUserAuthorizedPublicationWaiver({
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_USER_AUTHORIZED_PUBLICATION_WAIVER",
    edition: "2026-08-07",
    recordedAt: "2026-08-10T03:00:00.000Z",
    authorizationSource: "CODEX_THREAD_USER_MESSAGE",
    authorizationStatement: "authorized",
    authorizationScope:
      "EDITION_ONLY_IMMEDIATE_PUBLICATION_WITH_HUMAN_REVIEW_AND_OUTLOOK_GATES_WAIVED",
    waivedGates: [...USER_AUTHORIZED_WAIVED_GATES],
    retainedGates: [...USER_AUTHORIZED_RETAINED_GATES],
    manifestPath: USER_AUTHORIZED_WAIVER_MANIFEST_PATH,
    manifestSha256: USER_AUTHORIZED_WAIVER_MANIFEST_SHA256,
    manifestFileSha256: USER_AUTHORIZED_WAIVER_MANIFEST_FILE_SHA256,
    manifestStatus: "IN_REVIEW",
    publicationApprovalPresent: false,
    finalApprovedTotal: null,
    protectedNonChartSha256:
      USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256,
    renderedEmailSha256: USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
    validationReportPath: USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_PATH,
    validationReportSha256:
      USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_SHA256,
    validationIssueCount: 421,
    validationIssueCodeCounts: {
      ...USER_AUTHORIZED_WAIVER_ISSUE_CODE_COUNTS,
    },
    validationIssueFingerprint:
      USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT,
    totals: { ...USER_AUTHORIZED_WAIVER_TOTALS },
  });
}

describe("edition-specific user-authorized publication waiver", () => {
  it("accepts only the exact evidence-backed August 7 manifest issue contract", () => {
    const manifest = assertUserAuthorizedManifestEligible(manifestFixture(), {
      repositoryRoot: REPOSITORY_ROOT,
    });

    expect(manifest).toMatchObject({
      cutoffDate: "2026-08-07",
      manifestSha256: USER_AUTHORIZED_WAIVER_MANIFEST_SHA256,
      status: "IN_REVIEW",
      publicationApproval: null,
      controls: { finalApprovedTotal: null },
      totals: { grandTotal: USER_AUTHORIZED_WAIVER_TOTALS },
    });
    expect(manifest.records.every((record) =>
      record.review.firstReview === null)).toBe(true);
    expect(manifest.records.every((record) =>
      record.review.secondReview === null)).toBe(true);
  });

  it("recomputes the exact 421-finding fingerprint from the bound report", () => {
    const report = JSON.parse(readFileSync(
      USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_PATH,
      "utf8",
    )) as {
      issues: Array<{ code: string; recordId?: string; path?: string }>;
    };

    expect(computeUserAuthorizedWaiverIssueFingerprint(report.issues)).toBe(
      USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT,
    );
  });

  it("binds the exact manifest bytes, validation report, chart render, and protected copy", () => {
    const manifest = manifestFixture();
    const manifestFileSha256 = sha256Bytes(readFileSync(
      USER_AUTHORIZED_WAIVER_MANIFEST_PATH,
    ));

    expect(assertUserAuthorizedPublicationWaiverMatches(waiverFixture(), {
      repositoryRoot: REPOSITORY_ROOT,
      manifest,
      manifestFileSha256,
      renderedEmailSha256: USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
      protectedNonChartSha256:
        USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256,
    })).toEqual(waiverFixture());
  });

  it("rejects tampered authorization semantics and internal hashes", () => {
    const waiver = waiverFixture();
    expect(() => parseUserAuthorizedPublicationWaiver({
      ...waiver,
      authorizationStatement: "approve every future edition",
    })).toThrow();
    expect(() => parseUserAuthorizedPublicationWaiver({
      ...waiver,
      artifactWaiverSha256: "0".repeat(64),
    })).toThrow("waiver hash mismatch");
    expect(waiver.artifactWaiverSha256).toBe(
      computeUserAuthorizedPublicationWaiverSha256(waiver),
    );
  });

  it("rejects a changed manifest rather than treating the waiver as a general bypass", () => {
    const changed = structuredClone(manifestFixture());
    changed.records[0].target = "Changed after authorization";

    expect(() => assertUserAuthorizedManifestEligible(changed, {
      repositoryRoot: REPOSITORY_ROOT,
    })).toThrow(
      "Manifest validation findings do not exactly match the user-authorized waiver contract",
    );
  });

  it("rejects mismatched caller bindings even when the artifact itself is valid", () => {
    const manifest = manifestFixture();
    const binding = {
      repositoryRoot: REPOSITORY_ROOT,
      manifest,
      manifestFileSha256: USER_AUTHORIZED_WAIVER_MANIFEST_FILE_SHA256,
      renderedEmailSha256: USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
      protectedNonChartSha256:
        USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256,
    };

    expect(() => assertUserAuthorizedPublicationWaiverMatches(
      waiverFixture(),
      { ...binding, renderedEmailSha256: "0".repeat(64) },
    )).toThrow("rendered email hash mismatch");
    expect(() => assertUserAuthorizedPublicationWaiverMatches(
      waiverFixture(),
      { ...binding, protectedNonChartSha256: "0".repeat(64) },
    )).toThrow("protected non-chart content hash mismatch");
    expect(() => assertUserAuthorizedPublicationWaiverMatches(
      waiverFixture(),
      { ...binding, manifestFileSha256: "0".repeat(64) },
    )).toThrow("manifest caller binding hash mismatch");
  });
});
