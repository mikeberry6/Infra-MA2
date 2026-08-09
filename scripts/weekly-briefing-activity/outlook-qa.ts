import { z } from "zod";
import { assertDigest } from "./hash";
import { reviewerIdentityIssue } from "./review";

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day))
      .toISOString()
      .slice(0, 10) === value;
  }, "Expected a valid calendar date");
const sha256 = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Expected a lowercase SHA-256 digest");

export const outlookQaApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("WEEKLY_BRIEFING_OUTLOOK_QA_APPROVAL"),
  edition: calendarDate,
  manifestSha256: sha256,
  renderedEmailSha256: sha256,
  protectedNonChartSha256: sha256,
  reviewer: z.string().trim().min(1),
  reviewedAt: z.string().datetime({ offset: true }),
  notes: z.string().trim().min(1),
  humanAttestation: z.strictObject({
    performedByHuman: z.literal(true),
    exactRenderedEmailReviewed: z.literal(true),
    viewport320Passed: z.literal(true),
    viewport375Passed: z.literal(true),
    viewport600Passed: z.literal(true),
    desktopViewportPassed: z.literal(true),
    outlookDesktopCopyPastePassed: z.literal(true),
    outlookDesktopSendToSelfPassed: z.literal(true),
    approvedForCutover: z.literal(true),
  }),
});

export type OutlookQaApproval = z.infer<typeof outlookQaApprovalSchema>;

export interface OutlookQaBinding {
  edition: string;
  manifestSha256: string;
  renderedEmailSha256: string;
  protectedNonChartSha256: string;
}

export function parseOutlookQaApproval(
  input: string | unknown,
): OutlookQaApproval {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      throw new Error("Outlook QA approval is not valid JSON");
    }
  }
  const approval = outlookQaApprovalSchema.parse(value);
  const reviewerTokens = approval.reviewer
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const hasPlaceholderToken = reviewerTokens.some((token) =>
    [
      "pending",
      "placeholder",
      "replace",
      "tbd",
      "unassigned",
      "unknown",
    ].includes(token),
  );
  const identityProblem = hasPlaceholderToken
    ? "Placeholder reviewer identities are not allowed"
    : reviewerIdentityIssue(approval.reviewer);
  if (identityProblem) {
    throw new Error(`Invalid Outlook QA reviewer: ${identityProblem}`);
  }
  return approval;
}

export function assertOutlookQaApprovalMatches(
  approval: OutlookQaApproval,
  expected: OutlookQaBinding,
): void {
  if (approval.edition !== expected.edition) {
    throw new Error(
      `Outlook QA edition mismatch: expected ${expected.edition}, received ${approval.edition}`,
    );
  }
  assertDigest(
    expected.manifestSha256,
    approval.manifestSha256,
    "Outlook QA manifest",
  );
  assertDigest(
    expected.renderedEmailSha256,
    approval.renderedEmailSha256,
    "Outlook QA rendered email",
  );
  assertDigest(
    expected.protectedNonChartSha256,
    approval.protectedNonChartSha256,
    "Outlook QA protected non-chart content",
  );
}
