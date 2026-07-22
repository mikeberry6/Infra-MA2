import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completePipelineRun,
  failPipelineRun,
  startPipelineRun,
} from "@/modules/operations/pipeline-runs";

function pipelineClient() {
  return {
    pipelineRun: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

describe("pipeline run lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
  });

  it("records a running pipeline with non-sensitive metadata", async () => {
    const client = pipelineClient();
    client.pipelineRun.create.mockResolvedValue({ id: "run-1" });

    await expect(startPipelineRun(client as never, "NEWS_SCAN", { providerCount: 4 })).resolves.toBe("run-1");
    expect(client.pipelineRun.create).toHaveBeenCalledWith({
      data: {
        pipeline: "NEWS_SCAN",
        status: "RUNNING",
        metadata: { providerCount: 4 },
      },
      select: { id: true },
    });
  });

  it("completes a run with normalized counters and an end timestamp", async () => {
    const client = pipelineClient();
    client.pipelineRun.update.mockResolvedValue({});

    await completePipelineRun(client as never, "run-1", { inserted: 2, skipped: 3 });

    expect(client.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: "run-1" },
      data: {
        status: "SUCCEEDED",
        endedAt: new Date("2026-07-22T12:00:00.000Z"),
        inserted: 2,
        updated: 0,
        skipped: 3,
      },
    });
  });

  it("records a compact single-line failure so a later run can recover independently", async () => {
    const client = pipelineClient();
    client.pipelineRun.update.mockResolvedValue({});
    const longError = new Error(`provider failed\n${"x".repeat(600)}`);

    await failPipelineRun(client as never, "run-1", longError);

    const call = client.pipelineRun.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: "run-1" });
    expect(call.data).toMatchObject({
      status: "FAILED",
      endedAt: new Date("2026-07-22T12:00:00.000Z"),
    });
    expect(call.data.errorSummary).not.toContain("\n");
    expect(call.data.errorSummary).toHaveLength(500);

    client.pipelineRun.create.mockResolvedValue({ id: "run-2" });
    await expect(startPipelineRun(client as never, "NEWS_SCAN")).resolves.toBe("run-2");
  });

  it("records partial counts and non-sensitive metadata for failed runs", async () => {
    const client = pipelineClient();
    client.pipelineRun.update.mockResolvedValue({});

    await failPipelineRun(
      client as never,
      "run-1",
      new Error("provider threshold breached"),
      { updated: 8, skipped: 2 },
      { failedSources: 1 },
    );

    expect(client.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: "run-1" },
      data: {
        status: "FAILED",
        endedAt: new Date("2026-07-22T12:00:00.000Z"),
        errorSummary: "provider threshold breached",
        inserted: 0,
        updated: 8,
        skipped: 2,
        metadata: { failedSources: 1 },
      },
    });
  });
});
