import { describe, expect, it } from "vitest";
import {
  finalizeDatasetSnapshot,
  finalizeRecoveredCensusInput,
  snapshotCompanySha256,
} from "./artifacts";
import { buildTwoSidedLedger } from "./ledger-builder";
import {
  FIXTURE_NOW,
  productionSnapshotFixture,
  recoveredCensusFixture,
  seedSnapshotFixture,
} from "./test-fixtures";
import type { RecoveredCensusInput } from "./schema";

function managerUniverse(): string[] {
  return Array.from({ length: 100 }, (_, index) => `Manager ${index + 1}`);
}

function censusArtifact(input: {
  index: number;
  manager: string;
  holdings?: RecoveredCensusInput["holdings"];
}): RecoveredCensusInput {
  const base = recoveredCensusFixture();
  const { artifactSha256: _artifactSha256, ...baseWithoutHash } = base;
  return finalizeRecoveredCensusInput({
    ...baseWithoutHash,
    managerIndex: input.index,
    requestedManager: input.manager,
    canonicalManager: input.manager,
    aliasesSearched: [input.manager],
    recovery: {
      ...base.recovery,
      conversationUrl: `https://chatgpt.com/c/manager-${input.index}`,
      responseSha256: input.index.toString(16).padStart(64, "0"),
    },
    holdings: input.holdings ?? [],
  });
}

function fullCensus(
  holdingsByIndex: Map<number, RecoveredCensusInput["holdings"]>,
  managers = managerUniverse(),
): RecoveredCensusInput[] {
  return managers.map((manager, offset) => censusArtifact({
    index: offset + 1,
    manager,
    holdings: holdingsByIndex.get(offset + 1),
  }));
}

describe("deterministic two-sided ledger builder", () => {
  it("maps exact identities once, preserves manager overlaps, and queues ownership separately", () => {
    const baseHolding = recoveredCensusFixture().holdings[0];
    const secondHolding = {
      ...baseHolding,
      holdingId: "002:acme-infrastructure",
      ownership: { ...baseHolding.ownership, canonicalManager: "Manager 2", stake: "25%" },
      repoDisposition: "PROPOSED_NEW" as const,
      matchedRepoCompanyIds: [],
    };
    const recovered = fullCensus(new Map([
      [1, [{ ...baseHolding, ownership: { ...baseHolding.ownership, canonicalManager: "Manager 1" } }]],
      [2, [secondHolding]],
    ]));
    const built = buildTwoSidedLedger({
      runId: "ledger-test",
      generatedAt: FIXTURE_NOW,
      managerUniverse: managerUniverse(),
      recoveredInputs: recovered,
      productionSnapshot: productionSnapshotFixture(),
      seedSnapshot: seedSnapshotFixture(),
    });

    expect(built.ledger.summary.recoveredManagers).toBe(100);
    expect(built.ledger.summary.censusHoldings).toBe(2);
    expect(built.ledger.repoRows).toHaveLength(1);
    expect(built.ledger.canonicalCompanies).toHaveLength(1);
    expect(built.ledger.canonicalCompanies[0].censusHoldingIds).toEqual([
      "001:acme-infrastructure",
      "002:acme-infrastructure",
    ]);
    expect(built.ledger.censusRows.map((row) => row.disposition)).toEqual([
      "VERIFIED_EXISTING",
      "ADDITIONAL_OWNER",
    ]);
    expect(built.proposalQueue.entries).toHaveLength(1);
    expect(built.proposalQueue.entries[0].actionScopes).toEqual({
      company: [],
      ownership: ["ADD_OWNER"],
      verification: [],
    });
    expect(built.manifest.tasks[0].kind).toBe("LEDGER_CHANGE");
  });

  it("routes suffix-based heuristic candidates to review and never auto-merges them", () => {
    const base = recoveredCensusFixture().holdings[0];
    const holding = {
      ...base,
      companyName: "Acme Infrastructure",
      canonicalName: null,
      aliases: [],
      holdingId: "001:acme-short-name",
      repoDisposition: "POSSIBLE_DUPLICATE" as const,
      matchedRepoCompanyIds: [],
    };
    const built = buildTwoSidedLedger({
      runId: "heuristic-review-test",
      generatedAt: FIXTURE_NOW,
      managerUniverse: managerUniverse(),
      recoveredInputs: fullCensus(new Map([[1, [holding]]])),
      productionSnapshot: productionSnapshotFixture(),
      seedSnapshot: seedSnapshotFixture(),
    });

    expect(built.ledger.canonicalCompanies).toHaveLength(2);
    expect(built.ledger.canonicalCompanies.every((company) => company.decisionStatus === "NEEDS_REVIEW"))
      .toBe(true);
    expect(built.ledger.canonicalCompanies.flatMap((company) => company.recommendedActions))
      .not.toContain("MERGE_COMPANIES");
    expect(built.ledger.censusRows[0].canonicalKey).not.toBe(
      built.ledger.repoRows[0].canonicalKey,
    );
    expect(built.ledger.repoRows[0].disposition).toBe("DOCUMENTED_DEFERRAL");
    expect(built.proposalQueue.entries.some((entry) => entry.candidateCanonicalKeys.length > 0)).toBe(true);
  });

  it("carries exact-match census review rationale into every review surface", () => {
    const base = recoveredCensusFixture().holdings[0];
    const holding = {
      ...base,
      repoDisposition: "NEEDS_REVIEW" as const,
      rationale: "The disclosed stake conflicts with the repository ownership record.",
    };
    const built = buildTwoSidedLedger({
      runId: "exact-review-detail-test",
      generatedAt: FIXTURE_NOW,
      managerUniverse: managerUniverse(),
      recoveredInputs: fullCensus(new Map([[1, [holding]]])),
      productionSnapshot: productionSnapshotFixture(),
      seedSnapshot: seedSnapshotFixture(),
    });

    const company = built.ledger.canonicalCompanies[0];
    const entry = built.proposalQueue.entries[0];
    expect(company.decisionStatus).toBe("NEEDS_REVIEW");
    expect(company.rationale).toContain(holding.rationale);
    expect(company.rationale).not.toContain(";  requires individual review");
    expect(entry.unresolvedQuestions).toEqual(expect.arrayContaining([
      expect.stringContaining(holding.rationale),
    ]));
    expect(built.ledger.unresolvedConflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        subject: "Acme Infrastructure, LLC",
        issue: expect.stringContaining(holding.rationale),
      }),
    ]));
  });

  it("honors the approved Chicago Parking Meters owner exception", () => {
    const base = recoveredCensusFixture().holdings[0];
    const cpm = (manager: string, state: "SIGNED_PENDING_EXIT" | "SIGNED_PENDING_INCOMING", id: string) => ({
      ...base,
      holdingId: id,
      companyName: "Chicago Parking Meters, LLC",
      canonicalName: "Chicago Parking Meters, LLC",
      aliases: ["Chicago Parking Meters"],
      ownership: { ...base.ownership, canonicalManager: manager, state },
      repoDisposition: "PROPOSED_CORRECTION" as const,
      matchedRepoCompanyIds: [],
    });
    const recovered = fullCensus(new Map([
      [1, [cpm("Morgan Stanley Infrastructure Partners", "SIGNED_PENDING_EXIT", "001:cpm-msip")]],
      [2, [cpm("Stonepeak", "SIGNED_PENDING_INCOMING", "002:cpm-stonepeak")]],
    ]));
    const sourceProduction = productionSnapshotFixture();
    const sourceSeed = seedSnapshotFixture();
    const productionCompanyWithoutHash = {
      ...sourceProduction.companies[0],
      id: "company_cpm",
      seedKey: "chicago parking meters, llc|United States",
      name: "Chicago Parking Meters, LLC",
    };
    const { companySnapshotSha256: _productionCompanyHash, ...productionCompany } = productionCompanyWithoutHash;
    const seedCompanyWithoutHash = {
      ...sourceSeed.companies[0],
      id: null,
      seedKey: "chicago parking meters, llc|United States",
      name: "Chicago Parking Meters, LLC",
    };
    const { companySnapshotSha256: _seedCompanyHash, ...seedCompany } = seedCompanyWithoutHash;
    const { snapshotSha256: _productionHash, ...productionWithoutHash } = sourceProduction;
    const production = finalizeDatasetSnapshot({
      ...productionWithoutHash,
      companies: [{ ...productionCompany, companySnapshotSha256: snapshotCompanySha256(productionCompany) }],
    });
    const { snapshotSha256: _seedHash, ...seedWithoutHash } = sourceSeed;
    const seed = finalizeDatasetSnapshot({
      ...seedWithoutHash,
      companies: [{ ...seedCompany, companySnapshotSha256: snapshotCompanySha256(seedCompany) }],
    });
    if (production.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT"
      || seed.artifactType !== "PORTCO_SEED_SNAPSHOT") throw new Error("fixture type mismatch");
    const built = buildTwoSidedLedger({
      runId: "cpm-exception-test",
      generatedAt: FIXTURE_NOW,
      managerUniverse: managerUniverse(),
      recoveredInputs: recovered,
      productionSnapshot: production,
      seedSnapshot: seed,
    });
    const stonepeak = built.ledger.censusRows.find((row) => row.holdingId === "002:cpm-stonepeak")!;
    const msip = built.ledger.censusRows.find((row) => row.holdingId === "001:cpm-msip")!;
    expect(stonepeak.disposition).toBe("DOCUMENTED_DEFERRAL");
    expect(stonepeak.canonicalKey).toBeNull();
    expect(stonepeak.rationale).toMatch(/Stonepeak is not added/i);
    expect(msip.disposition).toBe("VERIFIED_EXISTING");
    expect(built.ledger.canonicalCompanies[0].recommendedActions).toEqual(["VERIFY_NO_CHANGE"]);
    expect(built.proposalQueue.entries).toHaveLength(0);
  });
});
