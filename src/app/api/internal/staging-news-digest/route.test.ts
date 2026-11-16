import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withImportTransaction } from "@/lib/prisma-transaction";
import { POST } from "./route";

vi.mock("@/lib/prisma-transaction", () => ({ withImportTransaction: vi.fn() }));

const secret = "staging-only-test-secret";
const transaction = vi.mocked(withImportTransaction);

function post(token?: string, executionId = "schx_fixture") {
  const headers = { "ce-vssscheduleid": "sch_fixture", "ce-id": executionId, ...(token && { Authorization: `Bearer ${token}` }) };
  return POST(new Request("https://staging.example.test", { method: "POST", headers }));
}

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NEWS_PIPELINE_TARGET", "staging");
  vi.stubEnv("NEWS_DIGEST_ENABLED", "true");
  vi.stubEnv("CRON_SECRET", secret);
  vi.stubEnv("NEWS_STAGING_DEPLOYMENT_NONCE", "123-1");
  vi.stubEnv("NEWS_DIGEST_START_DATE", "2026-11-15");
  vi.stubEnv("DATABASE_URL", "postgres://ep-staging.neon.tech/staging");
  vi.stubEnv("EXPECTED_DATABASE_HOST", "ep-staging.neon.tech");
  vi.stubEnv("EXPECTED_DATABASE_NAME", "staging");
  vi.stubEnv("FORBIDDEN_DATABASE_HOST", "ep-production.neon.tech");
  vi.stubEnv("FORBIDDEN_DATABASE_HOST_2", undefined);
  transaction.mockReset();
});

afterEach(() => vi.unstubAllEnvs());

describe("staging digest endpoint", () => {
  it.each([
    ["VERCEL_ENV", "production"],
    ["NEWS_PIPELINE_TARGET", "production"],
    ["NEWS_DIGEST_ENABLED", "false"],
  ])("fails closed when %s is %s", async (name, value) => {
    vi.stubEnv(name, value);
    expect((await post(secret)).status).toBe(404);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("requires the configured cron credential", async () => {
    expect((await post()).status).toBe(401);
    expect((await post("incorrect")).status).toBe(401);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("rejects missing scheduler metadata even with the correct credential", async () => {
    expect((await post(secret, "")).status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("refuses the pooled alias of the production database", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://ep-production-pooler.neon.tech/staging");
    vi.stubEnv("EXPECTED_DATABASE_HOST", "ep-production-pooler.neon.tech");
    expect((await post(secret)).status).toBe(500);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns the staging digest receipt after running the existing edition builder", async () => {
    const create = vi.fn().mockResolvedValue({ id: "run-receipt" });
    transaction.mockResolvedValueOnce({ date: "2026-11-15", _count: { entries: 1 } }).mockResolvedValueOnce(null)
      .mockImplementationOnce(async (work) => work({ pipelineRun: { create } } as unknown as Parameters<typeof work>[0]));
    const response = await post(secret);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      pipeline: "evidence-news-staging-digest", status: "SUCCEEDED", inserted: 1,
      metadata: expect.objectContaining({ scheduleId: "sch_fixture", executionId: "schx_fixture", deploymentNonce: "123-1" }),
    }) }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({ editions: [{ date: "2026-11-15", count: 1 }] });
  });
});
