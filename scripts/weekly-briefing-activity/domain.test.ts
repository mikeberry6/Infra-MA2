import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyManifestPublicationApproval,
  applyRecordReview,
  assertManifestPublishable,
  canonicalJson,
  computeActivityTotals,
  computeManifestArtifactHash,
  computeReviewedInputHash,
  deriveActivityScope,
  deriveSecondReviewReasons,
  finalizeActivityManifest,
  hashCanonical,
  requiresSecondReview,
  secondReviewRiskKinds,
  sha256Bytes,
  validateManifestForPublication,
  validateRecordData,
  validateRecordApproval,
  WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
  WEEKLY_ACTIVITY_SCHEMA_VERSION,
  type ActivityAuditManifest,
  type ActivityRecord,
  type ClassificationFacts,
} from "./index";

const FIRST_ATTESTATION = {
  performedByHuman: true,
  evidenceOpened: true,
  dispositionVerified: true,
  classificationVerified: true,
} as const;

const PUBLICATION_ATTESTATION = {
  performedByHuman: true,
  allRecordGatesReviewed: true,
  totalsReconciled: true,
  publicationAuthorized: true,
} as const;

function recordFixture(): ActivityRecord {
  return {
    recordId: "INF-2026-001",
    legacyId: "INF-2026-001",
    splitSuffix: null,
    transactionIdentityKey: "primary.example/deal|target-one",
    target: "Target One",
    disposition: "KEEP",
    duplicateOfRecordId: null,
    dispositionRationale: "This is a distinct in-scope infrastructure transaction.",
    scope: "DIRECT_FUND",
    scopeRationale: "Fund I is the transaction principal.",
    candidateClassification: {
      candidateScope: "PORTFOLIO_COMPANY",
      signals: [{
        kind: "VIA_LANGUAGE",
        detail: "Seed metadata says via Operating Company.",
        sourceIds: ["transaction"],
      }],
      rationale: "Automation candidate only; it does not set the authoritative scope.",
      generatedBy: "candidate-generator-v2",
      generatedAt: "2026-08-08T12:00:00Z",
      priorAuditEvidenceRefs: ["flow-through:INF-2026-001"],
    },
    actors: {
      buyers: [{
        name: "Fund I",
        entityKind: "FUND",
        isPrincipal: true,
        sponsorName: "Sponsor One",
        sourceIds: ["transaction"],
      }],
      sellers: [{
        name: "Seller One",
        entityKind: "CORPORATE",
        isPrincipal: true,
        sponsorName: null,
        sourceIds: ["transaction"],
      }],
      jointVentureParticipants: [],
    },
    actingEntity: {
      name: "Fund I",
      entityKind: "FUND",
      side: "BUYER",
      isOperatingCompany: false,
      sourceIds: ["transaction"],
    },
    sponsorLineage: [{
      sponsorName: "Sponsor One",
      entityName: "Fund I",
      relationship: "ADVISER",
      sourceIds: ["transaction"],
      rationale: "Sponsor One advises Fund I.",
    }],
    sector: "Power & ET",
    region: "North America",
    country: "United States",
    announcementDate: "2026-01-08",
    transactionStructure: {
      forms: ["ACQUISITION"],
      details: "Fund acquisition of an operating asset.",
      isExit: false,
      isBundledAnnouncement: false,
      isMixedDirectPortfolio: false,
      newPlatformWithInseparableSeedAcquisition: false,
      primaryOnlyPortfolioCompanyIssuance: false,
    },
    classificationFacts: {
      principalActorKind: "FUND",
      fundVehicleActsAsPrincipal: true,
      portfolioCompanyActsAsPrincipal: false,
      fundSellsOrInvests: true,
      alreadyOwnedOperatingCompany: false,
    },
    secondReviewRisks: [],
    sourceEvidence: [{
      sourceId: "transaction",
      tier: "PRIMARY",
      title: "Fund I acquires Target One",
      publisher: "Sponsor One",
      url: "https://primary.example/deal",
      artifactPath: null,
      publishedAt: "2026-01-08",
      retrievedAt: "2026-08-08",
      purposes: [
        "TRANSACTION",
        "PARTIES",
        "ANNOUNCEMENT_DATE",
        "SECTOR",
        "REGION",
        "TRANSACTION_STRUCTURE",
      ],
      evidenceSummary: "The sponsor names the buyer, seller, target, and announcement date.",
      fallbackRationale: null,
      contentSha256: null,
    }],
    ownershipEvidence: [],
    priorAuditEvidence: [],
    review: { firstReview: null, secondReview: null },
  };
}

function portfolioRecordFixture(): ActivityRecord {
  const record = structuredClone(recordFixture());
  record.recordId = "INF-2026-002";
  record.legacyId = "INF-2026-002";
  record.transactionIdentityKey = "primary.example/bolt-on|target-two";
  record.target = "Target Two";
  record.scope = "PORTFOLIO_COMPANY";
  record.scopeRationale = "Operating Co, already owned by Sponsor One, executes the bolt-on.";
  record.actors.buyers = [{
    name: "Operating Co",
    entityKind: "OPERATING_PORTFOLIO_COMPANY",
    isPrincipal: true,
    sponsorName: "Sponsor One",
    sourceIds: ["transaction", "ownership"],
  }];
  record.actingEntity = {
    name: "Operating Co",
    entityKind: "OPERATING_PORTFOLIO_COMPANY",
    side: "BUYER",
    isOperatingCompany: true,
    sourceIds: ["transaction", "ownership"],
  };
  record.sponsorLineage = [{
    sponsorName: "Sponsor One",
    entityName: "Operating Co",
    relationship: "DIRECT_OWNER",
    sourceIds: ["ownership"],
    rationale: "Sponsor One owned Operating Co before the bolt-on.",
  }];
  record.transactionStructure.forms = ["ACQUISITION", "BOLT_ON"];
  record.transactionStructure.details = "Operating-company bolt-on acquisition.";
  record.classificationFacts = {
    principalActorKind: "OPERATING_PORTFOLIO_COMPANY",
    fundVehicleActsAsPrincipal: false,
    portfolioCompanyActsAsPrincipal: true,
    fundSellsOrInvests: false,
    alreadyOwnedOperatingCompany: true,
  };
  record.sourceEvidence.push({
    sourceId: "ownership",
    tier: "PRIMARY",
    title: "Sponsor One portfolio",
    publisher: "Sponsor One",
    url: "https://primary.example/portfolio",
    artifactPath: null,
    publishedAt: "2025-12-31",
    retrievedAt: "2026-08-08",
    purposes: ["OWNERSHIP"],
    evidenceSummary: "The sponsor portfolio identifies Operating Co as an existing holding.",
    fallbackRationale: null,
    contentSha256: null,
  });
  record.ownershipEvidence = [{
    ownershipEvidenceId: "ownership-1",
    entityName: "Operating Co",
    sponsorName: "Sponsor One",
    relationship: "DIRECT_OWNER",
    validFrom: "2025-01-01",
    validThrough: null,
    confirmsOwnershipOnAnnouncementDate: true,
    sourceIds: ["ownership"],
    rationale: "The source confirms ownership before and through announcement.",
  }];
  return record;
}

function addDateValidMixedOwnership(record: ActivityRecord, entityName: string): void {
  const sourceId = `ownership-${entityName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  record.sourceEvidence.push({
    sourceId,
    tier: "PRIMARY",
    title: `${entityName} portfolio ownership`,
    publisher: "Sponsor One",
    url: `https://primary.example/portfolio/${sourceId}`,
    artifactPath: null,
    publishedAt: "2025-12-31",
    retrievedAt: "2026-08-08",
    purposes: ["OWNERSHIP"],
    evidenceSummary: `The sponsor identifies ${entityName} as an existing portfolio company.`,
    fallbackRationale: null,
    contentSha256: null,
  });
  record.ownershipEvidence.push({
    ownershipEvidenceId: sourceId,
    entityName,
    sponsorName: "Sponsor One",
    relationship: "DIRECT_OWNER",
    validFrom: "2025-01-01",
    validThrough: null,
    confirmsOwnershipOnAnnouncementDate: true,
    sourceIds: [sourceId],
    rationale: `The source confirms ownership of ${entityName} through the announcement date.`,
  });
  record.classificationFacts.alreadyOwnedOperatingCompany = true;
}

function firstReview(record: ActivityRecord, reviewer = "Morgan Smith"): ActivityRecord {
  return applyRecordReview(record, {
    stage: "FIRST",
    reviewer,
    reviewedAt: "2026-08-08T14:00:00Z",
    notes: `I opened the evidence and verified the disposition and scope for ${record.recordId}.`,
    humanAttestation: FIRST_ATTESTATION,
  });
}

function manifestFixture(records: ActivityRecord[]): ActivityAuditManifest {
  const totals = computeActivityTotals(records);
  const requiredFrozenInputs: ActivityAuditManifest["frozenInputs"] = [
    {
      inputArtifactId: "protected-non-chart-email",
      kind: "OTHER",
      path: "audits/protected-non-chart.html",
      sha256: "6".repeat(64),
      recordCount: 1,
      capturedAt: "2026-08-08T12:00:00Z",
      gitCommit: "a".repeat(40),
      notes: "Protected non-chart fixture.",
    },
    {
      inputArtifactId: "risk-based-review-policy",
      kind: "OTHER",
      path: "audits/review-policy.json",
      sha256: "7".repeat(64),
      recordCount: 1,
      capturedAt: "2026-08-08T12:00:00Z",
      gitCommit: "a".repeat(40),
      notes: "Risk-based review policy fixture.",
    },
  ];
  return finalizeActivityManifest({
    schemaVersion: WEEKLY_ACTIVITY_SCHEMA_VERSION,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_MANIFEST",
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoffDate: "2026-08-07",
    generatedAt: "2026-08-08T12:00:00Z",
    updatedAt: "2026-08-08T12:00:00Z",
    status: "IN_REVIEW",
    expectedCandidateCount: new Set(records.map((record) => record.legacyId)).size,
    controls: {
      publishedTotal: 393,
      correctedControlHypothesisTotal: 398,
      finalApprovedTotal: null,
    },
    frozenInputs: [[
      "ARCHIVED_ISSUES",
      "SEED",
      "PRODUCTION_SNAPSHOT",
      "GIT_HISTORY_SNAPSHOT",
      "PRIOR_FLOW_THROUGH_AUDIT",
    ].map((kind, index) => ({
      inputArtifactId: `input-${index + 1}`,
      kind,
      path: `audits/input-${index + 1}.json`,
      sha256: `${index + 1}`.repeat(64),
      recordCount: 1,
      capturedAt: "2026-08-08T12:00:00Z",
      gitCommit: "a".repeat(40),
      notes: "Frozen test input.",
    })), requiredFrozenInputs].flat(),
    records,
    totals,
    publicationApproval: null,
  });
}

function writeFrozenJson(repositoryRoot: string, relativePath: string, value: unknown): string {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  mkdirSync(dirname(join(repositoryRoot, relativePath)), { recursive: true });
  writeFileSync(join(repositoryRoot, relativePath), body, "utf8");
  return sha256Bytes(Buffer.from(body));
}

function reviewPolicyFixture() {
  const withoutHash = {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_POLICY",
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoff: "2026-08-07",
    adoptedAt: "2026-08-08T12:00:00Z",
    authorizationScope: "METHODOLOGY_DIRECTION_NOT_RECORD_APPROVAL",
    classificationBasis: "VERIFIED_LEGAL_ACTING_ENTITY",
    scopeRules: {
      directPrincipalKinds: [
        "FUND",
        "ADVISED_VEHICLE",
        "CO_INVESTMENT_VEHICLE",
        "NON_OPERATING_ACQUISITION_SPV",
      ],
      portfolioPrincipalKinds: ["OPERATING_PORTFOLIO_COMPANY", "OPERATING_PLATFORM"],
      portfolioRequiresDateValidPriorOwnership: true,
      fundExitIsDirect: true,
      operatingCompanyAssetSaleIsPortfolio: true,
      newPlatformWithInseparableSeedIsDirect: true,
      primaryOnlyPortfolioIssuanceIsPortfolioUnlessFundActs: true,
      categoryLabelsNeverDetermineScope: true,
    },
    firstReviewRequiredForEveryCandidate: true,
    secondReviewRiskKinds: [...secondReviewRiskKinds],
    categoryOnlySecondReviewTriggers: [],
    mixedTransactionPrecedence: "COUNT_ONCE_AS_DIRECT_RETAIN_BOTH_ATTRIBUTIONS",
    evidenceThreshold: "TRANSACTION_AND_PARTY_EVIDENCE_PLUS_DATE_VALID_OWNERSHIP_FOR_PORTFOLIO",
    riskEvidence: {
      conflictsRequireTwoDistinctQualifiedLocators: true,
      duplicateSourceLocatorsCountOnce: true,
      everyPrincipalActorRequiresTransactionAndPartyEvidence: true,
    },
    batchApproval: {
      allowed: true,
      recordLevelEvidenceRequired: true,
      recordLevelNotesRequired: true,
      recordLevelReviewedInputHashRequired: true,
    },
    finalControl: "EVIDENCE_DERIVED_NOT_FORCED_TO_393_OR_398",
  };
  return {
    ...withoutHash,
    policySha256: hashCanonical("weekly-briefing-activity-review-policy-v2", withoutHash),
  };
}

function manifestFixtureWithFrozenArtifacts(input: {
  records: ActivityRecord[];
  seed?: unknown;
  production?: unknown;
  seedDescriptorCount?: number;
  productionDescriptorCount?: number;
}): { manifest: ActivityAuditManifest; repositoryRoot: string } {
  const repositoryRoot = mkdtempSync(join(tmpdir(), "weekly-activity-gates-"));
  const manifest = manifestFixture(input.records);
  const legacyIds = [...new Set(input.records.map((record) => record.legacyId))];
  const seed = input.seed === undefined ? {
    recordCount: legacyIds.length,
    records: legacyIds.map((legacyId) => ({ legacyId })),
  } : input.seed;
  const production = input.production === undefined ? {
    status: "CAPTURED",
    recordCount: 1,
    records: [{ legacyId: "PRODUCTION-001" }],
  } : input.production;

  for (const frozenInput of manifest.frozenInputs) {
    const relativePath = `frozen/${frozenInput.inputArtifactId}.json`;
    const artifact = frozenInput.inputArtifactId === "risk-based-review-policy"
      ? reviewPolicyFixture()
      : frozenInput.kind === "SEED"
      ? seed
      : frozenInput.kind === "PRODUCTION_SNAPSHOT"
        ? production
        : { inputArtifactId: frozenInput.inputArtifactId };
    frozenInput.path = relativePath;
    frozenInput.sha256 = writeFrozenJson(repositoryRoot, relativePath, artifact);
    if (frozenInput.kind === "SEED") {
      frozenInput.recordCount = input.seedDescriptorCount
        ?? (typeof seed === "object" && seed !== null && "recordCount" in seed
          && Number.isInteger(seed.recordCount) ? seed.recordCount as number : 0);
    }
    if (frozenInput.kind === "PRODUCTION_SNAPSHOT") {
      frozenInput.recordCount = input.productionDescriptorCount
        ?? (typeof production === "object" && production !== null && "recordCount" in production
          && Number.isInteger(production.recordCount) ? production.recordCount as number : 0);
    }
  }

  return { manifest: finalizeActivityManifest(manifest), repositoryRoot };
}

function classificationFacts(overrides: Partial<ClassificationFacts> = {}): ClassificationFacts {
  return {
    principalActorKind: "UNKNOWN",
    fundVehicleActsAsPrincipal: false,
    portfolioCompanyActsAsPrincipal: false,
    fundSellsOrInvests: false,
    alreadyOwnedOperatingCompany: false,
    ...overrides,
  };
}

function scopeInput(
  facts: Partial<ClassificationFacts>,
  structure: Partial<ActivityRecord["transactionStructure"]> = {},
) {
  return {
    classificationFacts: classificationFacts(facts),
    transactionStructure: {
      isMixedDirectPortfolio: false,
      newPlatformWithInseparableSeedAcquisition: false,
      primaryOnlyPortfolioCompanyIssuance: false,
      ...structure,
    },
  };
}

describe("weekly activity canonical hashing", () => {
  it("sorts object keys recursively while preserving array order", () => {
    expect(canonicalJson({ b: 2, a: { d: 4, c: 3 } })).toBe('{"a":{"c":3,"d":4},"b":2}');
    expect(hashCanonical("test", { a: 1, b: 2 })).toBe(hashCanonical("test", { b: 2, a: 1 }));
    expect(hashCanonical("test", [1, 2])).not.toBe(hashCanonical("test", [2, 1]));
  });

  it("rejects values that ordinary JSON would silently discard", () => {
    expect(() => canonicalJson({ missing: undefined })).toThrow(/cannot encode undefined/i);
    expect(() => canonicalJson(Number.POSITIVE_INFINITY)).toThrow(/non-finite/i);
  });
});

describe("approved activity classification rules", () => {
  it("does not treat candidate signals or their absence as Direct", () => {
    expect(deriveActivityScope(scopeInput({}))).toBe("UNRESOLVED");
    expect(deriveActivityScope(recordFixture())).toBe("DIRECT_FUND");
    expect(recordFixture().candidateClassification?.candidateScope).toBe("PORTFOLIO_COMPANY");
  });

  it("distinguishes a non-operating acquisition SPV from an operating platform", () => {
    expect(deriveActivityScope(scopeInput({
      principalActorKind: "NON_OPERATING_ACQUISITION_SPV",
    }))).toBe("DIRECT_FUND");
    expect(deriveActivityScope(scopeInput({
      principalActorKind: "OPERATING_PLATFORM",
      portfolioCompanyActsAsPrincipal: true,
      alreadyOwnedOperatingCompany: true,
    }))).toBe("PORTFOLIO_COMPANY");
  });

  it("gives Direct precedence to mixed-side transactions", () => {
    expect(deriveActivityScope(scopeInput({
      principalActorKind: "OPERATING_PORTFOLIO_COMPANY",
      portfolioCompanyActsAsPrincipal: true,
      alreadyOwnedOperatingCompany: true,
    }, { isMixedDirectPortfolio: true }))).toBe("DIRECT_FUND");
  });

  it("classifies primary-only portfolio IPOs as Portfolio unless a fund sells or invests", () => {
    const primaryOnly = {
      principalActorKind: "OPERATING_PORTFOLIO_COMPANY" as const,
      portfolioCompanyActsAsPrincipal: true,
      alreadyOwnedOperatingCompany: true,
    };
    expect(deriveActivityScope(scopeInput(primaryOnly, {
      primaryOnlyPortfolioCompanyIssuance: true,
    }))).toBe("PORTFOLIO_COMPANY");
    expect(deriveActivityScope(scopeInput({
      ...primaryOnly,
      fundVehicleActsAsPrincipal: true,
      fundSellsOrInvests: true,
    }, {
      primaryOnlyPortfolioCompanyIssuance: false,
      isMixedDirectPortfolio: true,
    }))).toBe("DIRECT_FUND");
  });

  it("classifies a new platform with an inseparable seed acquisition as Direct", () => {
    expect(deriveActivityScope(scopeInput({
      principalActorKind: "FUND",
      fundVehicleActsAsPrincipal: true,
      fundSellsOrInvests: true,
    }, {
      newPlatformWithInseparableSeedAcquisition: true,
    }))).toBe("DIRECT_FUND");
    expect(deriveActivityScope(scopeInput({}, {
      newPlatformWithInseparableSeedAcquisition: true,
    }))).toBe("UNRESOLVED");
  });

  it.each([
    ["fund exit", {
      facts: { principalActorKind: "FUND" as const, fundVehicleActsAsPrincipal: true, fundSellsOrInvests: true },
      structure: {},
      form: "SALE" as const,
      isExit: true,
      expected: "DIRECT_FUND" as const,
    }],
    ["operating-company asset sale", {
      facts: {
        principalActorKind: "OPERATING_PORTFOLIO_COMPANY" as const,
        portfolioCompanyActsAsPrincipal: true,
        alreadyOwnedOperatingCompany: true,
      },
      structure: {},
      form: "ASSET_SALE" as const,
      isExit: true,
      expected: "PORTFOLIO_COMPANY" as const,
    }],
    ["fund-level JV", {
      facts: { principalActorKind: "ADVISED_VEHICLE" as const, fundVehicleActsAsPrincipal: true },
      structure: {},
      form: "JOINT_VENTURE" as const,
      isExit: false,
      expected: "DIRECT_FUND" as const,
    }],
    ["portfolio-company JV", {
      facts: {
        principalActorKind: "OPERATING_PLATFORM" as const,
        portfolioCompanyActsAsPrincipal: true,
        alreadyOwnedOperatingCompany: true,
      },
      structure: {},
      form: "JOINT_VENTURE" as const,
      isExit: false,
      expected: "PORTFOLIO_COMPANY" as const,
    }],
    ["inseparable new platform and seed", {
      facts: {
        principalActorKind: "FUND" as const,
        fundVehicleActsAsPrincipal: true,
        fundSellsOrInvests: true,
      },
      structure: { newPlatformWithInseparableSeedAcquisition: true },
      form: "PLATFORM_FORMATION" as const,
      isExit: false,
      expected: "DIRECT_FUND" as const,
    }],
    ["existing operating platform", {
      facts: {
        principalActorKind: "OPERATING_PLATFORM" as const,
        portfolioCompanyActsAsPrincipal: true,
        alreadyOwnedOperatingCompany: true,
      },
      structure: {},
      form: "PLATFORM_FORMATION" as const,
      isExit: false,
      expected: "PORTFOLIO_COMPANY" as const,
    }],
    ["fund recapitalization", {
      facts: { principalActorKind: "CO_INVESTMENT_VEHICLE" as const, fundVehicleActsAsPrincipal: true },
      structure: {},
      form: "RECAPITALIZATION" as const,
      isExit: false,
      expected: "DIRECT_FUND" as const,
    }],
    ["primary-only portfolio-company raise", {
      facts: {
        principalActorKind: "OPERATING_PORTFOLIO_COMPANY" as const,
        portfolioCompanyActsAsPrincipal: true,
        alreadyOwnedOperatingCompany: true,
      },
      structure: { primaryOnlyPortfolioCompanyIssuance: true },
      form: "CAPITAL_RAISE" as const,
      isExit: false,
      expected: "PORTFOLIO_COMPANY" as const,
    }],
  ])("uses the legal actor for %s without category-only escalation", (_label, testCase) => {
    expect(deriveActivityScope(scopeInput(testCase.facts, testCase.structure))).toBe(testCase.expected);
    const record = recordFixture();
    record.transactionStructure.forms = [testCase.form];
    record.transactionStructure.isExit = testCase.isExit;
    record.transactionStructure.newPlatformWithInseparableSeedAcquisition =
      "newPlatformWithInseparableSeedAcquisition" in testCase.structure
        ? testCase.structure.newPlatformWithInseparableSeedAcquisition
        : false;
    record.transactionStructure.primaryOnlyPortfolioCompanyIssuance =
      "primaryOnlyPortfolioCompanyIssuance" in testCase.structure
        ? testCase.structure.primaryOnlyPortfolioCompanyIssuance
        : false;
    record.secondReviewRisks = [];
    expect(requiresSecondReview(record)).toBe(false);
  });

  it("does not require second review from categories or acquisition-plus-sale wording", () => {
    const record = recordFixture();
    record.transactionStructure.forms = [
      "ACQUISITION",
      "SALE",
      "JOINT_VENTURE",
      "PLATFORM_FORMATION",
      "IPO",
      "RECAPITALIZATION",
    ];
    record.transactionStructure.isExit = true;
    expect(deriveSecondReviewReasons(record)).toEqual([]);
    expect(requiresSecondReview(record)).toBe(false);
  });

  it("requires second review only for verified evidence risks", () => {
    const record = recordFixture();
    record.transactionStructure.isMixedDirectPortfolio = true;
    record.transactionStructure.isBundledAnnouncement = true;
    record.secondReviewRisks = [{
      kind: "CONFLICTING_ACTOR_ATTRIBUTION",
      detail: "Two primary sources disagree on the legal buyer.",
      sourceIds: ["transaction"],
    }, {
      kind: "OWNERSHIP_TIMING_UNCERTAIN",
      detail: "Contemporaneous ownership sources do not establish the effective transfer date.",
      sourceIds: ["transaction"],
    }];
    expect(deriveSecondReviewReasons(record)).toEqual([
      "CONFLICTING_ACTOR_ATTRIBUTION",
      "OWNERSHIP_TIMING_UNCERTAIN",
      "ACTUAL_MIXED_DIRECT_PORTFOLIO",
      "BUNDLED_LEGAL_TRANSACTIONS",
    ]);
    expect(requiresSecondReview(record)).toBe(true);
  });
});

describe("hash-bound human record review", () => {
  it("keeps automation candidates separate from authoritative human approval", () => {
    const candidate = recordFixture();
    expect(candidate.candidateClassification?.candidateScope).toBe("PORTFOLIO_COMPANY");
    expect(candidate.scope).toBe("DIRECT_FUND");
    expect(candidate.review.firstReview).toBeNull();
    expect(validateRecordApproval(candidate).map((item) => item.code)).toContain("MISSING_FIRST_REVIEW");
  });

  it("rejects AI and placeholder reviewer identities", () => {
    for (const reviewer of [
      "Codex AI",
      "automation bot",
      "Reviewer",
      "TBD",
      "REPLACE_WITH_HUMAN_NAME",
      "Pending Reviewer",
    ]) {
      expect(() => firstReview(recordFixture(), reviewer)).toThrow(/human|placeholder|automated|AI/i);
    }
  });

  it("revalidates substantive first-review notes at the publication gate", () => {
    const approved = firstReview(recordFixture());
    approved.review.firstReview!.notes = "Verified.";

    expect(validateRecordApproval(approved)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "INVALID_FIRST_REVIEW_NOTES",
        path: "review.firstReview.notes",
      }),
    ]));
  });

  it.each([
    ["parties", (record: ActivityRecord) => { record.actors.buyers[0].name = "Changed Fund"; }],
    ["date", (record: ActivityRecord) => { record.announcementDate = "2026-01-09"; }],
    ["source", (record: ActivityRecord) => { record.sourceEvidence[0].evidenceSummary += " Updated."; }],
    ["ownership", (record: ActivityRecord) => { record.ownershipEvidence.push({
      ownershipEvidenceId: "supplemental",
      entityName: "Fund I",
      sponsorName: "Sponsor One",
      relationship: "OTHER",
      validFrom: null,
      validThrough: null,
      confirmsOwnershipOnAnnouncementDate: false,
      sourceIds: ["transaction"],
      rationale: "Supplemental lineage note.",
    }); }],
    ["sector", (record: ActivityRecord) => { record.sector = "Utilities"; }],
    ["region", (record: ActivityRecord) => { record.region = "Europe"; }],
    ["transaction structure", (record: ActivityRecord) => { record.transactionStructure.details += " Revised."; }],
    ["second-review risk", (record: ActivityRecord) => { record.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Two sources disagree on the announcement date.",
      sourceIds: ["transaction"],
    }]; }],
  ])("invalidates approval after a %s change", (_label, mutate) => {
    const approved = firstReview(recordFixture());
    const reviewedHash = approved.review.firstReview!.reviewedInputHash;
    const changed = structuredClone(approved);
    mutate(changed);
    expect(computeReviewedInputHash(changed)).not.toBe(reviewedHash);
    expect(validateRecordApproval(changed).map((item) => item.code)).toContain("STALE_FIRST_REVIEW");
  });

  it("requires current, independent second approval for verified risk records", () => {
    const record = recordFixture();
    record.sourceEvidence.push({
      ...structuredClone(record.sourceEvidence[0]),
      sourceId: "conflicting-transaction",
      title: "Conflicting transaction report",
      url: "https://primary.example/conflicting-deal",
      evidenceSummary: "A second primary source reports a materially different transaction fact.",
    });
    record.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "The two primary sources disagree on a material transaction fact.",
      sourceIds: ["transaction", "conflicting-transaction"],
    }];
    const once = firstReview(record);
    expect(validateRecordApproval(once).map((item) => item.code)).toContain("MISSING_SECOND_REVIEW");
    expect(() => applyRecordReview(once, {
      stage: "SECOND",
      reviewer: "Morgan Smith",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I reopened the transaction evidence for independent second review.",
      humanAttestation: FIRST_ATTESTATION,
    })).toThrow(/different human reviewer/i);

    const twice = applyRecordReview(once, {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently opened both conflicting sources and verified classification.",
      humanAttestation: FIRST_ATTESTATION,
    });
    expect(validateRecordApproval(twice)).toEqual([]);
  });

  it("revalidates substantive second-review notes at the publication gate", () => {
    const record = recordFixture();
    record.sourceEvidence.push({
      ...structuredClone(record.sourceEvidence[0]),
      sourceId: "conflicting-transaction",
      title: "Conflicting transaction report",
      url: "https://primary.example/conflicting-deal",
      evidenceSummary: "A second primary source reports a materially different transaction fact.",
    });
    record.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "The two primary sources disagree on a material transaction fact.",
      sourceIds: ["transaction", "conflicting-transaction"],
    }];
    const twice = applyRecordReview(firstReview(record), {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently opened both conflicting sources and verified classification.",
      humanAttestation: FIRST_ATTESTATION,
    });
    twice.review.secondReview!.notes = "Done.";

    expect(validateRecordApproval(twice)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "INVALID_SECOND_REVIEW_NOTES",
        path: "review.secondReview.notes",
      }),
    ]));
  });

  it("invalidates both approvals when a verified risk changes after second review", () => {
    const record = recordFixture();
    record.sourceEvidence.push({
      ...structuredClone(record.sourceEvidence[0]),
      sourceId: "conflicting-transaction",
      title: "Conflicting transaction report",
      url: "https://primary.example/conflicting-deal",
    });
    record.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Two primary sources disagree on the announcement date.",
      sourceIds: ["transaction", "conflicting-transaction"],
    }];
    const twice = applyRecordReview(firstReview(record), {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently opened both sources and resolved the disputed date.",
      humanAttestation: FIRST_ATTESTATION,
    });
    twice.secondReviewRisks[0].detail = "The conflict now concerns transaction structure rather than date.";
    expect(validateRecordApproval(twice).map((item) => item.code)).toEqual(expect.arrayContaining([
      "STALE_FIRST_REVIEW",
      "STALE_SECOND_REVIEW",
    ]));
  });

  it("validates each evidence-based second-review exception against its fact domain", () => {
    const transactionConflict = recordFixture();
    transactionConflict.sourceEvidence.push({
      ...structuredClone(transactionConflict.sourceEvidence[0]),
      sourceId: "transaction-conflict",
      url: "https://other-primary.example/transaction-conflict",
      title: "Conflicting transaction facts",
    });
    transactionConflict.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Two primary sources report different announcement dates.",
      sourceIds: ["transaction", "transaction-conflict"],
    }];

    const actorConflict = recordFixture();
    actorConflict.sourceEvidence.push({
      ...structuredClone(actorConflict.sourceEvidence[0]),
      sourceId: "actor-conflict",
      url: "https://other-primary.example/actor-conflict",
      title: "Conflicting buyer attribution",
      purposes: ["TRANSACTION", "PARTIES"],
    });
    actorConflict.secondReviewRisks = [{
      kind: "CONFLICTING_ACTOR_ATTRIBUTION",
      detail: "Two primary transaction sources identify different legal buyers.",
      sourceIds: ["transaction", "actor-conflict"],
    }];

    const ownershipTiming = portfolioRecordFixture();
    ownershipTiming.sourceEvidence.push({
      ...structuredClone(ownershipTiming.sourceEvidence.find((source) => source.sourceId === "ownership")!),
      sourceId: "ownership-timing",
      url: "https://other-primary.example/ownership-timing",
      title: "Ownership effective-date notice",
    });
    ownershipTiming.secondReviewRisks = [{
      kind: "OWNERSHIP_TIMING_UNCERTAIN",
      detail: "Two ownership sources disagree on the effective transfer date.",
      sourceIds: ["ownership", "ownership-timing"],
    }];

    const mixed = recordFixture();
    mixed.actors.sellers.push({
      name: "Operating Company",
      entityKind: "OPERATING_PORTFOLIO_COMPANY",
      isPrincipal: true,
      sponsorName: "Sponsor One",
      sourceIds: ["transaction"],
    });
    mixed.classificationFacts.portfolioCompanyActsAsPrincipal = true;
    mixed.transactionStructure.isMixedDirectPortfolio = true;
    addDateValidMixedOwnership(mixed, "Operating Company");
    mixed.secondReviewRisks = [{
      kind: "ACTUAL_MIXED_DIRECT_PORTFOLIO",
      detail: "The fund vehicle and its operating company are both legal transaction principals.",
      sourceIds: ["transaction"],
    }];

    const bundled = recordFixture();
    bundled.transactionStructure.isBundledAnnouncement = true;
    bundled.secondReviewRisks = [{
      kind: "BUNDLED_LEGAL_TRANSACTIONS",
      detail: "One announcement contains multiple legally distinct transactions.",
      sourceIds: ["transaction"],
    }];

    for (const record of [transactionConflict, actorConflict, ownershipTiming, mixed, bundled]) {
      expect(validateRecordData(record)).toEqual([]);
      expect(requiresSecondReview(record)).toBe(true);
    }
  });

  it("requires distinct qualified evidence and both principal sides for risk exceptions", () => {
    const duplicateActorSource = recordFixture();
    duplicateActorSource.sourceEvidence.push({
      ...structuredClone(duplicateActorSource.sourceEvidence[0]),
      sourceId: "duplicate-locator",
      title: "Duplicated citation entry",
      url: "http://www.primary.example/deal/?utm_source=duplicate#parties",
    });
    duplicateActorSource.secondReviewRisks = [{
      kind: "CONFLICTING_ACTOR_ATTRIBUTION",
      detail: "A duplicated citation must not count as independent evidence.",
      sourceIds: ["transaction", "duplicate-locator"],
    }];
    expect(validateRecordData(duplicateActorSource).map((item) => item.code)).toContain(
      "INSUFFICIENT_ACTOR_CONFLICT_EVIDENCE",
    );

    const mislabeledTransactionConflict = recordFixture();
    mislabeledTransactionConflict.sourceEvidence.push({
      ...structuredClone(mislabeledTransactionConflict.sourceEvidence[0]),
      sourceId: "parties-only",
      url: "https://other-primary.example/parties-only",
      purposes: ["TRANSACTION", "PARTIES"],
    });
    mislabeledTransactionConflict.sourceEvidence[0].purposes = ["TRANSACTION", "PARTIES"];
    mislabeledTransactionConflict.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Actor evidence cannot bypass the actor-conflict evidence contract.",
      sourceIds: ["transaction", "parties-only"],
    }];
    expect(validateRecordData(mislabeledTransactionConflict).map((item) => item.code)).toContain(
      "INSUFFICIENT_TRANSACTION_CONFLICT_EVIDENCE",
    );

    const differentFactSources = recordFixture();
    differentFactSources.sourceEvidence[0].purposes = ["TRANSACTION", "ANNOUNCEMENT_DATE"];
    differentFactSources.sourceEvidence.push({
      ...structuredClone(differentFactSources.sourceEvidence[0]),
      sourceId: "region-only",
      url: "https://other-primary.example/region-only",
      purposes: ["TRANSACTION", "REGION"],
    });
    differentFactSources.secondReviewRisks = [{
      kind: "CONFLICTING_TRANSACTION_FACTS",
      detail: "Sources about different facts cannot establish a conflict.",
      sourceIds: ["transaction", "region-only"],
    }];
    expect(validateRecordData(differentFactSources).map((item) => item.code)).toContain(
      "INSUFFICIENT_TRANSACTION_CONFLICT_EVIDENCE",
    );

    const unsupportedMixedSide = recordFixture();
    unsupportedMixedSide.sourceEvidence.push({
      ...structuredClone(unsupportedMixedSide.sourceEvidence[0]),
      sourceId: "irrelevant-side-source",
      url: "https://primary.example/irrelevant-side",
      purposes: ["SECTOR"],
    });
    unsupportedMixedSide.actors.sellers.push({
      name: "Operating Company",
      entityKind: "OPERATING_PORTFOLIO_COMPANY",
      isPrincipal: true,
      sponsorName: "Sponsor One",
      sourceIds: ["irrelevant-side-source"],
    });
    unsupportedMixedSide.classificationFacts.portfolioCompanyActsAsPrincipal = true;
    unsupportedMixedSide.transactionStructure.isMixedDirectPortfolio = true;
    unsupportedMixedSide.secondReviewRisks = [{
      kind: "ACTUAL_MIXED_DIRECT_PORTFOLIO",
      detail: "Both legal principals must be supported by transaction-and-party evidence.",
      sourceIds: ["transaction"],
    }];
    expect(validateRecordData(unsupportedMixedSide).map((item) => item.code)).toContain(
      "MISSING_PRINCIPAL_ACTOR_EVIDENCE",
    );
    expect(validateRecordData(unsupportedMixedSide).map((item) => item.code)).toEqual(expect.arrayContaining([
      "MISSING_MIXED_PRIOR_OWNERSHIP_FACT",
      "MISSING_MIXED_DATE_VALID_OWNERSHIP",
    ]));
  });

  it("requires acting entity and date-valid ownership evidence for Portfolio activity", () => {
    const valid = portfolioRecordFixture();
    expect(validateRecordApproval(firstReview(valid))).toEqual([]);

    const missing = portfolioRecordFixture();
    missing.ownershipEvidence[0].validFrom = "2026-01-09";
    expect(validateRecordApproval(missing).map((item) => item.code)).toContain("MISSING_DATE_VALID_OWNERSHIP");
  });

  it("rejects an unnecessary second approval for an obvious record", () => {
    const once = firstReview(recordFixture());
    expect(() => applyRecordReview(once, {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "No verified exception exists.",
      humanAttestation: FIRST_ATTESTATION,
    })).toThrow(/only for a verified second-review risk/i);
  });

  it("rejects contradictory principal facts and acting-entity attributions", () => {
    const contradictoryFacts = recordFixture();
    contradictoryFacts.classificationFacts.fundVehicleActsAsPrincipal = false;
    expect(validateRecordData(contradictoryFacts).map((item) => item.code)).toContain(
      "FUND_PRINCIPAL_FACT_MISMATCH",
    );

    const unmatchedActingEntity = recordFixture();
    unmatchedActingEntity.actingEntity!.name = "Different Fund";
    expect(validateRecordData(unmatchedActingEntity).map((item) => item.code)).toContain(
      "ACTING_ENTITY_PRINCIPAL_MISMATCH",
    );

    const contradictoryKind = recordFixture();
    contradictoryKind.classificationFacts.principalActorKind = "OPERATING_PLATFORM";
    expect(validateRecordData(contradictoryKind).map((item) => item.code)).toEqual(expect.arrayContaining([
      "PRINCIPAL_ACTOR_KIND_MISMATCH",
      "ACTING_ENTITY_KIND_MISMATCH",
    ]));

    const contradictoryOperatingFlag = recordFixture();
    contradictoryOperatingFlag.actingEntity!.isOperatingCompany = true;
    expect(validateRecordData(contradictoryOperatingFlag).map((item) => item.code)).toContain(
      "ACTING_ENTITY_OPERATING_FLAG_MISMATCH",
    );

    const unsupportedPlatformSeed = recordFixture();
    unsupportedPlatformSeed.transactionStructure.newPlatformWithInseparableSeedAcquisition = true;
    unsupportedPlatformSeed.classificationFacts.fundVehicleActsAsPrincipal = false;
    unsupportedPlatformSeed.classificationFacts.fundSellsOrInvests = false;
    expect(validateRecordData(unsupportedPlatformSeed).map((item) => item.code)).toContain(
      "INCOMPLETE_PLATFORM_SEED_FUND_FACTS",
    );

    const hiddenMixed = recordFixture();
    hiddenMixed.actors.sellers.push({
      name: "Operating Co",
      entityKind: "OPERATING_PORTFOLIO_COMPANY",
      isPrincipal: true,
      sponsorName: "Sponsor One",
      sourceIds: ["transaction"],
    });
    hiddenMixed.classificationFacts.portfolioCompanyActsAsPrincipal = true;
    expect(validateRecordData(hiddenMixed).map((item) => item.code)).toContain(
      "UNDECLARED_MIXED_PARTICIPATION",
    );

    hiddenMixed.transactionStructure.isMixedDirectPortfolio = true;
    expect(validateRecordData(hiddenMixed).map((item) => item.code)).toContain(
      "MISSING_SECOND_REVIEW_RISK",
    );
    hiddenMixed.secondReviewRisks = [{
      kind: "ACTUAL_MIXED_DIRECT_PORTFOLIO",
      detail: "A fund vehicle and an operating portfolio company are both transaction principals.",
      sourceIds: ["transaction"],
    }];
    addDateValidMixedOwnership(hiddenMixed, "Operating Co");
    expect(validateRecordData(hiddenMixed)).toEqual([]);
  });

  it("rejects generated fallback boilerplate and accepts a documented secondary fallback", () => {
    const placeholder = recordFixture();
    placeholder.sourceEvidence[0].tier = "RELIABLE_SECONDARY";
    placeholder.sourceEvidence[0].fallbackRationale = "Candidate-stage fallback: reviewer must document primary-source unavailability before approval.";
    expect(validateRecordData(placeholder).map((item) => item.code)).toEqual(expect.arrayContaining([
      "INVALID_RELIABLE_SECONDARY_FALLBACK",
      "UNEXPLAINED_SECONDARY_EVIDENCE",
    ]));

    const generic = recordFixture();
    generic.sourceEvidence[0].tier = "RELIABLE_SECONDARY";
    generic.sourceEvidence[0].fallbackRationale = "The primary transaction source was unavailable, so a reliable secondary source was used as fallback evidence.";
    expect(validateRecordData(generic).map((item) => item.code)).toContain(
      "INVALID_RELIABLE_SECONDARY_FALLBACK",
    );

    const documented = recordFixture();
    documented.sourceEvidence[0].tier = "RELIABLE_SECONDARY";
    documented.sourceEvidence[0].fallbackRationale = "The sponsor newsroom published no transaction release, and its media team did not provide one; this contemporaneous trade report is the documented fallback.";
    expect(validateRecordData(documented)).toEqual([]);
  });
});

describe("manifest publication gates", () => {
  it("rejects duplicate record notes even when approvals are otherwise current", () => {
    const first = firstReview(recordFixture());
    const secondRecord = portfolioRecordFixture();
    const second = firstReview(secondRecord, "Jamie Rivera");
    second.review.firstReview!.notes = first.review.firstReview!.notes;

    const result = validateManifestForPublication(manifestFixture([first, second]), {
      verifyFrozenInputFiles: false,
    });
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "DUPLICATE_FIRST_REVIEW_NOTES",
        recordId: second.recordId,
        path: "review.firstReview.notes",
      }),
    ]));
  });

  it("rejects duplicate independent-review notes across records", () => {
    const makeConflictRecord = (recordId: string, target: string): ActivityRecord => {
      const record = recordFixture();
      record.recordId = recordId;
      record.legacyId = recordId;
      record.target = target;
      record.transactionIdentityKey = `primary.example/${recordId.toLowerCase()}|${target.toLowerCase()}`;
      record.sourceEvidence.push({
        ...structuredClone(record.sourceEvidence[0]),
        sourceId: "conflicting-transaction",
        title: `Conflicting transaction report for ${target}`,
        url: `https://other-primary.example/${recordId.toLowerCase()}`,
        evidenceSummary: "A second primary source reports a materially different transaction fact.",
      });
      record.secondReviewRisks = [{
        kind: "CONFLICTING_TRANSACTION_FACTS",
        detail: "The two primary sources disagree on a material transaction fact.",
        sourceIds: ["transaction", "conflicting-transaction"],
      }];
      return applyRecordReview(firstReview(record), {
        stage: "SECOND",
        reviewer: "Taylor Jones",
        reviewedAt: "2026-08-08T15:00:00Z",
        notes: `I independently reopened both sources and resolved the conflict for ${recordId}.`,
        humanAttestation: FIRST_ATTESTATION,
      });
    };
    const first = makeConflictRecord("INF-2026-001", "Target One");
    const second = makeConflictRecord("INF-2026-002", "Target Two");
    second.review.secondReview!.notes = first.review.secondReview!.notes;

    const result = validateManifestForPublication(manifestFixture([first, second]), {
      verifyFrozenInputFiles: false,
    });
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "DUPLICATE_SECOND_REVIEW_NOTES",
        recordId: second.recordId,
        path: "review.secondReview.notes",
      }),
    ]));
  });

  it("supports suffixed legal transactions while counting source candidates by legacy ID", () => {
    const left = recordFixture();
    left.recordId = `${left.legacyId}#asset-a`;
    left.splitSuffix = "asset-a";
    left.transactionIdentityKey = "deal|asset-a";
    left.transactionStructure.isBundledAnnouncement = true;
    left.secondReviewRisks = [{
      kind: "BUNDLED_LEGAL_TRANSACTIONS",
      detail: "The announcement contains two legally distinct transactions.",
      sourceIds: ["transaction"],
    }];
    const right = structuredClone(left);
    right.recordId = `${right.legacyId}#asset-b`;
    right.splitSuffix = "asset-b";
    right.transactionIdentityKey = "deal|asset-b";
    const manifest = manifestFixture([left, right]);
    expect(manifest.expectedCandidateCount).toBe(1);
    expect(manifest.records).toHaveLength(2);
  });

  it("approves only reconciled, fully human-reviewed manifests", () => {
    const direct = firstReview(recordFixture());
    const portfolio = firstReview(portfolioRecordFixture(), "Jamie Rivera");
    const draft = manifestFixture([direct, portfolio]);
    const approved = applyManifestPublicationApproval(draft, {
      reviewer: "Alex Morgan",
      approvedAt: "2026-08-08T16:00:00Z",
      notes: "I reviewed all record gates and reconciled sector, region, and grand totals.",
      humanAttestation: PUBLICATION_ATTESTATION,
    });

    expect(approved.status).toBe("APPROVED");
    expect(approved.controls.finalApprovedTotal).toBe(2);
    expect(approved.totals.grandTotal).toEqual({ directFund: 1, portfolioCompany: 1, total: 2 });
    expect(approved.manifestSha256).toBe(computeManifestArtifactHash(approved));
    expect(assertManifestPublishable(approved, { verifyFrozenInputFiles: false })).toEqual(approved);
  });

  it("does not force the final total to either historical control", () => {
    const approved = applyManifestPublicationApproval(manifestFixture([firstReview(recordFixture())]), {
      reviewer: "Alex Morgan",
      approvedAt: "2026-08-08T16:00:00Z",
      notes: "I approve the evidence-derived control rather than either historical hypothesis.",
      humanAttestation: PUBLICATION_ATTESTATION,
    });
    expect(approved.controls).toMatchObject({
      publishedTotal: 393,
      correctedControlHypothesisTotal: 398,
      finalApprovedTotal: 1,
    });
  });

  it("rejects duplicate included identities and mismatched sector/region totals", () => {
    const first = firstReview(recordFixture());
    const secondRaw = recordFixture();
    secondRaw.recordId = "INF-2026-099";
    secondRaw.legacyId = "INF-2026-099";
    const second = firstReview(secondRaw, "Jamie Rivera");
    const draft = manifestFixture([first, second]);
    draft.totals.grandTotal = { directFund: 99, portfolioCompany: 0, total: 99 };
    const result = validateManifestForPublication(draft, { verifyFrozenInputFiles: false });
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "DUPLICATE_INCLUDED_IDENTITY",
      "GRAND_TOTAL_MISMATCH",
      "MANIFEST_HASH_MISMATCH",
      "MANIFEST_NOT_APPROVED",
    ]));
  });

  it("invalidates record and publication approvals after reviewed inputs change", () => {
    const approved = applyManifestPublicationApproval(manifestFixture([firstReview(recordFixture())]), {
      reviewer: "Alex Morgan",
      approvedAt: "2026-08-08T16:00:00Z",
      notes: "I approve the reconciled manifest.",
      humanAttestation: PUBLICATION_ATTESTATION,
    });
    const changed = structuredClone(approved);
    changed.records[0].region = "Europe";
    const rehashed = finalizeActivityManifest(changed);
    const result = validateManifestForPublication(rehashed, { verifyFrozenInputFiles: false });
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "STALE_FIRST_REVIEW",
      "STALE_PUBLICATION_APPROVAL",
      "REGION_TOTAL_MISMATCH",
    ]));
  });

  it("verifies the frozen seed universe and captured production snapshot", () => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
    });
    try {
      const approved = applyManifestPublicationApproval(frozen.manifest, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "I approve the reconciled manifest and its frozen source contracts.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      expect(validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      }).issues).toEqual([]);
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it("blocks a self-consistent policy artifact that weakens an adopted contract field", () => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
    });
    try {
      const policyInput = frozen.manifest.frozenInputs.find((input) =>
        input.inputArtifactId === "risk-based-review-policy")!;
      const policy = JSON.parse(readFileSync(join(frozen.repositoryRoot, policyInput.path), "utf8")) as
        ReturnType<typeof reviewPolicyFixture>;
      const weakened = {
        ...policy,
        finalControl: "FORCE_PUBLISHED_393",
      };
      const { policySha256: _policySha256, ...withoutHash } = weakened;
      const rehashed = {
        ...withoutHash,
        policySha256: hashCanonical("weekly-briefing-activity-review-policy-v2", withoutHash),
      };
      policyInput.sha256 = writeFrozenJson(frozen.repositoryRoot, policyInput.path, rehashed);
      const draft = finalizeActivityManifest(frozen.manifest);
      const approved = applyManifestPublicationApproval(draft, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "This approval must not override the frozen methodology contract.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      expect(validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      }).issues.map((item) => item.code)).toContain("REVIEW_POLICY_CONTRACT_MISMATCH");
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it("blocks a self-consistent amendment that no longer proves a presentation-only baseline change", () => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
    });
    try {
      const active = frozen.manifest.frozenInputs.find((input) =>
        input.inputArtifactId === "protected-non-chart-email")!;
      const originalPath = "frozen/protected-non-chart-original.html";
      const originalSha = writeFrozenJson(frozen.repositoryRoot, originalPath, "original protected copy");
      const original = {
        ...active,
        inputArtifactId: "protected-non-chart-email-original",
        path: originalPath,
        sha256: originalSha,
      };
      const amendmentPath = "frozen/non-chart-baseline-amendment.json";
      const amendmentWithoutHash = {
        schemaVersion: 1,
        artifactType: "WEEKLY_BRIEFING_NON_CHART_BASELINE_AMENDMENT",
        edition: frozen.manifest.cutoffDate,
        recordedAt: "2026-08-09T21:15:00Z",
        authorizationScope: "PRESENTATION_BASELINE_ONLY_NOT_RECORD_APPROVAL",
        previousBaseline: {
          protectedNonChartPath: original.path,
          protectedNonChartSha256: original.sha256,
          chartBlockSha256: "a".repeat(64),
        },
        activeBaseline: {
          protectedNonChartPath: active.path,
          protectedNonChartSha256: active.sha256,
          chartBlockSha256: "a".repeat(64),
        },
        chartBlockByteIdentical: false,
        july31HistoricalEmail: { unchanged: true },
        approvedEditionIndex: { august7Approved: false },
        underlyingTransactionMetadataChanged: false,
      };
      const amendment = {
        ...amendmentWithoutHash,
        amendmentSha256: hashCanonical(
          "weekly-briefing-activity-non-chart-amendment-v1",
          amendmentWithoutHash,
        ),
      };
      const amendmentSha = writeFrozenJson(frozen.repositoryRoot, amendmentPath, amendment);
      const draft = finalizeActivityManifest({
        ...frozen.manifest,
        frozenInputs: [
          ...frozen.manifest.frozenInputs,
          original,
          {
            inputArtifactId: "non-chart-baseline-amendment",
            kind: "OTHER",
            path: amendmentPath,
            sha256: amendmentSha,
            recordCount: 1,
            capturedAt: "2026-08-09T21:15:00Z",
            gitCommit: null,
            notes: "Tampered presentation-baseline amendment fixture.",
          },
        ],
      });
      const approved = applyManifestPublicationApproval(draft, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-09T22:00:00Z",
        notes: "This approval must not override a weakened presentation-baseline contract.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      expect(validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      }).issues.map((item) => item.code)).toContain("BASELINE_AMENDMENT_CONTRACT_MISMATCH");
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it("allows legally distinct split records to share one frozen seed legacy ID", () => {
    const left = recordFixture();
    left.recordId = `${left.legacyId}#asset-a`;
    left.splitSuffix = "asset-a";
    left.transactionIdentityKey = "deal|asset-a";
    left.transactionStructure.isBundledAnnouncement = true;
    left.secondReviewRisks = [{
      kind: "BUNDLED_LEGAL_TRANSACTIONS",
      detail: "The announcement contains two legally distinct transactions.",
      sourceIds: ["transaction"],
    }];
    const right = structuredClone(left);
    right.recordId = `${right.legacyId}#asset-b`;
    right.splitSuffix = "asset-b";
    right.transactionIdentityKey = "deal|asset-b";

    const reviewedLeft = applyRecordReview(firstReview(left), {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently verified the first legally distinct bundled transaction.",
      humanAttestation: FIRST_ATTESTATION,
    });
    const reviewedRight = applyRecordReview(firstReview(right, "Jamie Rivera"), {
      stage: "SECOND",
      reviewer: "Casey Brown",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently verified the second legally distinct bundled transaction.",
      humanAttestation: FIRST_ATTESTATION,
    });
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [reviewedLeft, reviewedRight],
    });
    try {
      const approved = applyManifestPublicationApproval(frozen.manifest, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "I approve the reconciled split transactions and frozen source universe.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      expect(validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      }).issues).toEqual([]);
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it.each([
    [
      "an extra seed ID",
      { recordCount: 2, records: [{ legacyId: "INF-2026-001" }, { legacyId: "EXTRA-001" }] },
      "FROZEN_SEED_UNIVERSE_MISMATCH",
    ],
    [
      "a missing legacy ID",
      { recordCount: 1, records: [{}] },
      "MALFORMED_FROZEN_SEED",
    ],
    [
      "a null seed artifact",
      null,
      "MALFORMED_FROZEN_SEED",
    ],
    [
      "an inconsistent seed record count",
      { recordCount: 2, records: [{ legacyId: "INF-2026-001" }] },
      "SEED_RECORD_COUNT_MISMATCH",
    ],
  ])("blocks publication for %s", (_label, seed, expectedCode) => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
      seed,
    });
    try {
      const approved = applyManifestPublicationApproval(frozen.manifest, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "Approval remains hash-bound, but semantic frozen-input gates still apply.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      const result = validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      });
      expect(result.ok).toBe(false);
      expect(result.issues.map((item) => item.code)).toContain(expectedCode);
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it.each([
    [
      "a NOT_CONFIGURED snapshot",
      { status: "NOT_CONFIGURED", recordCount: 0, records: [] },
      "PRODUCTION_SNAPSHOT_NOT_CAPTURED",
    ],
    [
      "an inconsistent production record count",
      { status: "CAPTURED", recordCount: 2, records: [{ legacyId: "PRODUCTION-001" }] },
      "PRODUCTION_SNAPSHOT_RECORD_COUNT_MISMATCH",
    ],
  ])("blocks publication for %s", (_label, production, expectedCode) => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
      production,
    });
    try {
      const approved = applyManifestPublicationApproval(frozen.manifest, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "Approval remains hash-bound, but semantic frozen-input gates still apply.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      const result = validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      });
      expect(result.ok).toBe(false);
      expect(result.issues.map((item) => item.code)).toContain(expectedCode);
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });

  it("requires exactly one frozen seed and production artifact", () => {
    const frozen = manifestFixtureWithFrozenArtifacts({
      records: [firstReview(recordFixture())],
    });
    try {
      const duplicateSeed = structuredClone(
        frozen.manifest.frozenInputs.find((input) => input.kind === "SEED")!,
      );
      duplicateSeed.inputArtifactId = "duplicate-seed";
      duplicateSeed.path = "frozen/duplicate-seed.json";
      duplicateSeed.sha256 = writeFrozenJson(frozen.repositoryRoot, duplicateSeed.path, {
        recordCount: 1,
        records: [{ legacyId: "INF-2026-001" }],
      });
      const draft = finalizeActivityManifest({
        ...frozen.manifest,
        frozenInputs: [...frozen.manifest.frozenInputs, duplicateSeed],
      });
      const approved = applyManifestPublicationApproval(draft, {
        reviewer: "Alex Morgan",
        approvedAt: "2026-08-08T16:00:00Z",
        notes: "Approval remains hash-bound, but frozen-artifact cardinality gates still apply.",
        humanAttestation: PUBLICATION_ATTESTATION,
      });
      expect(validateManifestForPublication(approved, {
        repositoryRoot: frozen.repositoryRoot,
      }).issues.map((item) => item.code)).toContain("FROZEN_SEED_ARTIFACT_CARDINALITY");
    } finally {
      rmSync(frozen.repositoryRoot, { recursive: true, force: true });
    }
  });
});
