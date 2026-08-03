import { assertProposalIntegrity } from "./integrity";
import type { ScorecardProposal } from "./schema";

function text(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function fact(value: { disclosureStatus: string; value: unknown }): string {
  if (value.disclosureStatus === "VERIFIED") return text(value.value);
  return value.disclosureStatus.replace(/_/g, " ");
}

function listOrNone(values: string[]): string {
  return values.length > 0 ? values.map((value) => `- ${text(value)}`).join("\n") : "None.";
}

export function renderScorecardReviewReport(value: ScorecardProposal): string {
  const proposal = assertProposalIntegrity(value);
  const currentOwners = proposal.ownerships.filter((owner) => owner.isCurrentLegalOwner);
  const formerOwners = proposal.ownerships.filter((owner) => !owner.isCurrentLegalOwner);
  const changes = proposal.beforeAfterDifferences.filter((change) => change.changeType !== "NO_CHANGE");
  const primary = proposal.citations.find((source) => source.isPrimary);

  const lines = [
    `# ${text(proposal.requestedCompany)} — scorecard proposal`,
    "",
    "## Recommendation",
    "",
    `${proposal.applicationRecommendation.replace(/_/g, " ")} · ${proposal.confidence} confidence · ${proposal.taskStatus}`,
    "",
    fact(proposal.overview),
    "",
    `Proposal hash: \`${proposal.proposalHash}\`  `,
    `Company snapshot: \`${proposal.companySnapshotHash}\``,
    "",
    "## Identity and operating profile",
    "",
    `- Identity: ${proposal.identityDecision.decision.replace(/_/g, " ")} — ${text(proposal.identityDecision.rationale)}`,
    `- Boundary: ${text(proposal.identityDecision.platformBoundary)}`,
    `- Website: ${fact(proposal.recommendedCompany.website)}`,
    `- Headquarters: ${fact(proposal.recommendedCompany.headquarters)}`,
    `- Founded: ${fact(proposal.recommendedCompany.yearFounded)}`,
    `- Classification: ${text(proposal.recommendedCompany.sector)} · ${text(proposal.recommendedCompany.subsector)} · ${text(proposal.recommendedCompany.region)}`,
    `- Products/services: ${fact(proposal.recommendedCompany.productsAndServices)}`,
    `- Customers/end markets: ${fact(proposal.recommendedCompany.customersAndEndMarkets)}`,
    `- Footprint: ${fact(proposal.recommendedCompany.geographicFootprint)}`,
    `- Scale: ${fact(proposal.recommendedCompany.operatingScale)}`,
    "",
    "## Current ownership",
    "",
    "| Owner | Vehicle / fund | Stake | Invested / closed | State |",
    "| --- | --- | ---: | --- | --- |",
    ...currentOwners.map((owner) => [
      text(owner.ownerName),
      `${fact(owner.vehicleName)} / ${fact(owner.fundName)}`,
      fact(owner.stake),
      `${fact(owner.investmentYear)} / ${fact(owner.closedAt)}`,
      owner.state.replace(/_/g, " "),
    ].map(text).join(" | ").replace(/^/, "| ").replace(/$/, " |")),
  ];

  if (currentOwners.length === 0) lines.push("| — | — | — | — | — |");
  if (formerOwners.length > 0) {
    lines.push(
      "",
      "## Former ownership",
      "",
      "| Owner | Invested | Exited |",
      "| --- | ---: | ---: |",
      ...formerOwners.map((owner) =>
        `| ${text(owner.ownerName)} | ${fact(owner.investmentYear)} | ${fact(owner.exitAt)} |`),
    );
  }

  lines.push(
    "",
    "## Material milestones",
    "",
    ...proposal.milestones
      .slice()
      .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
      .map((milestone) => `- **${text(milestone.date)} — ${text(milestone.category)}:** ${text(milestone.event)}`),
    "",
    "## Current senior management",
    "",
    proposal.management.disclosureStatus === "VERIFIED"
      ? proposal.management.executives.map((executive) => `- ${text(executive.name)} — ${text(executive.title)}`).join("\n")
      : proposal.management.disclosureStatus.replace(/_/g, " "),
    "",
    "## Proposed changes",
    "",
    changes.length > 0
      ? changes.map((change) =>
        `- **${text(change.entity)} · ${text(change.fieldPath)} · ${text(change.changeType)}:** ${text(change.rationale)}`,
      ).join("\n")
      : "No scorecard field changes; existing claims were revalidated.",
    "",
    "## Missing deals for separate review",
    "",
    proposal.missingDealsForSeparateReview.length > 0
      ? proposal.missingDealsForSeparateReview.map((deal) =>
        `- ${text(deal.title)}${deal.transactionDate ? ` (${deal.transactionDate})` : ""}: ${text(deal.rationale)}`,
      ).join("\n")
      : "None.",
    "",
    "## Sources",
    "",
    ...proposal.citations.map((source) =>
      `- ${source.isPrimary ? "**Primary:** " : ""}[${text(source.title)}](${source.url}) — ${text(source.publisher)} · ${source.health.replace(/_/g, " ")}`),
    "",
    "## Review flags",
    "",
    `Primary citation: ${primary ? `[${text(primary.title)}](${primary.url})` : "None"}`,
    "",
    "Unresolved questions:",
    "",
    listOrNone(proposal.unresolvedQuestions),
    "",
    "Blockers:",
    "",
    listOrNone(proposal.blockers),
  );
  return `${lines.join("\n").trim()}\n`;
}
