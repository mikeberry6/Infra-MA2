// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdminIdentity: vi.fn(),
  parseImportRequest: vi.fn(),
  createStoredImportPreview: vi.fn(),
  lockStoredImportPreview: vi.fn(),
  markStoredImportPreviewCommitted: vi.fn(),
  withImportTransaction: vi.fn(),
  revalidateAppData: vi.fn(),
  prepareDealRows: vi.fn(),
  classifyDealImport: vi.fn(),
  commitDealImport: vi.fn(),
  prepareFundRows: vi.fn(),
  classifyFundImport: vi.fn(),
  commitFundImport: vi.fn(),
  prepareCompanyRows: vi.fn(),
  classifyCompanyImport: vi.fn(),
  commitCompanyImport: vi.fn(),
  recordImportAuditEvent: vi.fn(),
  previewPrisma: { client: "preview" },
  transactionClient: { client: "transaction" },
  events: [] as string[],
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.previewPrisma,
}));

vi.mock("@/lib/prisma-transaction", () => ({
  withImportTransaction: mocks.withImportTransaction,
}));

vi.mock("@/lib/revalidation", () => ({
  revalidateAppData: mocks.revalidateAppData,
}));

vi.mock("@/modules/auth/guards", () => ({
  requireAdminIdentity: mocks.requireAdminIdentity,
  isAuthorizationError: (error: unknown) =>
    !!error
    && typeof error === "object"
    && "authorizationError" in error,
}));

vi.mock("./request", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./request")>();
  return {
    ...actual,
    parseImportRequest: mocks.parseImportRequest,
    isImportRequestError: (error: unknown) =>
      !!error
      && typeof error === "object"
      && "importRequestError" in error,
  };
});

vi.mock("./preview-store", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./preview-store")>();
  return {
    ...actual,
    createStoredImportPreview: mocks.createStoredImportPreview,
    lockStoredImportPreview: mocks.lockStoredImportPreview,
    markStoredImportPreviewCommitted: mocks.markStoredImportPreviewCommitted,
  };
});

vi.mock("./audit", () => ({
  recordImportAuditEvent: mocks.recordImportAuditEvent,
}));

vi.mock("./deals", () => ({
  prepareDealRows: mocks.prepareDealRows,
  classifyDealImport: mocks.classifyDealImport,
  commitDealImport: mocks.commitDealImport,
}));

vi.mock("./funds", () => ({
  prepareFundRows: mocks.prepareFundRows,
  classifyFundImport: mocks.classifyFundImport,
  commitFundImport: mocks.commitFundImport,
}));

vi.mock("./portfolio", () => ({
  prepareCompanyRows: mocks.prepareCompanyRows,
  classifyCompanyImport: mocks.classifyCompanyImport,
  commitCompanyImport: mocks.commitCompanyImport,
}));

import { ImportPreviewError } from "./preview-store";
import {
  commitImport,
  previewImport,
} from "./service";

const STATE_HASH = "a".repeat(64);
const CHANGED_STATE_HASH = "b".repeat(64);
const ROWS = [{
  __row: 1,
  legacyId: "deal-1",
  title: "Deal 1",
  target: "Target 1",
  buyer: "Buyer 1",
  seller: "Seller 1",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-29",
  status: "Announced",
  description: "Description",
  targetDescription: "",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [],
  sourceName: null,
  sourceUrl: null,
}];
const REPORT = [{
  row: 1,
  identifier: "deal-1",
  disposition: "create" as const,
}];
const SUMMARY = {
  total: 1,
  valid: 1,
  creates: 1,
  updates: 0,
  unchanged: 0,
  quarantined: 0,
  errors: 0,
  eligible: 1,
};
const CLASSIFICATION = {
  prepared: [{ legacyId: "deal-1" }],
  report: REPORT,
  summary: SUMMARY,
  stateHash: STATE_HASH,
  actions: new Map([["deal-1", "create" as const]]),
};
const MUTATION = {
  imported: 1,
  created: 1,
  updated: 0,
  unchanged: 0,
  quarantined: 0,
};
const PUBLIC_RESULT = {
  ...MUTATION,
  auditEventId: "audit-1",
};

function request(
  method: "POST" | "PUT",
  body?: unknown,
  requestId = "request-1",
): Request {
  return new Request("https://example.test/api/imports/deals", {
    method,
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function lockedPreview(overrides: Record<string, unknown> = {}) {
  return {
    id: "preview-1",
    payload: {
      version: 2,
      format: "json",
      rows: ROWS,
      rowErrors: [],
      totalRows: 1,
    },
    report: REPORT,
    summary: SUMMARY,
    stateHash: STATE_HASH,
    payloadHash: "c".repeat(64),
    fileName: "deals.csv",
    expiresAt: new Date("2026-07-29T17:15:00.000Z"),
    committedReceipt: null,
    ...overrides,
  };
}

describe("import service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.events.length = 0;
    mocks.requireAdminIdentity.mockReset().mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    });
    mocks.parseImportRequest.mockReset().mockResolvedValue({
      rows: ROWS,
      fileName: "deals.csv",
      format: "json",
      byteLength: 100,
    });
    mocks.createStoredImportPreview.mockReset().mockResolvedValue({
      id: "preview-1",
      token: "signed-preview-token",
      expiresAt: new Date("2026-07-29T17:15:00.000Z"),
      payloadHash: "c".repeat(64),
    });
    mocks.lockStoredImportPreview.mockReset().mockResolvedValue(lockedPreview());
    mocks.markStoredImportPreviewCommitted
      .mockReset()
      .mockImplementation(async () => {
        mocks.events.push("receipt");
        return {
          previewId: "preview-1",
          committedAt: new Date("2026-07-29T17:01:00.000Z"),
          auditEventId: "audit-1",
          result: PUBLIC_RESULT,
        };
      });
    mocks.withImportTransaction.mockReset().mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) => {
        mocks.events.push("transaction:start");
        const value = await callback(mocks.transactionClient);
        mocks.events.push("transaction:end");
        return value;
      },
    );
    mocks.revalidateAppData.mockReset();
    mocks.prepareDealRows
      .mockReset()
      .mockReturnValue(CLASSIFICATION.prepared);
    mocks.classifyDealImport
      .mockReset()
      .mockResolvedValue(CLASSIFICATION);
    mocks.commitDealImport.mockReset().mockImplementation(async () => {
      mocks.events.push("mutation");
      return MUTATION;
    });
    mocks.prepareFundRows.mockReset();
    mocks.classifyFundImport.mockReset();
    mocks.commitFundImport.mockReset();
    mocks.prepareCompanyRows.mockReset();
    mocks.classifyCompanyImport.mockReset();
    mocks.commitCompanyImport.mockReset();
    mocks.recordImportAuditEvent.mockReset().mockImplementation(async () => {
      mocks.events.push("audit");
      return "audit-1";
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("creates a server-side preview without mutating imported entities", async () => {
    const response = await previewImport(
      request("POST", { deals: ROWS }) as never,
      "deals",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      preview: true,
      token: "signed-preview-token",
      expiresAt: "2026-07-29T17:15:00.000Z",
      summary: SUMMARY,
      report: REPORT,
    });
    expect(mocks.classifyDealImport).toHaveBeenCalledWith(
      mocks.previewPrisma,
      CLASSIFICATION.prepared,
    );
    expect(mocks.createStoredImportPreview).toHaveBeenCalledWith({
      actorId: "admin-1",
      entityType: "deals",
      fileName: "deals.csv",
      payload: {
        version: 2,
        format: "json",
        rows: ROWS,
        rowErrors: [],
        totalRows: 1,
      },
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
    });
    expect(mocks.withImportTransaction).not.toHaveBeenCalled();
    expect(mocks.commitDealImport).not.toHaveBeenCalled();
    expect(mocks.recordImportAuditEvent).not.toHaveBeenCalled();
    expect(mocks.markStoredImportPreviewCommitted).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("previews and commits valid rows while retaining invalid rows as report errors", async () => {
    const rowErrors = [{
      row: 2,
      code: "INVALID_IMPORT_FIELDS" as const,
      message:
        "Import row 2 does not match the import template (unknown: privateEditorialNotes).",
    }];
    const mixedReport = [
      ...REPORT,
      {
        row: 2,
        identifier: "",
        disposition: "error" as const,
        code: rowErrors[0].code,
        message: rowErrors[0].message,
      },
    ];
    const mixedSummary = {
      ...SUMMARY,
      total: 2,
      errors: 1,
    };
    mocks.parseImportRequest.mockResolvedValue({
      rows: ROWS,
      rowErrors,
      totalRows: 2,
      fileName: "deals.json",
      format: "json",
      byteLength: 200,
    });

    const previewResponse = await previewImport(
      request("POST", { deals: ROWS }) as never,
      "deals",
    );
    expect(previewResponse.status).toBe(200);
    await expect(previewResponse.json()).resolves.toMatchObject({
      summary: mixedSummary,
      report: mixedReport,
    });
    expect(mocks.createStoredImportPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          version: 2,
          format: "json",
          rows: ROWS,
          rowErrors,
          totalRows: 2,
        },
        report: mixedReport,
        summary: mixedSummary,
      }),
    );

    mocks.lockStoredImportPreview.mockResolvedValue(lockedPreview({
      payload: {
        version: 2,
        format: "json",
        rows: ROWS,
        rowErrors,
        totalRows: 2,
      },
      report: mixedReport,
      summary: mixedSummary,
    }));
    const commitResponse = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );
    expect(commitResponse.status).toBe(200);
    expect(mocks.commitDealImport).toHaveBeenCalledOnce();
    expect(mocks.recordImportAuditEvent).toHaveBeenCalledWith(
      mocks.transactionClient,
      expect.objectContaining({ report: mixedReport }),
    );
  });

  it("can commit a mixed preview after bounding attacker-controlled unknown JSON keys", async () => {
    const actualRequest =
      await vi.importActual<typeof import("./request")>("./request");
    mocks.parseImportRequest.mockImplementation((incoming, options) =>
      actualRequest.parseImportRequest(incoming, options)
    );
    const valid = { ...ROWS[0] } as Record<string, unknown>;
    delete valid.__row;
    const unknown = Object.fromEntries(
      Array.from({ length: 40 }, (_, index) => [
        `unknown_${index}_${"x".repeat(4_000)}`,
        "private value must not survive",
      ]),
    );

    const previewResponse = await previewImport(
      request(
        "POST",
        [valid, { ...valid, legacyId: "deal-2", ...unknown }],
      ) as never,
      "deals",
    );
    expect(previewResponse.status).toBe(200);

    const storedInput = mocks.createStoredImportPreview.mock.calls[0][0];
    expect(storedInput.payload.rows).toEqual(ROWS);
    expect(storedInput.payload.rowErrors).toHaveLength(1);
    expect(storedInput.payload.rowErrors[0].message.length).toBeLessThan(1_000);
    expect(JSON.stringify(storedInput.payload.rows)).not.toContain(
      "private value must not survive",
    );
    expect(JSON.stringify(storedInput.payload.rows)).not.toContain("unknown_");

    mocks.lockStoredImportPreview.mockResolvedValue(lockedPreview({
      payload: storedInput.payload,
      report: storedInput.report,
      summary: storedInput.summary,
    }));
    const commitResponse = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(commitResponse.status).toBe(200);
    expect(mocks.commitDealImport).toHaveBeenCalledOnce();
  });

  it("binds confirmation to the current administrator and rejects another administrator's token", async () => {
    mocks.requireAdminIdentity.mockResolvedValue({
      id: "admin-2",
      role: "ADMIN",
    });
    mocks.lockStoredImportPreview.mockImplementation(async (_tx, input) => {
      if (input.actorId !== "admin-1") throw new ImportPreviewError();
      return lockedPreview();
    });

    const response = await commitImport(
      request("PUT", { token: "admin-1-preview-token" }) as never,
      "deals",
    );

    expect(response.status).toBe(409);
    expect(mocks.lockStoredImportPreview).toHaveBeenCalledWith(
      mocks.transactionClient,
      {
        token: "admin-1-preview-token",
        actorId: "admin-2",
        entityType: "deals",
      },
    );
    expect(mocks.classifyDealImport).not.toHaveBeenCalled();
    expect(mocks.commitDealImport).not.toHaveBeenCalled();
    expect(mocks.recordImportAuditEvent).not.toHaveBeenCalled();
    expect(mocks.markStoredImportPreviewCommitted).not.toHaveBeenCalled();
  });

  it.each([
    ["duplicate", 1],
    ["out-of-range", 3],
  ])("rejects %s stored row-error numbering", async (_label, errorRow) => {
    mocks.lockStoredImportPreview.mockResolvedValue(lockedPreview({
      payload: {
        version: 2,
        format: "json",
        rows: ROWS,
        rowErrors: [{
          row: errorRow,
          code: "INVALID_IMPORT_VALUE",
          message: "Invalid row",
        }],
        totalRows: 2,
      },
    }));

    const response = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(response.status).toBe(409);
    expect(mocks.commitDealImport).not.toHaveBeenCalled();
    expect(mocks.recordImportAuditEvent).not.toHaveBeenCalled();
  });

  it("returns 409 without mutation or audit when database state is stale", async () => {
    mocks.classifyDealImport.mockResolvedValue({
      ...CLASSIFICATION,
      stateHash: CHANGED_STATE_HASH,
    });

    const response = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error:
        "The database changed after this preview. Preview the file again before importing.",
    });
    expect(mocks.commitDealImport).not.toHaveBeenCalled();
    expect(mocks.recordImportAuditEvent).not.toHaveBeenCalled();
    expect(mocks.markStoredImportPreviewCommitted).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("orders mutation, audit, and committed receipt inside one transaction", async () => {
    const response = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(PUBLIC_RESULT);
    expect(mocks.events).toEqual([
      "transaction:start",
      "mutation",
      "audit",
      "receipt",
      "transaction:end",
    ]);
    expect(mocks.commitDealImport).toHaveBeenCalledWith(
      mocks.transactionClient,
      CLASSIFICATION,
    );
    expect(mocks.recordImportAuditEvent).toHaveBeenCalledWith(
      mocks.transactionClient,
      {
        actorId: "admin-1",
        previewId: "preview-1",
        entityType: "deals",
        payloadHash: "c".repeat(64),
        summary: SUMMARY,
        result: MUTATION,
        report: REPORT,
      },
    );
    expect(mocks.markStoredImportPreviewCommitted).toHaveBeenCalledWith(
      mocks.transactionClient,
      {
        id: "preview-1",
        auditEventId: "audit-1",
        result: PUBLIC_RESULT,
      },
    );
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
  });

  it("returns a stored committed result on replay without mutation or another audit", async () => {
    mocks.lockStoredImportPreview.mockResolvedValue(lockedPreview({
      committedReceipt: {
        previewId: "preview-1",
        committedAt: new Date("2026-07-29T17:01:00.000Z"),
        auditEventId: "audit-1",
        result: PUBLIC_RESULT,
      },
    }));

    const response = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ...PUBLIC_RESULT,
      idempotent: true,
    });
    expect(mocks.events).toEqual([
      "transaction:start",
      "transaction:end",
    ]);
    expect(mocks.classifyDealImport).not.toHaveBeenCalled();
    expect(mocks.commitDealImport).not.toHaveBeenCalled();
    expect(mocks.recordImportAuditEvent).not.toHaveBeenCalled();
    expect(mocks.markStoredImportPreviewCommitted).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
  });

  it("returns a generic 500 response without exposing raw database details", async () => {
    mocks.classifyDealImport.mockRejectedValue(
      Object.assign(
        new Error("password authentication failed for user secret_admin"),
        { code: "P1000" },
      ),
    );

    const response = await previewImport(
      request("POST", { deals: ROWS }, "request-safe-1") as never,
      "deals",
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "The import preview could not be created",
      requestId: "request-safe-1",
    });
    expect(JSON.stringify(body)).not.toContain("password authentication");
    expect(JSON.stringify(body)).not.toContain("secret_admin");
    expect(console.error).toHaveBeenCalledWith(JSON.stringify({
      event: "import_failure",
      entityType: "deals",
      operation: "preview",
      requestId: "request-safe-1",
      errorType: "Error",
      prismaCode: "P1000",
    }));
  });

  it("replaces an unsafe caller request id before logging or returning it", async () => {
    mocks.classifyDealImport.mockRejectedValue(new Error("failed"));
    const unsafe = `bad-${"x".repeat(300)}`;
    const response = await previewImport(
      request("POST", { deals: ROWS }, unsafe) as never,
      "deals",
    );
    const body = await response.json();

    expect(body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.requestId).not.toBe(unsafe);
    expect(console.error).toHaveBeenCalledWith(
      expect.not.stringContaining(unsafe),
    );
  });

  it("returns 403 before parsing or opening a transaction when authorization fails", async () => {
    mocks.requireAdminIdentity.mockRejectedValue({
      authorizationError: true,
      detail: "not an admin",
    });

    const previewResponse = await previewImport(
      request("POST", { deals: ROWS }) as never,
      "deals",
    );
    const commitResponse = await commitImport(
      request("PUT", { token: "signed-preview-token" }) as never,
      "deals",
    );

    expect(previewResponse.status).toBe(403);
    await expect(previewResponse.json()).resolves.toEqual({
      error: "Forbidden",
    });
    expect(commitResponse.status).toBe(403);
    await expect(commitResponse.json()).resolves.toEqual({
      error: "Forbidden",
    });
    expect(mocks.parseImportRequest).not.toHaveBeenCalled();
    expect(mocks.createStoredImportPreview).not.toHaveBeenCalled();
    expect(mocks.withImportTransaction).not.toHaveBeenCalled();
  });
});
