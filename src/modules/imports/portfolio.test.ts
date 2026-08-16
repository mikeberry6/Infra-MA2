import { describe, expect, it, vi } from "vitest";
import type { ImportClassification } from "./domain";
import {
  classifyCompanyImport,
  commitCompanyImport,
  prepareCompanyRows,
  type PreparedCompanyImport,
} from "./portfolio";

function rawCompany(overrides: Record<string, unknown> = {}) {
  return {
    name: "Digital Infrastructure Company",
    country: "United States",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    description: "A digital infrastructure platform.",
    status: "Active",
    website: "https://example.com/company",
    yearFounded: 2015,
    headquarters: "New York, NY",
    countryTags: ["United States"],
    ...overrides,
  };
}

function preparedCompany(overrides: Record<string, unknown> = {}) {
  const result = prepareCompanyRows([rawCompany(overrides)]);
  expect(result.errors).toEqual([]);
  return result.prepared[0];
}

function existingCompany(
  row: PreparedCompanyImport,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `db-${row.name.replaceAll(" ", "-").toLowerCase()}`,
    name: row.name,
    country: row.country,
    status: "DRAFT",
    updatedAt: new Date("2026-07-20T12:00:00.000Z"),
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    countryTags: row.countryTags,
    description: row.description,
    companyStatus: row.companyStatus,
    website: row.website,
    yearFounded: row.yearFounded,
    headquarters: row.headquarters,
    ownershipPeriods: [],
    ...overrides,
  };
}

function identity(row: PreparedCompanyImport): string {
  return `${row.name.trim().toLocaleLowerCase()}|${row.country
    .trim()
    .toLocaleLowerCase()}`;
}

function classification(
  row: PreparedCompanyImport,
  action: "create" | "update",
): ImportClassification<PreparedCompanyImport> {
  return {
    prepared: [row],
    report: [{
      row: row.row,
      identifier: `${row.name} | ${row.country}`,
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
    actions: new Map([[identity(row), action]]),
  };
}

function classificationClient(
  companies: unknown[],
  funds: unknown[] = [],
) {
  return {
    company: { findMany: vi.fn().mockResolvedValue(companies) },
    fund: { findMany: vi.fn().mockResolvedValue(funds) },
  };
}

describe("portfolio import preparation", () => {
  it("normalizes company enums and rejects canonical duplicates in one file", () => {
    const normalized = prepareCompanyRows([
      rawCompany({
        __row: 5,
        countryTags: "United States;Canada;United States",
      }),
    ]);
    expect(normalized.errors).toEqual([]);
    expect(normalized.prepared[0]).toMatchObject({
      row: 5,
      sector: "DIGITAL",
      region: "NORTH_AMERICA",
      companyStatus: "ACTIVE",
      countryTags: ["United States", "Canada"],
    });

    const duplicates = prepareCompanyRows([
      rawCompany({ name: "ALLO Communications, LLC" }),
      rawCompany({
        name: "ALLO Communications",
        country: "Canada",
      }),
    ]);
    expect(duplicates.prepared).toEqual([]);
    expect(duplicates.errors).toHaveLength(2);
    expect(duplicates.errors.every(
      (row) => row.code === "DUPLICATE_CANONICAL_IDENTITY",
    )).toBe(true);
  });

  it.each([
    ["yearFounded", "unknown"],
    ["investmentYear", "not-a-year"],
  ])("rejects an invalid supplied %s value", (field, value) => {
    const result = prepareCompanyRows([
      rawCompany({ [field]: value }),
    ]);

    expect(result.prepared).toEqual([]);
    expect(result.errors[0]).toMatchObject({
      disposition: "error",
      code: "VALIDATION_ERROR",
    });
  });
});

describe("portfolio import classification", () => {
  it("quarantines a spelling variant of an existing canonical company", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        name: "ALLO Communications",
        country: "Canada",
      }),
    ]);
    const canonicalRow = preparedCompany({
      name: "ALLO Communications, LLC",
    });
    const client = classificationClient([
      existingCompany(canonicalRow),
    ]);

    const result = await classifyCompanyImport(
      client as unknown as Parameters<typeof classifyCompanyImport>[0],
      rows,
    );

    expect(result.actions.get(
      "allo communications|canada",
    )).toBe("quarantined");
    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "CANONICAL_COMPANY_VARIANT",
    });
    expect(result.report[0].message).toContain(
      "ALLO Communications, LLC",
    );
    expect(result.report[0].message).toContain("United States");
  });

  it("quarantines an ownership vehicle that is not a canonical fund", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        investmentFirm: "Manager",
        ownershipVehicle: "Unknown Fund",
        investmentYear: 2025,
      }),
    ]);

    const result = await classifyCompanyImport(
      classificationClient([]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "UNKNOWN_OWNERSHIP_VEHICLE",
    });
  });

  it("blocks replacing an existing active owner through bulk import", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        investmentFirm: "New Manager",
        investmentYear: 2026,
      }),
    ]);
    const row = rows.prepared[0];
    const current = existingCompany(row, {
      ownershipPeriods: [{
        id: "ownership-old",
        fundId: "fund-old",
        organizationId: "manager-old",
        isActive: true,
        vehicleName: "Old Fund",
        investmentYear: 2022,
        exitYear: null,
        organization: { name: "Old Manager" },
      }],
    });

    const result = await classifyCompanyImport(
      classificationClient([current]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "OWNERSHIP_REPLACEMENT_BLOCKED",
    });
  });

  it("quarantines realized ownership without a reviewed exit year", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        status: "Realized",
        investmentFirm: "Infrastructure Manager",
        investmentYear: 2020,
      }),
    ]);

    const result = await classifyCompanyImport(
      classificationClient([]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.actions.get(identity(rows.prepared[0]))).toBe(
      "quarantined",
    );
    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "REALIZED_OWNERSHIP_EXIT_YEAR_REQUIRED",
    });
  });

  it("quarantines a realized transition that omits an existing active owner", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        status: "Realized",
        investmentFirm: "",
        ownershipVehicle: "",
        investmentYear: "",
      }),
    ]);
    const row = rows.prepared[0];
    const current = existingCompany(row, {
      companyStatus: "ACTIVE",
      ownershipPeriods: [{
        id: "ownership-active",
        fundId: null,
        organizationId: "manager-active",
        isActive: true,
        vehicleName: "Infrastructure Manager",
        investmentYear: 2020,
        exitYear: null,
        organization: { name: "Infrastructure Manager" },
      }],
    });

    const result = await classifyCompanyImport(
      classificationClient([current]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.actions.get(identity(row))).toBe("quarantined");
    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "REALIZED_OWNERSHIP_EXIT_YEAR_REQUIRED",
    });
  });

  it("accepts an unchanged realized ownership that already has an exit year", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        status: "Realized",
        investmentFirm: "Infrastructure Manager",
        investmentYear: 2020,
      }),
    ]);
    const row = rows.prepared[0];
    const current = existingCompany(row, {
      ownershipPeriods: [{
        id: "ownership-realized",
        fundId: null,
        organizationId: "manager-realized",
        isActive: false,
        vehicleName: "Infrastructure Manager",
        investmentYear: 2020,
        exitYear: 2025,
        organization: { name: "Infrastructure Manager" },
      }],
    });

    const result = await classifyCompanyImport(
      classificationClient([current]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.actions.get(identity(row))).toBe("unchanged");
  });

  it("quarantines reactivation of a historical ownership period", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        status: "Active",
        investmentFirm: "Infrastructure Manager",
        investmentYear: 2020,
      }),
    ]);
    const row = rows.prepared[0];
    const current = existingCompany(row, {
      companyStatus: "REALIZED",
      ownershipPeriods: [{
        id: "ownership-realized",
        fundId: null,
        organizationId: "manager-realized",
        isActive: false,
        vehicleName: "Infrastructure Manager",
        investmentYear: 2020,
        exitYear: 2025,
        organization: { name: "Infrastructure Manager" },
      }],
    });

    const result = await classifyCompanyImport(
      classificationClient([current]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(result.actions.get(identity(row))).toBe("quarantined");
    expect(result.report[0]).toMatchObject({
      disposition: "quarantined",
      code: "OWNERSHIP_REACTIVATION_BLOCKED",
    });
  });

  it("distinguishes unchanged drafts from changed protected companies", async () => {
    const rows = prepareCompanyRows([
      rawCompany({ name: "Unchanged Company" }),
      rawCompany({
        name: "Protected Company",
        description: "Updated description.",
      }),
    ]);
    const [unchanged, protectedRow] = rows.prepared;
    const client = classificationClient([
      existingCompany(unchanged),
      existingCompany(protectedRow, {
        description: "Prior description.",
        status: "PUBLISHED",
      }),
    ]);

    const result = await classifyCompanyImport(
      client as unknown as Parameters<typeof classifyCompanyImport>[0],
      rows,
    );

    expect(result.actions.get(identity(unchanged))).toBe("unchanged");
    expect(result.actions.get(identity(protectedRow))).toBe("quarantined");
    expect(result.report.find(
      (entry) => entry.identifier.startsWith("Protected Company"),
    )).toMatchObject({
      code: "NON_DRAFT_UPDATE_BLOCKED",
    });
  });

  it("binds exact descriptor-only names into the preview state hash", async () => {
    const rows = prepareCompanyRows([
      rawCompany({
        name: "Holdings LLC",
        description: "Incoming description.",
      }),
    ]);
    const row = rows.prepared[0];
    const first = existingCompany(row, {
      description: "First database description.",
      updatedAt: new Date("2026-07-20T12:00:00.000Z"),
    });
    const changed = existingCompany(row, {
      description: "Concurrent database description.",
      updatedAt: new Date("2026-07-20T12:01:00.000Z"),
    });

    const before = await classifyCompanyImport(
      classificationClient([first]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );
    const after = await classifyCompanyImport(
      classificationClient([changed]) as unknown as Parameters<
        typeof classifyCompanyImport
      >[0],
      rows,
    );

    expect(before.actions.get(identity(row))).toBe("update");
    expect(after.actions.get(identity(row))).toBe("update");
    expect(after.stateHash).not.toBe(before.stateHash);
  });
});

describe("portfolio import commit", () => {
  it("creates companies, managers, and ownership assertions as drafts", async () => {
    const row = preparedCompany({
      investmentFirm: "Infrastructure Manager",
      ownershipVehicle: "Infrastructure Fund I",
      investmentYear: 2025,
    });
    const companyCreate = vi.fn().mockResolvedValue({ id: "company-new" });
    const managerUpsert = vi.fn().mockResolvedValue({ id: "manager-new" });
    const ownershipUpsert = vi.fn().mockResolvedValue({ id: "owner-new" });
    const client = {
      company: {
        findMany: vi.fn().mockResolvedValue([]),
        create: companyCreate,
      },
      organization: { upsert: managerUpsert },
      fund: {
        findUnique: vi.fn().mockResolvedValue({ id: "fund-1" }),
      },
      ownershipPeriod: { upsert: ownershipUpsert },
    };

    await commitCompanyImport(
      client as unknown as Parameters<typeof commitCompanyImport>[0],
      classification(row, "create"),
    );

    expect(companyCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Digital Infrastructure Company",
        country: "United States",
        status: "DRAFT",
      }),
      select: { id: true },
    });
    expect(managerUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "DRAFT" }),
      }),
    );
    expect(ownershipUpsert).toHaveBeenCalledWith({
      where: {
        companyId_organizationId_vehicleName_investmentYear: {
          companyId: "company-new",
          organizationId: "manager-new",
          vehicleName: "Infrastructure Fund I",
          investmentYear: 2025,
        },
      },
      update: {
        fundId: "fund-1",
        investmentYear: 2025,
        isActive: true,
      },
      create: {
        companyId: "company-new",
        organizationId: "manager-new",
        fundId: "fund-1",
        vehicleName: "Infrastructure Fund I",
        investmentYear: 2025,
        isActive: true,
      },
    });
  });

  it("fails closed when a company draft compare-and-set update loses its race", async () => {
    const row = preparedCompany({ description: "Updated description." });
    const current = existingCompany(row, {
      description: "Prior description.",
    });
    const client = {
      company: {
        findMany: vi.fn().mockResolvedValue([current]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      organization: { upsert: vi.fn() },
      fund: { findUnique: vi.fn() },
      ownershipPeriod: { upsert: vi.fn() },
    };

    await expect(commitCompanyImport(
      client as unknown as Parameters<typeof commitCompanyImport>[0],
      classification(row, "update"),
    )).rejects.toThrow("Import state changed during commit");
    expect(client.ownershipPeriod.upsert).not.toHaveBeenCalled();
  });

  it("fails closed before creating a realized ownership without an exit year", async () => {
    const row = preparedCompany({
      status: "Realized",
      investmentFirm: "Infrastructure Manager",
      investmentYear: 2020,
    });
    const companyCreate = vi.fn();
    const client = {
      company: {
        findMany: vi.fn().mockResolvedValue([]),
        create: companyCreate,
      },
      organization: { upsert: vi.fn() },
      fund: { findUnique: vi.fn() },
      ownershipPeriod: { upsert: vi.fn() },
    };

    await expect(commitCompanyImport(
      client as unknown as Parameters<typeof commitCompanyImport>[0],
      classification(row, "create"),
    )).rejects.toThrow("requires an exit year");
    expect(companyCreate).not.toHaveBeenCalled();
    expect(client.ownershipPeriod.upsert).not.toHaveBeenCalled();
  });
});
