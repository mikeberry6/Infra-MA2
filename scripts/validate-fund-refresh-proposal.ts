import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  REPO_ROOT,
  canonicalManagerKey,
  canonicalJson,
  formatZodIssues,
  loadFundEvidenceManifest,
  loadFundEvidenceManifestAtCommit,
  loadFundManifest,
  loadFundManifestAtCommit,
  managerCohort,
  manifestRecordToSnapshot,
  normalizeIdentity,
  parseAndValidateProposal,
  parseCliArgs,
  proposalHash,
  requiredString,
  snapshotChangedFields,
  validateFundEvidenceManifest,
  type ValidationIssue,
  utcCalendarDate,
} from "./fund-refresh/lib";
import {
  artifactValuesEqual,
  expectedOwnershipArtifact,
  fundRefreshCoverageArtifactSchema,
  fundRefreshOwnershipArtifactSchema,
  fundRefreshSourceHealthArtifactSchema,
  renderFundRefreshFieldDiffCsv,
  renderFundRefreshProReviewPacket,
} from "./fund-refresh/artifacts";
import { fundRefreshProposalSchema } from "../src/modules/funds/refresh-schema";

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }).trim();
}

interface TrustedPriorCoverage {
  runId: string;
  researchWindowEnd: string;
  managerCohort: "ALL" | 0 | 1 | 2 | 3;
  catchUpManagerCohorts: number[];
}

function trustedPriorCoverageAtBase(
  baseCommit: string,
  currentResearchEnd: string,
): TrustedPriorCoverage[] {
  let paths: string[] = [];
  try {
    paths = git("ls-tree", "-r", "--name-only", baseCommit, "--", "audits/fund-refresh")
      .split("\n")
      .filter((value) => /\/coverage\.json$/.test(value));
  } catch {
    return [];
  }
  if (paths.length > 1_000) throw new Error("Refusing to inspect more than 1,000 prior fund-refresh coverage artifacts");

  const trusted = new Map<string, TrustedPriorCoverage>();
  for (const coveragePath of paths) {
    try {
      const coverageContents = git("show", `${baseCommit}:${coveragePath}`);
      const coverage = fundRefreshCoverageArtifactSchema.parse(JSON.parse(coverageContents));
      const proposalPath = `${path.posix.dirname(coveragePath)}/proposal.json`;
      const proposalContents = git("show", `${baseCommit}:${proposalPath}`);
      const priorProposal = fundRefreshProposalSchema.parse(JSON.parse(proposalContents));
      if (
        priorProposal.artifacts.coverageReport !== coveragePath ||
        coverage.runId !== priorProposal.runId ||
        coverage.proposalHash !== priorProposal.proposalHash ||
        coverage.researchWindow.end !== priorProposal.researchWindow.end ||
        coverage.managerCohort !== priorProposal.coverage.managerCohort ||
        coverage.researchWindow.end >= currentResearchEnd
      ) {
        continue;
      }
      trusted.set(coverage.runId, {
        runId: coverage.runId,
        researchWindowEnd: coverage.researchWindow.end,
        managerCohort: coverage.managerCohort as "ALL" | 0 | 1 | 2 | 3,
        catchUpManagerCohorts: [...coverage.catchUpManagerCohorts],
      });
    } catch {
      // An incomplete or legacy artifact is not trusted as successful coverage.
      // Omitting it only increases the catch-up requirement for the current run.
    }
  }
  return [...trusted.values()].sort((left, right) =>
    right.researchWindowEnd.localeCompare(left.researchWindowEnd) || right.runId.localeCompare(left.runId),
  );
}

function resolveProposalPath(input: string): string {
  const resolved = path.resolve(REPO_ROOT, input);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Proposal path must be inside the repository");
  }
  return resolved;
}

function writeJson(filePath: string, value: unknown) {
  const resolved = path.resolve(REPO_ROOT, filePath);
  mkdirSync(path.dirname(resolved), { recursive: true });
  writeFileSync(resolved, JSON.stringify(value, null, 2) + "\n");
}

function validateManifestAgreement(
  proposal: NonNullable<ReturnType<typeof parseAndValidateProposal>["proposal"]>,
  issues: ValidationIssue[],
) {
  const manifest = loadFundManifest();
  const desiredById = new Map(manifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]));
  for (const candidate of proposal.candidates) {
    if (!["CREATE", "UPDATE", "VERIFY_NO_CHANGE"].includes(candidate.action)) continue;
    const desired = desiredById.get(candidate.identity.legacyId);
    if (!desired || !candidate.after || JSON.stringify(desired) !== JSON.stringify(candidate.after)) {
      issues.push({
        severity: "error",
        code: "MANIFEST_PROPOSAL_DRIFT",
        legacyId: candidate.identity.legacyId,
        message: "The merged fund manifest must exactly match the candidate after snapshot",
      });
    }
  }
}

function validateArtifactSet(
  proposal: NonNullable<ReturnType<typeof parseAndValidateProposal>["proposal"]>,
  proposalPath: string,
  issues: ValidationIssue[],
) {
  const proposalDirectory = path.dirname(proposalPath);
  const contentsByLabel = new Map<string, string>();
  for (const [label, artifact] of Object.entries(proposal.artifacts)) {
    const resolved = path.resolve(REPO_ROOT, artifact);
    const relative = path.relative(REPO_ROOT, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative) || path.dirname(resolved) !== proposalDirectory) {
      issues.push({ severity: "error", code: "ARTIFACT_PATH", message: `${label} must be a sibling of the proposal inside its run directory` });
      continue;
    }
    try {
      const stat = lstatSync(resolved);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("not a regular file");
      const contents = readFileSync(resolved, "utf8");
      contentsByLabel.set(label, contents);
      if (!contents.includes(proposal.runId) || !contents.includes(proposal.proposalHash)) {
        issues.push({ severity: "error", code: "ARTIFACT_BINDING", message: `${label} must contain the exact runId and proposalHash` });
      }
    } catch (error) {
      issues.push({ severity: "error", code: "ARTIFACT_MISSING", message: `${label} is unavailable: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  const fieldDiff = contentsByLabel.get("fieldDiffCsv");
  if (fieldDiff !== undefined && fieldDiff !== renderFundRefreshFieldDiffCsv(proposal)) {
    issues.push({ severity: "error", code: "FIELD_DIFF_TAMPERED", message: "fieldDiffCsv must byte-for-byte match the deterministic proposal diff" });
  }
  const proReviewPacket = contentsByLabel.get("proReviewPacket");
  if (proReviewPacket !== undefined && proReviewPacket !== renderFundRefreshProReviewPacket(proposal)) {
    issues.push({ severity: "error", code: "PRO_REVIEW_PACKET_TAMPERED", message: "proReviewPacket must byte-for-byte match the deterministic mandatory and 10% review pools" });
  }

  const parseStructured = <T,>(label: string, schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { message: string } } }): T | null => {
    const contents = contentsByLabel.get(label);
    if (contents === undefined) return null;
    try {
      const parsed = schema.safeParse(JSON.parse(contents));
      if (!parsed.success) {
        issues.push({ severity: "error", code: "ARTIFACT_SCHEMA", message: `${label} failed its strict schema: ${parsed.error.message}` });
        return null;
      }
      return parsed.data;
    } catch (error) {
      issues.push({ severity: "error", code: "ARTIFACT_SCHEMA", message: `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}` });
      return null;
    }
  };

  const coverage = parseStructured("coverageReport", fundRefreshCoverageArtifactSchema);
  if (coverage) {
    const expectedCoverage = {
      runId: proposal.runId,
      proposalHash: proposal.proposalHash,
      researchWindow: proposal.researchWindow,
      managerCohort: proposal.coverage.managerCohort,
      knownManagerKeys: proposal.coverage.knownManagerKeys,
      raisingFundIds: proposal.coverage.raisingFundIds,
      searchedManagerKeys: proposal.coverage.searchedManagerKeys,
    };
    const actualCoverage = {
      runId: coverage.runId,
      proposalHash: coverage.proposalHash,
      researchWindow: coverage.researchWindow,
      managerCohort: coverage.managerCohort,
      knownManagerKeys: coverage.knownManagerKeys,
      raisingFundIds: coverage.raisingFundIds,
      searchedManagerKeys: coverage.searchedManagerKeys,
    };
    if (!artifactValuesEqual(actualCoverage, expectedCoverage)) {
      issues.push({ severity: "error", code: "COVERAGE_ARTIFACT_DRIFT", message: "coverageReport does not exactly match proposal coverage identities, cohort, window, run, and hash" });
    }
    if (coverage.sourceFailures.length !== proposal.coverage.sourceFailures) {
      issues.push({ severity: "error", code: "SOURCE_FAILURE_COUNT_DRIFT", message: `coverageReport contains ${coverage.sourceFailures.length} source failures; proposal reports ${proposal.coverage.sourceFailures}` });
    }
    const catchUpCohorts = [...new Set(coverage.catchUpManagerCohorts)].sort();
    if (!artifactValuesEqual(catchUpCohorts, coverage.catchUpManagerCohorts)) {
      issues.push({ severity: "error", code: "CATCH_UP_COHORT_ORDER", message: "coverageReport.catchUpManagerCohorts must be sorted and unique" });
    }
    const searched = new Set(proposal.coverage.searchedManagerKeys);
    const missingCatchUpManagers = proposal.coverage.knownManagerKeys.filter((managerKey) =>
      coverage.catchUpManagerCohorts.includes(managerCohort(managerKey)) && !searched.has(managerKey),
    );
    if (missingCatchUpManagers.length > 0) {
      issues.push({ severity: "error", code: "CATCH_UP_COHORT_INCOMPLETE", message: `Declared catch-up cohorts omit managers: ${missingCatchUpManagers.join(", ")}` });
    }
    const trustedHistory = trustedPriorCoverageAtBase(proposal.baseCommit, proposal.researchWindow.end);
    const expectedPriorHistory = trustedHistory.slice(0, 4);
    if (!artifactValuesEqual(coverage.priorSuccessfulCoverage, expectedPriorHistory)) {
      issues.push({
        severity: "error",
        code: "PRIOR_COVERAGE_HISTORY_DRIFT",
        message: "coverageReport.priorSuccessfulCoverage must exactly list the four newest trusted coverage artifacts at proposal.baseCommit",
      });
    }

    const currentEnd = Date.parse(`${proposal.researchWindow.end}T00:00:00.000Z`);
    const fourWeekStart = new Date(currentEnd - 27 * 86_400_000).toISOString().slice(0, 10);
    const recentHistory = trustedHistory.filter((item) => item.researchWindowEnd >= fourWeekStart);
    const coveredBeforeCatchUp = new Set<number>();
    for (const item of recentHistory) {
      if (item.managerCohort === "ALL") [0, 1, 2, 3].forEach((cohort) => coveredBeforeCatchUp.add(cohort));
      else coveredBeforeCatchUp.add(item.managerCohort);
      item.catchUpManagerCohorts.forEach((cohort) => coveredBeforeCatchUp.add(cohort));
    }
    if (proposal.coverage.managerCohort === "ALL") [0, 1, 2, 3].forEach((cohort) => coveredBeforeCatchUp.add(cohort));
    else coveredBeforeCatchUp.add(proposal.coverage.managerCohort);
    const requiredCatchUps = [0, 1, 2, 3].filter((cohort) => !coveredBeforeCatchUp.has(cohort));
    if (!artifactValuesEqual(coverage.catchUpManagerCohorts, requiredCatchUps)) {
      issues.push({
        severity: "error",
        code: "CATCH_UP_COHORT_DRIFT",
        message: `coverageReport must declare the exact cohorts absent from trusted four-week coverage: ${requiredCatchUps.join(", ") || "none"}`,
      });
    }

    const endDate = new Date(`${proposal.researchWindow.end}T00:00:00.000Z`);
    const quarterStart = new Date(Date.UTC(endDate.getUTCFullYear(), Math.floor(endDate.getUTCMonth() / 3) * 3, 1))
      .toISOString().slice(0, 10);
    const quarterAlreadyHasAll = trustedHistory.some((item) =>
      item.researchWindowEnd >= quarterStart && item.managerCohort === "ALL",
    );
    if (!quarterAlreadyHasAll && proposal.coverage.managerCohort !== "ALL") {
      issues.push({
        severity: "error",
        code: "QUARTERLY_ALL_COVERAGE_REQUIRED",
        message: "No trusted ALL coverage artifact exists in the current quarter; this run must review the complete manager universe",
      });
    }
  }

  const sourceHealth = parseStructured("sourceHealthReport", fundRefreshSourceHealthArtifactSchema);
  if (sourceHealth) {
    if (sourceHealth.runId !== proposal.runId || sourceHealth.proposalHash !== proposal.proposalHash) {
      issues.push({ severity: "error", code: "SOURCE_HEALTH_BINDING", message: "sourceHealthReport runId/proposalHash does not match the proposal" });
    }
    const key = (value: { legacyId: string; sourceId: string; url: string; evidenceLabel: string }) =>
      `${value.legacyId}\u0000${value.sourceId}\u0000${value.url}\u0000${value.evidenceLabel}`;
    const sourceHealthByKey = new Map(sourceHealth.sources.map((source) => [key(source), source]));
    if (sourceHealthByKey.size !== sourceHealth.sources.length) {
      issues.push({ severity: "error", code: "SOURCE_HEALTH_DUPLICATE", message: "sourceHealthReport contains duplicate fund/source/evidence-label rows" });
    }
    for (const candidate of proposal.candidates) {
      for (const evidence of candidate.evidence) {
        const health = sourceHealthByKey.get(key({ legacyId: candidate.identity.legacyId, ...evidence }));
        if (!health) {
          issues.push({ severity: "error", code: "SOURCE_HEALTH_MISSING", legacyId: candidate.identity.legacyId, message: `sourceHealthReport omits reviewed evidence ${evidence.url} (${evidence.evidenceLabel})` });
          continue;
        }
        if (health.status === "FAILED" || health.status === "BLOCKED") {
          issues.push({ severity: "error", code: "UNOPENED_CANDIDATE_EVIDENCE", legacyId: candidate.identity.legacyId, message: `Candidate evidence is marked ${health.status}: ${evidence.url}` });
        }
        const checkedDate = utcCalendarDate(health.checkedAt);
        if (checkedDate < proposal.researchWindow.start || checkedDate > proposal.researchWindow.end) {
          issues.push({ severity: "error", code: "SOURCE_HEALTH_WINDOW", legacyId: candidate.identity.legacyId, message: `Source check falls outside the research window: ${evidence.url}` });
        }
      }
    }
    if (coverage) {
      const failedUrls = new Set(sourceHealth.sources
        .filter((source) => source.status === "FAILED" || source.status === "BLOCKED")
        .map((source) => source.url));
      for (const failure of coverage.sourceFailures.filter((item) => item.url !== null)) {
        if (!failedUrls.has(failure.url!)) {
          issues.push({ severity: "error", code: "SOURCE_FAILURE_UNREPRESENTED", message: `coverageReport failure is not marked failed/blocked in sourceHealthReport: ${failure.url}` });
        }
      }
      const declaredFailureUrls = new Set(coverage.sourceFailures.flatMap((failure) => failure.url ? [failure.url] : []));
      for (const failedUrl of failedUrls) {
        if (!declaredFailureUrls.has(failedUrl)) {
          issues.push({ severity: "error", code: "SOURCE_HEALTH_FAILURE_UNDECLARED", message: `sourceHealthReport failed/blocked URL is absent from coverageReport.sourceFailures: ${failedUrl}` });
        }
      }
    }
  }

  const ownership = parseStructured("ownershipImpactReport", fundRefreshOwnershipArtifactSchema);
  if (ownership) {
    if (ownership.runId !== proposal.runId || ownership.proposalHash !== proposal.proposalHash) {
      issues.push({ severity: "error", code: "OWNERSHIP_ARTIFACT_BINDING", message: "ownershipImpactReport runId/proposalHash does not match the proposal" });
    }
    if (!artifactValuesEqual(ownership.candidates, expectedOwnershipArtifact(proposal))) {
      issues.push({ severity: "error", code: "OWNERSHIP_ARTIFACT_DRIFT", message: "ownershipImpactReport does not exactly match every proposal candidate's ownership assessment" });
    }
  }
}

function validateDesiredStateDiff(
  proposal: NonNullable<ReturnType<typeof parseAndValidateProposal>["proposal"]>,
  issues: ValidationIssue[],
) {
  const currentManifest = loadFundManifest();
  const baseManifest = loadFundManifestAtCommit(proposal.baseCommit);
  const currentEvidence = loadFundEvidenceManifest();
  const baseEvidence = loadFundEvidenceManifestAtCommit(proposal.baseCommit);
  const candidatesById = new Map(proposal.candidates.map((candidate) => [candidate.identity.legacyId, candidate]));

  const baseFunds = new Map(baseManifest.funds.map((fund) => [fund.id, fund]));
  const currentFunds = new Map(currentManifest.funds.map((fund) => [fund.id, fund]));
  const changedFundIds = [...new Set([...baseFunds.keys(), ...currentFunds.keys()])]
    .filter((legacyId) => canonicalJson(baseFunds.get(legacyId) ?? null) !== canonicalJson(currentFunds.get(legacyId) ?? null))
    .sort();
  for (const legacyId of changedFundIds) {
    const candidate = candidatesById.get(legacyId);
    if (!candidate || (candidate.action !== "CREATE" && candidate.action !== "UPDATE")) {
      issues.push({ severity: "error", code: "UNREPRESENTED_MANIFEST_EDIT", legacyId, message: "Every base-to-HEAD fund manifest edit requires a CREATE or UPDATE candidate" });
      continue;
    }
    const baseFund = baseFunds.get(legacyId);
    const currentFund = currentFunds.get(legacyId);
    if (baseFund && currentFund && canonicalJson(baseFund.portfolioCompanies) !== canonicalJson(currentFund.portfolioCompanies)) {
      issues.push({ severity: "error", code: "OWNERSHIP_MANIFEST_EDIT", legacyId, message: "Fund refresh proposals cannot alter portfolioCompanies/ownership desired state" });
    }
    if (!baseFund && currentFund && currentFund.portfolioCompanies.length > 0) {
      issues.push({ severity: "error", code: "OWNERSHIP_MANIFEST_EDIT", legacyId, message: "Automated CREATE candidates cannot introduce portfolioCompanies/ownership desired state" });
    }
  }

  const groupEvidenceByFund = (records: typeof currentEvidence.records) => {
    const grouped = new Map<string, typeof records>();
    for (const record of records) {
      const fundRecords = grouped.get(record.legacyId) ?? [];
      fundRecords.push(record);
      grouped.set(record.legacyId, fundRecords);
    }
    return grouped;
  };
  const baseEvidenceById = groupEvidenceByFund(baseEvidence.records);
  const currentEvidenceById = groupEvidenceByFund(currentEvidence.records);
  const baseNotesById = new Map(baseEvidence.fundNotes.map((note) => [note.legacyId, note]));
  const currentNotesById = new Map(currentEvidence.fundNotes.map((note) => [note.legacyId, note]));
  const evidenceKey = (record: { sourceId: string; url: string; evidenceLabel: string }) =>
    `${record.sourceId}\u0000${record.url}\u0000${record.evidenceLabel}`;
  const evidenceSemantics = (record: {
    supportedFields: string[];
    sourceTier: string;
    scope: string;
    publishedAt: string | null;
    retrievedAt: string;
    confidence: string;
    evidenceLabel: string;
  }) => ({
    supportedFields: [...record.supportedFields].sort(),
    sourceTier: record.sourceTier,
    scope: record.scope,
    publishedAt: record.publishedAt,
    retrievedAt: record.retrievedAt,
    confidence: record.confidence,
    evidenceLabel: record.evidenceLabel,
  });
  const evidenceStateIds = new Set([
    ...baseEvidenceById.keys(),
    ...currentEvidenceById.keys(),
    ...baseNotesById.keys(),
    ...currentNotesById.keys(),
  ]);
  const changedEvidenceIds = [...evidenceStateIds]
    .filter((legacyId) => canonicalJson({
      records: baseEvidenceById.get(legacyId) ?? [],
      note: baseNotesById.get(legacyId) ?? null,
    }) !== canonicalJson({
      records: currentEvidenceById.get(legacyId) ?? [],
      note: currentNotesById.get(legacyId) ?? null,
    }))
    .sort();
  for (const legacyId of changedEvidenceIds) {
    const candidate = candidatesById.get(legacyId);
    if (!candidate || candidate.evidence.length === 0) {
      issues.push({ severity: "error", code: "UNREPRESENTED_EVIDENCE_EDIT", legacyId, message: "Every base-to-HEAD evidence manifest edit requires candidate evidence" });
      continue;
    }
    const desiredEvidence = currentEvidenceById.get(legacyId) ?? [];
    if (desiredEvidence.length === 0) {
      issues.push({ severity: "error", code: "EVIDENCE_RECORD_REMOVAL", legacyId, message: "Fund refresh proposals cannot remove evidence manifest records" });
      continue;
    }
    const baseByKey = new Map((baseEvidenceById.get(legacyId) ?? []).map((record) => [evidenceKey(record), record]));
    const desiredByKey = new Map(desiredEvidence.map((record) => [evidenceKey(record), record]));
    const proposedByKey = new Map(candidate.evidence.map((record) => [evidenceKey(record), record]));
    const removedKeys = [...baseByKey.keys()].filter((key) => !desiredByKey.has(key)).sort();
    if (removedKeys.length > 0) {
      issues.push({
        severity: "error",
        code: "EVIDENCE_RECORD_REMOVAL",
        legacyId,
        message: `Fund refresh proposals cannot remove evidence keys: ${removedKeys.join(", ")}`,
      });
    }
    const changedDesiredRecords = desiredEvidence.filter((record) => {
      const previous = baseByKey.get(evidenceKey(record));
      return canonicalJson(previous ? evidenceSemantics(previous) : null) !== canonicalJson(evidenceSemantics(record));
    });
    for (const desired of changedDesiredRecords) {
      const proposed = proposedByKey.get(evidenceKey(desired));
      if (!proposed || canonicalJson(evidenceSemantics(proposed)) !== canonicalJson(evidenceSemantics(desired))) {
        issues.push({
          severity: "error",
          code: "UNREPRESENTED_EVIDENCE_EDIT",
          legacyId,
          message: `Changed desired-state evidence is absent from or differs from the proposal: ${desired.url} (${desired.evidenceLabel})`,
        });
      }
    }
  }
  for (const candidate of proposal.candidates.filter((item) => item.evidence.length > 0)) {
    const desiredEvidence = currentEvidenceById.get(candidate.identity.legacyId) ?? [];
    if (desiredEvidence.length === 0) {
      issues.push({ severity: "error", code: "CANDIDATE_EVIDENCE_NOT_VERSIONED", legacyId: candidate.identity.legacyId, message: "Candidate evidence requires a desired-state evidence manifest record" });
      continue;
    }
    const expectedByKey = new Map(desiredEvidence.map((record) => [evidenceKey(record), record]));
    const proposedByKey = new Map(candidate.evidence.map((evidence) => [evidenceKey(evidence), evidence]));
    for (const [key, proposed] of proposedByKey) {
      const desired = expectedByKey.get(key);
      if (!desired) {
        issues.push({ severity: "error", code: "CANDIDATE_EVIDENCE_NOT_VERSIONED", legacyId: candidate.identity.legacyId, message: `Candidate evidence is absent from desired state: ${proposed.url} (${proposed.evidenceLabel})` });
        continue;
      }
      if (canonicalJson(evidenceSemantics(desired)) !== canonicalJson(evidenceSemantics(proposed))) {
        issues.push({ severity: "error", code: "EVIDENCE_MANIFEST_PROPOSAL_DRIFT", legacyId: candidate.identity.legacyId, message: `Desired-state evidence semantics do not match proposal source ${proposed.url}` });
      }
    }
  }
  if (currentEvidence.asOf !== baseEvidence.asOf && changedEvidenceIds.length === 0) {
    issues.push({ severity: "error", code: "UNREPRESENTED_EVIDENCE_AS_OF", message: "Evidence asOf changed without a reviewed evidence record change" });
  }
}

function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const proposalInput = requiredString(args, "proposal");
  const proposalPath = resolveProposalPath(proposalInput);
  const raw = JSON.parse(readFileSync(proposalPath, "utf8")) as unknown;
  const manifest = loadFundManifest();
  const evidence = loadFundEvidenceManifest();
  let result = parseAndValidateProposal(raw, manifest);
  if (result.proposal) {
    try {
      const coverageManifest = loadFundManifestAtCommit(result.proposal.baseCommit);
      result = parseAndValidateProposal(raw, manifest, coverageManifest);
    } catch {
      // The explicit BASE_MANIFEST_UNAVAILABLE finding below remains the
      // authoritative fail-closed diagnostic.
    }
  }
  const issues = result.zodIssues ? formatZodIssues(result.zodIssues) : [...result.issues];
  issues.push(...validateFundEvidenceManifest(evidence));

  if (result.proposal) {
    const proposal = result.proposal;
    const expectedHash = args.get("expected-sha256");
    if (typeof expectedHash === "string" && proposal.proposalHash !== expectedHash.toLowerCase()) {
      issues.push({ severity: "error", code: "EXPECTED_HASH_MISMATCH", message: "Proposal hash does not match --expected-sha256" });
    }
    const expectedHead = args.get("expected-head-sha");
    if (typeof expectedHead === "string") {
      const actualHead = git("rev-parse", "HEAD");
      if (actualHead !== expectedHead.toLowerCase()) {
        issues.push({ severity: "error", code: "HEAD_SHA_MISMATCH", message: `Checked-out HEAD is ${actualHead}, not ${expectedHead}` });
      }
    }
    try {
      git("merge-base", "--is-ancestor", proposal.baseCommit, "HEAD");
    } catch {
      issues.push({ severity: "error", code: "BASE_NOT_ANCESTOR", message: "Proposal baseCommit is not an ancestor of HEAD" });
    }
    const evidenceFundCount = new Set(evidence.records.map((record) => record.legacyId)).size;
    if (proposal.coverage.evidenceFunds !== evidenceFundCount) {
      issues.push({ severity: "error", code: "EVIDENCE_COUNT", message: `Coverage says ${proposal.coverage.evidenceFunds} evidence funds; found ${evidenceFundCount}` });
    }
    try {
      const baseManifest = loadFundManifestAtCommit(proposal.baseCommit);
      if (proposal.coverage.manifestFunds !== baseManifest.funds.length) {
        issues.push({ severity: "error", code: "MANIFEST_COUNT", message: `Coverage says ${proposal.coverage.manifestFunds} base funds; found ${baseManifest.funds.length}` });
      }
      const expectedKnownManagers = new Set(baseManifest.funds.map((fund) => canonicalManagerKey(fund.managerName))).size;
      if (proposal.coverage.knownManagers !== expectedKnownManagers) {
        issues.push({ severity: "error", code: "KNOWN_MANAGER_COUNT", message: `Coverage says ${proposal.coverage.knownManagers} base managers; found ${expectedKnownManagers}` });
      }
      const expectedRaisingFunds = baseManifest.funds.filter((fund) => fund.status === "Raising").length;
      if (proposal.coverage.raisingFunds !== expectedRaisingFunds) {
        issues.push({ severity: "error", code: "RAISING_FUND_COUNT", message: `Coverage says ${proposal.coverage.raisingFunds} base raising funds; found ${expectedRaisingFunds}` });
      }
      const actionableCount = proposal.candidates.filter((candidate) => candidate.action === "CREATE" || candidate.action === "UPDATE").length;
      if (baseManifest.funds.length > 0 && actionableCount / baseManifest.funds.length > 0.1) {
        issues.push({
          severity: "error",
          code: "CHANGE_THRESHOLD_BASE",
          message: `Actionable changes affect ${actionableCount}/${baseManifest.funds.length} reviewed base funds (>10%)`,
        });
      }
      const baseManagers = new Set(baseManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)));
      for (const candidate of proposal.candidates) {
        if (!baseManagers.has(canonicalManagerKey(candidate.identity.managerName))) {
          issues.push({
            severity: "error",
            code: "UNKNOWN_BASE_MANAGER",
            legacyId: candidate.identity.legacyId,
            message: `${candidate.identity.managerName} was not a reviewed manager at proposal.baseCommit`,
          });
        }
      }
    } catch (error) {
      issues.push({
        severity: "error",
        code: "BASE_MANIFEST_UNAVAILABLE",
        message: error instanceof Error ? error.message : String(error),
      });
    }
    const start = Date.parse(`${proposal.researchWindow.start}T00:00:00Z`);
    const end = Date.parse(`${proposal.researchWindow.end}T00:00:00Z`);
    if ((end - start) / 86_400_000 !== 9) {
      issues.push({ severity: "error", code: "RESEARCH_WINDOW", message: "Research window must cover ten inclusive calendar days" });
    }
    validateManifestAgreement(proposal, issues);
    validateDesiredStateDiff(proposal, issues);
    validateArtifactSet(proposal, proposalPath, issues);
  }

  const report = {
    valid: issues.every((issue) => issue.severity !== "error"),
    proposalPath: path.relative(REPO_ROOT, proposalPath),
    proposalHash: result.proposal ? proposalHash(result.proposal) : null,
    runId: result.proposal?.runId ?? null,
    prNumber: typeof args.get("pr-number") === "string" ? Number(args.get("pr-number")) : null,
    candidateCount: result.proposal?.candidates.length ?? 0,
    changedFieldCount: result.proposal?.candidates.reduce((sum, candidate) => sum + snapshotChangedFields(candidate.before, candidate.after).length, 0) ?? 0,
    issues,
  };

  const output = args.get("output");
  if (typeof output === "string") writeJson(output, report);
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
