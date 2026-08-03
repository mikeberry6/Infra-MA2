import {
  companyImageSha256,
  finalizeDatasetSnapshot,
  finalizeRecoveredCensusInput,
  snapshotCompanySha256,
} from "./artifacts";
import { finalizeCanonicalLedger } from "./ledger";
import { createReconciliationManifest } from "./manifest";
import type {
  CanonicalLedger,
  CompanyImage,
  ProductionSnapshot,
  ReconciliationManifest,
  RecoveredCensusInput,
  SeedSnapshot,
  SnapshotCompany,
} from "./schema";

export const FIXTURE_NOW = "2026-08-03T12:00:00.000Z";
export const FIXTURE_SHA = "a".repeat(64);

function snapshotCompany(input: Omit<SnapshotCompany, "companySnapshotSha256">): SnapshotCompany {
  return {
    ...input,
    companySnapshotSha256: snapshotCompanySha256(input),
  };
}

export function productionSnapshotFixture(): ProductionSnapshot {
  const company = snapshotCompany({
    id: "company_acme",
    seedKey: "acme infrastructure|United States",
    name: "Acme Infrastructure, LLC",
    country: "United States",
    countryTags: ["United States"],
    sector: "Utilities",
    subsector: "Water services",
    region: "North America",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    website: "https://acme.example.com/",
    updatedAt: FIXTURE_NOW,
    lastVerifiedAt: null,
    relationCounts: {
      ownershipPeriods: 1,
      pendingOwnershipTransactions: 0,
      milestones: 1,
      managementRoles: 0,
      citations: 1,
      redirects: 0,
    },
  });
  const snapshot = finalizeDatasetSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
    asOfDate: "2026-08-03",
    capturedAt: FIXTURE_NOW,
    readOnly: true,
    databaseTargetLabel: "production-readonly",
    databaseTargetFingerprint: "b".repeat(64),
    companies: [company],
  });
  if (snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") throw new Error("fixture type mismatch");
  return snapshot;
}

export function seedSnapshotFixture(): SeedSnapshot {
  const company = snapshotCompany({
    id: null,
    seedKey: "acme infrastructure|United States",
    name: "Acme Infrastructure, LLC",
    country: "United States",
    countryTags: ["United States"],
    sector: "Utilities",
    subsector: "Water services",
    region: "North America",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    website: "https://acme.example.com/",
    updatedAt: null,
    lastVerifiedAt: null,
    relationCounts: {
      ownershipPeriods: 1,
      pendingOwnershipTransactions: 0,
      milestones: 1,
      managementRoles: 0,
      citations: 1,
      redirects: 0,
    },
  });
  const snapshot = finalizeDatasetSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_SEED_SNAPSHOT",
    asOfDate: "2026-08-03",
    capturedAt: FIXTURE_NOW,
    baseCommit: "c".repeat(40),
    evaluatedFrom: "prisma/seed-data/companies.ts",
    companies: [company],
  });
  if (snapshot.artifactType !== "PORTCO_SEED_SNAPSHOT") throw new Error("fixture type mismatch");
  return snapshot;
}

export function recoveredCensusFixture(): RecoveredCensusInput {
  return finalizeRecoveredCensusInput({
    schemaVersion: 1,
    artifactType: "PORTCO_CENSUS_RECOVERED_INPUT",
    methodologyVersion: "NA_PORTCO_CENSUS_V1",
    asOfDate: "2026-07-28",
    managerIndex: 1,
    requestedManager: "3i Infrastructure",
    canonicalManager: "3i Group",
    aliasesSearched: ["3i Group", "3i Infrastructure"],
    recovery: {
      kind: "TASK_ARCHIVE",
      recoveredAt: FIXTURE_NOW,
      archiveTaskId: "task_123",
      conversationUrl: "https://chatgpt.com/c/example",
      model: "GPT-5.6 Sol",
      mode: "Pro",
      acceptedAttempt: 1,
      responseSha256: FIXTURE_SHA,
    },
    taskStatus: "COMPLETE",
    blockers: [],
    holdings: [{
      holdingId: "001:acme-infrastructure",
      companyName: "Acme Infrastructure",
      aliases: ["Acme Infrastructure, LLC"],
      canonicalName: "Acme Infrastructure, LLC",
      investmentLevel: "COMPANY",
      countries: ["United States"],
      ownership: {
        state: "CLOSED_ACTIVE",
        canonicalManager: "3i Group",
        organizationName: "3i Group plc",
        fundName: "3i North American Infrastructure Fund",
        vehicleName: null,
        stake: "50%",
        investmentDate: "2020",
        exitDate: null,
      },
      evidence: [{
        url: "https://acme.example.com/owners",
        title: "Ownership",
        publisher: "Acme Infrastructure",
        sourceTier: "PRIMARY",
        health: "WORKING",
        publishedAt: null,
        retrievedAt: "2026-07-28",
        evidenceSummary: "Names 3i as a current infrastructure owner.",
        supports: ["CURRENT_OWNERSHIP", "NORTH_AMERICA"],
      }],
      repoDisposition: "EXISTING_VERIFIED",
      matchedRepoCompanyIds: ["company_acme"],
      rationale: "Identity, geography, and active ownership are directly supported.",
      confidence: "HIGH",
    }],
    excludedCandidates: [],
    unresolvedConflicts: [],
    completenessChecks: {
      officialPortfolioReviewed: true,
      acquisitionsSearched: true,
      exitsSearched: true,
      northAmericaReviewed: true,
      infrastructureStrategyReviewed: true,
      subsidiariesDeduplicated: true,
      allEvidenceOpened: true,
    },
  });
}

export function ledgerFixture(): {
  ledger: CanonicalLedger;
  recovered: RecoveredCensusInput;
  production: ProductionSnapshot;
  seed: SeedSnapshot;
} {
  const recovered = recoveredCensusFixture();
  const production = productionSnapshotFixture();
  const seed = seedSnapshotFixture();
  const ledger = finalizeCanonicalLedger({
    schemaVersion: 1,
    artifactType: "PORTCO_CANONICAL_LEDGER",
    methodologyVersion: "PORTCO_TWO_SIDED_LEDGER_V1",
    runId: "portco-2026-08-03",
    asOfDate: "2026-08-03",
    generatedAt: FIXTURE_NOW,
    recoveredCensusArtifactSha256: [recovered.artifactSha256],
    productionSnapshotSha256: production.snapshotSha256,
    seedSnapshotSha256: seed.snapshotSha256,
    censusRows: [{
      holdingId: "001:acme-infrastructure",
      managerIndex: 1,
      requestedManager: "3i Infrastructure",
      companyName: "Acme Infrastructure",
      canonicalKey: "acme-infrastructure|united-states",
      disposition: "VERIFIED_EXISTING",
      rationale: "Direct match to the current production and seed record.",
      evidenceUrls: ["https://acme.example.com/owners"],
    }],
    repoRows: [{
      repoRowId: "repo:company_acme",
      productionCompanyId: "company_acme",
      seedKey: "acme infrastructure|United States",
      sourcePresence: "BOTH",
      companyName: "Acme Infrastructure, LLC",
      canonicalKey: "acme-infrastructure|united-states",
      disposition: "MATCHED_CENSUS",
      rationale: "Production and seed resolve to the same legal entity.",
    }],
    repoOnlyRows: [],
    excludedCandidateLineage: [],
    canonicalCompanies: [{
      canonicalKey: "acme-infrastructure|united-states",
      displayName: "Acme Infrastructure, LLC",
      country: "United States",
      canonicalRepoCompanyId: "company_acme",
      censusHoldingIds: ["001:acme-infrastructure"],
      repoOnlyRecordIds: [],
      repoCompanyIds: ["company_acme"],
      seedKeys: ["acme infrastructure|United States"],
      candidateMatchKeys: ["acme infrastructure\u0000united states"],
      decisionStatus: "NO_CHANGE",
      recommendedActions: ["VERIFY_NO_CHANGE"],
      rationale: "All sides agree on the canonical company.",
    }],
    unresolvedConflicts: [],
  }, {
    recoveredInputs: [recovered],
    productionSnapshot: production,
    seedSnapshot: seed,
  });
  return { ledger, recovered, production, seed };
}

export function companyImageFixture(description = "Acme operates regulated water infrastructure."): CompanyImage {
  return {
    id: "company_acme",
    name: "Acme Infrastructure, LLC",
    aliases: ["Acme Infrastructure"],
    sector: "Utilities",
    subsector: "Water services",
    region: "North America",
    country: "United States",
    countryTags: ["United States"],
    description,
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    website: "https://acme.example.com/",
    yearFounded: 1999,
    headquarters: "New York, New York",
    lastVerifiedAt: FIXTURE_NOW,
    ownershipPeriods: [{
      id: "owner_1",
      managerName: "3i Group",
      organizationName: "3i Group plc",
      fundName: "3i North American Infrastructure Fund",
      vehicleName: null,
      stake: "50%",
      investmentYear: 2020,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
    }],
    pendingOwnershipTransactions: [],
    milestones: [{
      id: "milestone_1",
      date: "2020",
      event: "3i invested in Acme Infrastructure.",
      category: "Financing",
      sortDate: "2020-01-01T00:00:00.000Z",
      evidenceUrls: ["https://acme.example.com/owners"],
    }],
    managementRoles: [],
    citations: [{
      id: "citation_1",
      label: "Acme ownership",
      url: "https://acme.example.com/owners",
      sourceType: "WEBSITE",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Current ownership",
      isPrimary: true,
    }],
  };
}

export function companyImageHashFixture(description?: string): string {
  return companyImageSha256(companyImageFixture(description));
}

export function manifestFixture(): ReconciliationManifest {
  return createReconciliationManifest({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_MANIFEST",
    runId: "portco-2026-08-03",
    asOfDate: "2026-08-03",
    createdAt: FIXTURE_NOW,
    updatedAt: FIXTURE_NOW,
    phase: "RECOVERY",
    runStatus: "IDLE",
    managerUniverseSha256: FIXTURE_SHA,
    productionSnapshotSha256: null,
    seedSnapshotSha256: null,
    ledgerSha256: null,
    tasks: [
      {
        sequence: 1,
        taskId: "manager:001",
        kind: "CENSUS_MANAGER",
        subject: "3i Infrastructure",
        managerIndex: 1,
        status: "PENDING",
        attempts: 0,
        startedAt: null,
        updatedAt: FIXTURE_NOW,
        completedAt: null,
        artifacts: [],
        error: null,
      },
      {
        sequence: 2,
        taskId: "scorecard:acme",
        kind: "SCORECARD",
        subject: "Acme Infrastructure, LLC",
        managerIndex: 1,
        status: "PENDING",
        attempts: 0,
        startedAt: null,
        updatedAt: FIXTURE_NOW,
        completedAt: null,
        artifacts: [],
        error: null,
      },
    ],
  });
}
