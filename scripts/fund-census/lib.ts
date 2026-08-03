import fs from "fs";
import path from "path";
import {
  fundCensusManifestSchema,
  fundCensusRepoSnapshotSchema,
  fundCensusResultSchema,
  snapshotFieldNames,
  type FundCensusManifest,
  type FundCensusRepoSnapshot,
  type FundCensusResult,
} from "./schema";

export const REPO_ROOT = path.resolve(process.cwd());
export const MANAGER_UNIVERSE_PATH = path.join(REPO_ROOT, "scripts/research/manager-universe.json");
export const FUND_MANIFEST_PATH = path.join(REPO_ROOT, "prisma/seed-data/funds.manifest.json");
export const WORKER_TEMPLATE_PATH = path.join(REPO_ROOT, "scripts/fund-census/worker-prompt.md");
export const ORCHESTRATOR_PROMPT_PATH = path.join(REPO_ROOT, "scripts/fund-census/orchestrator-prompt.md");
export const RESULT_JSON_START = "<fund_census_json>";
export const RESULT_JSON_END = "</fund_census_json>";
export const RESULT_REPORT_START = "<fund_census_report>";
export const RESULT_REPORT_END = "</fund_census_report>";

const MANIFEST_MANAGER_OVERRIDES: Record<string, string> = {
  "3i Infrastructure": "3i Group",
  "ADIA Infrastructure": "Abu Dhabi Investment Authority (ADIA)",
  "Amber Infrastructure": "Amber Infrastructure Group",
  "APG Infrastructure": "APG Asset Management",
  "ArcLight Capital": "ArcLight Capital Partners",
  "Australian Super": "AustralianSuper",
  "Brookfield Asset Management": "Brookfield",
  "Carlyle Infrastructure": "Carlyle Group",
  "CDPQ": "La Caisse de dépôt (CDPQ)",
  "CVC": "CVC DIF",
  "DIF": "CVC DIF",
  "DWS Infrastructure": "DWS",
  "EIG Global Energy Partners": "EIG",
  "Ember Infrastructure": "Ember Infrastructure Management",
  "EQT Infrastructure": "EQT",
  "Global Infrastructure Partners": "BlackRock (GIP)",
  "Goldman Sachs Asset Management": "Goldman Sachs Alternatives",
  "Harbert Management Corp": "Harbert Management Corporation",
  "Mubadala": "Mubadala Investment Company",
  "Northleaf Capital": "Northleaf Capital Partners",
  "Ontario Teachers Pension Plan": "Ontario Teachers' Pension Plan",
  "QIC Global Infrastructure": "QIC",
  "Tallvine": "Tallvine Partners",
};

const RESEARCH_ALIAS_GROUPS: Record<string, string[]> = {
  "3i Infrastructure": ["3i Group", "3i North American Infrastructure"],
  "ADIA Infrastructure": ["ADIA", "Abu Dhabi Investment Authority"],
  "Amber Infrastructure": ["Amber Infrastructure Group"],
  "APG Infrastructure": ["APG", "APG Asset Management"],
  "ArcLight Capital": ["ArcLight Capital Partners"],
  "Australian Super": ["AustralianSuper"],
  "BlackRock": ["BlackRock Infrastructure"],
  "Brookfield Asset Management": ["Brookfield", "Brookfield Infrastructure"],
  "Carlyle Infrastructure": ["Carlyle Group"],
  "CDPQ": ["La Caisse", "La Caisse de dépôt et placement du Québec"],
  "CVC": ["CVC DIF", "DIF Capital Partners"],
  "DIF": ["CVC DIF", "DIF Capital Partners"],
  "DigitalBridge": ["Digital Colony"],
  "DWS Infrastructure": ["DWS"],
  "EIG Global Energy Partners": ["EIG"],
  "Ember Infrastructure": ["Ember Infrastructure Management"],
  "EQT Infrastructure": ["EQT"],
  "Global Infrastructure Partners": ["GIP", "BlackRock GIP"],
  "Goldman Sachs Asset Management": ["GSAM", "Goldman Sachs Alternatives"],
  "Harbert Management Corp": ["Harbert Management Corporation"],
  "InfraBridge": ["AMP Capital Global Infrastructure Equity"],
  "Northleaf Capital": ["Northleaf Capital Partners"],
  "Ontario Teachers Pension Plan": ["Ontario Teachers'", "OTPP"],
  "QIC Global Infrastructure": ["QIC"],
  "Tallvine": ["Tallvine Partners"],
};

const OVERLAP_GROUPS = [
  ["BlackRock", "Global Infrastructure Partners"],
  ["CVC", "DIF"],
  ["DigitalBridge", "InfraBridge"],
] as const;

export interface ParsedFundCensusResponse {
  result: FundCensusResult;
  report: string;
}

export function assertCalendarDate(value: string, label: string): void {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || Number.isNaN(parsed.valueOf())
    || parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${label} must use a valid YYYY-MM-DD date`);
  }
}

export function getManagerUniverse(): string[] {
  const parsed = JSON.parse(fs.readFileSync(MANAGER_UNIVERSE_PATH, "utf8")) as unknown;
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string" && item.trim())) {
    throw new Error("Manager universe must be a non-empty JSON string array");
  }
  const managers = parsed.map((item) => item.trim());
  if (managers.length !== 100) {
    throw new Error(`Fund census requires exactly 100 managers; found ${managers.length}`);
  }
  if (new Set(managers).size !== managers.length) {
    throw new Error("Manager universe contains duplicate requested managers");
  }
  return managers;
}

export function normalizeManager(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(the|inc|llc|ltd|plc|lp|limited|corporation|corp|company|co|partners|management|group)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function managerArtifactStem(index: number, manager: string): string {
  return `${String(index).padStart(3, "0")}-${slugify(manager)}`;
}

export function resolveRunDirectory(asOfDate: string, runDirectory?: string): string {
  return path.resolve(REPO_ROOT, runDirectory ?? path.join("audits", "fund-census", asOfDate));
}

export function manifestManagerFor(
  requestedManager: string,
  manifestManagers: string[],
): string | null {
  const override = MANIFEST_MANAGER_OVERRIDES[requestedManager];
  if (override && manifestManagers.includes(override)) return override;
  if (manifestManagers.includes(requestedManager)) return requestedManager;
  const normalized = normalizeManager(requestedManager);
  const matches = manifestManagers.filter((manager) => normalizeManager(manager) === normalized);
  return matches.length === 1 ? matches[0] : null;
}

export function managerAliases(requestedManager: string, canonicalManager: string | null): string[] {
  return [...new Set([
    requestedManager,
    canonicalManager,
    ...(RESEARCH_ALIAS_GROUPS[requestedManager] ?? []),
  ].filter((item): item is string => !!item?.trim()))].sort((left, right) => left.localeCompare(right));
}

export function overlappingSuppliedManagers(requestedManager: string): string[] {
  const group = OVERLAP_GROUPS.find((items) => items.includes(requestedManager as never));
  return group ? group.filter((manager) => manager !== requestedManager) : [];
}

export function renderWorkerPrompt(input: {
  asOfDate: string;
  managerIndex: number;
  requestedManager: string;
  snapshot: FundCensusRepoSnapshot;
  managerUniverse?: string[];
}): string {
  assertCalendarDate(input.asOfDate, "--as-of");
  const template = fs.readFileSync(WORKER_TEMPLATE_PATH, "utf8");
  const replacements: Record<string, string> = {
    AS_OF_DATE: input.asOfDate,
    MANAGER_INDEX: String(input.managerIndex),
    MANAGER_COUNT: String((input.managerUniverse ?? getManagerUniverse()).length),
    REQUESTED_MANAGER: input.requestedManager,
    REPO_SNAPSHOT_SOURCE: input.snapshot.source,
    EXISTING_REPO_SNAPSHOT_JSON: JSON.stringify(input.snapshot, null, 2),
    SUPPLIED_MANAGER_UNIVERSE_JSON: JSON.stringify(input.managerUniverse ?? getManagerUniverse(), null, 2),
  };
  const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    if (!(key in replacements)) throw new Error(`Unknown worker prompt placeholder: ${key}`);
    return replacements[key];
  });
  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved prompt placeholders: ${unresolved.join(", ")}`);
  return rendered;
}

function extractMarkedSection(input: string, start: string, end: string): string {
  const startIndex = input.indexOf(start);
  const endIndex = input.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Response is missing required markers ${start} and ${end}`);
  }
  return input.slice(startIndex + start.length, endIndex).trim();
}

function stripCodeFence(value: string): string {
  return value
    .replace(/^```(?:json|markdown|md)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export function parseFundCensusResponse(
  response: string,
  expected?: {
    manager?: string;
    asOfDate?: string;
    snapshotSource?: FundCensusRepoSnapshot["source"];
    knownManager?: boolean;
  },
): ParsedFundCensusResponse {
  const rawJson = stripCodeFence(extractMarkedSection(response, RESULT_JSON_START, RESULT_JSON_END));
  const report = stripCodeFence(extractMarkedSection(response, RESULT_REPORT_START, RESULT_REPORT_END));
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch (error) {
    throw new Error(`Fund census JSON is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }
  const parsed = fundCensusResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(`Fund census result failed validation:\n${parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")}`);
  }
  if (expected?.manager && parsed.data.requestedManager !== expected.manager) {
    throw new Error(`Expected manager "${expected.manager}", received "${parsed.data.requestedManager}"`);
  }
  if (expected?.asOfDate && parsed.data.asOfDate !== expected.asOfDate) {
    throw new Error(`Expected as-of date ${expected.asOfDate}, received ${parsed.data.asOfDate}`);
  }
  if (expected?.snapshotSource && parsed.data.repoSnapshotSource !== expected.snapshotSource) {
    throw new Error(
      `Expected repo snapshot source ${expected.snapshotSource}, received ${parsed.data.repoSnapshotSource}`,
    );
  }
  if (
    typeof expected?.knownManager === "boolean"
    && (parsed.data.managerScopeStatus === "KNOWN_MANAGER") !== expected.knownManager
  ) {
    throw new Error("Manager scope status does not match the repository snapshot");
  }
  if (report.length < 80) throw new Error("Fund census Markdown report is too short");
  if (!report.toLowerCase().includes(parsed.data.requestedManager.toLowerCase())) {
    throw new Error("Fund census Markdown report does not name the requested manager");
  }
  return { result: parsed.data, report };
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateResultAgainstSnapshot(
  result: FundCensusResult,
  snapshot: FundCensusRepoSnapshot,
): string[] {
  const issues: string[] = [];
  if (result.canonicalManager !== snapshot.canonicalManager) {
    issues.push(`canonicalManager must equal snapshot value ${JSON.stringify(snapshot.canonicalManager)}`);
  }
  const expectedScope = snapshot.knownManager ? "KNOWN_MANAGER" : "OUT_OF_SCOPE_UNKNOWN_MANAGER";
  if (result.managerScopeStatus !== expectedScope) {
    issues.push(`managerScopeStatus must equal ${expectedScope}`);
  }

  const repoById = new Map(snapshot.funds.map((fund) => [fund.legacyId, fund]));
  const reconciledIds: string[] = [];
  for (const [index, fund] of result.funds.entries()) {
    const label = `funds.${index}`;
    for (const match of fund.matchedRepoFunds) {
      const repoFund = repoById.get(match.legacyId);
      reconciledIds.push(match.legacyId);
      if (!repoFund) {
        issues.push(`${label}.matchedRepoFunds references unknown legacyId ${match.legacyId}`);
      } else if (
        match.managerName !== repoFund.managerName
        || match.fundName !== repoFund.fundName
      ) {
        issues.push(`${label}.matchedRepoFunds does not reproduce repository identity ${match.legacyId}`);
      }
    }
    if (fund.repoDisposition === "PROPOSED_NEW") {
      if (fund.snapshot.legacyId !== null) {
        issues.push(`${label}.snapshot.legacyId must be null for PROPOSED_NEW`);
      }
      if (!snapshot.knownManager || fund.snapshot.managerName !== snapshot.canonicalManager) {
        issues.push(`${label} cannot propose a fund outside the known canonical manager`);
      }
      continue;
    }
    if (["EXISTING_VERIFIED", "PROPOSED_CORRECTION"].includes(fund.repoDisposition)) {
      if (fund.matchedRepoFunds.length !== 1) {
        issues.push(`${label}.${fund.repoDisposition} requires exactly one repository match`);
        continue;
      }
      const repoFund = repoById.get(fund.matchedRepoFunds[0].legacyId);
      if (!repoFund) continue;
      if (fund.snapshot.legacyId !== repoFund.legacyId) {
        issues.push(`${label}.snapshot.legacyId must preserve ${repoFund.legacyId}`);
      }
      const actualChangedFields = snapshotFieldNames.filter((field) =>
        !sameValue(fund.snapshot[field], repoFund[field]));
      if (!sameValue([...fund.changedFields].sort(), [...actualChangedFields].sort())) {
        issues.push(
          `${label}.changedFields must exactly equal repository diff: ${actualChangedFields.join(", ") || "(none)"}`,
        );
      }
    }

    const primaryOrInstitutional = fund.evidence.some((item) =>
      item.sourceTier === "PRIMARY" || item.sourceTier === "INSTITUTIONAL");
    if (!primaryOrInstitutional) {
      const independentSources = new Set(fund.evidence.map((item) =>
        `${item.publisher.toLowerCase()}|${new URL(item.url).hostname}`));
      if (independentSources.size < 2) {
        issues.push(`${label} has only one secondary evidence source`);
      }
      if (fund.confidence === "HIGH") {
        issues.push(`${label} cannot be HIGH confidence with secondary-only evidence`);
      }
      if (fund.repoDisposition !== "NEEDS_REVIEW") {
        issues.push(`${label} must be NEEDS_REVIEW when evidence is secondary-only`);
      }
    }
    for (const [evidenceIndex, evidence] of fund.evidence.entries()) {
      if (evidence.retrievedAt > result.asOfDate) {
        issues.push(`${label}.evidence.${evidenceIndex}.retrievedAt is after the census as-of date`);
      }
    }
  }
  for (const [index, record] of result.repoOnlyRecords.entries()) {
    reconciledIds.push(record.legacyId);
    const repoFund = repoById.get(record.legacyId);
    if (!repoFund) {
      issues.push(`repoOnlyRecords.${index} references unknown legacyId ${record.legacyId}`);
    } else if (record.repoFundName !== repoFund.fundName) {
      issues.push(`repoOnlyRecords.${index}.repoFundName does not match ${record.legacyId}`);
    }
  }

  const counts = new Map<string, number>();
  for (const legacyId of reconciledIds) counts.set(legacyId, (counts.get(legacyId) ?? 0) + 1);
  for (const legacyId of repoById.keys()) {
    const count = counts.get(legacyId) ?? 0;
    if (count !== 1) {
      issues.push(`Repository legacyId ${legacyId} must be reconciled exactly once; found ${count}`);
    }
  }
  for (const [legacyId, count] of counts) {
    if (count > 1) issues.push(`Repository legacyId ${legacyId} is reconciled ${count} times`);
  }
  return issues;
}

export function createManifest(
  asOfDate: string,
  createdAt = new Date().toISOString(),
): FundCensusManifest {
  assertCalendarDate(asOfDate, "--as-of");
  const managers = getManagerUniverse();
  return fundCensusManifestSchema.parse({
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_MANIFEST",
    asOfDate,
    createdAt,
    updatedAt: createdAt,
    status: "READY",
    concurrency: 1,
    managerCount: 100,
    currentIndex: 1,
    modelConfiguration: {
      surface: "CHATGPT_WEB",
      model: "gpt-5.6-sol",
      reasoningMode: "pro",
    },
    managers: managers.map((requestedManager, index) => ({
      index: index + 1,
      requestedManager,
      slug: slugify(requestedManager),
      status: "PENDING",
      attempts: 0,
      startedAt: null,
      completedAt: null,
      resultJson: null,
      reportMarkdown: null,
      error: null,
    })),
  });
}

export function loadManifest(manifestPath: string): FundCensusManifest {
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
  const parsed = fundCensusManifestSchema.safeParse(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
  if (!parsed.success) {
    throw new Error(`Invalid fund census manifest:\n${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`);
  }
  return parsed.data;
}

export function readAndValidateSnapshot(snapshotPath: string): FundCensusRepoSnapshot {
  const parsed = fundCensusRepoSnapshotSchema.safeParse(
    JSON.parse(fs.readFileSync(snapshotPath, "utf8")),
  );
  if (!parsed.success) {
    throw new Error(`Invalid fund census snapshot:\n${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`);
  }
  return parsed.data;
}

export function atomicWrite(filePath: string, contents: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporaryPath, contents);
  fs.renameSync(temporaryPath, filePath);
}
