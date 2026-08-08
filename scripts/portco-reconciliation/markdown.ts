import type {
  CanonicalLedger,
  ReconciliationProposal,
} from "./schema";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function markdownCell(value: string | number | null): string {
  if (value === null || value === "") return "—";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function bulletList(values: readonly string[]): string {
  return values.length > 0
    ? values.map((value) => `- ${value}`).join("\n")
    : "- None";
}

export function renderCanonicalLedgerMarkdown(ledger: CanonicalLedger): string {
  const censusCounts = Object.entries(ledger.summary.censusDispositionCounts)
    .sort(([left], [right]) => compareText(left, right))
    .map(([disposition, count]) => `| ${markdownCell(disposition)} | ${count} |`)
    .join("\n");
  const repoCounts = Object.entries(ledger.summary.repoDispositionCounts)
    .sort(([left], [right]) => compareText(left, right))
    .map(([disposition, count]) => `| ${markdownCell(disposition)} | ${count} |`)
    .join("\n");
  const repoOnlyCounts = Object.entries(ledger.summary.repoOnlyDispositionCounts)
    .sort(([left], [right]) => compareText(left, right))
    .map(([disposition, count]) => `| ${markdownCell(disposition)} | ${count} |`)
    .join("\n");
  const censusRows = [...ledger.censusRows]
    .sort((left, right) =>
      left.managerIndex - right.managerIndex
      || compareText(left.companyName, right.companyName)
      || compareText(left.holdingId, right.holdingId))
    .map((row) =>
      `| ${row.managerIndex} | ${markdownCell(row.requestedManager)} | ${markdownCell(row.companyName)} | ${markdownCell(row.disposition)} | ${markdownCell(row.canonicalKey)} | ${markdownCell(row.rationale)} |`)
    .join("\n");
  const repoRows = [...ledger.repoRows]
    .sort((left, right) =>
      compareText(left.companyName, right.companyName)
      || compareText(left.repoRowId, right.repoRowId))
    .map((row) =>
      `| ${markdownCell(row.companyName)} | ${markdownCell(row.sourcePresence)} | ${markdownCell(row.productionCompanyId)} | ${markdownCell(row.seedKey)} | ${markdownCell(row.disposition)} | ${markdownCell(row.canonicalKey)} |`)
    .join("\n");
  const repoOnlyRows = [...ledger.repoOnlyRows]
    .sort((left, right) =>
      left.managerIndex - right.managerIndex
      || left.sourceOrdinal - right.sourceOrdinal
      || compareText(left.repoOnlyId, right.repoOnlyId))
    .map((row) =>
      `| ${row.managerIndex} | ${markdownCell(row.requestedManager)} | ${markdownCell(row.companyName)} | ${markdownCell(row.sourceDisposition)} | ${markdownCell(row.disposition)} | ${markdownCell(row.canonicalKey)} | ${markdownCell(row.rationale)} |`)
    .join("\n");
  const companies = [...ledger.canonicalCompanies]
    .sort((left, right) =>
      compareText(left.displayName, right.displayName)
      || compareText(left.country, right.country)
      || compareText(left.canonicalKey, right.canonicalKey))
    .map((company) => [
      `### ${company.displayName}`,
      "",
      `- Country: ${company.country}`,
      `- Decision: ${company.decisionStatus}`,
      `- Actions: ${company.recommendedActions.join(", ") || "None"}`,
      `- Census holdings: ${[...company.censusHoldingIds].sort(compareText).join(", ") || "None"}`,
      `- Repo-only judgments: ${[...company.repoOnlyRecordIds].sort(compareText).join(", ") || "None"}`,
      `- Production companies: ${[...company.repoCompanyIds].sort(compareText).join(", ") || "None"}`,
      `- Seed keys: ${[...company.seedKeys].sort(compareText).join(", ") || "None"}`,
      `- Rationale: ${company.rationale}`,
    ].join("\n"))
    .join("\n\n");
  const unresolved = [...ledger.unresolvedConflicts]
    .sort((left, right) =>
      compareText(left.subject, right.subject) || compareText(left.issue, right.issue))
    .map((conflict) =>
      `- **${conflict.subject}:** ${conflict.issue} Recommended resolution: ${conflict.recommendedResolution}`)
    .join("\n");

  return [
    "# PortCo canonical reconciliation ledger",
    "",
    `- Run ID: ${ledger.runId}`,
    `- As of: ${ledger.asOfDate}`,
    `- Ledger SHA-256: ${ledger.ledgerSha256}`,
    `- Recovered managers: ${ledger.summary.recoveredManagers}`,
    `- Census holdings: ${ledger.summary.censusHoldings}`,
    `- Repo-only judgments: ${ledger.summary.repoOnlyJudgments}`,
    `- Excluded candidates retained in source lineage: ${ledger.summary.excludedCandidates}`,
    `- Production companies: ${ledger.summary.productionCompanies}`,
    `- Evaluated seed companies: ${ledger.summary.seedCompanies}`,
    `- Proposed canonical companies: ${ledger.summary.canonicalCompanies}`,
    `- Unresolved items: ${ledger.summary.unresolvedItems}`,
    "",
    "## Census dispositions",
    "",
    "| Disposition | Count |",
    "| --- | ---: |",
    censusCounts,
    "",
    "## Repository dispositions",
    "",
    "| Disposition | Count |",
    "| --- | ---: |",
    repoCounts,
    "",
    "## Repo-only judgment dispositions",
    "",
    "| Disposition | Count |",
    "| --- | ---: |",
    repoOnlyCounts,
    "",
    "## Census-side coverage",
    "",
    "| # | Manager | Company | Disposition | Canonical key | Rationale |",
    "| ---: | --- | --- | --- | --- | --- |",
    censusRows || "| — | — | — | — | — | No census holdings |",
    "",
    "## Repository-side coverage",
    "",
    "| Company | Presence | Production ID | Seed key | Disposition | Canonical key |",
    "| --- | --- | --- | --- | --- | --- |",
    repoRows || "| — | — | — | — | — | No repository records |",
    "",
    "## Manager repo-only judgments",
    "",
    "| # | Manager | Repository company | Source judgment | Ledger route | Canonical key | Rationale |",
    "| ---: | --- | --- | --- | --- | --- | --- |",
    repoOnlyRows || "| — | — | — | — | — | — | No repo-only judgments |",
    "",
    "## Canonical companies",
    "",
    companies || "No canonical companies.",
    "",
    "## Unresolved conflicts",
    "",
    unresolved || "- None",
    "",
  ].join("\n");
}

export function renderProposalMarkdown(proposal: ReconciliationProposal): string {
  const evidence = [...proposal.evidence]
    .sort((left, right) =>
      compareText(left.url, right.url) || compareText(left.purpose, right.purpose))
    .map((item) =>
      `- [${item.purpose}](${item.url}) — ${[...item.supports].sort(compareText).join(", ")}`);
  const ownership = proposal.afterImage?.ownershipPeriods
    .map((period) => ({ ...period }))
    .sort((left, right) =>
      compareText(left.managerName, right.managerName)
      || (left.investmentYear ?? 0) - (right.investmentYear ?? 0))
    .map((period) =>
      `| ${markdownCell(period.managerName)} | ${markdownCell(period.fundName)} | ${markdownCell(period.vehicleName)} | ${markdownCell(period.stake)} | ${markdownCell(period.investmentYear)} | ${markdownCell(period.exitYear)} | ${period.transactionState} |`)
    .join("\n");
  const relationMerges = [...(proposal.relationMerges ?? [])]
    .sort((left, right) =>
      compareText(left.kind, right.kind)
      || compareText(left.retiredRelationId, right.retiredRelationId)
      || compareText(left.canonicalRelationId, right.canonicalRelationId))
    .map((mapping) =>
      `| ${markdownCell(mapping.kind)} | ${markdownCell(mapping.retiredRelationId)} | ${markdownCell(mapping.canonicalRelationId)} | ${markdownCell(mapping.rationale)} |`)
    .join("\n");

  return [
    `# PortCo proposal — ${proposal.companyName}`,
    "",
    `- Task: ${proposal.taskIndex} (${proposal.taskId})`,
    `- As of: ${proposal.asOfDate}`,
    `- Actions: ${proposal.actions.join(", ")}`,
    `- Proposal SHA-256: ${proposal.proposalSha256}`,
    `- Production snapshot SHA-256: ${proposal.productionSnapshotSha256}`,
    `- Current company snapshot SHA-256: ${proposal.currentCompanySnapshotSha256 ?? "New company"}`,
    `- After-image SHA-256: ${proposal.afterImageSha256 ?? "Blocked"}`,
    "",
    "## Recommendation",
    "",
    proposal.rationale,
    "",
    "## Ownership after image",
    "",
    "| Manager | Fund | Vehicle | Stake | Invested | Exited | State |",
    "| --- | --- | --- | --- | ---: | ---: | --- |",
    ownership || "| — | — | — | — | — | — | No after-image |",
    "",
    "## Source holdings",
    "",
    bulletList([...proposal.sourceHoldingIds].sort(compareText)),
    "",
    "## Retired company records",
    "",
    bulletList([...proposal.retiredCompanyIds].sort(compareText)),
    "",
    "## Retired relation mappings",
    "",
    "| Kind | Retired relation | Canonical relation | Rationale |",
    "| --- | --- | --- | --- |",
    relationMerges || "| — | — | — | None |",
    "",
    "## Evidence",
    "",
    evidence.join("\n") || "- None",
    "",
    "## Unresolved questions",
    "",
    bulletList([...proposal.unresolvedQuestions].sort(compareText)),
    "",
    "Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.",
    "",
  ].join("\n");
}
