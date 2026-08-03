import { describe, expect, it } from "vitest";
import { resolveOrgName } from "../../prisma/entity-resolution";
import { fundRefreshSnapshotSchema, type FundRefreshCandidate, type FundRefreshProposal, type FundRefreshSnapshot } from "../../src/modules/funds/refresh-schema";
import {
  canonicalManagerKey,
  compareManifestEvidenceRecords,
  expectedManagerCoverageCohort,
  findUnreviewedEvidenceWrites,
  loadFundManifest,
  managerCohort,
  manifestRecordToSnapshot,
  normalizeIdentity,
  parseAndValidateProposal,
  parseCliArgs,
  proposalHash,
  rollbackGuard,
  rollbackManifestScopeBlockers,
  scheduledManagerCohort,
  snapshotChangedFields,
  utcCalendarDate,
} from "./lib";
import {
  fundRefreshReviewPools,
  renderFundRefreshFieldDiffCsv,
  renderFundRefreshProReviewPacket,
} from "./artifacts";

const loadedManifest = loadFundManifest();
// Unit cases isolate proposal semantics from the repository's known raising-
// fund reconciliation debt. Dedicated coverage tests exercise that gate.
const manifest = {
  ...loadedManifest,
  funds: loadedManifest.funds.map((fund) => fund.status === "Raising"
    ? { ...fund, status: "Financial Close" as const }
    : fund),
};
const base = manifestRecordToSnapshot(manifest.funds[0]);

function evidence(
  fields: string[],
  url = "https://example-manager.com/fund-release",
  sourceTier: "PRIMARY" | "INSTITUTIONAL" = "PRIMARY",
): FundRefreshCandidate["evidence"] {
  return [{
    sourceId: "source-1",
    url,
    supportedFields: fields,
    sourceTier,
    scope: "FUND" as const,
    publishedAt: "2026-07-20",
    retrievedAt: "2026-07-22",
    confidence: "HIGH" as const,
    evidenceLabel: "Official fund announcement",
  }];
}

function candidate(
  action: FundRefreshCandidate["action"],
  before: FundRefreshSnapshot | null,
  after: FundRefreshSnapshot | null,
  changedFields: string[],
  candidateEvidence: FundRefreshCandidate["evidence"] = evidence(changedFields),
): FundRefreshCandidate {
  const identitySnapshot = after ?? before ?? base;
  return {
    action,
    identity: {
      legacyId: identitySnapshot.legacyId,
      managerName: identitySnapshot.managerName,
      fundName: identitySnapshot.fundName,
    },
    before,
    after,
    changedFields: [...changedFields].sort(),
    evidence: candidateEvidence,
    confidence: "HIGH",
    unresolvedQuestions: [],
    ownershipLinkImpact: {
      matchedOwnershipPeriodCount: 0,
      matchedOwnershipVehicles: [],
      linkedOwnershipPeriodCount: 0,
      linkedCompanyIds: [],
      mutationProposed: false,
      notes: "No ownership mutation proposed.",
    },
  };
}

function proposal(candidates: FundRefreshCandidate[]): FundRefreshProposal {
  const unresolvedCandidates = candidates.filter((item) =>
    item.unresolvedQuestions.length > 0 || item.confidence !== "HIGH" || item.action === "ARCHIVE_REVIEW",
  ).length;
  const knownManagerKeys = [...new Set(manifest.funds.map((fund) => canonicalManagerKey(fund.managerName)))].sort();
  const raisingFundIds = manifest.funds.filter((fund) => fund.status === "Raising").map((fund) => fund.id).sort();
  const fixtureCohort = expectedManagerCoverageCohort(new Date("2026-07-22T00:00:00.000Z"));
  const requiredManagerKeys = new Set(
    fixtureCohort === "ALL"
      ? knownManagerKeys
      : knownManagerKeys.filter((managerKey) => managerCohort(managerKey) === fixtureCohort),
  );
  for (const fund of manifest.funds.filter((item) => item.status === "Raising")) requiredManagerKeys.add(canonicalManagerKey(fund.managerName));
  const searchedManagerKeys = [...requiredManagerKeys].sort();
  const draft = {
    schemaVersion: 1 as const,
    runId: "historical-forward-test",
    generatedAt: "2026-07-22T12:00:00.000Z",
    researchWindow: { start: "2026-07-13", end: "2026-07-22" },
    baseCommit: "a".repeat(40),
    liveDatabaseFingerprint: "b".repeat(64),
    coverage: {
      manifestFunds: manifest.funds.length,
      liveFunds: 150,
      evidenceFunds: 150,
      knownManagers: knownManagerKeys.length,
      raisingFunds: manifest.funds.filter((fund) => fund.status === "Raising").length,
      searchedManagers: searchedManagerKeys.length,
      sourceFailures: 0,
      candidates: candidates.length,
      unresolvedCandidates,
      managerCohort: fixtureCohort,
      knownManagerKeys,
      raisingFundIds,
      searchedManagerKeys,
    },
    modelConfiguration: {
      workerModel: "gpt-5.6-sol" as const,
      reasoningEffort: "ultra" as const,
      reviewerSurface: "chatgpt" as const,
      reviewerModel: "gpt-5.6" as const,
      reviewerReasoningMode: "pro" as const,
    },
    candidates,
    artifacts: {
      fieldDiffCsv: "audits/fund-refresh/historical-forward-test/field-diff.csv",
      coverageReport: "audits/fund-refresh/historical-forward-test/coverage.json",
      sourceHealthReport: "audits/fund-refresh/historical-forward-test/source-health.json",
      ownershipImpactReport: "audits/fund-refresh/historical-forward-test/ownership-impact.json",
      proReviewPacket: "audits/fund-refresh/historical-forward-test/pro-review-packet.md",
    },
  };
  return { ...draft, proposalHash: proposalHash(draft as Omit<FundRefreshProposal, "proposalHash">) };
}

describe("fund refresh historical forward cases", () => {
  it("accepts a corroborated final-close transition", () => {
    const before = { ...base, fundStatus: "Raising" as const, sizeBasis: "TARGET" as const, sizeAsOf: "2026-07-10" };
    const after = { ...before, fundStatus: "Financial Close" as const, sizeBasis: "FINAL_CLOSE" as const, sizeAsOf: "2026-07-20" };
    const fields = snapshotChangedFields(before, after);
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields)]), manifest);
    expect(result.issues).toEqual([]);
  });

  it("keeps an ownership-linked rename unresolved and non-apply-eligible", () => {
    const after = { ...base, fundName: `${base.fundName} (Official Name)` };
    const renamed = candidate("UPDATE", base, after, ["fundName"]);
    renamed.ownershipLinkImpact.matchedOwnershipPeriodCount = 2;
    renamed.ownershipLinkImpact.matchedOwnershipVehicles = [base.fundName, after.fundName].sort();
    renamed.confidence = "MEDIUM";
    renamed.unresolvedQuestions = ["Approve an ownership-link alias or remediation plan before apply."];
    const result = parseAndValidateProposal(proposal([renamed]), manifest);
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(result.issues.map((issue) => issue.code)).toContain("RENAME_OWNERSHIP_APPLY_BLOCKED");
  });

  it("rejects an ownership-linked rename marked apply-ready", () => {
    const after = { ...base, fundName: `${base.fundName} (Unsafe Rename)` };
    const renamed = candidate("UPDATE", base, after, ["fundName"]);
    renamed.ownershipLinkImpact.matchedOwnershipPeriodCount = 2;
    renamed.ownershipLinkImpact.matchedOwnershipVehicles = [base.fundName];
    const result = parseAndValidateProposal(proposal([renamed]), manifest);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "RENAME_REMEDIATION_UNRESOLVED",
      "RENAME_APPLY_CONFIDENCE",
    ]));
  });

  it("accepts a successor vehicle for a known manager", () => {
    const after = {
      ...base,
      legacyId: "FUND-TEST-SUCCESSOR",
      fundName: `${base.fundName} Successor`,
      vintage: "2026",
      sizeNativeCurrency: "GBP",
      sizeNativeAmount: "3800000000",
      sizeBasis: "AUM" as const,
      sizeAsOf: "2026-07-20",
    };
    const fields = snapshotChangedFields(null, after);
    const created = candidate("CREATE", null, after, fields, evidence(fields));
    const result = parseAndValidateProposal(proposal([created]), manifest);
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("allows a reviewed base-manager alias to move to its canonical identity", () => {
    const aliasRecord = manifest.funds.find((fund) => canonicalManagerKey(fund.managerName) !== normalizeIdentity(fund.managerName));
    expect(aliasRecord).toBeDefined();
    const before = manifestRecordToSnapshot(aliasRecord!);
    const canonicalName = resolveOrgName(aliasRecord!.managerName);
    const after = { ...before, managerName: canonicalName };
    const fields = snapshotChangedFields(before, after);
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields, evidence(fields))]), manifest);
    expect(result.issues.map((issue) => issue.code)).not.toContain("UNKNOWN_MANAGER");
  });

  it("still rejects a genuinely unknown manager", () => {
    const after = { ...base, managerName: "Totally New Infrastructure Manager" };
    const fields = snapshotChangedFields(base, after);
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", base, after, fields, evidence(fields))]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("UNKNOWN_MANAGER");
  });

  it("blocks Form D as sole proof of final committed capital", () => {
    const before = { ...base, fundStatus: "Raising" as const, sizeBasis: "AMOUNT_SOLD" as const, sizeAsOf: "2026-07-10" };
    const after = { ...before, fundStatus: "Financial Close" as const, sizeBasis: "FINAL_CLOSE" as const, sizeAsOf: "2026-07-20" };
    const fields = snapshotChangedFields(before, after);
    const secEvidence = evidence(fields, "https://www.sec.gov/Archives/example/form-d.xml", "INSTITUTIONAL");
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields, secEvidence)]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("FORM_D_FINAL_CLOSE");
  });

  it("blocks a Form D-only close even when the recorded amount is not final-close capital", () => {
    const before = { ...base, fundStatus: "Raising" as const, sizeBasis: "AMOUNT_SOLD" as const, sizeAsOf: "2026-07-10" };
    const after = { ...before, fundStatus: "Financial Close" as const };
    const fields = snapshotChangedFields(before, after);
    const secEvidence = evidence(fields, "https://www.sec.gov/Archives/example/form-d.xml", "INSTITUTIONAL");
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields, secEvidence)]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("FORM_D_STATUS_CLOSE");
  });

  it("blocks Form D-only commitments and AUM semantics", () => {
    for (const sizeBasis of ["COMMITMENTS", "AUM"] as const) {
      const before = {
        ...base,
        size: "$500 million sold",
        sizeUsdMm: 500,
        sizeNativeCurrency: "USD",
        sizeNativeAmount: "500000000",
        sizeBasis: "AMOUNT_SOLD" as const,
        sizeAsOf: "2026-07-10",
      };
      const after = { ...before, size: `$500 million ${sizeBasis.toLowerCase()}`, sizeBasis, sizeAsOf: "2026-07-20" };
      const fields = snapshotChangedFields(before, after);
      const secEvidence = evidence(fields, "https://www.sec.gov/Archives/example/form-d.xml", "INSTITUTIONAL");
      const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields, secEvidence)]), manifest);
      expect(result.issues.map((issue) => issue.code)).toContain("FORM_D_COMMITTED_CAPITAL");
    }
  });

  it("accepts a narrow Form D amount-sold update without inferring a close", () => {
    const before = {
      ...base,
      fundStatus: "Raising" as const,
      size: "$100 million target",
      sizeUsdMm: 100,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "100000000",
      sizeBasis: "TARGET" as const,
      sizeAsOf: "2026-07-19",
    };
    const after = {
      ...before,
      size: "$40 million sold of $100 million offering",
      sizeUsdMm: 40,
      sizeNativeAmount: "40000000",
      sizeBasis: "AMOUNT_SOLD" as const,
      sizeAsOf: "2026-07-20",
    };
    const fields = snapshotChangedFields(before, after);
    const secEvidence = evidence(fields, "https://www.sec.gov/Archives/example/form-d.xml", "INSTITUTIONAL");
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, fields, secEvidence)]), manifest);
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("assigns managers and weeks to deterministic four-way cohorts", () => {
    expect(managerCohort(base.managerName)).toBe(managerCohort(base.managerName));
    expect(managerCohort(base.managerName)).toBeGreaterThanOrEqual(0);
    expect(managerCohort(base.managerName)).toBeLessThanOrEqual(3);
    expect(scheduledManagerCohort(new Date("2026-07-22T12:00:00Z"))).toBe(2);
    expect(expectedManagerCoverageCohort(new Date("2026-07-22T12:00:00Z"))).toBe(2);
    expect(expectedManagerCoverageCohort(new Date("2026-07-06T12:00:00Z"))).toBe("ALL");
  });

  it("rejects a declared manager cohort that does not match the run date", () => {
    const item = candidate("VERIFY_NO_CHANGE", base, base, [], evidence(["fundName"]));
    const draft = proposal([item]);
    draft.coverage.managerCohort = 0;
    const result = parseAndValidateProposal(draft, manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("COVERAGE_COHORT_SCHEDULE");
  });

  it("binds generatedAt to the UTC research date rather than its written offset date", () => {
    const item = candidate("VERIFY_NO_CHANGE", base, base, [], evidence(["fundName"]));
    const draft = proposal([item]);
    draft.generatedAt = "2026-07-22T23:30:00-04:00";
    const result = parseAndValidateProposal(draft, manifest);
    expect(utcCalendarDate(draft.generatedAt)).toBe("2026-07-23");
    expect(result.issues.map((issue) => issue.code)).toContain("RESEARCH_WINDOW_GENERATED_AT");
  });

  it("accepts stronger ALL coverage on a catch-up run outside the quarter opening week", () => {
    const item = candidate("VERIFY_NO_CHANGE", base, base, [], evidence(["fundName"]));
    const draft = proposal([item]);
    draft.coverage.managerCohort = "ALL";
    draft.coverage.searchedManagerKeys = [...draft.coverage.knownManagerKeys];
    draft.coverage.searchedManagers = draft.coverage.searchedManagerKeys.length;
    const result = parseAndValidateProposal(draft, manifest);
    expect(result.issues.map((issue) => issue.code)).not.toContain("COVERAGE_COHORT_SCHEDULE");
    expect(result.issues.map((issue) => issue.code)).not.toContain("COVERAGE_REQUIRED_MANAGERS");
  });

  it("rejects impossible dates and noncanonical decimals before apply", () => {
    expect(fundRefreshSnapshotSchema.safeParse({
      ...base,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "0100.00",
      sizeBasis: "TARGET",
      sizeAsOf: "2026-02-31",
    }).success).toBe(false);
  });

  it("rejects inconsistent USD and recorded-FX equivalents", () => {
    const usdAfter = {
      ...base,
      size: "$100 million target",
      sizeUsdMm: 200,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "100000000",
      sizeBasis: "TARGET" as const,
      sizeAsOf: "2026-07-20",
    };
    const usdFields = snapshotChangedFields(base, usdAfter);
    const usdResult = parseAndValidateProposal(proposal([
      candidate("UPDATE", base, usdAfter, usdFields, evidence(usdFields)),
    ]), manifest);
    expect(usdResult.issues.map((issue) => issue.code)).toContain("SIZE_USD_INCONSISTENT");

    const fxAfter = {
      ...base,
      size: "€100 million target",
      sizeUsdMm: 200,
      sizeNativeCurrency: "EUR",
      sizeNativeAmount: "100000000",
      sizeBasis: "TARGET" as const,
      sizeAsOf: "2026-07-20",
      sizeUsdFxRate: "1.1",
      sizeUsdFxDate: "2026-07-20",
    };
    const fxFields = snapshotChangedFields(base, fxAfter);
    const fxResult = parseAndValidateProposal(proposal([
      candidate("UPDATE", base, fxAfter, fxFields, evidence(fxFields)),
    ]), manifest);
    expect(fxResult.issues.map((issue) => issue.code)).toContain("SIZE_FX_INCONSISTENT");
  });

  it("rejects duplicate candidates for one legacyId", () => {
    const after = { ...base, investmentStrategy: `${base.investmentStrategy} Reviewed` };
    const first = candidate("UPDATE", base, after, ["investmentStrategy"]);
    const result = parseAndValidateProposal(proposal([first, { ...first }]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("DUPLICATE_CANDIDATE");
  });

  it("rejects unsupported evidence fields, invalid evidence dates, and overstated program confidence", () => {
    const after = { ...base, investmentStrategy: `${base.investmentStrategy} Reviewed` };
    const fields = snapshotChangedFields(base, after);
    const invalidEvidence = evidence(fields).map((item) => ({
      ...item,
      supportedFields: [...item.supportedFields, "notARealFundField"].sort(),
      scope: "PROGRAM_EXCEPTION" as const,
      publishedAt: "2026-07-23",
      retrievedAt: "2026-07-12",
    }));
    const result = parseAndValidateProposal(proposal([
      candidate("UPDATE", base, after, fields, invalidEvidence),
    ]), manifest);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "UNKNOWN_SUPPORTED_FIELD",
      "EVIDENCE_DATE_ORDER",
      "PROGRAM_CONFIDENCE",
      "EVIDENCE_RETRIEVAL_WINDOW",
    ]));
  });

  it("requires one stable sourceId per evidence URL across a proposal", () => {
    const beforeOne = manifestRecordToSnapshot(manifest.funds[0]);
    const beforeTwo = manifestRecordToSnapshot(manifest.funds[1]);
    const afterOne = { ...beforeOne, investmentStrategy: `${beforeOne.investmentStrategy} Reviewed` };
    const afterTwo = { ...beforeTwo, investmentStrategy: `${beforeTwo.investmentStrategy} Reviewed` };
    const firstFields = snapshotChangedFields(beforeOne, afterOne);
    const secondFields = snapshotChangedFields(beforeTwo, afterTwo);
    const candidates = [
      candidate("UPDATE", beforeOne, afterOne, firstFields, evidence(firstFields, "https://manager-one.test/release")),
      candidate("UPDATE", beforeTwo, afterTwo, secondFields, evidence(secondFields, "https://manager-two.test/release")),
    ].sort((left, right) => left.identity.legacyId.localeCompare(right.identity.legacyId));
    const result = parseAndValidateProposal(proposal(candidates), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("SOURCE_ID_COLLISION");
  });

  it("rejects candidate confidence above its evidence and field-level secondary non-corroboration", () => {
    const after = { ...base, investmentStrategy: `${base.investmentStrategy} Reviewed` };
    const fields = snapshotChangedFields(base, after);
    const weakEvidence: FundRefreshCandidate["evidence"] = [{
      ...evidence(fields)[0],
      url: "https://secondary.example/report",
      sourceTier: "REPUTABLE_SECONDARY",
      confidence: "LOW",
    }];
    const reviewed = candidate("UPDATE", base, after, fields, weakEvidence);
    reviewed.confidence = "MEDIUM";
    const result = parseAndValidateProposal(proposal([reviewed]), manifest);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "CANDIDATE_CONFIDENCE_OVERSTATED",
      "SECONDARY_EVIDENCE_INSUFFICIENT",
      "SECONDARY_FIELD_CORROBORATION",
    ]));
  });

  it("does not let a program exception establish vehicle identity", () => {
    const after = { ...base, fundName: `${base.fundName} Renamed` };
    const fields = snapshotChangedFields(base, after);
    const programEvidence: FundRefreshCandidate["evidence"] = [{
      ...evidence(fields)[0],
      scope: "PROGRAM_EXCEPTION",
      confidence: "MEDIUM",
    }];
    const reviewed = candidate("UPDATE", base, after, fields, programEvidence);
    reviewed.confidence = "MEDIUM";
    const result = parseAndValidateProposal(proposal([reviewed]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("FUND_PRIMARY_REQUIRED");
  });

  it("allows an explicit undisclosed-size state but rejects an unclassified numeric display", () => {
    const undisclosed = { ...base, size: "Not disclosed", sizeUsdMm: null };
    const undisclosedFields = snapshotChangedFields(base, undisclosed);
    const accepted = parseAndValidateProposal(proposal([
      candidate("UPDATE", base, undisclosed, undisclosedFields, evidence(undisclosedFields)),
    ]), manifest);
    expect(accepted.issues.map((issue) => issue.code)).not.toContain("SIZE_BASIS_REQUIRED");
    expect(accepted.issues.map((issue) => issue.code)).not.toContain("SIZE_DISPLAY_UNCLASSIFIED");

    const unclassified = { ...undisclosed, size: "$500 million" };
    const unclassifiedFields = snapshotChangedFields(base, unclassified);
    const rejected = parseAndValidateProposal(proposal([
      candidate("UPDATE", base, unclassified, unclassifiedFields, evidence(unclassifiedFields)),
    ]), manifest);
    expect(rejected.issues.map((issue) => issue.code)).toContain("SIZE_DISPLAY_UNCLASSIFIED");
  });

  it("allows medium-confidence program AUM evidence for an evergreen listed vehicle", () => {
    const after = {
      ...base,
      size: "£4.0B AUM",
      sizeUsdMm: 5200,
      sizeNativeCurrency: "GBP",
      sizeNativeAmount: "4000000000",
      sizeBasis: "AUM" as const,
      sizeAsOf: "2026-07-20",
    };
    const fields = snapshotChangedFields(base, after);
    const programEvidence: FundRefreshCandidate["evidence"] = [{
      ...evidence(fields)[0],
      scope: "PROGRAM_EXCEPTION",
      confidence: "MEDIUM",
    }];
    const reviewed = candidate("UPDATE", base, after, fields, programEvidence);
    reviewed.confidence = "MEDIUM";
    const result = parseAndValidateProposal(proposal([reviewed]), manifest);
    expect(result.issues.map((issue) => issue.code)).not.toContain("FUND_PRIMARY_REQUIRED");
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("requires every raising vehicle to appear as a reviewed candidate", () => {
    const draft = proposal([candidate("VERIFY_NO_CHANGE", base, base, [], evidence(["fundName"]))]);
    const raisingFundIds = loadedManifest.funds
      .filter((fund) => fund.status === "Raising")
      .map((fund) => fund.id)
      .sort();
    const searchedManagerKeys = [...new Set([
      ...draft.coverage.searchedManagerKeys,
      ...loadedManifest.funds
        .filter((fund) => fund.status === "Raising")
        .map((fund) => canonicalManagerKey(fund.managerName)),
    ])].sort();
    draft.coverage.raisingFundIds = raisingFundIds;
    draft.coverage.raisingFunds = raisingFundIds.length;
    draft.coverage.searchedManagerKeys = searchedManagerKeys;
    draft.coverage.searchedManagers = searchedManagerKeys.length;
    const result = parseAndValidateProposal(draft, loadedManifest);
    expect(result.issues.map((issue) => issue.code)).toContain("COVERAGE_RAISING_CANDIDATES");
  });

  it("keeps a fund in base raising coverage when the desired state closes it", () => {
    const before = { ...base, fundStatus: "Raising" as const };
    const after = { ...before, fundStatus: "Financial Close" as const };
    const reviewed = candidate("UPDATE", before, after, ["fundStatus"], evidence(["fundStatus"]));
    const draft = proposal([reviewed]);
    const coverageManifest = {
      ...manifest,
      funds: manifest.funds.map((fund) => fund.id === base.legacyId
        ? { ...fund, status: "Raising" as const }
        : fund),
    };
    const raisingFundIds = coverageManifest.funds.filter((fund) => fund.status === "Raising").map((fund) => fund.id).sort();
    const searchedManagerKeys = [...new Set([
      ...draft.coverage.searchedManagerKeys,
      canonicalManagerKey(base.managerName),
    ])].sort();
    draft.coverage.raisingFundIds = raisingFundIds;
    draft.coverage.raisingFunds = raisingFundIds.length;
    draft.coverage.searchedManagerKeys = searchedManagerKeys;
    draft.coverage.searchedManagers = searchedManagerKeys.length;
    const result = parseAndValidateProposal(draft, manifest, coverageManifest);
    expect(result.issues.map((issue) => issue.code)).not.toContain("COVERAGE_RAISING_IDENTITIES");
    expect(result.issues.map((issue) => issue.code)).not.toContain("COVERAGE_RAISING_CANDIDATES");
  });

  it("blocks overwriting established commitments with Form D progress semantics", () => {
    const before = {
      ...base,
      size: "$1 billion final close",
      sizeUsdMm: 1000,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "1000000000",
      sizeBasis: "FINAL_CLOSE" as const,
      sizeAsOf: "2026-07-10",
      fundStatus: "Financial Close" as const,
    };
    const after = {
      ...before,
      size: "$400 million sold",
      sizeUsdMm: 400,
      sizeNativeAmount: "400000000",
      sizeBasis: "AMOUNT_SOLD" as const,
      sizeAsOf: "2026-07-20",
    };
    const fields = snapshotChangedFields(before, after);
    const secEvidence = evidence(fields, "https://www.sec.gov/Archives/example/form-d-progress.xml", "INSTITUTIONAL");
    const result = parseAndValidateProposal(proposal([
      candidate("UPDATE", before, after, fields, secEvidence),
    ]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("SIZE_BASIS_REGRESSION");
  });

  it("parses both spaced and equals-style CLI values deterministically", () => {
    expect(parseCliArgs(["--output=tmp/report.json", "--offline"])).toEqual(new Map<string, string | boolean>([
      ["output", "tmp/report.json"],
      ["offline", true],
    ]));
    expect(() => parseCliArgs(["--output=a", "--output", "b"])).toThrow("Duplicate argument");
  });

  it("keeps exact retries idempotent but treats later evidence retrieval as a new verification", () => {
    const after = { ...base, investmentStrategy: `${base.investmentStrategy} Updated` };
    const first = proposal([candidate("UPDATE", base, after, ["investmentStrategy"])]);
    const sameEvidenceRetry = {
      ...first,
      runId: "replay-run",
      generatedAt: "2026-08-01T12:00:00.000Z",
      researchWindow: { start: "2026-07-23", end: "2026-08-01" },
    };
    const laterEvidence = {
      ...sameEvidenceRetry,
      candidates: first.candidates.map((item) => ({
        ...item,
        evidence: item.evidence.map((itemEvidence) => ({ ...itemEvidence, retrievedAt: "2026-08-01" })),
      })),
    };
    expect(proposalHash(first)).toBe(proposalHash(sameEvidenceRetry));
    expect(proposalHash(first)).not.toBe(proposalHash(laterEvidence));
  });

  it("builds deterministic mandatory and ten-percent Pro review artifacts", () => {
    const verificationCandidates = manifest.funds.slice(0, 11).map((fund) => {
      const snapshot = manifestRecordToSnapshot(fund);
      return candidate("VERIFY_NO_CHANGE", snapshot, snapshot, [], evidence(["fundName"]));
    }).sort((left, right) => left.identity.legacyId.localeCompare(right.identity.legacyId));
    const substantiveBefore = manifestRecordToSnapshot(manifest.funds[20]);
    const substantiveAfter = { ...substantiveBefore, investmentStrategy: `${substantiveBefore.investmentStrategy} Reviewed` };
    const reviewedProposal = proposal([
      ...verificationCandidates,
      candidate("UPDATE", substantiveBefore, substantiveAfter, ["investmentStrategy"]),
    ].sort((left, right) => left.identity.legacyId.localeCompare(right.identity.legacyId)));
    const pools = fundRefreshReviewPools(reviewedProposal);
    expect(pools.mandatory).toEqual([substantiveBefore.legacyId]);
    expect(pools.lowerRisk).toHaveLength(11);
    expect(renderFundRefreshFieldDiffCsv(reviewedProposal)).toContain(reviewedProposal.proposalHash);
    const packet = renderFundRefreshProReviewPacket(reviewedProposal);
    expect(packet).toContain("## Mandatory review pool");
    expect(packet).toContain("first ceiling(10%) (2 candidate(s))");
    expect(packet).toContain(substantiveBefore.legacyId);
    expect(packet).toBe(renderFundRefreshProReviewPacket(reviewedProposal));
  });

  it("blocks source removal without equivalent replacements", () => {
    const before = { ...base, sourceUrls: ["https://one.test", "https://two.test"] };
    const after = { ...before, sourceUrls: ["https://replacement.test"] };
    const result = parseAndValidateProposal(proposal([candidate("UPDATE", before, after, ["sourceUrls"], evidence(["sourceUrls"]))]), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("SOURCE_REMOVAL");
  });

  it("requires a missing operational evidence row to be explicitly reviewed", () => {
    const desired = [{
      ...evidence(["fundName"])[0],
      legacyId: base.legacyId,
    }];
    expect(findUnreviewedEvidenceWrites(desired, [], [])).toEqual([
      `${desired[0].url}\u0000${desired[0].evidenceLabel}`,
    ]);
    expect(findUnreviewedEvidenceWrites(desired, [], desired)).toEqual([]);
  });

  it("requires live evidence semantic drift to be explicitly reviewed", () => {
    const desired = [{
      ...evidence(["fundName", "vintage"])[0],
      legacyId: base.legacyId,
    }];
    const current = [{
      ...desired[0],
      supportedFields: ["fundName"],
      retrievedAt: "2026-07-19",
    }];
    expect(findUnreviewedEvidenceWrites(desired, current, [])).toHaveLength(1);
    expect(findUnreviewedEvidenceWrites(desired, current, desired)).toEqual([]);
  });

  it("keeps base-manifest evidence during a bootstrap rollback even when it was absent operationally", () => {
    const desiredRecord = {
      ...evidence(["fundName"])[0],
      legacyId: base.legacyId,
    };
    const evidenceManifest = {
      schemaVersion: 2 as const,
      asOf: "2026-07-22",
      records: [desiredRecord],
      fundNotes: [],
    };
    const operationalBefore = [{
      url: desiredRecord.url,
      evidenceLabel: desiredRecord.evidenceLabel,
      existing: null,
    }];
    expect(operationalBefore[0].existing).toBeNull();
    expect(compareManifestEvidenceRecords(evidenceManifest, base.legacyId, [desiredRecord]).matches).toBe(true);
    expect(compareManifestEvidenceRecords(evidenceManifest, base.legacyId, []).matches).toBe(false);
  });

  it("blocks an actionable proposal affecting more than ten percent of the universe", () => {
    const overThresholdCount = Math.floor(manifest.funds.length * 0.1) + 1;
    const candidates = manifest.funds.slice(0, overThresholdCount).map((fund) => {
      const before = manifestRecordToSnapshot(fund);
      const after = { ...before, investmentStrategy: `${before.investmentStrategy} Reviewed` };
      return candidate("UPDATE", before, after, ["investmentStrategy"]);
    }).sort((left, right) => left.identity.legacyId.localeCompare(right.identity.legacyId));
    const result = parseAndValidateProposal(proposal(candidates), manifest);
    expect(result.issues.map((issue) => issue.code)).toContain("CHANGE_THRESHOLD");
  });

  it("allows rollback only for untouched update before-images", () => {
    expect(rollbackGuard({ legacyId: base.legacyId, before: base, appliedAfter: base, current: base })).toEqual([]);
    expect(rollbackGuard({ legacyId: base.legacyId, before: null, appliedAfter: base, current: base })[0]).toContain("CREATE");
    expect(rollbackGuard({ legacyId: base.legacyId, before: base, appliedAfter: base, current: { ...base, size: "$changed" } })).toEqual([
      `${base.legacyId}: live fund no longer matches the recorded applied image`,
    ]);
    expect(rollbackGuard({ legacyId: base.legacyId, before: base, appliedAfter: base, current: base, laterRevisionId: "revision-2" })[0]).toContain("later revision");
  });

  it("allows rollback manifest changes only inside the original revision scope", () => {
    const affected = manifest.funds[0];
    const unrelated = manifest.funds[1];
    const evidenceRecord = {
      ...evidence(["fundName"])[0],
      legacyId: affected.id,
    };
    const baseEvidence = {
      schemaVersion: 2 as const,
      asOf: "2026-07-22",
      records: [evidenceRecord],
      fundNotes: [],
    };
    const affectedOnly = rollbackManifestScopeBlockers({
      baseManifest: manifest,
      currentManifest: {
        ...manifest,
        funds: manifest.funds.map((fund) => fund.id === affected.id ? { ...fund, size: "restored" } : fund),
      },
      baseEvidence,
      currentEvidence: { ...baseEvidence, records: [] },
      allowedLegacyIds: new Set([affected.id]),
    });
    expect(affectedOnly).toEqual([]);

    const withUnrelatedEdit = rollbackManifestScopeBlockers({
      baseManifest: manifest,
      currentManifest: {
        ...manifest,
        funds: manifest.funds.map((fund) => {
          if (fund.id === affected.id) return { ...fund, size: "restored" };
          if (fund.id === unrelated.id) return { ...fund, size: "unrelated edit" };
          return fund;
        }),
      },
      baseEvidence,
      currentEvidence: {
        ...baseEvidence,
        records: [{
          ...evidenceRecord,
          legacyId: unrelated.id,
          url: "https://example-manager.com/unrelated-fund",
        }],
      },
      allowedLegacyIds: new Set([affected.id]),
    });
    expect(withUnrelatedEdit).toEqual([
      `${unrelated.id}: rollback PR changes unrelated evidence records`,
      `${unrelated.id}: rollback PR changes unrelated fund manifest state`,
    ]);
  });
});
