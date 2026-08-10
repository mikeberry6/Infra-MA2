import { createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isWeeklyBriefingEdition } from "@/modules/briefings/archive";
import { assertManifestPublishable } from "../../../scripts/weekly-briefing-activity/review";
import {
  assertOutlookQaApprovalMatches,
  parseOutlookQaApproval,
} from "../../../scripts/weekly-briefing-activity/outlook-qa";
import { renderManifestActivityEmail } from "../../../scripts/weekly-briefing-activity/render-charts";

const DEFAULT_APPROVED_EDITIONS_PATH = path.join(
  process.cwd(),
  "public",
  "email-format",
  "approved-editions.json",
);
const LEGACY_BASELINE_EDITION = "2026-07-31";
const INDEX_HASH_DOMAIN = "weekly-briefing-approved-editions-index/v1";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CHART_BLOCK_START_MARKER = "<!-- YTD STATS -->";
const CHART_BLOCK_END_MARKER = "<!-- FOOTER -->";
const NON_CHART_HASH_SENTINEL =
  "<!-- YTD STATS OMITTED --><!-- FOOTER -->";

export interface LegacyApprovedEdition {
  edition: string;
  approval: {
    kind: "LEGACY_BASELINE";
    emailPath: string;
    renderedEmailSha256: string;
    rationale: string;
  };
}

export interface AuditedApprovedEdition {
  edition: string;
  approval: {
    kind: "AUDIT_MANIFEST";
    manifestPath: string;
    manifestSha256: string;
    emailPath: string;
    renderedEmailSha256: string;
    protectedNonChartSha256: string;
    outlookQaPath: string;
    outlookQaSha256: string;
  };
}

export type ApprovedWeeklyBriefingEdition =
  | LegacyApprovedEdition
  | AuditedApprovedEdition;

export interface ApprovedWeeklyBriefingIndex {
  schemaVersion: 1;
  entries: ApprovedWeeklyBriefingEdition[];
  indexSha256: string;
}

function isCanonicalCalendarDate(value: string): boolean {
  if (!isWeeklyBriefingEdition(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.toISOString().slice(0, 10) === value;
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Approved index cannot encode a non-finite number");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (!value || typeof value !== "object") {
    throw new Error(`Approved index cannot encode ${typeof value}`);
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function digestsEqual(left: string, right: string): boolean {
  if (!SHA256_PATTERN.test(left) || !SHA256_PATTERN.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function computeApprovedWeeklyBriefingIndexSha256({
  schemaVersion,
  entries,
}: Pick<ApprovedWeeklyBriefingIndex, "schemaVersion" | "entries">): string {
  return sha256(
    `${INDEX_HASH_DOMAIN}\n${canonicalJson({ schemaVersion, entries })}`,
  );
}

export function computeProtectedNonChartSha256(sourceHtml: string): string {
  const start = sourceHtml.indexOf(CHART_BLOCK_START_MARKER);
  const end = sourceHtml.indexOf(CHART_BLOCK_END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Approved email is missing its delimited chart block");
  }
  if (
    sourceHtml.indexOf(CHART_BLOCK_START_MARKER, start + 1) >= 0 ||
    sourceHtml.indexOf(CHART_BLOCK_END_MARKER, end + 1) >= 0
  ) {
    throw new Error("Approved email must contain exactly one chart block");
  }
  return sha256(
    sourceHtml.slice(0, start) +
      NON_CHART_HASH_SENTINEL +
      sourceHtml.slice(end + CHART_BLOCK_END_MARKER.length),
  );
}

function recordValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  record: Record<string, unknown>,
  keys: readonly string[],
  label: string,
): void {
  const actual = Object.keys(record).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} contains unexpected or missing fields`);
  }
}

function digestValue(value: unknown, label: string): string {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256 digest`);
  }
  return value;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function parseEditionEntry(
  value: unknown,
  position: number,
): ApprovedWeeklyBriefingEdition {
  const entry = recordValue(value, `Approved edition ${position}`);
  exactKeys(entry, ["edition", "approval"], `Approved edition ${position}`);
  const edition = nonEmptyString(
    entry.edition,
    `Approved edition ${position} edition`,
  );
  if (!isCanonicalCalendarDate(edition)) {
    throw new Error(`Approved edition ${position} has an invalid edition date`);
  }

  const approval = recordValue(
    entry.approval,
    `Approved edition ${edition} approval`,
  );
  if (approval.kind === "LEGACY_BASELINE") {
    exactKeys(
      approval,
      ["kind", "emailPath", "renderedEmailSha256", "rationale"],
      `Approved edition ${edition} legacy approval`,
    );
    if (edition !== LEGACY_BASELINE_EDITION) {
      throw new Error(
        `Only ${LEGACY_BASELINE_EDITION} may use LEGACY_BASELINE approval`,
      );
    }
    return {
      edition,
      approval: {
        kind: "LEGACY_BASELINE",
        emailPath: nonEmptyString(approval.emailPath, "Legacy email path"),
        renderedEmailSha256: digestValue(
          approval.renderedEmailSha256,
          "Legacy email hash",
        ),
        rationale: nonEmptyString(
          approval.rationale,
          "Legacy approval rationale",
        ),
      },
    };
  }

  if (approval.kind === "AUDIT_MANIFEST") {
    exactKeys(
      approval,
      [
        "kind",
        "manifestPath",
        "manifestSha256",
        "emailPath",
        "renderedEmailSha256",
        "protectedNonChartSha256",
        "outlookQaPath",
        "outlookQaSha256",
      ],
      `Approved edition ${edition} audit approval`,
    );
    return {
      edition,
      approval: {
        kind: "AUDIT_MANIFEST",
        manifestPath: nonEmptyString(
          approval.manifestPath,
          "Approved manifest path",
        ),
        manifestSha256: digestValue(
          approval.manifestSha256,
          "Approved manifest hash",
        ),
        emailPath: nonEmptyString(approval.emailPath, "Approved email path"),
        renderedEmailSha256: digestValue(
          approval.renderedEmailSha256,
          "Approved email hash",
        ),
        protectedNonChartSha256: digestValue(
          approval.protectedNonChartSha256,
          "Protected non-chart hash",
        ),
        outlookQaPath: nonEmptyString(
          approval.outlookQaPath,
          "Outlook QA artifact path",
        ),
        outlookQaSha256: digestValue(
          approval.outlookQaSha256,
          "Outlook QA artifact hash",
        ),
      },
    };
  }

  throw new Error(`Approved edition ${edition} has an invalid approval kind`);
}

export function parseApprovedWeeklyBriefingIndex(
  raw: string,
): ApprovedWeeklyBriefingIndex {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Approved weekly briefing index is not valid JSON");
  }

  const record = recordValue(value, "Approved weekly briefing index");
  exactKeys(
    record,
    ["schemaVersion", "entries", "indexSha256"],
    "Approved weekly briefing index",
  );
  if (record.schemaVersion !== 1) {
    throw new Error("Approved weekly briefing index must use schemaVersion 1");
  }
  if (!Array.isArray(record.entries) || record.entries.length === 0) {
    throw new Error(
      "Approved weekly briefing index must contain at least one entry",
    );
  }
  const entries = record.entries.map(parseEditionEntry);
  if (new Set(entries.map((entry) => entry.edition)).size !== entries.length) {
    throw new Error("Approved weekly briefing index contains duplicate editions");
  }
  const indexSha256 = digestValue(record.indexSha256, "Approved index hash");
  const expectedIndexSha256 = computeApprovedWeeklyBriefingIndexSha256({
    schemaVersion: 1,
    entries,
  });
  if (!digestsEqual(indexSha256, expectedIndexSha256)) {
    throw new Error(
      `Approved weekly briefing index hash mismatch: expected ${expectedIndexSha256}, received ${indexSha256}`,
    );
  }

  return { schemaVersion: 1, entries, indexSha256 };
}

function repositoryFilePath(
  repositoryRoot: string,
  relativePath: string,
  label: string,
): string {
  if (
    relativePath.includes("\\") ||
    path.posix.isAbsolute(relativePath) ||
    path.posix.normalize(relativePath) !== relativePath ||
    relativePath.startsWith("../")
  ) {
    throw new Error(`${label} must be a normalized repository-relative path`);
  }
  const root = path.resolve(repositoryRoot);
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} escapes the repository root`);
  }
  return resolved;
}

async function readRepositoryFile({
  repositoryRoot,
  relativePath,
  label,
}: {
  repositoryRoot: string;
  relativePath: string;
  label: string;
}): Promise<Buffer> {
  return readFile(
    repositoryFilePath(repositoryRoot, relativePath, `${label} path`),
  );
}

export async function validateApprovedWeeklyBriefingIndexDependencies(
  index: ApprovedWeeklyBriefingIndex,
  repositoryRoot = process.cwd(),
): Promise<void> {
  for (const entry of index.entries) {
    const expectedEmailPath = `public/email-format/${entry.edition}.html`;
    if (entry.approval.emailPath !== expectedEmailPath) {
      throw new Error("Approved email path does not match its edition");
    }
    const emailBytes = await readRepositoryFile({
      repositoryRoot,
      relativePath: entry.approval.emailPath,
      label: "Approved email",
    });
    const actualEmailSha256 = sha256(emailBytes);
    if (
      !digestsEqual(entry.approval.renderedEmailSha256, actualEmailSha256)
    ) {
      throw new Error(
        `Approved email hash mismatch: expected ${entry.approval.renderedEmailSha256}, received ${actualEmailSha256}`,
      );
    }
    if (entry.approval.kind === "LEGACY_BASELINE") continue;

    const expectedManifestPath =
      `audits/weekly-briefing-activity/${entry.edition}/manifest.json`;
    if (entry.approval.manifestPath !== expectedManifestPath) {
      throw new Error("Approved manifest path does not match its edition");
    }
    const manifestBytes = await readRepositoryFile({
      repositoryRoot,
      relativePath: entry.approval.manifestPath,
      label: "Approved manifest",
    });
    let manifestValue: unknown;
    try {
      manifestValue = JSON.parse(manifestBytes.toString("utf8"));
    } catch {
      throw new Error("Approved activity manifest is not valid JSON");
    }
    const manifest = assertManifestPublishable(manifestValue, {
      repositoryRoot,
    });
    if (manifest.cutoffDate !== entry.edition) {
      throw new Error("Approved manifest cutoff does not match its edition");
    }
    if (!digestsEqual(entry.approval.manifestSha256, manifest.manifestSha256)) {
      throw new Error(
        `Approved manifest hash mismatch: expected ${entry.approval.manifestSha256}, received ${manifest.manifestSha256}`,
      );
    }
    const protectedInput = manifest.frozenInputs.find(
      (input) => input.inputArtifactId === "protected-non-chart-email",
    );
    if (!protectedInput) {
      throw new Error(
        "Approved manifest is missing its protected non-chart email input",
      );
    }
    if (
      !digestsEqual(
        entry.approval.protectedNonChartSha256,
        protectedInput.sha256,
      )
    ) {
      throw new Error(
        "Approved index non-chart hash does not match the manifest's frozen email input",
      );
    }
    const actualNonChartSha256 = computeProtectedNonChartSha256(
      emailBytes.toString("utf8"),
    );
    if (
      !digestsEqual(
        entry.approval.protectedNonChartSha256,
        actualNonChartSha256,
      )
    ) {
      throw new Error(
        `Protected non-chart hash mismatch: expected ${entry.approval.protectedNonChartSha256}, received ${actualNonChartSha256}`,
      );
    }
    const expectedRenderedEmail = renderManifestActivityEmail({
      sourceHtml: emailBytes.toString("utf8"),
      manifest,
      expectedNonChartSha256: entry.approval.protectedNonChartSha256,
    }).html;
    if (emailBytes.toString("utf8") !== expectedRenderedEmail) {
      throw new Error(
        "Approved email does not byte-for-byte match the deterministic manifest render",
      );
    }

    const expectedQaPath =
      `audits/weekly-briefing-activity/${entry.edition}/outlook-qa-approval.json`;
    if (entry.approval.outlookQaPath !== expectedQaPath) {
      throw new Error("Outlook QA artifact path does not match its edition");
    }
    const qaBytes = await readRepositoryFile({
      repositoryRoot,
      relativePath: entry.approval.outlookQaPath,
      label: "Outlook QA approval",
    });
    const actualQaSha256 = sha256(qaBytes);
    if (!digestsEqual(entry.approval.outlookQaSha256, actualQaSha256)) {
      throw new Error(
        `Outlook QA artifact hash mismatch: expected ${entry.approval.outlookQaSha256}, received ${actualQaSha256}`,
      );
    }
    const qaApproval = parseOutlookQaApproval(qaBytes.toString("utf8"));
    assertOutlookQaApprovalMatches(qaApproval, {
      edition: entry.edition,
      manifestSha256: manifest.manifestSha256,
      renderedEmailSha256: actualEmailSha256,
      protectedNonChartSha256: actualNonChartSha256,
    });
  }
}

export async function readApprovedWeeklyBriefingIndex(
  indexPath = DEFAULT_APPROVED_EDITIONS_PATH,
  repositoryRoot = process.cwd(),
): Promise<ApprovedWeeklyBriefingIndex> {
  const index = parseApprovedWeeklyBriefingIndex(
    await readFile(indexPath, "utf8"),
  );
  await validateApprovedWeeklyBriefingIndexDependencies(index, repositoryRoot);
  return index;
}

export function resolveLatestApprovedWeeklyBriefingEdition({
  index,
  archivedEditions,
}: {
  index: ApprovedWeeklyBriefingIndex;
  archivedEditions: readonly string[];
}): string {
  const archived = new Set(archivedEditions);
  const missing = index.entries
    .map((entry) => entry.edition)
    .filter((edition) => !archived.has(edition));
  if (missing.length > 0) {
    throw new Error(
      `Approved weekly briefing edition is missing from the archive: ${missing.join(", ")}`,
    );
  }

  return index.entries
    .map((entry) => entry.edition)
    .sort((left, right) => right.localeCompare(left))[0];
}
