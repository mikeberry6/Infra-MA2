import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRequestId,
  getRequestId,
  logServerFailure,
  logServerOperation,
  withServerOperation,
  withServerTask,
} from "@/lib/server-log";

describe("server request logging", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates fresh server-owned correlation IDs for the public request boundary", () => {
    const first = createRequestId();
    const second = createRequestId();

    expect(first).toMatch(/^[0-9a-f-]{36}$/i);
    expect(second).toMatch(/^[0-9a-f-]{36}$/i);
    expect(second).not.toBe(first);
  });

  it("keeps a safe upstream request ID and replaces unsafe values", () => {
    expect(getRequestId(new Request("http://localhost/api/test", {
      headers: { "x-request-id": "edge:request-123" },
    }))).toBe("edge:request-123");

    expect(getRequestId(new Request("http://localhost/api/test", {
      headers: { "x-request-id": "private value that must not be logged" },
    }))).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("logs only the allowlisted request envelope and propagates the request ID", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/test?private=query", {
      headers: { "x-request-id": "request-123" },
    });

    const response = await withServerOperation(request, {
      route: "/api/test",
      operation: "read_test",
    }, () => Response.json({ private: "response value" }, { status: 404 }));

    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(warn).toHaveBeenCalledOnce();
    const serialized = String(warn.mock.calls[0][0]);
    const entry = JSON.parse(serialized);
    expect(entry).toEqual({
      requestId: "request-123",
      route: "/api/test",
      operation: "read_test",
      durationMs: expect.any(Number),
      status: 404,
      errorClassification: "not_found",
      errorMessage: "Requested resource was not found.",
    });
    expect(serialized).not.toContain("private=query");
    expect(serialized).not.toContain("response value");
  });

  it("classifies an exception without serializing its message, stack, or extra fields", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/test", {
      headers: { "x-request-id": "request-500" },
    });
    const failure = Object.assign(new Error("secret token and imported row contents"), {
      email: "person@example.com",
      requestBody: { password: "do-not-log" },
      code: "P2002",
    });

    await expect(withServerOperation(request, {
      route: "/api/test",
      operation: "failing_test",
    }, () => {
      throw failure;
    })).rejects.toThrow("secret token");

    const serialized = String(errorLog.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toEqual({
      requestId: "request-500",
      route: "/api/test",
      operation: "failing_test",
      durationMs: expect.any(Number),
      status: 500,
      errorClassification: "database_error",
      errorMessage: "Database operation failed (P2002).",
    });
    expect(serialized).not.toMatch(/secret token|imported row|person@example|password|stack/i);
  });

  it("records one operational failure when a compatibility response remains HTTP 200", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failure = new Error("private session details");

    const response = await withServerOperation(
      new Request("http://localhost/api/export-permission", {
        headers: { "x-request-id": "permission-compat" },
      }),
      {
        route: "/api/export-permission",
        operation: "check_export_permission",
      },
      ({ markFailure }) => {
        markFailure(failure);
        return Response.json({ canExport: false });
      },
    );

    expect(response.status).toBe(200);
    expect(info).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledOnce();
    expect(JSON.parse(String(errorLog.mock.calls[0][0]))).toEqual({
      requestId: "permission-compat",
      route: "/api/export-permission",
      operation: "check_export_permission",
      durationMs: expect.any(Number),
      status: 500,
      errorClassification: "internal_error",
      errorMessage: "Server operation failed.",
    });
  });

  it("redacts query strings, unsafe labels, and arbitrary caller properties", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logServerOperation({
      requestId: "unsafe request id with spaces",
      route: "/search?q=private-company#results",
      operation: "search?term=private-company",
      durationMs: Number.NaN,
      status: 500,
      error: { message: "api-token=private", stack: "private stack", rows: ["private row"] },
      errorClassification: "secret_token=private" as never,
      privateQuery: "private-company",
    } as Parameters<typeof logServerOperation>[0] & { privateQuery: string });

    const serialized = String(errorLog.mock.calls[0][0]);
    const entry = JSON.parse(serialized);
    expect(entry).toEqual({
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      route: "/search",
      operation: "server_operation",
      durationMs: 0,
      status: 500,
      errorClassification: "internal_error",
      errorMessage: "Server operation failed.",
    });
    expect(serialized).not.toMatch(/private-company|api-token|private stack|private row|privateQuery/i);
  });

  it("logs maintenance tasks with a generated task ID and safe fixed failure text", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(withServerTask({
      task: "pipeline_health",
      operation: "verify_freshness",
    }, () => "ok")).resolves.toBe("ok");

    const success = JSON.parse(String(info.mock.calls[0][0]));
    expect(success).toEqual({
      taskId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      task: "pipeline_health",
      operation: "verify_freshness",
      durationMs: expect.any(Number),
      status: 200,
    });

    logServerFailure({
      task: "pipeline_health",
      operation: "verify_freshness",
      errorClassification: "configuration_error",
    }, new Error("DATABASE_URL=postgres://private"));

    const failure = String(errorLog.mock.calls[0][0]);
    expect(JSON.parse(failure)).toEqual({
      taskId: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      task: "pipeline_health",
      operation: "verify_freshness",
      durationMs: 0,
      status: 500,
      errorClassification: "configuration_error",
      errorMessage: "Required server configuration is unavailable.",
    });
    expect(failure).not.toContain("postgres://private");
  });

  it("uses the middleware request ID for a server task when one is available", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await withServerTask({
      route: "/tracker",
      operation: "render_tracker",
      requestId: "middleware:request-456",
    }, () => undefined);

    expect(JSON.parse(String(info.mock.calls[0][0]))).toEqual({
      requestId: "middleware:request-456",
      route: "/tracker",
      operation: "render_tracker",
      durationMs: expect.any(Number),
      status: 200,
    });
  });

  it("preserves native redirects whose original headers are immutable", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/auth/callback", {
      headers: { "x-request-id": "auth-redirect" },
    });

    const response = await withServerOperation(request, {
      route: "/api/auth/[...nextauth]",
      operation: "auth_get",
    }, () => Response.redirect("http://localhost/tracker", 302));

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost/tracker");
    expect(response.headers.get("x-request-id")).toBe("auth-redirect");
  });
});
