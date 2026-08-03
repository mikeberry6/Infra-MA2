import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fundRefreshProposalSchema, type FundRefreshCandidate, type FundRefreshSnapshot } from "../src/modules/funds/refresh-schema";
import { renderFundRefreshFieldDiffCsv, renderFundRefreshProReviewPacket } from "./fund-refresh/artifacts";
import {
  REPO_ROOT,
  parseCliArgs,
  proposalHash,
  requiredString,
} from "./fund-refresh/lib";

function repoPath(input: string): string {
  const resolved = path.resolve(REPO_ROOT, input);
  const relative = path.relative(REPO_ROOT, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Fund refresh artifacts must be files inside the repository");
  }
  return resolved;
}

function sortedSnapshot(snapshot: FundRefreshSnapshot | null): FundRefreshSnapshot | null {
  if (!snapshot) return null;
  return {
    ...snapshot,
    strategies: [...snapshot.strategies].sort() as FundRefreshSnapshot["strategies"],
    sectors: [...snapshot.sectors].sort() as FundRefreshSnapshot["sectors"],
    regions: [...snapshot.regions].sort() as FundRefreshSnapshot["regions"],
    sourceUrls: [...snapshot.sourceUrls].sort(),
  };
}

function sortedCandidate(candidate: FundRefreshCandidate): FundRefreshCandidate {
  return {
    ...candidate,
    before: sortedSnapshot(candidate.before),
    after: sortedSnapshot(candidate.after),
    changedFields: [...candidate.changedFields].sort(),
    evidence: candidate.evidence.map((evidence) => ({
      ...evidence,
      supportedFields: [...evidence.supportedFields].sort(),
    })).sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel)),
    unresolvedQuestions: [...candidate.unresolvedQuestions].sort(),
    ownershipLinkImpact: {
      ...candidate.ownershipLinkImpact,
      matchedOwnershipVehicles: [...candidate.ownershipLinkImpact.matchedOwnershipVehicles].sort(),
      linkedCompanyIds: [...candidate.ownershipLinkImpact.linkedCompanyIds].sort(),
    },
  };
}

function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const inputPath = repoPath(requiredString(args, "proposal"));
  const outputPath = typeof args.get("output") === "string" ? repoPath(String(args.get("output"))) : inputPath;
  const raw = JSON.parse(readFileSync(inputPath, "utf8")) as Record<string, unknown>;
  const candidates = Array.isArray(raw.candidates)
    ? (raw.candidates as FundRefreshCandidate[]).map(sortedCandidate).sort((left, right) =>
        left.identity.legacyId.localeCompare(right.identity.legacyId) || left.action.localeCompare(right.action),
      )
    : [];
  const unresolvedCandidates = candidates.filter((candidate) =>
    candidate.unresolvedQuestions.length > 0 || candidate.confidence !== "HIGH" || candidate.action === "ARCHIVE_REVIEW",
  ).length;
  const draft = {
    ...raw,
    coverage: {
      ...(raw.coverage as Record<string, unknown>),
      candidates: candidates.length,
      unresolvedCandidates,
    },
    candidates,
  };
  const finalized = { ...draft, proposalHash: proposalHash(draft as any) };
  const parsed = fundRefreshProposalSchema.parse(finalized);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(parsed, null, 2) + "\n");

  const diffOutput = args.get("diff-output");
  if (typeof diffOutput !== "string") {
    throw new Error("--diff-output is required and must match proposal.artifacts.fieldDiffCsv");
  }
  if (path.relative(REPO_ROOT, repoPath(diffOutput)) !== parsed.artifacts.fieldDiffCsv) {
    throw new Error("--diff-output must exactly match proposal.artifacts.fieldDiffCsv");
  }
  const resolvedDiff = repoPath(diffOutput);
  mkdirSync(path.dirname(resolvedDiff), { recursive: true });
  writeFileSync(resolvedDiff, renderFundRefreshFieldDiffCsv(parsed));

  const proReviewPath = repoPath(parsed.artifacts.proReviewPacket);
  mkdirSync(path.dirname(proReviewPath), { recursive: true });
  writeFileSync(proReviewPath, renderFundRefreshProReviewPacket(parsed));
  console.log(JSON.stringify({ proposal: path.relative(REPO_ROOT, outputPath), proposalHash: parsed.proposalHash, candidates: parsed.candidates.length }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
