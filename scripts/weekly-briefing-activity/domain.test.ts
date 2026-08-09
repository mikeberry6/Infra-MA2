import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
  sha256Bytes,
  validateManifestForPublication,
  validateRecordData,
  validateRecordApproval,
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
      generatedBy: "candidate-generator-v1",
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
      ownershipChangedNearAnnouncement: false,
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
    ambiguityFlags: [],
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

function firstReview(record: ActivityRecord, reviewer = "Morgan Smith"): ActivityRecord {
  return applyRecordReview(record, {
    stage: "FIRST",
    reviewer,
    reviewedAt: "2026-08-08T14:00:00Z",
    notes: "I opened the evidence and verified the disposition and scope.",
    humanAttestation: FIRST_ATTESTATION,
  });
}

function manifestFixture(records: ActivityRecord[]): ActivityAuditManifest {
  const totals = computeActivityTotals(records);
  return finalizeActivityManifest({
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_MANIFEST",
    methodologyVersion: "WEEKLY_BRIEFING_ACTIVITY_V1",
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
    frozenInputs: [
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
    })),
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
    const artifact = frozenInput.kind === "SEED"
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
    expect(deriveActivityScope(scopeInput({ ...primaryOnly, fundSellsOrInvests: true }, {
      primaryOnlyPortfolioCompanyIssuance: true,
    }))).toBe("DIRECT_FUND");
  });

  it("classifies a new platform with an inseparable seed acquisition as Direct", () => {
    expect(deriveActivityScope(scopeInput({}, {
      newPlatformWithInseparableSeedAcquisition: true,
    }))).toBe("DIRECT_FUND");
  });

  it("derives second review for JVs, platforms, IPOs, recaps, exits, mixed sides, bundles, and ownership changes", () => {
    const record = recordFixture();
    record.transactionStructure.forms = ["JOINT_VENTURE", "PLATFORM_FORMATION", "IPO", "RECAPITALIZATION"];
    record.transactionStructure.isExit = true;
    record.transactionStructure.isMixedDirectPortfolio = true;
    record.transactionStructure.isBundledAnnouncement = true;
    record.transactionStructure.ownershipChangedNearAnnouncement = true;
    expect(deriveSecondReviewReasons(record)).toEqual([
      "JOINT_VENTURE",
      "PLATFORM_FORMATION",
      "IPO",
      "RECAPITALIZATION",
      "MIXED_SIDE_TRANSACTION",
      "EXIT",
      "BUNDLED_ANNOUNCEMENT",
      "OWNERSHIP_CHANGE_NEAR_ANNOUNCEMENT",
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
  ])("invalidates approval after a %s change", (_label, mutate) => {
    const approved = firstReview(recordFixture());
    const reviewedHash = approved.review.firstReview!.reviewedInputHash;
    const changed = structuredClone(approved);
    mutate(changed);
    expect(computeReviewedInputHash(changed)).not.toBe(reviewedHash);
    expect(validateRecordApproval(changed).map((item) => item.code)).toContain("STALE_FIRST_REVIEW");
  });

  it("requires current, independent second approval for ambiguous records", () => {
    const record = recordFixture();
    record.transactionStructure.forms = ["JOINT_VENTURE"];
    record.ambiguityFlags = ["JOINT_VENTURE"];
    const once = firstReview(record);
    expect(validateRecordApproval(once).map((item) => item.code)).toContain("MISSING_SECOND_REVIEW");
    expect(() => applyRecordReview(once, {
      stage: "SECOND",
      reviewer: "Morgan Smith",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "Second review.",
      humanAttestation: FIRST_ATTESTATION,
    })).toThrow(/different human reviewer/i);

    const twice = applyRecordReview(once, {
      stage: "SECOND",
      reviewer: "Taylor Jones",
      reviewedAt: "2026-08-08T15:00:00Z",
      notes: "I independently opened the JV evidence and verified classification.",
      humanAttestation: FIRST_ATTESTATION,
    });
    expect(validateRecordApproval(twice)).toEqual([]);
  });

  it("requires acting entity and date-valid ownership evidence for Portfolio activity", () => {
    const valid = portfolioRecordFixture();
    expect(validateRecordApproval(firstReview(valid))).toEqual([]);

    const missing = portfolioRecordFixture();
    missing.ownershipEvidence[0].validFrom = "2026-01-09";
    expect(validateRecordApproval(missing).map((item) => item.code)).toContain("MISSING_DATE_VALID_OWNERSHIP");
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
  it("supports suffixed legal transactions while counting source candidates by legacy ID", () => {
    const left = recordFixture();
    left.recordId = `${left.legacyId}#asset-a`;
    left.splitSuffix = "asset-a";
    left.transactionIdentityKey = "deal|asset-a";
    left.transactionStructure.isBundledAnnouncement = true;
    left.ambiguityFlags = ["BUNDLED_ANNOUNCEMENT"];
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

  it("allows legally distinct split records to share one frozen seed legacy ID", () => {
    const left = recordFixture();
    left.recordId = `${left.legacyId}#asset-a`;
    left.splitSuffix = "asset-a";
    left.transactionIdentityKey = "deal|asset-a";
    left.transactionStructure.isBundledAnnouncement = true;
    left.ambiguityFlags = ["BUNDLED_ANNOUNCEMENT"];
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
