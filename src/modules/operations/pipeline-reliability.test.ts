import { describe, expect, it } from "vitest";
import {
  assessPipelineReliability,
  buildPipelineReliabilityLedger,
  collapsePipelineAttemptsByRefreshWindow,
  easternRefreshWindow,
  findConsecutiveCriticalSourceIssues,
  pipelineExecutionProvenanceFromEnv,
  pipelineExecutionProvenanceFromMetadata,
  reliabilityObservationWindow,
  resolveEasternRefreshWindow,
} from "@/modules/operations/pipeline-reliability";
import { scheduledPipelineRefreshSlots } from "@/modules/operations/pipeline-schedules";

describe("pipeline refresh-window reliability", () => {
  it("derives the Eastern calendar window across both DST offsets", () => {
    expect(easternRefreshWindow(new Date("2026-07-22T11:30:00.000Z"))).toBe("2026-07-22");
    expect(easternRefreshWindow(new Date("2026-12-02T12:30:00.000Z"))).toBe("2026-12-02");
    expect(easternRefreshWindow(new Date("2026-07-23T02:00:00.000Z"))).toBe("2026-07-22");
    expect(resolveEasternRefreshWindow(undefined, new Date("2026-07-23T02:00:00.000Z"))).toBe("2026-07-22");
    expect(resolveEasternRefreshWindow("2026-07-22")).toBe("2026-07-22");
    expect(() => resolveEasternRefreshWindow("07/22/2026")).toThrow("YYYY-MM-DD");
  });

  it("collapses retry attempts into one scheduled refresh outcome", () => {
    const windows = collapsePipelineAttemptsByRefreshWindow([
      attempt("FAILED", "2026-07-21T11:30:00.000Z", "2026-07-21"),
      attempt("FAILED", "2026-07-22T11:30:00.000Z", "2026-07-22"),
      attempt("SUCCEEDED", "2026-07-22T11:35:00.000Z", "2026-07-22"),
    ]);

    expect(windows).toEqual([
      expect.objectContaining({ refreshWindow: "2026-07-21", status: "FAILED", attempts: 1 }),
      expect.objectContaining({ refreshWindow: "2026-07-22", status: "SUCCEEDED", attempts: 2 }),
    ]);
  });

  it("counts missing schedule slots in the rolling success-rate denominator", () => {
    const startAt = new Date("2026-07-01T00:00:00.000Z");
    const endAt = new Date("2026-07-30T23:59:59.999Z");
    const slots = scheduledPipelineRefreshSlots({
      schedule: "news-daily",
      startAt,
      endAt,
    });
    const attempts = [
      ...slots.slice(0, 28).map((slot) =>
        attempt("SUCCEEDED", slot.scheduledAt.toISOString(), slot.refreshWindow)),
      attempt("FAILED", slots[28].scheduledAt.toISOString(), slots[28].refreshWindow),
      // The final expected date is deliberately missing.
    ];
    const ledger = buildPipelineReliabilityLedger({
      schedule: "news-daily",
      slots,
      attempts,
    });

    expect(ledger).toMatchObject({
      expected: 30,
      succeeded: 28,
      failed: 1,
      missing: 1,
      successRate: 28 / 30,
    });
    expect(ledger.successRate).toBeLessThan(0.95);
    expect(ledger.slots.at(-1)?.status).toBe("MISSING");
  });

  it("does not let unexpected weekend dispatches mask missed weekday windows", () => {
    const slots = scheduledPipelineRefreshSlots({
      schedule: "dashboard-weekday",
      startAt: new Date("2026-07-21T00:00:00.000Z"),
      endAt: new Date("2026-08-20T23:59:59.999Z"),
    });
    expect(slots).toHaveLength(23);
    const attempts = [
      ...slots.slice(0, 20).map((slot) =>
        attempt("SUCCEEDED", slot.scheduledAt.toISOString(), slot.refreshWindow)),
      attempt(
        "SUCCEEDED",
        "2026-07-25T11:30:00.000Z",
        "2026-07-25",
        "repository_dispatch",
      ),
    ];
    const ledger = buildPipelineReliabilityLedger({
      schedule: "dashboard-weekday",
      slots,
      attempts,
    });

    expect(ledger.succeeded).toBe(20);
    expect(ledger.missing).toBe(3);
    expect(ledger.successRate).toBe(20 / 23);
    expect(ledger.unexpectedObserved).toEqual([{
      refreshWindow: "2026-07-25",
      status: "SUCCEEDED",
      attempts: 1,
      reason: "ineligible_event",
    }]);
  });

  it("does not let a same-day manual success satisfy a scheduled slot", () => {
    const slots = scheduledPipelineRefreshSlots({
      schedule: "news-daily",
      startAt: new Date("2026-07-22T00:00:00.000Z"),
      endAt: new Date("2026-07-22T23:59:59.999Z"),
    });
    const ledger = buildPipelineReliabilityLedger({
      schedule: "news-daily",
      slots,
      attempts: [
        attempt(
          "SUCCEEDED",
          "2026-07-22T18:00:00.000Z",
          "2026-07-22",
          "repository_dispatch",
        ),
      ],
    });

    expect(ledger).toMatchObject({
      expected: 1,
      assessed: 1,
      succeeded: 0,
      missing: 1,
      eligibleAttempts: 0,
      ineligibleAttempts: 1,
      successRate: 0,
    });
    expect(ledger.unexpectedObserved[0]).toMatchObject({
      refreshWindow: "2026-07-22",
      reason: "ineligible_event",
    });
  });

  it("reports an active scheduled attempt as running without charging it as a failed slot", () => {
    const slots = scheduledPipelineRefreshSlots({
      schedule: "news-daily",
      startAt: new Date("2026-07-21T00:00:00.000Z"),
      endAt: new Date("2026-07-22T23:35:00.000Z"),
    });
    const ledger = buildPipelineReliabilityLedger({
      schedule: "news-daily",
      slots,
      attempts: [
        attempt("SUCCEEDED", "2026-07-21T23:30:00.000Z", "2026-07-21"),
        {
          status: "RUNNING",
          startedAt: new Date("2026-07-22T23:30:00.000Z"),
          endedAt: null,
          metadata: {
            refreshWindow: "2026-07-22",
            execution: executionProvenance("schedule"),
          },
        },
      ],
    });

    expect(ledger).toMatchObject({
      expected: 2,
      assessed: 1,
      succeeded: 1,
      failed: 0,
      missing: 0,
      running: 1,
      successRate: 1,
    });
    expect(ledger.slots[1].status).toBe("RUNNING");
  });

  it("uses the successful attempt completion time, not a later failed rerun", () => {
    const windows = collapsePipelineAttemptsByRefreshWindow([
      {
        ...attempt("SUCCEEDED", "2026-07-22T23:30:00.000Z", "2026-07-22"),
        endedAt: new Date("2026-07-22T23:31:00.000Z"),
      },
      {
        ...attempt("FAILED", "2026-07-23T02:00:00.000Z", "2026-07-22"),
        endedAt: new Date("2026-07-23T02:01:00.000Z"),
      },
    ]);

    expect(windows[0].status).toBe("SUCCEEDED");
    expect(windows[0].endedAt?.toISOString()).toBe("2026-07-23T02:01:00.000Z");
    expect(windows[0].successfulAt?.toISOString()).toBe("2026-07-22T23:31:00.000Z");
  });

  it("alerts only after two distinct critical-source windows both exhaust retries", () => {
    const rows = [
      sourceRun("FAILED", "2026-07-21T11:30:00.000Z", "2026-07-21"),
      sourceRun("FAILED", "2026-07-21T11:35:00.000Z", "2026-07-21"),
      sourceRun("FAILED", "2026-07-22T11:30:00.000Z", "2026-07-22"),
      sourceRun("SKIPPED", "2026-07-22T11:35:00.000Z", "2026-07-22"),
    ];
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual(["U.S. Treasury"]);

    rows.push(sourceRun("SUCCESS", "2026-07-22T11:40:00.000Z", "2026-07-22"));
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual([]);
  });

  it("treats partial required-metric gaps as a critical missed window", () => {
    const rows = [
      sourceRun("PARTIAL", "2026-07-21T11:30:00.000Z", "2026-07-21", {
        missingRequiredMetrics: ["us_treasury_2y"],
      }),
      sourceRun("PARTIAL", "2026-07-22T11:30:00.000Z", "2026-07-22", {
        staleRequiredMetrics: ["us_treasury_10y"],
      }),
    ];
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual(["U.S. Treasury"]);
  });

  it("keeps a pipeline in collecting status until 30 actual days have elapsed", () => {
    const now = new Date("2026-07-22T12:00:00.000Z");
    const observation = reliabilityObservationWindow({
      now,
      firstRunAt: new Date(now.getTime() - (30 * 86_400_000 - 3_600_000)),
      windowDays: 30,
      requiredDays: 30,
    });
    const assessment = assessPipelineReliability({
      observationComplete: observation.complete,
      failures: [],
    });

    expect(observation.observedDays).toBeCloseTo(29 + 23 / 24);
    expect(observation.complete).toBe(false);
    expect(assessment).toEqual({
      status: "collecting",
      operationallyHealthy: true,
      healthy: false,
      exitCriterionMet: false,
    });
  });

  it("meets the reliability exit criterion after a full observation window", () => {
    const now = new Date("2026-07-22T12:00:00.000Z");
    const observation = reliabilityObservationWindow({
      now,
      firstRunAt: new Date(now.getTime() - 30 * 86_400_000),
      windowDays: 30,
      requiredDays: 30,
    });

    expect(observation.observedDays).toBe(30);
    expect(observation.complete).toBe(true);
    expect(assessPipelineReliability({
      observationComplete: observation.complete,
      failures: [],
    })).toEqual({
      status: "healthy",
      operationallyHealthy: true,
      healthy: true,
      exitCriterionMet: true,
    });
  });

  it("reports operational failures as unhealthy regardless of observation age", () => {
    expect(assessPipelineReliability({
      observationComplete: false,
      failures: ["latest success is missing"],
    })).toEqual({
      status: "unhealthy",
      operationallyHealthy: false,
      healthy: false,
      exitCriterionMet: false,
    });
  });

  it("reports zero observed days before the first pipeline run", () => {
    expect(reliabilityObservationWindow({
      now: new Date("2026-07-22T12:00:00.000Z"),
      firstRunAt: null,
      windowDays: 30,
      requiredDays: 30,
    })).toEqual({
      effectiveStartAt: null,
      observedDays: 0,
      requiredDays: 30,
      complete: false,
    });
  });

  it("accepts only bounded sanitized GitHub execution provenance", () => {
    const provenance = pipelineExecutionProvenanceFromEnv({
      GITHUB_ACTIONS: "true",
      GITHUB_SHA: "a".repeat(40),
      GITHUB_RUN_ID: "30036752296",
      GITHUB_RUN_ATTEMPT: "2",
      GITHUB_EVENT_NAME: "repository_dispatch",
    });

    expect(provenance).toEqual({
      gitSha: "a".repeat(40),
      githubRunId: "30036752296",
      githubRunAttempt: 2,
      githubEventName: "repository_dispatch",
    });
    expect(pipelineExecutionProvenanceFromMetadata({ execution: provenance }))
      .toEqual(provenance);
    expect(pipelineExecutionProvenanceFromEnv({ GITHUB_ACTIONS: "false" })).toBeNull();
    expect(() => pipelineExecutionProvenanceFromEnv({
      GITHUB_ACTIONS: "true",
      GITHUB_SHA: "branch-name",
      GITHUB_RUN_ID: "30036752296",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_EVENT_NAME: "schedule",
    })).toThrow("SHA is invalid");
    expect(pipelineExecutionProvenanceFromMetadata({
      execution: {
        gitSha: "not-a-sha",
        githubRunId: "private payload",
        githubRunAttempt: 1,
        githubEventName: "schedule",
      },
    })).toBeNull();
  });

  it("retains per-window provenance without retaining arbitrary metadata", () => {
    const provenance = {
      gitSha: "b".repeat(40),
      githubRunId: "30036752296",
      githubRunAttempt: 1,
      githubEventName: "schedule",
    };
    const windows = collapsePipelineAttemptsByRefreshWindow([
      {
        ...attempt("SUCCEEDED", "2026-07-22T23:30:00.000Z", "2026-07-22"),
        metadata: {
          refreshWindow: "2026-07-22",
          execution: provenance,
          privateProviderPayload: "must-not-enter-ledger",
        },
      },
    ]);

    expect(windows[0].provenance).toEqual([provenance]);
    expect(JSON.stringify(windows[0])).not.toContain("privateProviderPayload");
    expect(JSON.stringify(windows[0])).not.toContain("must-not-enter-ledger");
  });

  it("bounds provenance retained for a single refresh window", () => {
    const windows = collapsePipelineAttemptsByRefreshWindow(
      Array.from({ length: 12 }, (_, index) => ({
        ...attempt("FAILED", `2026-07-22T23:${String(index).padStart(2, "0")}:00.000Z`, "2026-07-22"),
        metadata: {
          refreshWindow: "2026-07-22",
          execution: {
            gitSha: "c".repeat(40),
            githubRunId: String(30_036_752_296 + index),
            githubRunAttempt: 1,
            githubEventName: "repository_dispatch",
          },
        },
      })),
    );

    expect(windows[0].provenance).toHaveLength(10);
    expect(windows[0].provenanceTruncated).toBe(true);
  });
});

function executionProvenance(
  githubEventName: "repository_dispatch" | "schedule",
) {
  return {
    gitSha: "d".repeat(40),
    githubRunId: "30036752296",
    githubRunAttempt: 1,
    githubEventName,
  };
}

function attempt(
  status: string,
  startedAt: string,
  refreshWindow: string,
  githubEventName: "repository_dispatch" | "schedule" = "schedule",
) {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: new Date(new Date(startedAt).getTime() + 60_000),
    metadata: {
      refreshWindow,
      execution: executionProvenance(githubEventName),
    },
  };
}

function sourceRun(
  status: string,
  startedAt: string,
  refreshWindow: string,
  metadata: Record<string, unknown> = {},
) {
  return {
    sourceId: "treasury",
    sourceName: "U.S. Treasury",
    status,
    startedAt: new Date(startedAt),
    metadata: { critical: true, refreshWindow, ...metadata },
  };
}
