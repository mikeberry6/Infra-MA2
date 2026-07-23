import { File as NodeFile } from "node:buffer";
import { FormData as UndiciFormData } from "undici";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getSessionIdentity: vi.fn(),
  isAuthorizationError: vi.fn(() => false),
  commitImport: vi.fn(),
  revalidate: vi.fn(),
  fundFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { fund: { findMany: mocks.fundFindMany } },
}));
vi.mock("@/modules/auth/guards", () => ({
  AuthorizationError: class AuthorizationError extends Error {},
  requireAdmin: mocks.requireAdmin,
  getSessionIdentity: mocks.getSessionIdentity,
  isAuthorizationError: mocks.isAuthorizationError,
}));
vi.mock("@/modules/imports/commit", () => ({ commitImport: mocks.commitImport }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));

import { POST } from "./route";

beforeAll(() => {
  vi.stubGlobal("FormData", UndiciFormData);
  vi.stubGlobal("File", NodeFile);
});

afterAll(() => vi.unstubAllGlobals());

const fundRow = {
  id: "fund-1",
  managerName: "Manager Infrastructure",
  fundName: "Manager Infrastructure Fund I",
  size: "TBD",
  vintage: "2026",
  strategies: ["Core"],
  structure: "Closed-End",
  status: "Raising",
  sectors: ["Digital"],
  regions: ["North America"],
};

function jsonRequest(
  rows: Record<string, unknown>[],
  { preview = false, token }: { preview?: boolean; token?: string } = {},
) {
  return new NextRequest(`http://localhost/api/imports/funds${preview ? "?preview=1" : ""}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-import-preview-token": token } : {}),
    },
    body: JSON.stringify({ funds: rows }),
  });
}

function csvPreviewRequest() {
  const csv = [
    "id,managerName,fundName,size,vintage,strategies,structure,status,sectors,regions",
    "fund-1,Manager Infrastructure,Manager Infrastructure Fund I,TBD,2026,Core,Closed-End,Raising,Digital,North America",
  ].join("\n");
  const boundary = "----infrasight-fund-import-test";
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="funds.csv"',
    "Content-Type: text/csv",
    "",
    csv,
    `--${boundary}--`,
    "",
  ].join("\r\n");
  return new NextRequest("http://localhost/api/imports/funds?preview=1", {
    method: "POST",
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
}

function transactionClient(findMany = vi.fn().mockResolvedValue([])) {
  return {
    fund: {
      findMany,
      create: vi.fn().mockResolvedValue({ id: "db-fund-1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
  };
}

describe("fund import preview and commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "route-test-import-preview-secret";
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.fundFindMany.mockResolvedValue([]);
  });

  it("previews multipart CSV without any commit write", async () => {
    const response = await POST(csvPreviewRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ total: 1, creates: 1, updates: 0, unchanged: 0, quarantined: 0 });
    expect(body.items[0]).toMatchObject({ id: "fund-1", row: 2, classification: "create" });
    expect(body.previewToken).toEqual(expect.any(String));
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("rejects direct commit bypass and every duplicate upload identity", async () => {
    const direct = await POST(jsonRequest([fundRow]));
    expect(direct.status).toBe(428);
    expect(mocks.commitImport).not.toHaveBeenCalled();

    const duplicate = await POST(jsonRequest([fundRow, { ...fundRow, fundName: "Duplicate row" }], { preview: true }));
    const body = await duplicate.json();
    expect(body.errors).toHaveLength(2);
    expect(body.items.map((item: { classification: string }) => item.classification)).toEqual(["error", "error"]);
  });

  it("quarantines a fund name already owned by a different legacy identity", async () => {
    mocks.fundFindMany.mockResolvedValue([{
      id: "db-other-fund",
      legacyId: "fund-other",
      fundName: fundRow.fundName,
      status: "DRAFT",
      updatedAt: new Date("2026-07-20T00:00:00Z"),
    }]);

    const response = await POST(jsonRequest([fundRow], { preview: true }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.items[0]).toMatchObject({
      classification: "quarantine",
      code: "FUND_NAME_IDENTITY_CONFLICT",
    });
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("commits the identical normalized preview and returns its audit event", async () => {
    const preview = await (await POST(jsonRequest([fundRow], { preview: true }))).json();
    const tx = transactionClient();
    mocks.commitImport.mockImplementation(async (options: {
      actorId?: string;
      execute: (client: typeof tx) => Promise<{ value: unknown }>;
    }) => {
      expect(options.actorId).toBe("admin-1");
      const work = await options.execute(tx);
      return { value: work.value, auditEventId: "audit-funds", pipelineRunId: "pipeline-funds" };
    });

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ imported: 1, auditEventId: "audit-funds" });
    expect(tx.fund.create).toHaveBeenCalledTimes(1);
    expect(mocks.revalidate).toHaveBeenCalledTimes(1);
  });

  it("returns conflict when target fund state changes after preview", async () => {
    const preview = await (await POST(jsonRequest([fundRow], { preview: true }))).json();
    const tx = transactionClient(vi.fn().mockResolvedValue([{
      id: "db-fund-1",
      legacyId: "fund-1",
      fundName: "Manager Infrastructure Fund I",
      status: "PUBLISHED",
      updatedAt: new Date("2026-07-21T00:00:00Z"),
    }]));
    mocks.commitImport.mockImplementation(async (options: { execute: (client: typeof tx) => Promise<unknown> }) => options.execute(tx));

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(409);
    expect(tx.fund.create).not.toHaveBeenCalled();
  });
});
