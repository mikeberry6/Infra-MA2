import { describe, expect, it, vi } from "vitest";
import type { ImportClassification } from "./domain";
import {
  classifyDealImport,
  commitDealImport,
  prepareDealRows,
  type PreparedDealImport,
} from "./deals";

function rawDeal(overrides: Record<string, unknown> = {}) {
  return {
    id: "DEAL-1",
    title: "Buyer acquires Target",
    target: "Target",
    buyer: "Buyer A",
    seller: "Seller A",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-07-15",
    description: "A transaction description.",
    targetDescription: "A digital infrastructure business.",
    country: "United States",
    status: "Announced",
    keyHighlights: ["Platform acquisition"],
    ...overrides,
  };
}

function preparedDeal(overrides: Record<string, unknown> = {}) {
  const result = prepareDealRows([rawDeal(overrides)]);
  expect(result.errors).toEqual([]);
  return result.prepared[0];
}

function existingDeal(
  row: PreparedDealImport,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `db-${row.legacyId}`,
    legacyId: row.legacyId,
    status: "DRAFT",
    title: row.title,
    target: row.target,
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    categories: row.categories,
    date: new Date(row.date),
    description: row.description,
    targetDescription: row.targetDescription,
    country: row.country,
    enterpriseValue: row.enterpriseValue,
    equityValue: row.equityValue,
    stake: row.stake,
    dealStatus: row.dealStatus,
    closingDate: row.closingDate ? new Date(row.closingDate) : null,
    assetScale: row.assetScale,
    valuationMultiple: row.valuationMultiple,
    fundVehicle: row.fundVehicle,
    keyHighlights: row.keyHighlights,
    updatedAt: new Date("2026-07-20T12:00:00.000Z"),
    participants: [
      ...row.buyers.map((name) => ({
        role: "BUYER",
        displayName: name,
        organization: { name },
      })),
      ...row.sellers.map((name) => ({
        role: "SELLER",
        displayName: name,
        organization: { name },
      })),
    ],
    citations: row.sourceUrl
      ? [{
          sourceId: `source-${row.legacyId}`,
          source: {
            url: row.sourceUrl,
            label: row.sourceName || row.sourceUrl,
          },
        }]
      : [],
    ...overrides,
  };
}

function classification(
  row: PreparedDealImport,
  action: "create" | "update",
): ImportClassification<PreparedDealImport> {
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

describe("deal import preparation and classification", () => {
  it("normalizes dates, enums, parties, and source fields", () => {
    const result = prepareDealRows([
      rawDeal({
        __row: 7,
        buyer: [" Buyer A ", "Buyer A", "N/A", "Buyer B"],
        seller: "Seller A / —",
        category: "Acquisition (Buyout);Joint Venture",
        sourceName: "Announcement",
        sourceUrl: "https://example.com/deal",
      }),
    ]);

    expect(result.errors).toEqual([]);
    expect(result.prepared[0]).toMatchObject({
      row: 7,
      legacyId: "DEAL-1",
      sector: "DIGITAL",
      region: "NORTH_AMERICA",
      categories: ["ACQUISITION_BUYOUT", "JOINT_VENTURE"],
      buyers: ["Buyer A", "Buyer B"],
      sellers: ["Seller A"],
      sourceName: "Announcement",
      sourceUrl: "https://example.com/deal",
    });
    expect(result.prepared[0].date).toMatch(/^2026-07-15T/);
  });

  it("rejects every row sharing a duplicate legacy identity", () => {
    const result = prepareDealRows([
      rawDeal(),
      rawDeal({ target: "A different target" }),
    ]);

    expect(result.prepared).toEqual([]);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.every(
      (row) => row.code === "DUPLICATE_IDENTITY",
    )).toBe(true);
  });

  it("separates creates, updates, unchanged rows, and protected records", async () => {
    const rows = prepareDealRows([
      rawDeal({ id: "UNCHANGED" }),
      rawDeal({ id: "UPDATE", title: "Updated title" }),
      rawDeal({ id: "PROTECTED", title: "Protected update" }),
      rawDeal({ id: "CREATE" }),
    ]);
    const [unchanged, update, protectedRow] = rows.prepared;
    const client = {
      deal: {
        findMany: vi.fn().mockResolvedValue([
          existingDeal(unchanged),
          existingDeal(update, { title: "Old title" }),
          existingDeal(protectedRow, {
            title: "Old protected title",
            status: "PUBLISHED",
          }),
        ]),
      },
    };

    const result = await classifyDealImport(
      client as unknown as Parameters<typeof classifyDealImport>[0],
      rows,
    );

    expect(Object.fromEntries(result.actions)).toEqual({
      UNCHANGED: "unchanged",
      UPDATE: "update",
      PROTECTED: "quarantined",
      CREATE: "create",
    });
    expect(result.summary).toEqual({
      total: 4,
      valid: 4,
      creates: 1,
      updates: 1,
      unchanged: 1,
      quarantined: 1,
      errors: 0,
      eligible: 2,
    });
    expect(result.report.find(
      (row) => row.identifier === "PROTECTED",
    )).toMatchObject({
      disposition: "quarantined",
      code: "NON_DRAFT_UPDATE_BLOCKED",
    });
  });
});

describe("deal import commit", () => {
  it("creates new deals as drafts", async () => {
    const row = preparedDeal({
      sourceName: "Announcement",
      sourceUrl: "https://example.com/new-deal",
    });
    const dealCreate = vi.fn().mockResolvedValue({ id: "new-deal" });
    const client = {
      deal: {
        findMany: vi.fn().mockResolvedValue([]),
        create: dealCreate,
      },
      organization: {
        upsert: vi.fn().mockImplementation(({ where }) => ({
          id: `org-${where.name}`,
        })),
      },
      dealParticipant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({}),
      },
      source: {
        upsert: vi.fn().mockResolvedValue({ id: "source-new" }),
      },
      citation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn(),
      },
    };

    await commitDealImport(
      client as unknown as Parameters<typeof commitDealImport>[0],
      classification(row, "create"),
    );

    expect(dealCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        legacyId: "DEAL-1",
        status: "DRAFT",
      }),
      select: { id: true },
    });
    expect(client.organization.upsert).toHaveBeenCalledTimes(2);
    expect(client.organization.upsert).toHaveBeenCalledWith({
      where: { name: "Buyer A" },
      update: {},
      create: {
        name: "Buyer A",
        types: ["OTHER"],
        status: "DRAFT",
      },
      select: { id: true },
    });
    expect(client.organization.upsert).toHaveBeenCalledWith({
      where: { name: "Seller A" },
      update: {},
      create: {
        name: "Seller A",
        types: ["OTHER"],
        status: "DRAFT",
      },
      select: { id: true },
    });
    expect(client.citation.deleteMany).not.toHaveBeenCalled();
  });

  it("adds a new citation without deleting citations already on a draft", async () => {
    const row = preparedDeal({
      title: "Updated title",
      sourceName: "New announcement",
      sourceUrl: "https://example.com/new",
    });
    const current = existingDeal(row, {
      title: "Old title",
      citations: [{
        sourceId: "source-old",
        source: {
          url: "https://example.com/old",
          label: "Prior source",
        },
      }],
    });
    const citationDelete = vi.fn();
    const citationCreate = vi.fn().mockResolvedValue({});
    const client = {
      deal: {
        findMany: vi.fn().mockResolvedValue([current]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      organization: { upsert: vi.fn() },
      dealParticipant: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      source: {
        upsert: vi.fn().mockResolvedValue({ id: "source-new" }),
      },
      citation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: citationCreate,
        deleteMany: citationDelete,
      },
    };

    await commitDealImport(
      client as unknown as Parameters<typeof commitDealImport>[0],
      classification(row, "update"),
    );

    expect(citationDelete).not.toHaveBeenCalled();
    expect(citationCreate).toHaveBeenCalledWith({
      data: {
        dealId: current.id,
        sourceId: "source-new",
      },
    });
  });

  it("fails closed when the draft compare-and-set update loses its race", async () => {
    const row = preparedDeal({ title: "Updated title" });
    const current = existingDeal(row, { title: "Old title" });
    const client = {
      deal: {
        findMany: vi.fn().mockResolvedValue([current]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      organization: { upsert: vi.fn() },
      dealParticipant: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      source: { upsert: vi.fn() },
      citation: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    await expect(commitDealImport(
      client as unknown as Parameters<typeof commitDealImport>[0],
      classification(row, "update"),
    )).rejects.toThrow("Import state changed during commit");
    expect(client.dealParticipant.deleteMany).not.toHaveBeenCalled();
    expect(client.citation.create).not.toHaveBeenCalled();
  });
});
