import { describe, expect, it, vi } from "vitest";
import {
  reportSuppressedTaskFailure,
  runWithPreservedCleanup,
} from "./task-cleanup";

describe("runWithPreservedCleanup", () => {
  it("preserves the primary failure when cleanup succeeds", async () => {
    const primary = new Error("primary operation failed");
    const cleanup = vi.fn();

    await expect(runWithPreservedCleanup({
      run: async () => {
        throw primary;
      },
      cleanup,
      onSuppressedCleanupError: vi.fn(),
    })).rejects.toBe(primary);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("preserves the primary failure when cleanup also fails", async () => {
    const primary = new Error("primary operation failed");
    const cleanup = new Error("database disconnect failed");
    const report = vi.fn();

    await expect(runWithPreservedCleanup({
      run: async () => {
        throw primary;
      },
      cleanup: async () => {
        throw cleanup;
      },
      onSuppressedCleanupError: report,
    })).rejects.toBe(primary);
    expect(report).toHaveBeenCalledWith(cleanup);
  });

  it("surfaces cleanup failure after a successful operation", async () => {
    const cleanup = new Error("database disconnect failed");

    await expect(runWithPreservedCleanup({
      run: async () => "ok",
      cleanup: async () => {
        throw cleanup;
      },
      onSuppressedCleanupError: vi.fn(),
    })).rejects.toBe(cleanup);
  });

  it("does not let cleanup-reporting failure mask the primary error", async () => {
    const primary = new Error("primary operation failed");

    await expect(runWithPreservedCleanup({
      run: async () => {
        throw primary;
      },
      cleanup: async () => {
        throw new Error("cleanup failed");
      },
      onSuppressedCleanupError: () => {
        throw new Error("reporting failed");
      },
    })).rejects.toBe(primary);
  });

  it("preserves an explicitly thrown undefined value when cleanup fails", async () => {
    const cleanup = new Error("database disconnect failed");
    const report = vi.fn();

    await expect(runWithPreservedCleanup({
      run: async () => {
        throw undefined;
      },
      cleanup: async () => {
        throw cleanup;
      },
      onSuppressedCleanupError: report,
    })).rejects.toBeUndefined();
    expect(report).toHaveBeenCalledWith(cleanup);
  });

  it("does not throw when the logging sink fails", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
      throw new Error("logging sink failed");
    });

    expect(() => reportSuppressedTaskFailure({
      task: "test_task",
      operation: "record_failure",
    }, new Error("cleanup failed"))).not.toThrow();
    consoleError.mockRestore();
  });
});
