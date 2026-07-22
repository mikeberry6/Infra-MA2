import { afterEach, describe, expect, it, vi } from "vitest";
import { getRequestId, withServerOperation } from "@/lib/server-log";

describe("server request logging", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps a safe upstream request ID and replaces unsafe values", () => {
    expect(getRequestId(new Request("http://localhost/api/test", {
      headers: { "x-request-id": "edge:request-123" },
    }))).toBe("edge:request-123");

    expect(getRequestId(new Request("http://localhost/api/test", {
      headers: { "x-request-id": "private value that must not be logged" },
    }))).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("logs the operation envelope and propagates the request ID", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/test?private=query", {
      headers: { "x-request-id": "request-123" },
    });

    const response = await withServerOperation(request, {
      route: "/api/test",
      operation: "read_test",
    }, () => Response.json({ private: "response value" }, { status: 404 }));

    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(info).toHaveBeenCalledOnce();
    const entry = JSON.parse(String(info.mock.calls[0][0]));
    expect(entry).toMatchObject({
      level: "warn",
      route: "/api/test",
      operation: "read_test",
      status: 404,
      requestId: "request-123",
    });
    expect(entry.durationMs).toEqual(expect.any(Number));
    expect(entry.timestamp).toEqual(expect.any(String));
    expect(info.mock.calls[0][0]).not.toContain("private=query");
    expect(info.mock.calls[0][0]).not.toContain("response value");
  });

  it("logs an unexpected exception as a 500 without logging its message", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/test", {
      headers: { "x-request-id": "request-500" },
    });

    await expect(withServerOperation(request, {
      route: "/api/test",
      operation: "failing_test",
    }, () => {
      throw new Error("secret token and imported row contents");
    })).rejects.toThrow("secret token");

    const serialized = String(info.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toMatchObject({
      level: "error",
      route: "/api/test",
      operation: "failing_test",
      status: 500,
      requestId: "request-500",
    });
    expect(serialized).not.toContain("secret token");
    expect(serialized).not.toContain("imported row");
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
