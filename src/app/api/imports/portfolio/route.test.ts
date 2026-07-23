import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  commitImport: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/imports/commit", () => ({ commitImport: mocks.commitImport }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));

import { POST } from "./route";

function request(name: string) {
  return new NextRequest("http://localhost/api/imports/portfolio", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify([{
      name,
      country: "United States",
      sector: "Digital",
      region: "North America",
      status: "Active",
    }]),
  });
}

function transactionClient(existing: Array<Record<string, unknown>>) {
  return {
    company: {
      findMany: vi.fn().mockResolvedValue(existing),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    ownershipPeriod: { updateMany: vi.fn(), upsert: vi.fn() },
    organization: { upsert: vi.fn() },
    fund: { findFirst: vi.fn() },
    citation: { updateMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    source: { upsert: vi.fn() },
  };
}

describe("portfolio import canonical identity quarantine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
  });

  async function executeWith(existing: Array<Record<string, unknown>>, name: string) {
    const tx = transactionClient(existing);
    mocks.commitImport.mockImplementation(async (options: {
      execute: (client: typeof tx) => Promise<{ value: unknown }>;
    }) => {
      const work = await options.execute(tx);
      return { value: work.value, auditEventId: "audit-1", pipelineRunId: "pipeline-1" };
    });
    const response = await POST(request(name));
    return { tx, response, body: await response.json() as { imported: number; errors: Array<{ error: string }> } };
  }

  it("quarantines an exact retired identity before create or relation writes", async () => {
    const { tx, response, body } = await executeWith([{
      id: "retired",
      name: "Retired Fiber",
      country: "United States",
      status: "DRAFT",
      retirement: { companyId: "canonical" },
      redirects: [],
    }], "Retired Fiber");

    expect(response.status).toBe(200);
    expect(body.imported).toBe(0);
    expect(body.errors[0].error).toContain("Retired company identity");
    expect(tx.company.create).not.toHaveBeenCalled();
    expect(tx.ownershipPeriod.updateMany).not.toHaveBeenCalled();
    expect(tx.citation.updateMany).not.toHaveBeenCalled();
  });

  it("quarantines a canonical-name variant instead of creating a duplicate", async () => {
    const { tx, body } = await executeWith([{
      id: "canonical",
      name: "Example Fiber Holdings, LLC",
      country: "United States",
      status: "DRAFT",
      retirement: null,
      redirects: [],
    }], "Example Fiber Holdings, Inc.");

    expect(body.imported).toBe(0);
    expect(body.errors[0].error).toContain("existing company");
    expect(tx.company.create).not.toHaveBeenCalled();
  });
});
