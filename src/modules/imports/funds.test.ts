import { describe, expect, it, vi } from "vitest";
import type { ImportClassification } from "./domain";
import {
  classifyFundImport,
  commitFundImport,
  prepareFundRows,
  type PreparedFundImport,
} from "./funds";

function rawFund(overrides: Record<string, unknown> = {}) {
  return {
    id: "FUND-1",
    managerName: "Infrastructure Manager",
    fundName: "Infrastructure Fund I",
    investmentStrategy: "Core infrastructure investments.",
    size: "$2.0 billion",
    sizeUsdMm: 2_000,
    vintage: "2026",
    strategies: ["Core"],
    structure: "Closed-End",
    status: "Financial Close",
    sectors: ["Digital"],
    regions: ["North America"],
    sourceUrls: ["https://example.com/fund"],
    strategyUrl: "https://example.com/strategy",
    ...overrides,
  };
}

function preparedFund(overrides: Record<string, unknown> = {}) {
  const result = prepareFundRows([rawFund(overrides)]);
  expect(result.errors).toEqual([]);
  return result.prepared[0];
}

function existingFund(
  row: PreparedFundImport,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `db-${row.legacyId}`,
    legacyId: row.legacyId,
    status: "DRAFT",
    updatedAt: new Date("2026-07-20T12:00:00.000Z"),
    managerId: "manager-1",
    manager: { name: row.managerName },
    fundName: row.fundName,
    ticker: row.ticker,
    investmentStrategy: row.investmentStrategy,
    size: row.size,
    sizeUsdMm: row.sizeUsdMm,
    vintage: row.vintage,
    strategies: row.strategies,
    structure: row.structure,
    fundStatus: row.fundStatus,
    sectors: row.sectors,
    regions: row.regions,
    sourceUrls: row.sourceUrls,
    strategyUrl: row.strategyUrl || "",
    ...overrides,
  };
}

function classification(
  row: PreparedFundImport,
  action: "create" | "update",
): ImportClassification<PreparedFundImport> {
  return {
    prepared: [row],
    report: [{
      row: row.row,
      identifier: row.legacyId,
      disposition: action,
    }],
    summary: {
      total: 1,
      valid: 1,
      creates: action === "create" ? 1 : 0,
      updates: action === "update" ? 1 : 0,
      unchanged: 0,
      quarantined: 0,
      errors: 0,
      eligible: 1,
    },
    stateHash: "state",
    actions: new Map([[row.legacyId, action]]),
  };
}

describe("fund import preparation and classification", () => {
  it("normalizes enum arrays and rejects duplicate legacy identities", () => {
    const normalized = prepareFundRows([
      rawFund({
        __row: 12,
        strategies: "Core;Value-Add;Core",
        sectors: "Digital;Power & ET",
        regions: "North America;Global",
      }),
    ]);
    expect(normalized.errors).toEqual([]);
    expect(normalized.prepared[0]).toMatchObject({
      row: 12,
      strategies: ["CORE", "VALUE_ADD"],
      structure: "CLOSED_END",
      fundStatus: "FINANCIAL_CLOSE",
      sectors: ["DIGITAL", "POWER_ET"],
      regions: ["NORTH_AMERICA", "GLOBAL"],
    });

    const duplicate = prepareFundRows([
      rawFund(),
      rawFund({ fundName: "Different display name" }),
    ]);
    expect(duplicate.prepared).toEqual([]);
    expect(duplicate.errors).toHaveLength(2);
    expect(duplicate.errors.every(
      (row) => row.code === "DUPLICATE_IDENTITY",
    )).toBe(true);
  });

  it("rejects a supplied nonnumeric fund size instead of silently omitting it", () => {
    const result = prepareFundRows([
      rawFund({ sizeUsdMm: "not-a-number" }),
    ]);

    expect(result.prepared).toEqual([]);
    expect(result.errors[0]).toMatchObject({
      identifier: "FUND-1",
      disposition: "error",
      code: "VALIDATION_ERROR",
    });
  });

  it("quarantines a fund name already owned by another canonical ID", async () => {
    const rows = prepareFundRows([rawFund()]);
    const row = rows.prepared[0];
    const client = {
      fund: {
        findMany: vi.fn().mockResolvedValue([
          existingFund(row, { legacyId: "OTHER-ID" }),
        ]),
      },
    };

    const result = await classifyFundImport(
      client as unknown as Parameters<typeof classifyFundImport>[0],
      rows,
    );

    expect(result.actions.get("FUND-1")).toBe("quarantined");
    expect(result.report[0]).toMatchObject({
      code: "FUND_IDENTITY_CONFLICT",
      disposition: "quarantined",
    });
  });
});

describe("fund import commit", () => {
  it("creates new funds and their managers as drafts", async () => {
    const row = preparedFund();
    const managerUpsert = vi.fn().mockResolvedValue({ id: "manager-new" });
    const fundCreate = vi.fn().mockResolvedValue({ id: "fund-new" });
    const client = {
      fund: {
        findMany: vi.fn().mockResolvedValue([]),
        create: fundCreate,
      },
      organization: { upsert: managerUpsert },
    };

    await commitFundImport(
      client as unknown as Parameters<typeof commitFundImport>[0],
      classification(row, "create"),
    );

    expect(managerUpsert).toHaveBeenCalledWith({
      where: { name: "Infrastructure Manager" },
      update: {},
      create: {
        name: "Infrastructure Manager",
        types: ["FUND_MANAGER"],
        status: "DRAFT",
      },
      select: { id: true },
    });
    expect(fundCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        legacyId: "FUND-1",
        managerId: "manager-new",
        status: "DRAFT",
      }),
    });
  });

  it("merges source URLs and retains an existing strategy URL on update", async () => {
    const row = preparedFund({
      sourceUrls: ["https://example.com/new-source"],
      strategyUrl: "",
    });
    const current = existingFund(row, {
      sourceUrls: ["https://example.com/old-source"],
      strategyUrl: "https://example.com/existing-strategy",
      investmentStrategy: "Old strategy text.",
    });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const client = {
      fund: {
        findMany: vi.fn().mockResolvedValue([current]),
        updateMany,
      },
      organization: {
        upsert: vi.fn().mockResolvedValue({ id: "manager-1" }),
      },
    };

    await commitFundImport(
      client as unknown as Parameters<typeof commitFundImport>[0],
      classification(row, "update"),
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: current.id,
        status: "DRAFT",
        updatedAt: current.updatedAt,
      },
      data: expect.objectContaining({
        sourceUrls: [
          "https://example.com/old-source",
          "https://example.com/new-source",
        ],
        strategyUrl: "https://example.com/existing-strategy",
      }),
    });
  });
});
