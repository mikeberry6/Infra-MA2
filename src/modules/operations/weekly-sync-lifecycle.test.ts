import { beforeEach, describe, expect, it, vi } from "vitest";
import { failPipelineRun } from "@/modules/operations/pipeline-runs";
import { runWeeklySyncLifecycle } from "@/modules/operations/weekly-sync-lifecycle";

describe("weekly sync pipeline lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
  });

  it("persists deterministic partial counts when a later candidate fails", async () => {
    const client = {
      pipelineRun: {
        update: vi.fn().mockResolvedValue({}),
      },
    };
    const complete = vi.fn();
    const failure = new Error("failed at https://private.example/deal?q=secret");

    await expect(runWeeklySyncLifecycle({
      weeklyCardCount: 8,
      execute: async (progress) => {
        progress.setPlan(3, 5);
        progress.beginSync();
        progress.record("created");
        progress.record("updated");
        throw failure;
      },
      complete,
      fail: (error, counts, metadata) => failPipelineRun(
        client as never,
        "weekly-run-1",
        error,
        counts,
        metadata,
      ),
    })).rejects.toBe(failure);

    expect(complete).not.toHaveBeenCalled();
    expect(client.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: "weekly-run-1" },
      data: {
        status: "FAILED",
        endedAt: new Date("2026-07-22T12:00:00.000Z"),
        errorSummary: "internal_error: Server operation failed.",
        inserted: 1,
        updated: 1,
        skipped: 5,
        metadata: {
          phase: "syncing",
          weeklyCardCount: 8,
          candidateCount: 3,
          attempted: 2,
        },
      },
    });
    expect(JSON.stringify(client.pipelineRun.update.mock.calls)).not.toMatch(
      /private\.example|secret/i,
    );
  });

  it("preserves the sync failure when pipeline-failure recording also fails", async () => {
    const primary = new Error("failed at https://private.example/deal?q=secret");
    const bookkeeping = new Error("pipeline database unavailable with token=private");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(runWeeklySyncLifecycle({
      weeklyCardCount: 1,
      execute: async () => {
        throw primary;
      },
      complete: vi.fn(),
      fail: vi.fn().mockRejectedValue(bookkeeping),
    })).rejects.toBe(primary);

    expect(consoleError).toHaveBeenCalledTimes(1);
    const serialized = String(consoleError.mock.calls[0]?.[0]);
    expect(serialized).toContain('"task":"weekly_deal_sync"');
    expect(serialized).toContain('"operation":"record_pipeline_failure"');
    expect(serialized).not.toMatch(/private\.example|secret|token=private/i);
    consoleError.mockRestore();
  });
});
