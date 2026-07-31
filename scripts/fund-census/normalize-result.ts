import fs from "fs";
import path from "path";
import {
  REPO_ROOT,
  atomicWrite,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  readAndValidateSnapshot,
} from "./lib";
import {
  normalizeExcludedReasonCode,
  normalizeEvidenceRetrievedAtAsOf,
  normalizeExplicitNorthAmericaBasis,
  normalizeLifecycleEnum,
  normalizeMatchedRepoFundIdentities,
  normalizeNullUsdSizeEvidenceSupport,
  normalizeProgramExceptionEvidenceScope,
  normalizeProgramExceptionIdentityEvidence,
  normalizeRepositoryChangedFields,
  normalizeRegionEnum,
  normalizeSummaryCounts,
  normalizeUnsupportedRepositoryDifferences,
  normalizeUnsupportedNorthAmericaHolding,
  normalizeUnsupportedNorthAmericaEvidenceRepoReview,
  normalizeUnsupportedSizeAsOf,
  normalizeUnclassifiedSizeStructure,
  normalizeVerifiedHoldingNorthAmericaRegions,
  normalizeVerifiedSourcePublishedAt,
} from "./normalization";

interface Options {
  runDirectory: string;
  managerIndex: number;
  inputPath: string;
  sourceDates: Array<{ url: string; publishedAt: string }>;
  mode:
    | "snapshot-identity"
    | "null-usd-size-evidence"
    | "as-of-retrieval-date"
    | "program-exception-evidence-scope"
    | "program-exception-identity-evidence"
    | "unclassified-size-structure"
    | "repository-changed-fields"
    | "repository-unsupported-reversion"
    | "unsupported-na-holding-exclusion"
    | "unsupported-size-as-of"
    | "excluded-reason-code"
    | "verified-holding-na-region"
    | "explicit-na-basis"
    | "region-enum"
    | "summary-counts"
    | "lifecycle-enum"
    | "unsupported-na-evidence-repo-review"
    | "unsupported-lifecycle-evidence-repo-review"
    | "secondary-only-evidence-repo-review"
    | "verified-source-published-at";
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { sourceDates: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) {
      options.runDirectory = arg.slice("--run-dir=".length);
    } else if (arg === "--manager-index") {
      options.managerIndex = Number(argv[++index]);
    } else if (arg.startsWith("--manager-index=")) {
      options.managerIndex = Number(arg.slice("--manager-index=".length));
    } else if (arg === "--input") {
      options.inputPath = argv[++index];
    } else if (arg.startsWith("--input=")) {
      options.inputPath = arg.slice("--input=".length);
    } else if (arg === "--mode") {
      options.mode = argv[++index] as Options["mode"];
    } else if (arg.startsWith("--mode=")) {
      options.mode = arg.slice("--mode=".length) as Options["mode"];
    } else if (arg === "--source-date") {
      const value = argv[++index];
      const publishedAt = value?.slice(0, 10);
      const url = value?.slice(11);
      if (
        !value
        || value[10] !== "="
        || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)
        || !/^https:\/\//.test(url)
      ) {
        throw new Error("--source-date must be YYYY-MM-DD=https://...");
      }
      options.sourceDates!.push({ url, publishedAt });
    } else if (arg.startsWith("--source-date=")) {
      const value = arg.slice("--source-date=".length);
      const publishedAt = value.slice(0, 10);
      const url = value.slice(11);
      if (
        value[10] !== "="
        || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)
        || !/^https:\/\//.test(url)
      ) {
        throw new Error("--source-date must be YYYY-MM-DD=https://...");
      }
      options.sourceDates!.push({ url, publishedAt });
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  options.mode ??= "snapshot-identity";
  if (!options.runDirectory || !options.inputPath || !Number.isInteger(options.managerIndex)) {
    throw new Error(
      "Usage: --run-dir path --manager-index N --input raw-response.txt "
      + "[--mode snapshot-identity|null-usd-size-evidence|as-of-retrieval-date"
      + "|program-exception-evidence-scope"
      + "|program-exception-identity-evidence|unclassified-size-structure"
      + "|repository-changed-fields"
      + "|repository-unsupported-reversion|unsupported-size-as-of"
      + "|unsupported-na-holding-exclusion|excluded-reason-code"
      + "|verified-holding-na-region|explicit-na-basis|region-enum"
      + "|summary-counts"
      + "|lifecycle-enum"
      + "|unsupported-na-evidence-repo-review"
      + "|unsupported-lifecycle-evidence-repo-review"
      + "|secondary-only-evidence-repo-review"
      + "|verified-source-published-at]"
      + " [--source-date YYYY-MM-DD=https://...]",
    );
  }
  if (options.managerIndex! < 1 || options.managerIndex! > 100) {
    throw new Error("--manager-index must be from 1 through 100");
  }
  if (
    options.mode !== "snapshot-identity"
    && options.mode !== "null-usd-size-evidence"
    && options.mode !== "as-of-retrieval-date"
    && options.mode !== "program-exception-evidence-scope"
    && options.mode !== "program-exception-identity-evidence"
    && options.mode !== "unclassified-size-structure"
    && options.mode !== "repository-changed-fields"
    && options.mode !== "repository-unsupported-reversion"
    && options.mode !== "unsupported-na-holding-exclusion"
    && options.mode !== "unsupported-size-as-of"
    && options.mode !== "excluded-reason-code"
    && options.mode !== "verified-holding-na-region"
    && options.mode !== "explicit-na-basis"
    && options.mode !== "region-enum"
    && options.mode !== "summary-counts"
    && options.mode !== "lifecycle-enum"
    && options.mode !== "unsupported-na-evidence-repo-review"
    && options.mode !== "unsupported-lifecycle-evidence-repo-review"
    && options.mode !== "secondary-only-evidence-repo-review"
    && options.mode !== "verified-source-published-at"
  ) {
    throw new Error(
      "--mode must be snapshot-identity, null-usd-size-evidence, "
      + "as-of-retrieval-date, program-exception-evidence-scope, "
      + "program-exception-identity-evidence, unclassified-size-structure, "
      + "repository-changed-fields, repository-unsupported-reversion, "
      + "unsupported-size-as-of, unsupported-na-holding-exclusion, "
      + "excluded-reason-code, "
      + "verified-holding-na-region, "
      + "explicit-na-basis, "
      + "region-enum, "
      + "summary-counts, "
      + "lifecycle-enum, "
      + "unsupported-na-evidence-repo-review, "
      + "unsupported-lifecycle-evidence-repo-review, "
      + "secondary-only-evidence-repo-review, "
      + "or verified-source-published-at",
    );
  }
  if (
    options.mode === "verified-source-published-at"
    && options.sourceDates!.length === 0
  ) {
    throw new Error(
      "verified-source-published-at requires at least one --source-date",
    );
  }
  if (
    options.mode !== "verified-source-published-at"
    && options.sourceDates!.length > 0
  ) {
    throw new Error("--source-date is only valid with verified-source-published-at");
  }
  return options as Options;
}

function repoRelative(filePath: string): string {
  return path.relative(REPO_ROOT, filePath);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  const manifest = loadManifest(path.join(runDirectory, "manifest.json"));
  const manager = getManagerUniverse()[options.managerIndex - 1];
  const target = manifest.managers[options.managerIndex - 1];
  if (!target || target.requestedManager !== manager) {
    throw new Error("Manifest manager order does not match manager universe");
  }

  const stem = managerArtifactStem(options.managerIndex, manager);
  const snapshot = readAndValidateSnapshot(
    path.join(runDirectory, "snapshots", `${stem}.json`),
  );
  const inputPath = path.resolve(options.inputPath);
  const input = fs.readFileSync(inputPath, "utf8");
  const normalized = options.mode === "snapshot-identity"
    ? normalizeMatchedRepoFundIdentities(input, snapshot)
    : options.mode === "null-usd-size-evidence"
      ? normalizeNullUsdSizeEvidenceSupport(input, snapshot)
      : options.mode === "as-of-retrieval-date"
        ? normalizeEvidenceRetrievedAtAsOf(input, snapshot)
        : options.mode === "program-exception-evidence-scope"
            ? normalizeProgramExceptionEvidenceScope(input)
          : options.mode === "program-exception-identity-evidence"
            ? normalizeProgramExceptionIdentityEvidence(input)
          : options.mode === "unclassified-size-structure"
            ? normalizeUnclassifiedSizeStructure(input)
            : options.mode === "repository-changed-fields"
              ? normalizeRepositoryChangedFields(input, snapshot)
              : options.mode === "repository-unsupported-reversion"
                ? normalizeUnsupportedRepositoryDifferences(input, snapshot)
              : options.mode === "unsupported-na-holding-exclusion"
                ? normalizeUnsupportedNorthAmericaHolding(input)
              : options.mode === "unsupported-size-as-of"
                ? normalizeUnsupportedSizeAsOf(input, snapshot)
              : options.mode === "excluded-reason-code"
                ? normalizeExcludedReasonCode(input)
                : options.mode === "verified-holding-na-region"
                  ? normalizeVerifiedHoldingNorthAmericaRegions(input, snapshot)
                : options.mode === "explicit-na-basis"
                  ? normalizeExplicitNorthAmericaBasis(input)
                : options.mode === "region-enum"
                  ? normalizeRegionEnum(input)
                : options.mode === "summary-counts"
                  ? normalizeSummaryCounts(input)
                  : options.mode === "lifecycle-enum"
                    ? normalizeLifecycleEnum(input)
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? normalizeUnsupportedNorthAmericaEvidenceRepoReview(
                        input,
                        snapshot,
                      )
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? normalizeUnsupportedNorthAmericaEvidenceRepoReview(
                        input,
                        snapshot,
                        "CURRENT_LIFECYCLE",
                      )
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? normalizeUnsupportedNorthAmericaEvidenceRepoReview(
                        input,
                        snapshot,
                        "SECONDARY_ONLY",
                      )
                      : normalizeVerifiedSourcePublishedAt(
                          input,
                          options.sourceDates,
                        );
  if (normalized.changes.length === 0) {
    throw new Error(
      options.mode === "snapshot-identity"
        ? "No missing repository identity fields were found"
        : options.mode === "null-usd-size-evidence"
        ? "No safely normalizable null USD-size evidence mappings were found"
        : options.mode === "as-of-retrieval-date"
          ? "No post-cutoff evidence retrieval dates were found"
          : options.mode === "program-exception-evidence-scope"
            ? "No safely normalizable program-exception evidence scopes were found"
          : options.mode === "program-exception-identity-evidence"
            ? "No safely normalizable program-exception identity attribution was found"
          : options.mode === "unclassified-size-structure"
            ? "No unsupported unclassified structured size fields were found"
            : options.mode === "repository-changed-fields"
              ? "No safely normalizable repository changedFields lists were found"
              : options.mode === "repository-unsupported-reversion"
                ? "No undeclared unsupported repository differences were found"
              : options.mode === "unsupported-na-holding-exclusion"
                ? "No proposed-new fund with an unsupported North American holding was found"
              : options.mode === "unsupported-size-as-of"
                ? "No unsupported sizeAsOf values could be safely anchored to evidence"
              : options.mode === "excluded-reason-code"
                ? "No safely normalizable excluded reason codes were found"
                : options.mode === "verified-holding-na-region"
                  ? "No safely normalizable verified-holding North America regions were found"
                : options.mode === "explicit-na-basis"
                  ? "No safely normalizable explicit North America basis was found"
                : options.mode === "region-enum"
                  ? "No safely normalizable region enum shorthand was found"
                : options.mode === "summary-counts"
                  ? "No inconsistent summary counts were found"
                  : options.mode === "lifecycle-enum"
                    ? "No safely normalizable lifecycle enum synonyms were found"
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? "No repository fund lacking North America evidence was found"
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? "No repository fund lacking current lifecycle evidence was found"
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? "No repository fund supported only by secondary evidence was found"
                      : "No verified source publication dates were recorded",
    );
  }

  const outputPath = path.join(
    runDirectory,
    "raw",
    options.mode === "snapshot-identity"
      ? `${stem}-snapshot-normalized.txt`
      : options.mode === "null-usd-size-evidence"
        ? `${stem}-evidence-normalized.txt`
        : options.mode === "as-of-retrieval-date"
          ? `${stem}-retrieval-normalized.txt`
          : options.mode === "program-exception-evidence-scope"
            ? `${stem}-program-scope-normalized.txt`
          : options.mode === "program-exception-identity-evidence"
            ? `${stem}-program-identity-normalized.txt`
          : options.mode === "unclassified-size-structure"
            ? `${stem}-unclassified-size-normalized.txt`
            : options.mode === "repository-changed-fields"
              ? `${stem}-changed-fields-normalized.txt`
              : options.mode === "repository-unsupported-reversion"
                ? `${stem}-unsupported-reverted.txt`
              : options.mode === "unsupported-na-holding-exclusion"
                ? `${stem}-unsupported-holding-excluded.txt`
              : options.mode === "unsupported-size-as-of"
                ? `${stem}-size-as-of-normalized.txt`
              : options.mode === "excluded-reason-code"
                ? `${stem}-excluded-reason-normalized.txt`
                : options.mode === "verified-holding-na-region"
                  ? `${stem}-na-region-normalized.txt`
                : options.mode === "explicit-na-basis"
                  ? `${stem}-explicit-na-basis-normalized.txt`
                : options.mode === "region-enum"
                  ? `${stem}-region-enum-normalized.txt`
                : options.mode === "summary-counts"
                  ? `${stem}-summary-counts-normalized.txt`
                  : options.mode === "lifecycle-enum"
                    ? `${stem}-lifecycle-normalized.txt`
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? `${stem}-unsupported-na-review-normalized.txt`
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? `${stem}-unsupported-lifecycle-review-normalized.txt`
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? `${stem}-secondary-only-review-normalized.txt`
                      : `${stem}-source-date-normalized.txt`,
  );
  const auditPath = path.join(
    runDirectory,
    "normalizations",
    options.mode === "snapshot-identity"
      ? `${stem}.json`
      : options.mode === "null-usd-size-evidence"
        ? `${stem}-evidence-support.json`
        : options.mode === "as-of-retrieval-date"
          ? `${stem}-retrieval-date.json`
          : options.mode === "program-exception-evidence-scope"
            ? `${stem}-program-scope.json`
          : options.mode === "program-exception-identity-evidence"
            ? `${stem}-program-identity.json`
          : options.mode === "unclassified-size-structure"
            ? `${stem}-unclassified-size.json`
            : options.mode === "repository-changed-fields"
              ? `${stem}-changed-fields.json`
              : options.mode === "repository-unsupported-reversion"
                ? `${stem}-unsupported-reversion.json`
              : options.mode === "unsupported-na-holding-exclusion"
                ? `${stem}-unsupported-holding-exclusion.json`
              : options.mode === "unsupported-size-as-of"
                ? `${stem}-size-as-of.json`
              : options.mode === "excluded-reason-code"
                ? `${stem}-excluded-reason.json`
                : options.mode === "verified-holding-na-region"
                  ? `${stem}-na-region.json`
                : options.mode === "explicit-na-basis"
                  ? `${stem}-explicit-na-basis.json`
                : options.mode === "region-enum"
                  ? `${stem}-region-enum.json`
                : options.mode === "summary-counts"
                  ? `${stem}-summary-counts.json`
                  : options.mode === "lifecycle-enum"
                    ? `${stem}-lifecycle.json`
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? `${stem}-unsupported-na-review.json`
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? `${stem}-unsupported-lifecycle-review.json`
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? `${stem}-secondary-only-review.json`
                      : `${stem}-source-date.json`,
  );
  for (const filePath of [outputPath, auditPath]) {
    if (fs.existsSync(filePath)) {
      throw new Error(`Refusing to replace existing normalization artifact: ${filePath}`);
    }
  }

  const audit = {
    schemaVersion: 1,
    artifactType: options.mode === "snapshot-identity"
      ? "FUND_CENSUS_SNAPSHOT_IDENTITY_NORMALIZATION"
      : options.mode === "null-usd-size-evidence"
        ? "FUND_CENSUS_EVIDENCE_FIELD_NORMALIZATION"
        : options.mode === "as-of-retrieval-date"
          ? "FUND_CENSUS_RETRIEVAL_DATE_NORMALIZATION"
          : options.mode === "program-exception-evidence-scope"
            ? "FUND_CENSUS_PROGRAM_EVIDENCE_SCOPE_NORMALIZATION"
          : options.mode === "program-exception-identity-evidence"
            ? "FUND_CENSUS_PROGRAM_IDENTITY_EVIDENCE_NORMALIZATION"
          : options.mode === "unclassified-size-structure"
            ? "FUND_CENSUS_UNCLASSIFIED_SIZE_STRUCTURE_NORMALIZATION"
              : options.mode === "repository-changed-fields"
                ? "FUND_CENSUS_REPOSITORY_CHANGED_FIELDS_NORMALIZATION"
                : options.mode === "repository-unsupported-reversion"
                  ? "FUND_CENSUS_UNSUPPORTED_REPOSITORY_DIFFERENCE_NORMALIZATION"
                : options.mode === "unsupported-na-holding-exclusion"
                  ? "FUND_CENSUS_UNSUPPORTED_NORTH_AMERICA_HOLDING_NORMALIZATION"
                : options.mode === "unsupported-size-as-of"
                  ? "FUND_CENSUS_UNSUPPORTED_SIZE_AS_OF_NORMALIZATION"
                : options.mode === "excluded-reason-code"
                ? "FUND_CENSUS_EXCLUDED_REASON_CODE_NORMALIZATION"
                : options.mode === "verified-holding-na-region"
                  ? "FUND_CENSUS_VERIFIED_HOLDING_NA_REGION_NORMALIZATION"
                : options.mode === "explicit-na-basis"
                  ? "FUND_CENSUS_EXPLICIT_NORTH_AMERICA_BASIS_NORMALIZATION"
                : options.mode === "region-enum"
                  ? "FUND_CENSUS_REGION_ENUM_NORMALIZATION"
                : options.mode === "summary-counts"
                  ? "FUND_CENSUS_SUMMARY_COUNT_NORMALIZATION"
                  : options.mode === "lifecycle-enum"
                    ? "FUND_CENSUS_LIFECYCLE_ENUM_NORMALIZATION"
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? "FUND_CENSUS_UNSUPPORTED_NORTH_AMERICA_REPO_REVIEW_NORMALIZATION"
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? "FUND_CENSUS_UNSUPPORTED_LIFECYCLE_REPO_REVIEW_NORMALIZATION"
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? "FUND_CENSUS_SECONDARY_ONLY_REPO_REVIEW_NORMALIZATION"
                      : "FUND_CENSUS_VERIFIED_SOURCE_DATE_NORMALIZATION",
    asOfDate: manifest.asOfDate,
    requestedManager: manager,
    createdAt: new Date().toISOString(),
    inputPath: repoRelative(inputPath),
    outputPath: repoRelative(outputPath),
    allowedFields: options.mode === "snapshot-identity"
      ? ["managerName", "fundName"]
      : options.mode === "null-usd-size-evidence"
        ? ["evidence[].supportedFields[].sizeUsdMm"]
        : options.mode === "as-of-retrieval-date"
          ? ["evidence[].retrievedAt"]
          : options.mode === "program-exception-evidence-scope"
            ? ["evidence[].scope"]
          : options.mode === "program-exception-identity-evidence"
            ? [
                "evidence[].supports[].FUND_IDENTITY",
                "evidence[].supportedFields[].fundName",
              ]
          : options.mode === "unclassified-size-structure"
            ? [
                "snapshot.sizeUsdMm",
                "snapshot.sizeNativeCurrency",
                "snapshot.sizeNativeAmount",
                "snapshot.sizeUsdFxRate",
                "snapshot.sizeUsdFxDate",
              ]
          : options.mode === "repository-changed-fields"
            ? ["changedFields"]
            : options.mode === "repository-unsupported-reversion"
              ? [
                  "snapshot.*",
                  "changedFields",
                  "repoDisposition",
                  "repoDispositionRationale",
                  "summary.proposedCorrections",
                ]
            : options.mode === "unsupported-na-holding-exclusion"
              ? [
                  "funds",
                  "excludedCandidates",
                  "unresolvedConflicts",
                  "summary",
                ]
            : options.mode === "unsupported-size-as-of"
              ? ["snapshot.sizeAsOf", "evidence[].supportedFields[].sizeAsOf"]
            : options.mode === "excluded-reason-code"
                ? ["excludedCandidates[].reasonCode"]
                : options.mode === "verified-holding-na-region"
                  ? [
                    "funds[].snapshot.regions",
                    "funds[].repoDisposition",
                    "funds[].changedFields",
                    "funds[].repoDispositionRationale",
                    "summary.proposedCorrections",
                  ]
                : options.mode === "explicit-na-basis"
                  ? [
                    "funds[].northAmericaQualification.basis",
                    "funds[].northAmericaQualification.currentHoldingName",
                    "funds[].northAmericaQualification.currentHoldingUrl",
                    "summary.explicitNaMandate",
                    "summary.verifiedCurrentNaHolding",
                  ]
                : options.mode === "region-enum"
                  ? ["funds[].snapshot.regions"]
                : options.mode === "summary-counts"
                  ? ["summary.*"]
                  : options.mode === "lifecycle-enum"
                    ? ["funds[].lifecycle"]
                    : options.mode === "unsupported-na-evidence-repo-review"
                      ? [
                        "funds",
                        "repoOnlyRecords",
                        "unresolvedConflicts",
                        "summary",
                      ]
                    : options.mode === "unsupported-lifecycle-evidence-repo-review"
                      ? [
                        "funds",
                        "repoOnlyRecords",
                        "unresolvedConflicts",
                        "summary",
                      ]
                    : options.mode === "secondary-only-evidence-repo-review"
                      ? [
                        "funds",
                        "repoOnlyRecords",
                        "unresolvedConflicts",
                        "summary",
                      ]
                      : ["evidence[].publishedAt"],
    changes: normalized.changes,
  };
  atomicWrite(
    outputPath,
    normalized.response.endsWith("\n") ? normalized.response : `${normalized.response}\n`,
  );
  atomicWrite(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
  console.log(`Normalized response: ${outputPath}`);
  console.log(`Audit log: ${auditPath}`);
  console.log(`Hydrated fields: ${normalized.changes.length}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
