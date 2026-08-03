import { describe, expect, it } from "vitest";
import {
  activateNextManifestTask,
  transitionManifestTask,
  verifyReconciliationManifest,
} from "./manifest";
import { manifestFixture } from "./test-fixtures";

describe("resumable manifest", () => {
  it("permits exactly one in-flight task and preserves strict sequence", () => {
    const firstActive = activateNextManifestTask(
      manifestFixture(),
      "2026-08-03T12:01:00.000Z",
    );
    expect(firstActive.runStatus).toBe("RUNNING");
    expect(firstActive.tasks[0].status).toBe("ACTIVE");
    expect(firstActive.tasks[0].attempts).toBe(1);
    expect(() => transitionManifestTask(
      firstActive,
      "scorecard:acme",
      "ACTIVE",
      "2026-08-03T12:02:00.000Z",
    )).toThrow(/in flight/i);

    const awaiting = transitionManifestTask(
      firstActive,
      "manager:001",
      "AWAITING_APPROVAL",
      "2026-08-03T12:03:00.000Z",
    );
    expect(awaiting.runStatus).toBe("AWAITING_APPROVAL");
    expect(verifyReconciliationManifest(awaiting)).toEqual(awaiting);
  });

  it("resumes the next task only after its predecessor is terminal", () => {
    const active = activateNextManifestTask(manifestFixture(), "2026-08-03T12:01:00.000Z");
    const completed = transitionManifestTask(
      active,
      "manager:001",
      "COMPLETED",
      "2026-08-03T12:02:00.000Z",
    );
    expect(completed.runStatus).toBe("IDLE");
    const next = activateNextManifestTask(completed, "2026-08-03T12:03:00.000Z");
    expect(next.tasks[1].status).toBe("ACTIVE");
    expect(next.phase).toBe("SCORECARD_REFRESH");
  });

  it("requires an explicit reason when a task fails or blocks", () => {
    const active = activateNextManifestTask(manifestFixture(), "2026-08-03T12:01:00.000Z");
    expect(() => transitionManifestTask(
      active,
      "manager:001",
      "FAILED",
      "2026-08-03T12:02:00.000Z",
    )).toThrow(/non-empty error/i);
  });
});
