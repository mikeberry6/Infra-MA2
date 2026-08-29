import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { verifyDatasetSnapshot } from "./artifacts";
import {
  assertSeedRedirectBaselineMatchesLiveDecisions,
  executeSnapshotCli,
  parseApprovedAfterImages,
  parseSeedRedirectBaseline,
  parseSnapshotCliArguments,
  writeArtifactAtomically,
  writeSnapshotRunAtomically,
} from "./snapshot-cli";
import {
  buildProductionSnapshot,
  buildSeedSnapshot,
  databaseTargetIdentity,
  readProductionSnapshot,
  redactDatabaseError,
  type ProductionCompanyRow,
  type ProductionSnapshotClient,
  type ProductionSnapshotTransaction,
} from "./snapshot";

const NOW = "2026-08-03T12:00:00.000Z";

function productionRow(overrides: Partial<ProductionCompanyRow> = {}): ProductionCompanyRow {
  return {
    id: "company-1",
    name: "Acme Infrastructure, LLC",
    country: "United States",
    countryTags: ["United States"],
    sector: "UTILITIES",
    subsector: "Water services",
    region: "NORTH_AMERICA",
    companyStatus: "ACTIVE",
    status: "PUBLISHED",
    website: "https://acme.example.com/",
    updatedAt: NOW,
    lastVerifiedAt: null,
    _count: {
      ownershipPeriods: 2,
      pendingOwnershipTransactions: 0,
      milestones: 3,
      managementRoles: 1,
      citations: 4,
      redirects: 1,
    },
    ...overrides,
  };
}

function totalsFor(row: ProductionCompanyRow) {
  return { ...row._count };
}

function seedCompany(): PortCo {
  return {
    name: "Acme Infrastructure, LLC",
    investmentFirm: "3i Infrastructure",
    sector: "Utilities",
    subsector: "Water services",
    region: "North America",
    country: "United States",
    ownershipVehicle: "Acme Fund",
    description: "Acme owns regulated water infrastructure.",
    status: "Active",
    countryTags: ["United States"],
    website: "https://acme.example.com/",
    owners: [
      {
        investmentFirm: "3i Infrastructure",
        ownershipVehicle: "Acme Fund",
        investmentYear: 2020,
        status: "Active",
      },
      {
        investmentFirm: "3i Group",
        ownershipVehicle: "Acme Fund",
        investmentYear: 2020,
        status: "Active",
      },
    ],
    milestones: [
      { date: "2020", event: "3i invested.", category: "Financing" },
      { date: "2020", event: "3i invested.", category: "Financing" },
    ],
    management: [
      { name: "Ada Lovelace", title: "Chief Executive Officer" },
      { name: "Ada Lovelace", title: "Chief Executive Officer" },
    ],
    sources: [
      {
        label: "Acme — ownership",
        url: "https://acme.example.com/owners",
        purpose: "OWNERSHIP_INVESTMENT",
        evidenceLabel: "Current ownership.",
      },
      {
        label: "Acme — ownership",
        url: "https://acme.example.com/owners",
        purpose: "OWNERSHIP_INVESTMENT",
        evidenceLabel: "Current ownership.",
      },
    ],
  };
}

describe("database target identity", () => {
  it("binds to the expected host/database without hashing credentials", () => {
    const first = databaseTargetIdentity({
      connectionString: "postgresql://alice:first-secret@prod.example.com:5432/infrasight?sslmode=require",
      expectedHost: "prod.example.com",
      expectedDatabase: "infrasight",
      label: "production-readonly",
    });
    const rotated = databaseTargetIdentity({
      connectionString: "postgresql://bob:second-secret@prod.example.com/infrasight?sslmode=verify-full",
      expectedHost: "PROD.EXAMPLE.COM.",
      expectedDatabase: "infrasight",
      label: "production-readonly",
    });
    expect(first).toEqual(rotated);
    expect(JSON.stringify(first)).not.toContain("secret");
    expect(JSON.stringify(first)).not.toContain("alice");
  });

  it("fails closed on target mismatch or query-string target overrides", () => {
    expect(() => databaseTargetIdentity({
      connectionString: "postgresql://user:secret@local.example.com/infrasight",
      expectedHost: "prod.example.com",
      expectedDatabase: "infrasight",
      label: "production-readonly",
    })).toThrow(/does not match/i);
    expect(() => databaseTargetIdentity({
      connectionString: "postgresql://user:secret@prod.example.com/infrasight?host=other.example.com",
      expectedHost: "prod.example.com",
      expectedDatabase: "infrasight",
      label: "production-readonly",
    })).toThrow(/override/i);
    expect(redactDatabaseError(
      new Error("connection postgresql://user:secret@prod.example.com/infrasight failed for user with secret"),
      "postgresql://user:secret@prod.example.com/infrasight",
    )).not.toContain("secret");
    expect(redactDatabaseError(
      new Error("authentication failed for snapshot-user"),
      "postgresql://snapshot-user:secret@prod.example.com/infrasight",
    )).not.toContain("snapshot-user");
    expect(redactDatabaseError(new Error("plain seed snapshot failure"), ""))
      .toBe("plain seed snapshot failure");
  });
});

describe("production snapshot read", () => {
  it("enforces read-only repeatable-read and verifies exact relation totals", async () => {
    const row = productionRow();
    const calls: string[] = [];
    const count = (key: keyof ProductionCompanyRow["_count"]) => ({
      count: async (args?: unknown) => {
        calls.push(`count:${key}:${args ? "filtered" : "all"}`);
        return row._count[key];
      },
    });
    const transaction: ProductionSnapshotTransaction = {
      $executeRawUnsafe: async (query) => { calls.push(query); return 0; },
      $queryRawUnsafe: async (query) => {
        calls.push(`capability:${query.includes("PendingOwnershipTransaction")}`);
        return [{ relation: '"PendingOwnershipTransaction"' }];
      },
      company: {
        findMany: async (args) => {
          calls.push(`companies:${JSON.stringify(args).includes("redirects")}`);
          return [row];
        },
      },
      ownershipPeriod: count("ownershipPeriods"),
      pendingOwnershipTransaction: count("pendingOwnershipTransactions"),
      milestone: count("milestones"),
      managementRole: count("managementRoles"),
      citation: count("citations"),
      companyRedirect: count("redirects"),
    };
    const client: ProductionSnapshotClient = {
      $transaction: async (callback, options) => {
        expect(options).toEqual({ isolationLevel: "RepeatableRead", timeout: 120_000 });
        return callback(transaction);
      },
    };

    const result = await readProductionSnapshot(client);
    expect(result).toEqual({
      rows: [row],
      totals: totalsFor(row),
      pendingOwnershipTransactionsAvailable: true,
    });
    expect(calls[0]).toBe("SET TRANSACTION READ ONLY");
    expect(calls[1]).toBe("capability:true");
    expect(calls[2]).toBe("companies:true");
    expect(calls).toContain("count:citations:filtered");
  });

  it("rejects a partial or inconsistent relation read", () => {
    const row = productionRow();
    expect(() => buildProductionSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      target: { label: "production-readonly", fingerprint: "a".repeat(64) },
      read: {
        rows: [row],
        totals: { ...totalsFor(row), citations: row._count.citations + 1 },
        pendingOwnershipTransactionsAvailable: true,
      },
    })).toThrow(/incomplete/i);
  });

  it("requires an explicit legacy flag before recording zero for an absent pending table", async () => {
    const row = productionRow({
      _count: { ...productionRow()._count, pendingOwnershipTransactions: 9 },
    });
    const count = (key: Exclude<keyof ProductionCompanyRow["_count"], "pendingOwnershipTransactions">) => ({
      count: async () => row._count[key],
    });
    const transaction: ProductionSnapshotTransaction = {
      $executeRawUnsafe: async () => 0,
      $queryRawUnsafe: async () => [{ relation: null }],
      company: { findMany: async () => [row] },
      ownershipPeriod: count("ownershipPeriods"),
      milestone: count("milestones"),
      managementRole: count("managementRoles"),
      citation: count("citations"),
      companyRedirect: count("redirects"),
    };
    const client: ProductionSnapshotClient = {
      $transaction: async (callback) => callback(transaction),
    };

    await expect(readProductionSnapshot(client)).rejects.toThrow(/legacy-schema/i);
    const legacy = await readProductionSnapshot(client, { allowLegacySchema: true });
    expect(legacy.pendingOwnershipTransactionsAvailable).toBe(false);
    expect(legacy.rows[0]._count.pendingOwnershipTransactions).toBe(0);
    expect(legacy.totals.pendingOwnershipTransactions).toBe(0);
    expect(() => buildProductionSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      target: { label: "production-readonly", fingerprint: "a".repeat(64) },
      read: legacy,
    })).toThrow(/label.*legacy/i);
    expect(buildProductionSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      target: { label: "production-readonly-legacy", fingerprint: "a".repeat(64) },
      read: legacy,
    }).companies[0].relationCounts.pendingOwnershipTransactions).toBe(0);
  });

  it("sorts, hashes, and strictly validates production companies", () => {
    const row = productionRow();
    const artifact = buildProductionSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      target: { label: "production-readonly", fingerprint: "a".repeat(64) },
      read: {
        rows: [row],
        totals: totalsFor(row),
        pendingOwnershipTransactionsAvailable: true,
      },
    });
    expect(verifyDatasetSnapshot(artifact)).toEqual(artifact);
    expect(artifact.companies[0].companySnapshotSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(artifact.snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("evaluated seed snapshot", () => {
  it("counts distinct legal vehicles under the same manager and fund as separate ownership periods", () => {
    const company = seedCompany();
    company.owners = ["Alpha Holdco LLC", "Beta Holdco LLC", "Gamma Holdco LLC"].map(
      (vehicleName) => ({
        investmentFirm: "3i Infrastructure",
        ownershipVehicle: "Acme Fund",
        fundName: "Acme Fund",
        vehicleName,
        investmentYear: 2020,
        status: "Active" as const,
      }),
    ) as NonNullable<PortCo["owners"]>;

    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [company],
      approvedAfterImages: [],
    });

    expect(artifact.companies[0].relationCounts.ownershipPeriods).toBe(3);
  });

  it("preserves legacy ownershipVehicle deduplication when new owner fields are absent", () => {
    const company = seedCompany();
    company.owners = [
      {
        investmentFirm: "3i Infrastructure",
        ownershipVehicle: "Acme Fund",
        investmentYear: 2020,
        status: "Active",
      },
      {
        investmentFirm: "3i Infrastructure",
        ownershipVehicle: "Acme Fund",
        investmentYear: 2021,
        status: "Active",
      },
      {
        investmentFirm: "3i Infrastructure",
        ownershipVehicle: "Acme Co-Investment Vehicle",
        investmentYear: 2021,
        status: "Active",
      },
    ];

    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [company],
      approvedAfterImages: [],
    });

    expect(artifact.companies[0].relationCounts.ownershipPeriods).toBe(2);
  });

  it("models seed-runner deduplication and approved redirect overlays", () => {
    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [{
        proposalSha256: "a".repeat(64),
        taskId: "ledger:0001:acme",
        canonicalCompanyId: "company_acme",
        company: { name: "Acme Infrastructure, LLC", country: "United States" },
        productionRetiredCompanyIds: ["company_retired_acme"],
        retiredCompanies: [{ name: "Acme Infrastructure", country: "United States" }],
      }],
    });
    expect(artifact.companies[0]).toMatchObject({
      seedKey: "acme infrastructure, llc|United States",
      sector: "UTILITIES",
      region: "NORTH_AMERICA",
      relationCounts: {
        ownershipPeriods: 1,
        pendingOwnershipTransactions: 0,
        milestones: 1,
        managementRoles: 1,
        citations: 1,
        redirects: 1,
      },
    });
    expect(verifyDatasetSnapshot(artifact)).toEqual(artifact);
  });

  it("does not count reviewed seed-only identity retirements as production redirects", () => {
    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [{
        proposalSha256: "b".repeat(64),
        taskId: "ledger:0002:acme",
        canonicalCompanyId: "company_acme",
        company: { name: "Acme Infrastructure, LLC", country: "United States" },
        productionRetiredCompanyIds: [],
        retiredCompanies: [
          { name: "Acme Infrastructure", country: "United States" },
          { name: "Acme Infrastructure LP", country: "United States" },
        ],
        reviewedSeedRetirements: [
          { name: "Acme Infrastructure", country: "United States" },
          { name: "Acme Infrastructure LP", country: "United States" },
        ],
      }],
    });

    expect(artifact.companies[0].relationCounts.redirects).toBe(0);
    expect(verifyDatasetSnapshot(artifact)).toEqual(artifact);
  });

  it("counts repeated retired names by their distinct production row ids", () => {
    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [
        {
          proposalSha256: "c".repeat(64),
          taskId: "ledger:0003:acme",
          canonicalCompanyId: "company_acme",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired_1"],
          retiredCompanies: [{ name: "Acme Infrastructure, LLC", country: "United States" }],
        },
        {
          proposalSha256: "d".repeat(64),
          taskId: "ledger:0004:acme",
          canonicalCompanyId: "company_acme",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired_2"],
          retiredCompanies: [{ name: "Acme Infrastructure, LLC", country: "United States" }],
        },
      ],
    });

    expect(artifact.companies[0].relationCounts.redirects).toBe(2);
  });

  it("rejects a production row retired by more than one overlay", () => {
    expect(() => buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [
        {
          proposalSha256: "e".repeat(64),
          taskId: "ledger:0005:acme",
          canonicalCompanyId: "company_acme",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired"],
          retiredCompanies: [{ name: "Retired One", country: "United States" }],
        },
        {
          proposalSha256: "f".repeat(64),
          taskId: "ledger:0006:acme",
          canonicalCompanyId: "company_other",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired"],
          retiredCompanies: [{ name: "Retired Two", country: "United States" }],
        },
      ],
    })).toThrow(/production company company_retired more than once/i);
  });

  it("deduplicates a superseding overlay for the same task and production row", () => {
    const sharedTaskId = "ledger:0010:acme-retry";
    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [
        {
          proposalSha256: "4".repeat(64),
          taskId: sharedTaskId,
          canonicalCompanyId: "company_acme",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired_retry"],
          retiredCompanies: [{ name: "Acme Old", country: "United States" }],
        },
        {
          proposalSha256: "5".repeat(64),
          taskId: sharedTaskId,
          canonicalCompanyId: "company_acme",
          company: { name: "Acme Infrastructure, LLC", country: "United States" },
          productionRetiredCompanyIds: ["company_retired_retry"],
          retiredCompanies: [{ name: "Acme Old", country: "United States" }],
        },
      ],
    });

    expect(artifact.companies[0].relationCounts.redirects).toBe(1);
  });

  it("fails when an overlay canonical target is absent", () => {
    expect(() => buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      approvedAfterImages: [{
        proposalSha256: "1".repeat(64),
        taskId: "ledger:0007:missing",
        canonicalCompanyId: "company_missing",
        company: { name: "Missing Company", country: "United States" },
        productionRetiredCompanyIds: ["company_retired"],
        retiredCompanies: [{ name: "Retired", country: "United States" }],
      }],
    })).toThrow(/absent/i);
  });

  it("parses explicit and legacy production redirect lineage separately from seed retirements", () => {
    const explicitSha = "2".repeat(64);
    const legacySha = "3".repeat(64);
    const parsed = parseApprovedAfterImages([
      {
        proposalSha256: explicitSha,
        taskId: "ledger:0008:explicit",
        company: { name: "Acme Infrastructure, LLC", country: "United States" },
        productionRetiredCompanies: [{
          id: "production_explicit",
          name: "Acme Alias",
          country: "United States",
        }],
        retiredCompanies: [
          { name: "Acme Alias", country: "United States" },
          { name: "Acme Seed Alias", country: "United States" },
        ],
      },
      {
        proposalSha256: legacySha,
        taskId: "ledger:0009:legacy",
        company: { name: "Acme Infrastructure, LLC", country: "United States" },
        retiredCompanies: [{ name: "Acme Legacy Alias", country: "United States" }],
      },
    ], new Map([[legacySha, ["production_legacy"]]]));

    expect(parsed.map((entry) => entry.productionRetiredCompanyIds)).toEqual([
      ["production_explicit"],
      ["production_legacy"],
    ]);
  });

  it("rehomes baseline redirects when a later approved overlay retires their target", () => {
    const artifact = buildSeedSnapshot({
      asOfDate: "2026-08-03",
      capturedAt: NOW,
      baseCommit: "b".repeat(40),
      companies: [seedCompany()],
      baselineRedirects: parseSeedRedirectBaseline([{
        lineageKey: "legacy-acme",
        retiredId: "company_legacy_alias",
        companyId: "company_intermediate",
        company: { name: "Intermediate Acme", country: "United States" },
      }]),
      approvedAfterImages: [{
        proposalSha256: "6".repeat(64),
        taskId: "ledger:0011:acme-rehome",
        canonicalCompanyId: "company_acme",
        company: { name: "Acme Infrastructure, LLC", country: "United States" },
        productionRetiredCompanyIds: ["company_intermediate"],
        retiredCompanies: [{ name: "Intermediate Acme", country: "United States" }],
      }],
    });

    expect(artifact.companies[0].relationCounts.redirects).toBe(2);
  });

  it("rejects a baseline that is not bound to the reviewed live cleanup decisions", () => {
    expect(() => assertSeedRedirectBaselineMatchesLiveDecisions([{
      lineageKey: "unreviewed",
      retiredId: "company_retired",
      companyId: "company_acme",
      company: { name: "Acme Infrastructure, LLC", country: "United States" },
    }])).toThrow(/reviewed live canonical-cleanup decisions/i);
  });
});

describe("snapshot CLI boundary", () => {
  it("requires explicit output scope, date, and production target", () => {
    expect(parseSnapshotCliArguments([
      "production",
      "--as-of=2026-08-03",
      "--output=prod.json",
      "--database-target-label=production-readonly",
      "--expected-host=prod.example.com",
      "--expected-database=infrasight",
      "--legacy-schema",
    ])).toMatchObject({ command: "production", output: "prod.json", runDir: null, legacySchema: true });
    expect(() => parseSnapshotCliArguments(["seed", "--as-of=2026-02-30", "--output=seed.json"]))
      .toThrow(/calendar date/i);
    expect(() => parseSnapshotCliArguments(["both", "--as-of=2026-08-03", "--output=run"]))
      .toThrow(/run-dir/i);
    expect(() => parseSnapshotCliArguments(["production", "--as-of=2026-08-03", "--output=prod.json"]))
      .toThrow(/target/i);
    expect(() => parseSnapshotCliArguments([
      "seed", "--as-of=2026-08-03", "--output=seed.json", "--legacy-schema",
    ])).toThrow(/database target options/i);
  });

  it("writes one artifact atomically and refuses overwrite", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-snapshot-test-"));
    try {
      const artifact = buildSeedSnapshot({
        asOfDate: "2026-08-03",
        capturedAt: NOW,
        baseCommit: "b".repeat(40),
        companies: [seedCompany()],
        approvedAfterImages: [],
      });
      const output = join(directory, "seed.json");
      await writeArtifactAtomically(output, artifact);
      expect(JSON.parse(await readFile(output, "utf8"))).toEqual(artifact);
      await expect(writeArtifactAtomically(output, artifact)).rejects.toThrow(/overwrite/i);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("publishes the paired run directory only after both artifacts are ready", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-snapshot-run-test-"));
    try {
      const row = productionRow();
      const production = buildProductionSnapshot({
        asOfDate: "2026-08-03",
        capturedAt: NOW,
        target: { label: "production-readonly", fingerprint: "a".repeat(64) },
        read: {
          rows: [row],
          totals: totalsFor(row),
          pendingOwnershipTransactionsAvailable: true,
        },
      });
      const seed = buildSeedSnapshot({
        asOfDate: "2026-08-03",
        capturedAt: NOW,
        baseCommit: "b".repeat(40),
        companies: [seedCompany()],
        approvedAfterImages: [],
      });
      const runDir = join(directory, "snapshots");
      await writeSnapshotRunAtomically({ runDir, production, seed });
      expect(JSON.parse(await readFile(join(runDir, "production-snapshot.json"), "utf8"))).toEqual(production);
      expect(JSON.parse(await readFile(join(runDir, "seed-snapshot.json"), "utf8"))).toEqual(seed);
      await expect(writeSnapshotRunAtomically({ runDir, production, seed })).rejects.toThrow(/overwrite/i);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("does not silently fall back to seed when production credentials are absent", async () => {
    await expect(executeSnapshotCli([
      "production",
      "--as-of=2026-08-03",
      "--output=unused.json",
      "--database-target-label=production-readonly",
      "--expected-host=prod.example.com",
      "--expected-database=infrasight",
      "--database-url-env=PORTCO_TEST_DATABASE_URL",
    ], {})).rejects.toThrow(/not set/i);
  });
});
