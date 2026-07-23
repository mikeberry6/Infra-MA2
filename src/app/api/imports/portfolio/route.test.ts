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
  companyFindMany: vi.fn(),
  fundFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: { findMany: mocks.companyFindMany },
    fund: { findMany: mocks.fundFindMany },
  },
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

const companyRow = {
  name: "Example Fiber",
  country: "United States",
  sector: "Digital",
  region: "North America",
  status: "Active",
  investmentFirm: "Manager Infrastructure",
  ownershipVehicle: "Manager Infrastructure Fund I",
  investmentYear: 2026,
};

function jsonRequest(
  rows: Record<string, unknown>[],
  { preview = false, token }: { preview?: boolean; token?: string } = {},
) {
  return new NextRequest(`http://localhost/api/imports/portfolio${preview ? "?preview=1" : ""}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-import-preview-token": token } : {}),
    },
    body: JSON.stringify({ companies: rows }),
  });
}

function csvPreviewRequest() {
  const csv = [
    "name,country,sector,region,status,investmentFirm,ownershipVehicle,investmentYear",
    "Example Fiber,United States,Digital,North America,Active,Manager Infrastructure,Manager Infrastructure Fund I,2026",
  ].join("\n");
  const boundary = "----infrasight-portfolio-import-test";
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="portfolio.csv"',
    "Content-Type: text/csv",
    "",
    csv,
    `--${boundary}--`,
    "",
  ].join("\r\n");
  return new NextRequest("http://localhost/api/imports/portfolio?preview=1", {
    method: "POST",
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
}

function transactionClient({
  companies = [],
  funds = [],
}: {
  companies?: Array<Record<string, unknown>>;
  funds?: Array<Record<string, unknown>>;
} = {}) {
  return {
    company: {
      findMany: vi.fn().mockResolvedValue(companies),
      create: vi.fn().mockResolvedValue({ id: "db-company-1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    fund: { findMany: vi.fn().mockResolvedValue(funds) },
    ownershipPeriod: { updateMany: vi.fn(), upsert: vi.fn() },
    organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
    citation: {
      updateMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      create: vi.fn(),
    },
    source: { upsert: vi.fn().mockResolvedValue({ id: "source-1" }) },
  };
}

function identityRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "company-existing",
    name: "Example Fiber",
    country: "United States",
    status: "DRAFT",
    updatedAt: new Date("2026-07-20T00:00:00Z"),
    sector: "DIGITAL",
    subsector: "",
    region: "NORTH_AMERICA",
    countryTags: [],
    description: "",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: null,
    headquarters: null,
    retirement: null,
    redirects: [],
    ownershipPeriods: [],
    citations: [],
    ...overrides,
  };
}

describe("portfolio import preview and commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "route-test-import-preview-secret";
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.companyFindMany.mockResolvedValue([]);
    mocks.fundFindMany.mockResolvedValue([{
      id: "db-fund-1",
      fundName: "Manager Infrastructure Fund I",
      updatedAt: new Date("2026-07-20T00:00:00Z"),
    }]);
  });

  it("previews multipart CSV read-only and exposes ownership effects", async () => {
    const response = await POST(csvPreviewRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ total: 1, creates: 1, updates: 0, unchanged: 0, quarantined: 0 });
    expect(body.items[0]).toMatchObject({ name: "Example Fiber", row: 2, classification: "create" });
    expect(body.ownershipChanges[0]).toMatchObject({
      action: "create",
      code: "OWNERSHIP_CREATE",
      from: [],
      to: "Manager Infrastructure · Manager Infrastructure Fund I",
    });
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("quarantines retired and canonical-conflict identities during preview", async () => {
    mocks.companyFindMany.mockResolvedValue([
      identityRow({
        id: "retired",
        name: "Retired Fiber",
        retirement: { companyId: "canonical" },
      }),
    ]);
    const retired = await (await POST(jsonRequest([{ ...companyRow, name: "Retired Fiber" }], { preview: true }))).json();
    expect(retired.items[0]).toMatchObject({ classification: "quarantine", code: "RETIRED_IDENTITY" });
    expect(mocks.commitImport).not.toHaveBeenCalled();

    mocks.companyFindMany.mockResolvedValue([
      identityRow({ name: "Example Fiber Holdings, LLC" }),
    ]);
    const conflict = await (await POST(jsonRequest([{ ...companyRow, name: "Example Fiber Holdings, Inc." }], { preview: true }))).json();
    expect(conflict.items[0]).toMatchObject({ classification: "quarantine", code: "CANONICAL_IDENTITY_CONFLICT" });
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("rejects direct commit bypass and tokens replayed with changed rows", async () => {
    const direct = await POST(jsonRequest([companyRow]));
    expect(direct.status).toBe(428);

    const preview = await (await POST(jsonRequest([companyRow], { preview: true }))).json();
    const changed = await POST(jsonRequest(
      [{ ...preview.items[0], country: "Canada" }],
      { token: preview.previewToken },
    ));
    expect(changed.status).toBe(400);
    expect(mocks.commitImport).not.toHaveBeenCalled();
  });

  it("revalidates state in the commit transaction and returns the audit id", async () => {
    const preview = await (await POST(jsonRequest([companyRow], { preview: true }))).json();
    const tx = transactionClient({
      funds: [{ id: "db-fund-1", fundName: "Manager Infrastructure Fund I", updatedAt: new Date("2026-07-20T00:00:00Z") }],
    });
    mocks.commitImport.mockImplementation(async (options: {
      actorId?: string;
      execute: (client: typeof tx) => Promise<{ value: unknown }>;
    }) => {
      expect(options.actorId).toBe("admin-1");
      const work = await options.execute(tx);
      return { value: work.value, auditEventId: "audit-portfolio", pipelineRunId: "pipeline-portfolio" };
    });

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ imported: 1, auditEventId: "audit-portfolio" });
    expect(tx.company.create).toHaveBeenCalledTimes(1);
    expect(tx.ownershipPeriod.upsert).toHaveBeenCalledTimes(1);
    expect(mocks.revalidate).toHaveBeenCalledTimes(1);
  });

  it("performs no company or relation writes for an unchanged row", async () => {
    const current = identityRow({
      ownershipPeriods: [{
        id: "ownership-1",
        fundId: "db-fund-1",
        vehicleName: "Manager Infrastructure Fund I",
        investmentYear: 2026,
        isActive: true,
        organization: { name: "Manager Infrastructure" },
      }],
    });
    const funds = [{
      id: "db-fund-1",
      fundName: "Manager Infrastructure Fund I",
      updatedAt: new Date("2026-07-20T00:00:00Z"),
    }];
    mocks.companyFindMany.mockResolvedValue([current]);
    mocks.fundFindMany.mockResolvedValue(funds);
    const preview = await (await POST(jsonRequest([companyRow], { preview: true }))).json();
    expect(preview.items[0].classification).toBe("unchanged");

    const tx = transactionClient({ companies: [current], funds });
    mocks.commitImport.mockImplementation(async (options: {
      execute: (client: typeof tx) => Promise<{ value: unknown }>;
    }) => {
      const work = await options.execute(tx);
      return { value: work.value, auditEventId: "audit-unchanged", pipelineRunId: "pipeline-unchanged" };
    });

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ imported: 0, auditEventId: "audit-unchanged" });
    expect(tx.company.create).not.toHaveBeenCalled();
    expect(tx.company.updateMany).not.toHaveBeenCalled();
    expect(tx.ownershipPeriod.updateMany).not.toHaveBeenCalled();
    expect(tx.ownershipPeriod.upsert).not.toHaveBeenCalled();
    expect(tx.citation.updateMany).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("returns conflict before writes if canonical state changed after preview", async () => {
    const preview = await (await POST(jsonRequest([companyRow], { preview: true }))).json();
    const tx = transactionClient({
      companies: [identityRow({ status: "PUBLISHED" })],
      funds: [{ id: "db-fund-1", fundName: "Manager Infrastructure Fund I", updatedAt: new Date("2026-07-20T00:00:00Z") }],
    });
    mocks.commitImport.mockImplementation(async (options: { execute: (client: typeof tx) => Promise<unknown> }) => options.execute(tx));

    const response = await POST(jsonRequest(preview.items, { token: preview.previewToken }));
    expect(response.status).toBe(409);
    expect(tx.company.create).not.toHaveBeenCalled();
    expect(tx.ownershipPeriod.upsert).not.toHaveBeenCalled();
  });
});
