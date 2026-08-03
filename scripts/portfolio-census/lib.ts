import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ORG_CANONICAL, resolveOrgName } from "../../prisma/entity-resolution";
import {
  portfolioCensusManifestSchema,
  portfolioCensusResultSchema,
  repoSnapshotSchema,
  type PortfolioCensusManifest,
  type PortfolioCensusRepoSnapshot,
  type PortfolioCensusResult,
} from "./schema";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const MANAGER_UNIVERSE_PATH = path.join(REPO_ROOT, "scripts/research/manager-universe.json");
export const WORKER_TEMPLATE_PATH = path.join(REPO_ROOT, "scripts/portfolio-census/worker-prompt.md");
export const ORCHESTRATOR_PROMPT_PATH = path.join(REPO_ROOT, "scripts/portfolio-census/orchestrator-prompt.md");
export const RESULT_JSON_START = "<portfolio_census_json>";
export const RESULT_JSON_END = "</portfolio_census_json>";
export const RESULT_REPORT_START = "<portfolio_census_report>";
export const RESULT_REPORT_END = "</portfolio_census_report>";

const MANAGER_ALIAS_GROUPS: Record<string, string[]> = {
  "3i Infrastructure": ["3i Group", "3i North American Infrastructure"],
  "ADIA Infrastructure": ["ADIA", "Abu Dhabi Investment Authority", "Abu Dhabi Investment Authority (ADIA)"],
  "APG Infrastructure": ["APG", "APG Asset Management"],
  "BlackRock": ["BlackRock Infrastructure", "GIP", "Global Infrastructure Partners"],
  "CVC": ["CVC DIF", "DIF"],
  "DIF": ["CVC DIF", "CVC"],
  "Global Infrastructure Partners": ["GIP", "BlackRock"],
  "Goldman Sachs Asset Management": ["GSAM", "Goldman Sachs Alternatives"],
  "InfraBridge": ["DigitalBridge"],
  "Northleaf Capital": ["Northleaf"],
  "Ontario Teachers Pension Plan": ["Ontario Teachers'", "OTPP"],
  "Quinbrook Infrastructure Partners": ["Quinbrook Infrastructure", "Quinbrook"],
};

export interface ParsedPortfolioCensusResponse {
  result: PortfolioCensusResult;
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
  if (!Array.isArray(parsed) || !parsed.every((value) => typeof value === "string" && value.trim())) {
    throw new Error(`${MANAGER_UNIVERSE_PATH} must contain a non-empty JSON string array`);
  }
  const managers = parsed.map((value) => value.trim());
  const duplicates = managers.filter((manager, index) => managers.indexOf(manager) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Manager universe contains duplicates: ${[...new Set(duplicates)].join(", ")}`);
  }
  if (managers.length !== 100) {
    throw new Error(`Portfolio census requires exactly 100 managers; found ${managers.length}`);
  }
  return managers;
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
  return path.resolve(
    REPO_ROOT,
    runDirectory ?? path.join("audits", "portfolio-census", asOfDate),
  );
}

function normalizeManager(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(the|inc|llc|ltd|plc|lp|limited|corporation|corp|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function managerAliases(requestedManager: string): string[] {
  const canonical = resolveOrgName(requestedManager);
  const aliases = new Set<string>([
    requestedManager,
    canonical,
    ...(MANAGER_ALIAS_GROUPS[requestedManager] ?? []),
  ]);

  for (const [variant, resolved] of Object.entries(ORG_CANONICAL)) {
    if (
      normalizeManager(resolved) === normalizeManager(canonical)
      || normalizeManager(variant) === normalizeManager(requestedManager)
    ) {
      aliases.add(variant);
      aliases.add(resolved);
    }
  }
  return [...aliases].filter(Boolean).sort((left, right) => left.localeCompare(right));
}

export function canonicalManager(requestedManager: string): string {
  return resolveOrgName(requestedManager);
}

export function managerNameMatches(value: string | null | undefined, aliases: string[]): boolean {
  if (!value) return false;
  const normalizedValue = normalizeManager(resolveOrgName(value));
  return aliases.some((alias) => {
    const normalizedAlias = normalizeManager(resolveOrgName(alias));
    return normalizedValue === normalizedAlias;
  });
}

export function renderWorkerPrompt(input: {
  asOfDate: string;
  managerIndex: number;
  requestedManager: string;
  snapshot: PortfolioCensusRepoSnapshot;
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
  if (unresolved) throw new Error(`Unresolved worker prompt placeholders: ${unresolved.join(", ")}`);
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

export function parsePortfolioCensusResponse(
  response: string,
  expected?: { manager?: string; asOfDate?: string; snapshotSource?: PortfolioCensusRepoSnapshot["source"] },
): ParsedPortfolioCensusResponse {
  const rawJson = stripCodeFence(extractMarkedSection(response, RESULT_JSON_START, RESULT_JSON_END));
  const report = stripCodeFence(extractMarkedSection(response, RESULT_REPORT_START, RESULT_REPORT_END));
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch (error) {
    throw new Error(`Portfolio census JSON is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  const parsed = portfolioCensusResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) =>
      `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new Error(`Portfolio census result failed validation:\n${issues.join("\n")}`);
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
  if (report.length < 80) {
    throw new Error("Portfolio census Markdown report is too short to be reviewable");
  }
  if (!report.toLowerCase().includes(parsed.data.requestedManager.toLowerCase())) {
    throw new Error("Portfolio census Markdown report does not name the requested manager");
  }
  return { result: parsed.data, report };
}

export function loadManifest(manifestPath: string): PortfolioCensusManifest {
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
  const parsed = portfolioCensusManifestSchema.safeParse(
    JSON.parse(fs.readFileSync(manifestPath, "utf8")),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid portfolio census manifest:\n${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}

export function createManifest(asOfDate: string, createdAt = new Date().toISOString()): PortfolioCensusManifest {
  assertCalendarDate(asOfDate, "--as-of");
  const managers = getManagerUniverse();
  return portfolioCensusManifestSchema.parse({
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_MANIFEST",
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

export function atomicWrite(filePath: string, contents: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporaryPath, contents);
  fs.renameSync(temporaryPath, filePath);
}

export function readAndValidateSnapshot(snapshotPath: string): PortfolioCensusRepoSnapshot {
  const parsed = repoSnapshotSchema.safeParse(JSON.parse(fs.readFileSync(snapshotPath, "utf8")));
  if (!parsed.success) {
    throw new Error(
      `Invalid repo snapshot:\n${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}
