import { describe, expect, it } from "vitest";
import {
  RECOVERY_ANNOTATION_KIND,
  RECOVERY_ANNOTATION_RUN,
  RECOVERY_ANNOTATION_SHA,
  type NeonBranchDetail,
} from "./neon-recovery-control.ts";
import { classifyRecoveryBranches } from "./neon-recovery-janitor.ts";

const projectId = "silent-river-123456";
const validationBranchId = "br-validation-123456";
const releaseSha = "a".repeat(40);
const runKey = "123456789-1";
const sourceId = "br-recovery-source-123456";

function detail({
  ageHours,
  kind,
  parentId,
  run = runKey,
}: {
  ageHours: number;
  kind: "source" | "restored";
  parentId?: string;
  run?: string;
}): NeonBranchDetail {
  const id = kind === "source" ? sourceId : "br-recovery-restored-123456";
  return {
    branch: {
      id,
      project_id: projectId,
      parent_id: parentId ?? (
        kind === "source" ? validationBranchId : sourceId
      ),
      parent_lsn: kind === "restored" ? "0/16B6C50" : undefined,
      name: `infrasight-recovery-${kind}-${run}`,
      current_state: "ready",
      default: false,
      protected: false,
      created_at: new Date(
        Date.parse("2026-07-23T20:00:00.000Z") - ageHours * 3_600_000,
      ).toISOString(),
    },
    annotation: {
      [RECOVERY_ANNOTATION_RUN]: run,
      [RECOVERY_ANNOTATION_SHA]: releaseSha,
      [RECOVERY_ANNOTATION_KIND]: kind,
    },
  };
}

describe("durable Neon recovery branch cleanup classification", () => {
  it("trusts an exact source/restore pair and marks only two-hour branches stale", () => {
    const result = classifyRecoveryBranches({
      details: [
        detail({ ageHours: 3, kind: "source" }),
        detail({ ageHours: 3, kind: "restored" }),
      ],
      now: new Date("2026-07-23T20:00:00.000Z"),
      projectId,
      validationBranchId,
    });

    expect(result.untrustedCount).toBe(0);
    expect(result.trusted).toHaveLength(2);
    expect(result.stale).toHaveLength(2);
  });

  it("does not delete a still-active exact-run branch", () => {
    const result = classifyRecoveryBranches({
      details: [detail({ ageHours: 1, kind: "source" })],
      now: new Date("2026-07-23T20:00:00.000Z"),
      projectId,
      validationBranchId,
    });

    expect(result.untrustedCount).toBe(0);
    expect(result.trusted).toHaveLength(1);
    expect(result.stale).toHaveLength(0);
  });

  it("fails closed on a reserved-name branch with a wrong parent or annotation", () => {
    const result = classifyRecoveryBranches({
      details: [
        detail({
          ageHours: 3,
          kind: "source",
          parentId: "br-unapproved-parent-123456",
        }),
        {
          ...detail({ ageHours: 3, kind: "restored" }),
          annotation: {
            [RECOVERY_ANNOTATION_RUN]: "999-1",
            [RECOVERY_ANNOTATION_SHA]: releaseSha,
            [RECOVERY_ANNOTATION_KIND]: "restored",
          },
        },
      ],
      now: new Date("2026-07-23T20:00:00.000Z"),
      projectId,
      validationBranchId,
    });

    expect(result.trusted).toHaveLength(0);
    expect(result.stale).toHaveLength(0);
    expect(result.untrustedCount).toBe(2);
  });
});
