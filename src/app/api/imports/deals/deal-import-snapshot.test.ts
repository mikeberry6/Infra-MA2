import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getSessionIdentity: vi.fn(),
  isAuthorizationError: vi.fn(),
  createImportPreviewToken: vi.fn(),
  consumeImportPreviewToken: vi.fn(),
  hashImportPreviewState: vi.fn(),
  revalidateAppData: vi.fn(),
  recordAuditEvent: vi.fn(),
  dealFindMany: vi.fn(),
  transaction: vi.fn(),
  pipelineCreate: vi.fn(),
  pipelineUpdate: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  AuthorizationError: class AuthorizationError extends Error {},
  requireAdmin: mocks.requireAdmin,
  getSessionIdentity: mocks.getSessionIdentity,
  isAuthorizationError: mocks.isAuthorizationError,
}));
vi.mock("@/modules/imports/preview-token", () => ({
  ImportPreviewTokenError: class ImportPreviewTokenError extends Error {
    constructor(message = "Import preview is missing, expired, changed, or already used. Preview the file again.") {
      super(message);
      this.name = "ImportPreviewTokenError";
    }
  },
  createImportPreviewToken: mocks.createImportPreviewToken,
  consumeImportPreviewToken: mocks.consumeImportPreviewToken,
  hashImportPreviewState: mocks.hashImportPreviewState,
}));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidateAppData }));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { findMany: mocks.dealFindMany },
    $transaction: mocks.transaction,
    pipelineRun: { create: mocks.pipelineCreate, update: mocks.pipelineUpdate },
  },
}));

import { POST as importDeals } from "@/app/api/imports/deals/route";
import { ImportPreviewTokenError } from "@/modules/imports/preview-token";

function jsonRequest(path: string, body: unknown, previewToken = "preview-token"): NextRequest {
  return {
    headers: new Headers({
      "content-type": "application/json",
      ...(previewToken ? { "x-import-preview-token": previewToken } : {}),
    }),
    json: vi.fn().mockResolvedValue(body),
    nextUrl: new URL(`http://localhost${path}`),
  } as unknown as NextRequest;
}

function deal() {
  return {
    id: "DEAL-1",
    title: "Buyer acquires Target",
    target: "Target",
    buyer: "Buyer",
    seller: "Seller",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-07-20",
    description: "A complete transaction description.",
    targetDescription: "A fiber platform.",
    country: "United States",
    status: "Announced",
    sourceName: "Company announcement",
    sourceUrl: "https://example.com/deal",
  };
}

function existingDeal(overrides: Record<string, unknown> = {}) {
  return {
    id: "database-deal-1",
    legacyId: "DEAL-1",
    status: "DRAFT",
    title: "Earlier title",
    target: "Target",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    categories: ["ACQUISITION_BUYOUT"],
    date: new Date("2026-07-20T12:00:00.000Z"),
    description: "Earlier description.",
    targetDescription: "A fiber platform.",
    country: "United States",
    enterpriseValue: null,
    equityValue: null,
    stake: null,
    dealStatus: "ANNOUNCED",
    closingDate: null,
    sellerDisclosureStatus: "DISCLOSED",
    sellerDisclosureReason: null,
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [],
    updatedAt: new Date("2026-07-21T12:00:00.000Z"),
    participants: [
      { role: "SELLER", displayName: "Seller", organization: { name: "Seller" } },
      { role: "BUYER", displayName: "Buyer", organization: { name: "Buyer" } },
    ],
    citations: [
      { source: { url: "https://example.com/z-source", label: "Z source" } },
      { source: { url: "https://example.com/deal", label: "Company announcement" } },
    ],
    ...overrides,
  };
}

function failingCommitClient(existing: ReturnType<typeof existingDeal>) {
  return {
    deal: {
      findMany: vi.fn().mockResolvedValue([existing]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn(),
    },
    dealParticipant: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    organization: { upsert: vi.fn() },
    citation: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    source: { upsert: vi.fn() },
    pipelineRun: { update: vi.fn() },
    importPreview: { updateMany: vi.fn() },
  };
}

describe("deal import preview state binding", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.isAuthorizationError.mockReturnValue(false);
    mocks.createImportPreviewToken.mockResolvedValue("preview-token");
    mocks.hashImportPreviewState.mockImplementation((value) => JSON.stringify(value));
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
    mocks.pipelineCreate.mockResolvedValue({ id: "pipeline-1" });
    mocks.pipelineUpdate.mockResolvedValue({});
  });

  it("builds a deterministic snapshot from all selected deal state", async () => {
    const first = existingDeal();
    const second = existingDeal({
      participants: [...first.participants].reverse(),
      citations: [...first.citations].reverse(),
    });
    mocks.dealFindMany.mockResolvedValueOnce([first]).mockResolvedValueOnce([second]);

    const firstResponse = await importDeals(jsonRequest("/api/imports/deals?preview=1", { deals: [deal()] }));
    const secondResponse = await importDeals(jsonRequest("/api/imports/deals?preview=1", { deals: [deal()] }));

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    const firstSummary = mocks.createImportPreviewToken.mock.calls[0][0].summary;
    const secondSummary = mocks.createImportPreviewToken.mock.calls[1][0].summary;
    expect(firstSummary.stateHash).toBe(secondSummary.stateHash);
    expect(mocks.hashImportPreviewState.mock.calls[0][0]).toMatchObject({
      actions: [{ id: "DEAL-1", action: "update" }],
      existing: [{
        id: "database-deal-1",
        legacyId: "DEAL-1",
        updatedAt: "2026-07-21T12:00:00.000Z",
        participants: [
          { role: "BUYER", displayName: "Buyer", organizationName: "Buyer" },
          { role: "SELLER", displayName: "Seller", organizationName: "Seller" },
        ],
        citations: [
          { url: "https://example.com/deal", label: "Company announcement" },
          { url: "https://example.com/z-source", label: "Z source" },
        ],
      }],
      warnings: [],
    });
  });

  it("rejects a missing commit token before reading deal state", async () => {
    const response = await importDeals(jsonRequest("/api/imports/deals", { deals: [deal()] }, ""));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Import preview is missing, expired, changed, or already used. Preview the file again.",
    });
    expect(mocks.dealFindMany).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
  });

  it("rejects a stale preview from the transaction snapshot before any write", async () => {
    const previewState = existingDeal();
    const changedState = existingDeal({
      title: "Concurrent editorial change",
      updatedAt: new Date("2026-07-22T12:00:00.000Z"),
    });
    mocks.dealFindMany.mockResolvedValue([previewState]);
    const tx = failingCommitClient(changedState);
    mocks.transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    const previewResponse = await importDeals(jsonRequest("/api/imports/deals?preview=1", { deals: [deal()] }));
    expect(previewResponse.status).toBe(200);
    const previewSummary = mocks.createImportPreviewToken.mock.calls[0][0].summary;
    mocks.consumeImportPreviewToken.mockImplementation(async (options) => {
      if (options.summary.stateHash !== previewSummary.stateHash) {
        throw new ImportPreviewTokenError();
      }
    });

    const response = await importDeals(jsonRequest("/api/imports/deals", { deals: [deal()] }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Import preview is missing, expired, changed, or already used. Preview the file again.",
    });
    expect(tx.deal.findMany).toHaveBeenCalledOnce();
    expect(mocks.consumeImportPreviewToken).toHaveBeenCalledOnce();
    expect(mocks.consumeImportPreviewToken.mock.calls[0][0].summary.stateHash)
      .not.toBe(previewSummary.stateHash);
    expect(mocks.consumeImportPreviewToken.mock.calls[0][1]).toBe(tx);
    expect(tx.deal.updateMany).not.toHaveBeenCalled();
    expect(tx.deal.create).not.toHaveBeenCalled();
    expect(tx.dealParticipant.deleteMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("uses updatedAt compare-and-swap when state changes after the transaction read", async () => {
    const previewState = existingDeal();
    mocks.dealFindMany.mockResolvedValue([previewState]);
    const tx = failingCommitClient(previewState);
    mocks.transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    const previewResponse = await importDeals(jsonRequest("/api/imports/deals?preview=1", { deals: [deal()] }));
    expect(previewResponse.status).toBe(200);
    const previewSummary = mocks.createImportPreviewToken.mock.calls[0][0].summary;
    mocks.consumeImportPreviewToken.mockImplementation(async (options) => {
      if (options.summary.stateHash !== previewSummary.stateHash) {
        throw new ImportPreviewTokenError();
      }
    });

    const response = await importDeals(jsonRequest("/api/imports/deals", { deals: [deal()] }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Deal import review state changed during commit. Preview the file again.",
    });
    expect(mocks.consumeImportPreviewToken).toHaveBeenCalledWith(
      expect.objectContaining({ summary: previewSummary }),
      tx,
    );
    expect(tx.deal.updateMany).toHaveBeenCalledWith({
      where: {
        id: "database-deal-1",
        status: { in: ["DRAFT", "IN_REVIEW"] },
        updatedAt: previewState.updatedAt,
      },
      data: expect.objectContaining({ title: "Buyer acquires Target" }),
    });
    expect(tx.deal.findMany.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.consumeImportPreviewToken.mock.invocationCallOrder[0]);
    expect(mocks.consumeImportPreviewToken.mock.invocationCallOrder[0])
      .toBeLessThan(tx.deal.updateMany.mock.invocationCallOrder[0]);
    expect(tx.dealParticipant.deleteMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });
});
