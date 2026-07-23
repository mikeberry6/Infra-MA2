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
  dealFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { deal: { findMany: mocks.dealFindMany } },
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

const dealRow = {
  id: "deal-1",
  title: "Buyer acquires Target",
  target: "Target",
  buyer: "Buyer Infrastructure",
  seller: "Seller Infrastructure",
  sector: "Digital",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-20",
  description: "A reviewed infrastructure transaction.",
  status: "Announced",
};

function jsonRequest(
  rows: Record<string, unknown>[],
  { preview = false, token }: { preview?: boolean; token?: string } = {},
) {
  return new NextRequest(`http://localhost/api/imports/deals${preview ? "?preview=1" : ""}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-import-preview-token": token } : {}),
    },
    body: JSON.stringify({ deals: rows }),
  });
}

function csvPreviewRequest() {
  const csv = [
    "id,title,target,buyer,seller,sector,region,category,date,description,status",
    "deal-1,Buyer acquires Target,Target,Buyer Infrastructure,Seller Infrastructure,Digital,North America,Acquisition (Buyout),2026-07-20,A reviewed infrastructure transaction.,Announced",
  ].join("\n");
  const boundary = "----infrasight-deal-import-test";
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="deals.csv"',
    "Content-Type: text/csv",
    "",
    csv,
    `--${boundary}--`,
    "",
  ].join("\r\n");
  return new NextRequest("http://localhost/api/imports/deals?preview=1", {
    method: "POST",
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
}

function transactionClient(findMany = vi.fn().mockResolvedValue([])) {
  return {
    deal: {
      findMany,
      create: vi.fn().mockResolvedValue({ id: "db-deal-1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    dealParticipant: { deleteMany: vi.fn(), create: vi.fn() },
    organization: { upsert: vi.fn().mockResolvedValue({ id: "org-1" }) },
    citation: {
      updateMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      create: vi.fn(),
    },
    source: { upsert: vi.fn().mockResolvedValue({ id: "source-1" }) },
  };
}

describe("deal import preview and commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "route-test-import-preview-secret";
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.dealFindMany.mockResolvedValue([]);
  });

  it("previews multipart CSV without entering the commit path", async () => {
    const request = csvPreviewRequest();
    const debugForm = await request.clone().formData();
    expect(await (debugForm.get("file") as File).text()).toContain("deal-1");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ total: 1, creates: 1, updates: 0, unchanged: 0, quarantined: 0 });
    expect(body.previewToken).toEqual(expect.any(String));
    expect(body.items[0]).toMatchObject({ id: "deal-1", row: 2, classification: "create" });
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("requires a preview token and binds it to the normalized rows", async () => {
    const withoutToken = await POST(jsonRequest([dealRow]));
    expect(withoutToken.status).toBe(428);
    expect(mocks.commitImport).not.toHaveBeenCalled();

    const preview = await (await POST(jsonRequest([dealRow], { preview: true }))).json();
    const changed = await POST(jsonRequest(
      [{ ...preview.items[0], title: "Changed after preview" }],
      { token: preview.previewToken },
    ));
    expect(changed.status).toBe(400);
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("commits identical preview rows and returns the exact audit event", async () => {
    const preview = await (await POST(jsonRequest([dealRow], { preview: true }))).json();
    const tx = transactionClient();
    mocks.commitImport.mockImplementation(async (options: {
      actorId?: string;
      execute: (client: typeof tx) => Promise<{ value: unknown }>;
    }) => {
      expect(options.actorId).toBe("admin-1");
      const work = await options.execute(tx);
      return { value: work.value, auditEventId: "audit-deals", pipelineRunId: "pipeline-deals" };
    });

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ imported: 1, auditEventId: "audit-deals" });
    expect(tx.deal.create).toHaveBeenCalledTimes(1);
    expect(mocks.revalidate).toHaveBeenCalledTimes(1);
  });

  it("rejects a commit when database state changed after preview", async () => {
    const preview = await (await POST(jsonRequest([dealRow], { preview: true }))).json();
    const tx = transactionClient(vi.fn().mockResolvedValue([{
      id: "db-deal-1",
      legacyId: "deal-1",
      status: "PUBLISHED",
      updatedAt: new Date("2026-07-21T00:00:00Z"),
    }]));
    mocks.commitImport.mockImplementation(async (options: { execute: (client: typeof tx) => Promise<unknown> }) => options.execute(tx));

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(409);
    expect(tx.deal.create).not.toHaveBeenCalled();
  });
});
