import { describe, expect, it } from "vitest";
import {
  assertOutlookQaApprovalMatches,
  parseOutlookQaApproval,
} from "./outlook-qa";

const binding = {
  edition: "2026-08-07",
  manifestSha256: "a".repeat(64),
  renderedEmailSha256: "b".repeat(64),
  protectedNonChartSha256: "c".repeat(64),
};

function validApproval() {
  return {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_OUTLOOK_QA_APPROVAL",
    ...binding,
    reviewer: "Alex Morgan",
    reviewedAt: "2026-08-09T14:30:00.000Z",
    notes:
      "Verified responsive rendering and Outlook desktop copy/paste delivery against the exact rendered email.",
    humanAttestation: {
      performedByHuman: true,
      exactRenderedEmailReviewed: true,
      viewport320Passed: true,
      viewport375Passed: true,
      viewport600Passed: true,
      desktopViewportPassed: true,
      outlookDesktopCopyPastePassed: true,
      outlookDesktopSendToSelfPassed: true,
      approvedForCutover: true,
    },
  } as const;
}

describe("Outlook QA approval", () => {
  it("accepts a strict human attestation bound to all publication hashes", () => {
    const parsed = parseOutlookQaApproval(JSON.stringify(validApproval()));
    expect(() => assertOutlookQaApprovalMatches(parsed, binding)).not.toThrow();
  });

  it("rejects incomplete checks and unexpected fields", () => {
    const failed = {
      ...validApproval(),
      humanAttestation: {
        ...validApproval().humanAttestation,
        viewport375Passed: false,
      },
    };
    expect(() => parseOutlookQaApproval(failed)).toThrow();

    expect(() =>
      parseOutlookQaApproval({ ...validApproval(), unreviewedOverride: true }),
    ).toThrow();
  });

  it.each(["REPLACE_WITH_HUMAN_NAME", "Codex Agent", "ChatGPT", "reviewer"])(
    "rejects placeholder or automated reviewer identity %s",
    (reviewer) => {
      expect(() =>
        parseOutlookQaApproval({ ...validApproval(), reviewer }),
      ).toThrow("Invalid Outlook QA reviewer");
    },
  );

  it("rejects stale or cross-edition QA bindings", () => {
    const parsed = parseOutlookQaApproval(validApproval());
    expect(() =>
      assertOutlookQaApprovalMatches(parsed, {
        ...binding,
        renderedEmailSha256: "d".repeat(64),
      }),
    ).toThrow("Outlook QA rendered email hash mismatch");
    expect(() =>
      assertOutlookQaApprovalMatches(parsed, {
        ...binding,
        edition: "2026-08-14",
      }),
    ).toThrow("Outlook QA edition mismatch");
  });
});
