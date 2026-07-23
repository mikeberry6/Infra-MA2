import { afterEach, describe, expect, it, vi } from "vitest";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
  withServerOperationLogging,
} from "@/lib/server-log";
import {
  REQUEST_ID_HEADER,
  runWithServerRequestContext,
} from "@/lib/server-request-context";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("structured server logging", () => {
  it("serializes only the fixed operational fields", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const requestId = "123e4567-e89b-42d3-a456-426614174000";

    const record = runWithServerRequestContext(
      new Headers({ [REQUEST_ID_HEADER]: requestId }),
      () => logServerRequest({
        route: SERVER_ROUTES.health,
        operation: SERVER_OPERATIONS.healthRead,
        startedAt: performance.now(),
        status: 200,
      }),
    );

    expect(record).toEqual({
      route: "/api/health",
      operation: "health.read",
      durationMs: expect.any(Number),
      status: 200,
      requestId,
    });
    expect(JSON.parse(String(info.mock.calls[0][0]))).toEqual(record);
  });

  it("reduces adversarial exceptions to an allowlisted class", () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const rawError = Object.assign(
      new Error("person@example.com postgres://user:secret@private/db?token=abc"),
      {
        code: "P2021",
        args: { password: "private" },
        rows: [{ name: "Private Person" }],
      },
    );

    logServerRequest({
      route: SERVER_ROUTES.dealDetail,
      operation: SERVER_OPERATIONS.dealDetailRead,
      startedAt: performance.now(),
      status: 500,
      error: rawError,
    });

    const serialized = String(output.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toEqual({
      route: "/api/deals/[legacyId]",
      operation: "deal-detail.read",
      durationMs: expect.any(Number),
      status: 500,
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/),
      errorClass: "database_error",
    });
    expect(serialized).not.toMatch(/person|postgres|secret|private|token|password|args|rows/i);
  });

  it("refuses dynamic route and operation labels before writing", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect(() => logServerRequest({
      route: "/api/deals/person@example.com" as never,
      operation: "read?token=private" as never,
      startedAt: performance.now(),
      status: 200,
    })).toThrow(/declared static label/i);
    expect(info).not.toHaveBeenCalled();
  });

  it("logs a safe failure and rethrows without inspecting response data", async () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failure = new Error("private imported row with token=secret");

    await expect(withServerOperationLogging(
      SERVER_ROUTES.importDeals,
      SERVER_OPERATIONS.importCommit,
      async () => { throw failure; },
    )).rejects.toBe(failure);

    expect(String(output.mock.calls[0][0])).not.toMatch(/imported row|token|secret/i);
  });
});
