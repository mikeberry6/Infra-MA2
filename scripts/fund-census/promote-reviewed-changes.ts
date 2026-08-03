import fs from "node:fs";
import path from "node:path";
import {
  loadFundEvidenceManifest,
  loadFundEvidenceManifestAtCommit,
  loadFundManifest,
  loadFundManifestAtCommit,
  validateFundRefreshCandidate,
  type FundEvidenceManifest,
  type FundManifest,
  type ValidationIssue,
} from "../fund-refresh/lib";
import { atomicWrite, REPO_ROOT } from "./lib";
import {
  applyPromotionBatch,
  buildPromotionPlan,
  type AggregateArtifact,
  type LiveOwnershipRow,
  type PromotionPolicy,
} from "./promotion";

interface Options {
  runDirectory: string;
  policyPath: string;
  outputDirectory: string;
  liveAuditPath: string | null;
  reviewBaselineCommit: string | null;
  applyBatch: number | null;
}

function resolveInsideRepo(input: string): string {
  const resolved = path.resolve(REPO_ROOT, input);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path must remain inside the repository: ${input}`);
  }
  return resolved;
}

function parseOptions(argv: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    const equals = argument.indexOf("=");
    if (equals >= 0) {
      values.set(argument.slice(2, equals), argument.slice(equals + 1));
      continue;
    }
    const key = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    values.set(key, value);
    index += 1;
  }
  const runDirectory = values.get("run-dir");
  if (!runDirectory) throw new Error("--run-dir is required");
  const policyPath =
    values.get("policy")
    ?? path.join(runDirectory, "implementation-policy.json");
  const outputDirectory =
    values.get("output-dir")
    ?? path.join(runDirectory, "implementation");
  const applyBatchValue = values.get("apply-batch");
  const applyBatch =
    applyBatchValue === undefined ? null : Number(applyBatchValue);
  if (
    applyBatch !== null
    && (!Number.isInteger(applyBatch) || applyBatch < 1 || applyBatch > 6)
  ) {
    throw new Error("--apply-batch must be an integer from 1 through 6");
  }
  return {
    runDirectory: resolveInsideRepo(runDirectory),
    policyPath: resolveInsideRepo(policyPath),
    outputDirectory: resolveInsideRepo(outputDirectory),
    liveAuditPath: values.has("live-audit")
      ? resolveInsideRepo(values.get("live-audit")!)
      : null,
    reviewBaselineCommit: values.get("review-baseline-commit") ?? null,
    applyBatch,
  };
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function liveOwnershipRows(filePath: string | null): LiveOwnershipRow[] {
  if (!filePath) return [];
  const audit = readJson<{
    database?: {
      ownership?: {
        rows?: LiveOwnershipRow[];
      };
    };
  }>(filePath);
  const rows = audit.database?.ownership?.rows;
  if (!Array.isArray(rows)) {
    throw new Error(
      "--live-audit must be a trusted fund audit generated with "
      + "--include-live-snapshots",
    );
  }
  return rows;
}

function renderOwnershipMarkdown(
  plan: ReturnType<typeof buildPromotionPlan>,
): string {
  const lines = [
    "# Ownership-linked fund rename deferrals",
    "",
    `Source census date: ${plan.sourceAsOfDate}`,
    "",
    "No OwnershipPeriod or portfolio-company mutation is proposed.",
    "",
    "| Legacy ID | Current name | Proposed name | Seed references | Lines | Live exact matches |",
    "|---|---|---|---:|---|---:|",
  ];
  for (const item of plan.ownershipRenameDeferrals) {
    lines.push(
      `| ${item.legacyId} | ${item.currentFundName} | `
      + `${item.proposedFundName} | ${item.seedReferenceCount} | `
      + `${item.seedReferenceLines.join(", ")} | `
      + `${item.liveExactMatchCount} |`,
    );
  }
  lines.push(
    "",
    `Reviewed seed references: ${plan.summary.knownOwnershipReferences}`,
    `Current seed references: ${plan.summary.currentSeedOwnershipReferences}`,
    `Reference drift: ${plan.summary.ownershipReferenceDrift}`,
    "",
  );
  return lines.join("\n");
}

function candidateContractIssues(
  candidate: ReturnType<typeof buildPromotionPlan>["candidates"][number],
): ValidationIssue[] {
  const validation = validateFundRefreshCandidate({
    action: candidate.action,
    identity: {
      legacyId: candidate.legacyId,
      managerName: candidate.after.managerName,
      fundName: candidate.after.fundName,
    },
    before: candidate.before,
    after: candidate.after,
    changedFields: candidate.changedFields,
    evidence: candidate.evidence,
    confidence: candidate.confidence,
    unresolvedQuestions: [],
    ownershipLinkImpact: {
      matchedOwnershipPeriodCount: 0,
      matchedOwnershipVehicles: [],
      linkedOwnershipPeriodCount: 0,
      linkedCompanyIds: [],
      mutationProposed: false,
      notes:
        "Promotion preflight only; the trusted live audit is required "
        + "when the executable proposal is generated.",
    },
  });
  if (validation.zodIssues) {
    return validation.zodIssues.map((issue) => ({
      severity: "error",
      code: "CANDIDATE_SCHEMA",
      legacyId: candidate.legacyId,
      message: `${issue.path.join(".")}: ${issue.message}`,
    }));
  }
  return validation.issues;
}

function batchReadiness(input: {
  plan: ReturnType<typeof buildPromotionPlan>;
  batch: number;
  baseManifest: FundManifest;
  evidenceManifest: FundEvidenceManifest;
  trustedLiveAuditSupplied: boolean;
}) {
  const candidates = input.plan.candidates.filter(
    (candidate) => candidate.batch === input.batch,
  );
  const candidateIds = new Set(
    candidates.map((candidate) => candidate.legacyId),
  );
  const requiredRaisingReviewIds = input.baseManifest.funds
    .filter(
      (fund) => fund.status === "Raising" && !candidateIds.has(fund.id),
    )
    .map((fund) => fund.id)
    .sort();
  const evidenceIds = new Set(
    input.evidenceManifest.records.map((record) => record.legacyId),
  );
  const raisingFundsMissingEvidence = requiredRaisingReviewIds.filter(
    (legacyId) => !evidenceIds.has(legacyId),
  );
  const candidateIssues = candidates.flatMap((candidate) =>
    candidateContractIssues(candidate).map((issue) => ({
      ...issue,
      legacyId: issue.legacyId ?? candidate.legacyId,
    }))
  );
  const blockingCandidateIssues = candidateIssues.filter(
    (issue) => issue.severity === "error",
  );
  const blockers = [
    ...(!input.trustedLiveAuditSupplied
      ? ["TRUSTED_LIVE_AUDIT_REQUIRED"]
      : []),
    ...(blockingCandidateIssues.length > 0
      ? ["ACTION_CANDIDATE_CONTRACT_ERRORS"]
      : []),
    ...(requiredRaisingReviewIds.length > 0
      ? ["RAISING_VERIFY_CANDIDATES_REQUIRED"]
      : []),
    ...(raisingFundsMissingEvidence.length > 0
      ? ["RAISING_EVIDENCE_GAPS"]
      : []),
    ...(input.plan.summary.ownershipReferenceDrift !== 0
      ? ["OWNERSHIP_REFERENCE_DRIFT"]
      : []),
    "SOURCE_REOPEN_AND_HEALTH_CLASSIFICATION_REQUIRED",
    "GPT_5_6_PRO_AND_HUMAN_REVIEW_REQUIRED",
  ];
  return {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_PROMOTION_READINESS",
    batch: input.batch,
    executableProposalReady: false,
    blockers,
    actionCandidates: candidates.length,
    blockingActionIssueCount: blockingCandidateIssues.length,
    candidateIssues,
    requiredRaisingReviewIds,
    raisingFundsMissingEvidence,
    notes: [
      "This is a deterministic promotion preflight, not a FundRefreshProposal.",
      "No OwnershipPeriod or production database mutation is authorized.",
    ],
  };
}

function main(): void {
  const options = parseOptions(process.argv.slice(2));
  const aggregate = readJson<AggregateArtifact>(
    path.join(options.runDirectory, "aggregate.json"),
  );
  const policy = readJson<PromotionPolicy>(options.policyPath);
  if (
    options.reviewBaselineCommit !== null
    && !/^[a-f0-9]{40}$/i.test(options.reviewBaselineCommit)
  ) {
    throw new Error("--review-baseline-commit must be a full Git SHA");
  }
  const manifest = loadFundManifest();
  const reviewBaselineManifest = options.reviewBaselineCommit
    ? loadFundManifestAtCommit(options.reviewBaselineCommit)
    : manifest;
  const evidenceManifest = loadFundEvidenceManifest();
  const reviewBaselineEvidenceManifest = options.reviewBaselineCommit
    ? loadFundEvidenceManifestAtCommit(options.reviewBaselineCommit)
    : evidenceManifest;
  const companySeedSource = fs.readFileSync(
    path.join(REPO_ROOT, "prisma/seed-data/companies.ts"),
    "utf8",
  );
  const plan = buildPromotionPlan({
    aggregate,
    baselineManifest: reviewBaselineManifest,
    policy,
    companySeedSource,
    liveOwnershipRows: liveOwnershipRows(options.liveAuditPath),
  });

  fs.mkdirSync(options.outputDirectory, { recursive: true });
  atomicWrite(
    path.join(options.outputDirectory, "promotion-plan.json"),
    JSON.stringify(plan, null, 2) + "\n",
  );
  atomicWrite(
    path.join(options.outputDirectory, "ownership-rename-deferrals.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        artifactType: "FUND_RENAME_OWNERSHIP_REVIEW",
        sourceAsOfDate: plan.sourceAsOfDate,
        mutationProposed: false,
        reviewedSeedReferences: plan.summary.knownOwnershipReferences,
        totalSeedReferences: plan.summary.currentSeedOwnershipReferences,
        referenceDrift: plan.summary.ownershipReferenceDrift,
        deferrals: plan.ownershipRenameDeferrals,
      },
      null,
      2,
    ) + "\n",
  );
  atomicWrite(
    path.join(options.outputDirectory, "ownership-rename-deferrals.md"),
    renderOwnershipMarkdown(plan),
  );
  let simulatedState = {
    manifest: reviewBaselineManifest,
    evidenceManifest: reviewBaselineEvidenceManifest,
  };
  const readinessByBatch = new Map<
    number,
    ReturnType<typeof batchReadiness>
  >();
  for (const batch of plan.summary.batches) {
    const batchDirectory = path.join(
      options.outputDirectory,
      `batch-${String(batch.batch).padStart(2, "0")}`,
    );
    fs.mkdirSync(batchDirectory, { recursive: true });
    const candidates = plan.candidates.filter(
      (candidate) => candidate.batch === batch.batch,
    );
    atomicWrite(
      path.join(batchDirectory, "change-set.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          artifactType: "FUND_CENSUS_PROMOTION_BATCH",
          sourceAsOfDate: plan.sourceAsOfDate,
          policyHash: plan.policyHash,
          batch: batch.batch,
          summary: batch,
          candidates,
        },
        null,
        2,
      ) + "\n",
    );
    const readiness = batchReadiness({
      plan,
      batch: batch.batch,
      baseManifest: simulatedState.manifest,
      evidenceManifest: simulatedState.evidenceManifest,
      trustedLiveAuditSupplied: options.liveAuditPath !== null,
    });
    readinessByBatch.set(batch.batch, readiness);
    atomicWrite(
      path.join(batchDirectory, "readiness.json"),
      JSON.stringify(readiness, null, 2) + "\n",
    );
    simulatedState = applyPromotionBatch({
      plan,
      batch: batch.batch,
      manifest: simulatedState.manifest,
      evidenceManifest: simulatedState.evidenceManifest,
    });
  }

  if (options.applyBatch !== null) {
    if (options.liveAuditPath === null) {
      throw new Error(
        "--apply-batch requires --live-audit from an authenticated "
        + "trusted successful default-branch artifact",
      );
    }
    const readiness = readinessByBatch.get(options.applyBatch)!;
    const expectedBaseCount = plan.summary.batches.find(
      (batch) => batch.batch === options.applyBatch,
    )!.baseFundCount;
    if (manifest.funds.length !== expectedBaseCount) {
      throw new Error(
        `Batch ${options.applyBatch} requires ${expectedBaseCount} funds `
        + `in its base manifest; found ${manifest.funds.length}`,
      );
    }
    if (readiness.blockingActionIssueCount > 0) {
      throw new Error(
        `Batch ${options.applyBatch} has `
        + `${readiness.blockingActionIssueCount} candidate-contract errors; `
        + "resolve its readiness report before materializing the manifest",
      );
    }
    const applied = applyPromotionBatch({
      plan,
      batch: options.applyBatch,
      manifest,
      evidenceManifest,
    });
    atomicWrite(
      path.join(REPO_ROOT, "prisma/seed-data/funds.manifest.json"),
      JSON.stringify(applied.manifest, null, 2) + "\n",
    );
    atomicWrite(
      path.join(
        REPO_ROOT,
        "prisma/seed-data/fund-evidence.manifest.json",
      ),
      JSON.stringify(applied.evidenceManifest, null, 2) + "\n",
    );
  }

  console.log(JSON.stringify({
    promotionPlan: path.relative(
      REPO_ROOT,
      path.join(options.outputDirectory, "promotion-plan.json"),
    ),
    additions: plan.summary.additions,
    corrections: plan.summary.corrections,
    finalFunds: plan.summary.finalFunds,
    deferredRenames: plan.summary.deferredRenames,
    appliedBatch: options.applyBatch,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
