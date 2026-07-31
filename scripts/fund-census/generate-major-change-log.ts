import fs from "fs";
import path from "path";
import {
  evaluateAdditionSizeGate,
  type AdditionSizeGateResult,
} from "./addition-size-gate";
import {
  REPO_ROOT,
  atomicWrite,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  readAndValidateSnapshot,
} from "./lib";
import {
  snapshotFieldNames,
  type FundCensusResult,
} from "./schema";

type ResultFund = FundCensusResult["funds"][number];
type FundSnapshot = ResultFund["snapshot"];
type SnapshotField = (typeof snapshotFieldNames)[number];

interface AggregateFund extends ResultFund {
  requestedManager: string;
  canonicalManager: string | null;
}

interface AggregateArtifact {
  artifactType: "FUND_CENSUS_AGGREGATE";
  asOfDate: string;
  partial: boolean;
  summary: {
    proposedNew: number;
    proposedCorrections: number;
    needsReview: number;
    archiveReviews: number;
    unknownManagers: number;
    crossManagerDuplicateGroups: number;
  };
  funds: AggregateFund[];
}

interface Options {
  runDirectory: string;
  minimumAdditionSizeUsdMm: number | null;
}

interface ChangeCandidate {
  changeId: string;
  action: "CREATE" | "UPDATE";
  fund: AggregateFund;
  legacyId: string | null;
  before: FundSnapshot | null;
  after: FundSnapshot;
  changedFields: SnapshotField[];
  reviewReasons: string[];
  additionSizeGate: AdditionSizeGateResult | null;
}

const SIZE_FIELDS = new Set([
  "size",
  "sizeUsdMm",
  "sizeNativeCurrency",
  "sizeNativeAmount",
  "sizeBasis",
  "sizeAsOf",
  "sizeUsdFxRate",
  "sizeUsdFxDate",
]);

const MATERIAL_FIELDS = new Set([
  "managerName",
  "fundName",
  "investmentStrategy",
  ...SIZE_FIELDS,
  "vintage",
  "strategies",
  "structure",
  "fundStatus",
  "sectors",
  "regions",
]);

const FIELD_LABELS: Record<SnapshotField, string> = {
  managerName: "Manager",
  fundName: "Fund name",
  ticker: "Ticker",
  investmentStrategy: "Investment strategy",
  size: "Display size",
  sizeUsdMm: "Size (USD mm)",
  sizeNativeCurrency: "Native currency",
  sizeNativeAmount: "Native amount",
  sizeBasis: "Size basis",
  sizeAsOf: "Size as of",
  sizeUsdFxRate: "USD FX rate",
  sizeUsdFxDate: "USD FX date",
  vintage: "Vintage",
  strategies: "Strategies",
  structure: "Structure",
  fundStatus: "Fund status",
  sectors: "Sectors",
  regions: "Regions",
  sourceUrls: "Source URLs",
  strategyUrl: "Strategy URL",
};

function parseArgs(argv: string[]): Options {
  let runDirectory: string | undefined;
  let minimumAdditionSizeUsdMm: number | null = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) {
      runDirectory = arg.slice("--run-dir=".length);
    } else {
      if (arg === "--minimum-addition-size-usd-mm") {
        minimumAdditionSizeUsdMm = Number(argv[++index]);
      } else if (arg.startsWith("--minimum-addition-size-usd-mm=")) {
        minimumAdditionSizeUsdMm = Number(
          arg.slice("--minimum-addition-size-usd-mm=".length),
        );
      } else {
        throw new Error(`Unknown argument: ${arg}`);
      }
    }
  }
  if (!runDirectory) throw new Error("Usage: --run-dir path");
  if (
    minimumAdditionSizeUsdMm !== null
    && (
      !Number.isFinite(minimumAdditionSizeUsdMm)
      || minimumAdditionSizeUsdMm <= 0
    )
  ) {
    throw new Error("--minimum-addition-size-usd-mm must be positive");
  }
  return { runDirectory, minimumAdditionSizeUsdMm };
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length > 0 ? value.join(" | ") : "—";
  return String(value).replace(/\s+/g, " ").trim();
}

function markdownValue(value: unknown): string {
  return displayValue(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function csvCell(value: unknown): string {
  const text = displayValue(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function reviewReasons(
  action: ChangeCandidate["action"],
  fund: AggregateFund,
  changedFields: SnapshotField[],
): string[] {
  const reasons: string[] = [];
  if (action === "CREATE") reasons.push("CREATE");
  if (action === "UPDATE") {
    if (changedFields.includes("fundName")) {
      reasons.push("RENAME_OR_CANONICAL_NAME");
    }
    if (changedFields.includes("fundStatus")) reasons.push("STATUS_TRANSITION");
    if (changedFields.some((field) => SIZE_FIELDS.has(field))) {
      reasons.push("SIZE_OR_AMOUNT_CHANGE");
    }
  }
  if (fund.confidence !== "HIGH") reasons.push("MEDIUM_CONFIDENCE");
  if (fund.vehicleType === "PROGRAM_EXCEPTION") {
    reasons.push("PROGRAM_EXCEPTION");
  }
  if (reasons.length === 0) reasons.push("MATERIAL_FIELD_UPDATE");
  return reasons;
}

function buildBaselineMap(runDirectory: string): Map<string, FundSnapshot> {
  const baseline = new Map<string, FundSnapshot>();
  const managers = getManagerUniverse();
  managers.forEach((manager, offset) => {
    const index = offset + 1;
    const stem = managerArtifactStem(index, manager);
    const snapshot = readAndValidateSnapshot(
      path.join(runDirectory, "snapshots", `${stem}.json`),
    );
    for (const fund of snapshot.funds) {
      const existing = baseline.get(fund.legacyId);
      if (existing && !sameValue(existing, fund)) {
        throw new Error(
          `Conflicting frozen baseline rows for ${fund.legacyId}`,
        );
      }
      baseline.set(fund.legacyId, fund);
    }
  });
  return baseline;
}

function qualificationLabel(fund: AggregateFund): string {
  const qualification = fund.northAmericaQualification;
  if (qualification.basis === "VERIFIED_CURRENT_NA_HOLDING") {
    return `${qualification.basis}: ${qualification.currentHoldingName}`;
  }
  return qualification.basis;
}

function evidenceMarkdown(fund: AggregateFund): string[] {
  return fund.evidence.map((item) => {
    const supported = item.supportedFields.length > 0
      ? `; fields: ${item.supportedFields.join(", ")}`
      : "";
    return `- [${item.evidenceLabel} — ${item.title}](${item.url})`
      + ` — ${item.sourceTier}/${item.scope}${supported}`;
  });
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  const manifest = loadManifest(path.join(runDirectory, "manifest.json"));
  if (manifest.status !== "COMPLETE") {
    throw new Error(`Run is ${manifest.status}; change log requires COMPLETE`);
  }
  const aggregatePath = path.join(runDirectory, "aggregate.json");
  const aggregate = JSON.parse(
    fs.readFileSync(aggregatePath, "utf8"),
  ) as AggregateArtifact;
  if (
    aggregate.artifactType !== "FUND_CENSUS_AGGREGATE"
    || aggregate.partial
  ) {
    throw new Error("Expected a complete FUND_CENSUS_AGGREGATE artifact");
  }
  const baseline = buildBaselineMap(runDirectory);
  const allAdditions = aggregate.funds
    .filter((fund) => fund.repoDisposition === "PROPOSED_NEW")
    .sort((left, right) =>
      (left.canonicalManager ?? left.requestedManager).localeCompare(
        right.canonicalManager ?? right.requestedManager,
      ) || left.fundName.localeCompare(right.fundName)
    );
  const additionEvaluations = new Map<AggregateFund, AdditionSizeGateResult>();
  const additions = options.minimumAdditionSizeUsdMm === null
    ? allAdditions
    : allAdditions.filter((fund) => {
      const evaluation = evaluateAdditionSizeGate(
        fund.snapshot,
        options.minimumAdditionSizeUsdMm!,
      );
      additionEvaluations.set(fund, evaluation);
      return evaluation.eligible;
    });
  const updates = aggregate.funds
    .filter((fund) => fund.repoDisposition === "PROPOSED_CORRECTION")
    .sort((left, right) => {
      const leftId = left.matchedRepoFunds[0]?.legacyId ?? "";
      const rightId = right.matchedRepoFunds[0]?.legacyId ?? "";
      return leftId.localeCompare(rightId)
        || left.fundName.localeCompare(right.fundName);
    });
  if (allAdditions.length !== aggregate.summary.proposedNew) {
    throw new Error("Proposed-new count does not match aggregate summary");
  }
  if (updates.length !== aggregate.summary.proposedCorrections) {
    throw new Error("Proposed-correction count does not match aggregate summary");
  }

  const candidates: ChangeCandidate[] = [];
  additions.forEach((fund, offset) => {
    if (fund.snapshot.legacyId !== null) {
      throw new Error(`CREATE ${fund.fundName} unexpectedly has a legacy ID`);
    }
    const fields = [...snapshotFieldNames];
    candidates.push({
      changeId: `ADD-${String(offset + 1).padStart(3, "0")}`,
      action: "CREATE",
      fund,
      legacyId: null,
      before: null,
      after: fund.snapshot,
      changedFields: fields,
      reviewReasons: reviewReasons("CREATE", fund, fields),
      additionSizeGate: additionEvaluations.get(fund) ?? null,
    });
  });
  updates.forEach((fund, offset) => {
    if (fund.matchedRepoFunds.length !== 1) {
      throw new Error(
        `UPDATE ${fund.fundName} must match exactly one repository row`,
      );
    }
    const legacyId = fund.matchedRepoFunds[0].legacyId;
    const before = baseline.get(legacyId);
    if (!before) throw new Error(`Missing frozen baseline for ${legacyId}`);
    const actualDiff = snapshotFieldNames.filter((field) =>
      !sameValue(before[field], fund.snapshot[field])
    );
    const declaredDiff = [...fund.changedFields].sort();
    const sortedActualDiff = [...actualDiff].sort();
    if (!sameValue(declaredDiff, sortedActualDiff)) {
      throw new Error(
        `${legacyId} changedFields mismatch: `
        + `${declaredDiff.join(", ")} vs ${sortedActualDiff.join(", ")}`,
      );
    }
    if (!actualDiff.some((field) => MATERIAL_FIELDS.has(field))) {
      throw new Error(`${legacyId} has no material field change`);
    }
    candidates.push({
      changeId: `UPD-${String(offset + 1).padStart(3, "0")}`,
      action: "UPDATE",
      fund,
      legacyId,
      before,
      after: fund.snapshot,
      changedFields: actualDiff,
      reviewReasons: reviewReasons("UPDATE", fund, actualDiff),
      additionSizeGate: null,
    });
  });

  const markdown: string[] = [
    "# Major proposed fund changes — record-level log",
    "",
    `As of ${aggregate.asOfDate}. Generated from the validated, complete 100-manager census.`,
    "",
    "> Review-only. This log does not modify the fund manifest, evidence manifest, ownership links, database, or publication state.",
    "",
    "## Scope",
    "",
    `- Proposed additions available before size gate: ${allAdditions.length}`,
    `- Proposed additions included: ${additions.length}`,
    `- Proposed additions excluded by size gate: ${
      allAdditions.length - additions.length
    }`,
    `- Proposed corrections: ${updates.length}`,
    `- Total major proposed changes: ${candidates.length}`,
    `- Needs-review funds excluded from actionable changes: ${aggregate.summary.needsReview}`,
    `- Archive-review records excluded from actionable changes: ${aggregate.summary.archiveReviews}`,
    `- Unknown managers excluded from additions: ${aggregate.summary.unknownManagers}`,
    `- Cross-manager duplicate groups suppressed: ${aggregate.summary.crossManagerDuplicateGroups}`,
    "",
    "Every entry is a mandatory human-review item because the full change set exceeds the workflow's 10% manifest threshold. Additional entry-level review reasons are shown below.",
    "",
    ...(options.minimumAdditionSizeUsdMm === null
      ? []
      : [
        "## Addition size gate",
        "",
        `Only proposed additions with fund-specific evidence indicating at least $${
          options.minimumAdditionSizeUsdMm / 1_000
        } billion of current or expected fund size are included.`,
        "",
        "Accepted indications are: a structured USD amount at or above the threshold, or a disclosed EUR/GBP billion-scale fund amount or target at or above the same nominal threshold. No USD conversion is invented. Undisclosed amounts, manager-level AUM, transaction values, and sub-threshold fund amounts are excluded.",
        "",
      ]),
    "## Proposed additions",
    "",
  ];

  for (const candidate of candidates.filter((item) => item.action === "CREATE")) {
    const fund = candidate.fund;
    markdown.push(
      `### ${candidate.changeId} — ${fund.snapshot.managerName} | ${fund.fundName}`,
      "",
      `- Action: **CREATE**`,
      `- Confidence: **${fund.confidence}**`,
      `- Vehicle/lifecycle: ${fund.vehicleType} / ${fund.lifecycle}`,
      `- North America qualification: ${qualificationLabel(fund)}`,
      ...(candidate.additionSizeGate
        ? [
          `- Size-gate basis: ${candidate.additionSizeGate.basis}`,
          `- Size-gate evidence: ${candidate.additionSizeGate.rationale}`,
        ]
        : []),
      `- Review reasons: ${candidate.reviewReasons.join(", ")}`,
      `- Rationale: ${fund.repoDispositionRationale}`,
      "",
      "| Proposed field | Value |",
      "|---|---|",
    );
    for (const field of snapshotFieldNames.filter((name) =>
      name !== "sourceUrls" && name !== "strategyUrl"
    )) {
      markdown.push(
        `| ${FIELD_LABELS[field]} | ${markdownValue(candidate.after[field])} |`,
      );
    }
    markdown.push("", "Evidence:", "", ...evidenceMarkdown(fund), "");
  }

  markdown.push("## Proposed corrections", "");
  for (const candidate of candidates.filter((item) => item.action === "UPDATE")) {
    const fund = candidate.fund;
    markdown.push(
      `### ${candidate.changeId} — ${candidate.legacyId} — `
      + `${fund.snapshot.managerName} | ${fund.fundName}`,
      "",
      `- Action: **UPDATE**`,
      `- Confidence: **${fund.confidence}**`,
      `- North America qualification: ${qualificationLabel(fund)}`,
      `- Review reasons: ${candidate.reviewReasons.join(", ")}`,
      `- Rationale: ${fund.repoDispositionRationale}`,
      "",
      "| Field | Baseline | Proposed |",
      "|---|---|---|",
    );
    for (const field of candidate.changedFields) {
      markdown.push(
        `| ${FIELD_LABELS[field]} | ${markdownValue(candidate.before?.[field])}`
        + ` | ${markdownValue(candidate.after[field])} |`,
      );
    }
    markdown.push("", "Evidence:", "", ...evidenceMarkdown(fund), "");
  }

  markdown.push(
    "## Non-actionable review buckets",
    "",
    `- ${aggregate.summary.needsReview} fund candidates remain in NEEDS_REVIEW.`,
    `- ${aggregate.summary.archiveReviews} repository records remain ARCHIVE_REVIEW only.`,
    `- ${aggregate.summary.unknownManagers} requested managers remain out of scope.`,
    `- ${aggregate.summary.crossManagerDuplicateGroups} CVC/DIF cross-manager overlaps were suppressed from the unique fund count and retained in the review queue.`,
    "",
    "See `review-queue.json` for the complete non-actionable records.",
    "",
  );

  const csvHeader = [
    "changeId",
    "action",
    "requestedManager",
    "canonicalManager",
    "legacyId",
    "baselineFundName",
    "proposedFundName",
    "confidence",
    "vehicleType",
    "lifecycle",
    "northAmericaBasis",
    "additionSizeGateBasis",
    "additionSizeGateRationale",
    "field",
    "before",
    "after",
    "rationale",
    "reviewReasons",
    "evidenceUrls",
  ];
  const csvRows: unknown[][] = [];
  for (const candidate of candidates) {
    const evidenceUrls = candidate.fund.evidence
      .map((item) => item.url)
      .join(" | ");
    for (const field of candidate.changedFields) {
      csvRows.push([
        candidate.changeId,
        candidate.action,
        candidate.fund.requestedManager,
        candidate.fund.canonicalManager,
        candidate.legacyId,
        candidate.before?.fundName ?? null,
        candidate.after.fundName,
        candidate.fund.confidence,
        candidate.fund.vehicleType,
        candidate.fund.lifecycle,
        qualificationLabel(candidate.fund),
        candidate.additionSizeGate?.basis ?? null,
        candidate.additionSizeGate?.rationale ?? null,
        field,
        candidate.before?.[field] ?? null,
        candidate.after[field],
        candidate.fund.repoDispositionRationale,
        candidate.reviewReasons.join(" | "),
        evidenceUrls,
      ]);
    }
  }
  const csv = [
    csvHeader.map(csvCell).join(","),
    ...csvRows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");

  const markdownPath = path.join(runDirectory, "major-change-log.md");
  const csvPath = path.join(runDirectory, "major-change-log.csv");
  atomicWrite(markdownPath, `${markdown.join("\n")}\n`);
  atomicWrite(csvPath, `${csv}\n`);
  console.log(JSON.stringify({
    proposedAdditionsAvailable: allAdditions.length,
    proposedAdditionsIncluded: additions.length,
    proposedAdditionsExcluded: allAdditions.length - additions.length,
    minimumAdditionSizeUsdMm: options.minimumAdditionSizeUsdMm,
    proposedCorrections: updates.length,
    totalMajorChanges: candidates.length,
    fieldDiffRows: csvRows.length,
    markdown: path.relative(REPO_ROOT, markdownPath),
    csv: path.relative(REPO_ROOT, csvPath),
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
