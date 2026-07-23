import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HealthResult } from "@/app/api/health/health";

const mocks = vi.hoisted(() => ({
  collectHealthResult: vi.fn(),
  createUnavailableHealthResult: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    pipelineRun: { findMany: vi.fn() },
  },
}));
vi.mock("@/app/api/health/health", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/app/api/health/health")>();
  return {
    ...original,
    collectHealthResult: mocks.collectHealthResult,
    createUnavailableHealthResult: mocks.createUnavailableHealthResult,
  };
});

import {
  dynamic,
  fetchCache,
  GET,
  revalidate,
} from "@/app/api/health/route";

const REQUEST_ID = "123e4567-e89b-42d3-a456-426614174000";
const SHA = "0123456789abcdef0123456789abcdef01234567";

function result(status: "healthy" | "unhealthy" = "healthy"): HealthResult {
  return {
    payload: {
      status,
      version: SHA,
      database: "connected",
      pipelines: {
        dashboard: {
          state: status === "healthy" ? "healthy" : "failed",
          lastAttemptAt: "2026-07-26T11:30:00.000Z",
          lastSuccessfulAt: status === "healthy" ? "2026-07-26T11:35:00.000Z" : null,
          nextExpectedAt: "2026-07-27T11:30:00.000Z",
        },
        news: {
          state: "healthy",
          lastAttemptAt: "2026-07-25T23:30:00.000Z",
          lastSuccessfulAt: "2026-07-25T23:35:00.000Z",
          nextExpectedAt: "2026-07-26T23:30:00.000Z",
        },
      },
      generatedAt: "2026-07-26T12:00:00.000Z",
      generationMs: 7,
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  mocks.collectHealthResult.mockReset();
  mocks.createUnavailableHealthResult.mockReset();
});

describe("GET /api/health", () => {
  it("is dynamic, no-store, correlated, and exposes only the health contract", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    mocks.collectHealthResult.mockResolvedValue(result());
    const response = await GET(new NextRequest("https://example.test/api/health?token=private", {
      headers: { "x-request-id": REQUEST_ID },
    }));
    const body = await response.json();

    expect(dynamic).toBe("force-dynamic");
    expect(revalidate).toBe(0);
    expect(fetchCache).toBe("force-no-store");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
    expect(Object.keys(body)).toEqual([
      "status",
      "version",
      "database",
      "pipelines",
      "generatedAt",
      "generationMs",
    ]);
    expect(body).toEqual(result().payload);
    expect(JSON.stringify(body)).not.toMatch(/token|query|url|error|metadata/i);
  });

  it("returns 503 when a critical health contract fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.collectHealthResult.mockResolvedValue(result("unhealthy"));
    const response = await GET(new NextRequest("https://example.test/api/health", {
      headers: { "x-request-id": REQUEST_ID },
    }));
    expect(response.status).toBe(503);
    expect((await response.json()).status).toBe("unhealthy");
  });

  it("replaces an invalid direct-call request ID instead of echoing it", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    mocks.collectHealthResult.mockResolvedValue(result());
    const response = await GET(new NextRequest("https://example.test/api/health", {
      headers: { "x-request-id": "person@example.com?token=private" },
    }));
    expect(response.headers.get("x-request-id"))
      .toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("returns a fixed unhealthy payload when collection throws", async () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.collectHealthResult.mockRejectedValue(
      new Error("person@example.com postgres://user:secret@private/db?token=abc"),
    );
    mocks.createUnavailableHealthResult.mockReturnValue({
      ...result("unhealthy"),
      errorClass: "internal_error",
    });
    const response = await GET(new NextRequest("https://example.test/api/health", {
      headers: { "x-request-id": REQUEST_ID },
    }));
    const serialized = `${await response.text()}${output.mock.calls.map((call) => call[0]).join("")}`;

    expect(response.status).toBe(503);
    expect(serialized).not.toMatch(/person@example|postgres|secret|private|token/i);
  });
});

