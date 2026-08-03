import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import {
  scorecardPromptContextSchema,
  scorecardResearchResultSchema,
  type ScorecardPromptContext,
  type ScorecardResearchResult,
} from "./schema";

export const SCORECARD_JSON_START = "<scorecard_refresh_json>";
export const SCORECARD_JSON_END = "</scorecard_refresh_json>";
export const SCORECARD_REPORT_START = "<scorecard_refresh_report>";
export const SCORECARD_REPORT_END = "</scorecard_refresh_report>";

const SCORECARD_REFRESH_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PROMPT_PATH = path.join(SCORECARD_REFRESH_DIRECTORY, "worker-prompt.md");
const REPAIR_PROMPT_PATH = path.join(SCORECARD_REFRESH_DIRECTORY, "repair-prompt.md");

function outputJsonSchema(): unknown {
  return z.toJSONSchema(scorecardResearchResultSchema, { target: "draft-7" });
}

function renderTemplate(template: string, replacements: Record<string, string>): string {
  const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    if (!(key in replacements)) throw new Error(`Unknown scorecard prompt placeholder: ${key}`);
    return replacements[key];
  });
  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved scorecard prompt placeholders: ${unresolved.join(", ")}`);
  return rendered;
}

export function renderScorecardWorkerPrompt(input: ScorecardPromptContext): string {
  const context = scorecardPromptContextSchema.parse(input);
  return renderTemplate(fs.readFileSync(WORKER_PROMPT_PATH, "utf8"), {
    AS_OF_DATE: context.asOfDate,
    REQUESTED_COMPANY: context.canonicalName,
    CONTEXT_JSON: JSON.stringify(context, null, 2),
    OUTPUT_JSON_SCHEMA: JSON.stringify(outputJsonSchema(), null, 2),
  });
}

export function renderScorecardRepairPrompt(input: {
  originalResponse: string;
  validationErrors: string[];
}): string {
  if (input.validationErrors.length === 0) throw new Error("A repair prompt requires validation errors");
  return renderTemplate(fs.readFileSync(REPAIR_PROMPT_PATH, "utf8"), {
    VALIDATION_ERRORS: input.validationErrors.map((error) => `- ${error}`).join("\n"),
    ORIGINAL_RESPONSE: input.originalResponse,
    OUTPUT_JSON_SCHEMA: JSON.stringify(outputJsonSchema(), null, 2),
  });
}

function markerCount(value: string, marker: string): number {
  return value.split(marker).length - 1;
}

function extractMarkedSection(value: string, start: string, end: string): string {
  if (markerCount(value, start) !== 1 || markerCount(value, end) !== 1) {
    throw new Error(`Response must contain exactly one ${start} and one ${end}`);
  }
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end);
  if (endIndex <= startIndex) throw new Error(`${end} must follow ${start}`);
  return value.slice(startIndex + start.length, endIndex).trim();
}

function stripCodeFence(value: string): string {
  return value
    .replace(/^```(?:json|markdown|md)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export interface ParsedScorecardResponse {
  result: ScorecardResearchResult;
  report: string;
}

export class ScorecardResponseValidationError extends Error {
  readonly validationErrors: string[];

  constructor(errors: string[]) {
    super(`Scorecard response failed validation:\n${errors.map((error) => `- ${error}`).join("\n")}`);
    this.name = "ScorecardResponseValidationError";
    this.validationErrors = errors;
  }
}

export function parseScorecardResponse(
  response: string,
  expected: ScorecardPromptContext,
): ParsedScorecardResponse {
  const context = scorecardPromptContextSchema.parse(expected);
  let rawJson: string;
  let report: string;
  try {
    rawJson = stripCodeFence(extractMarkedSection(response, SCORECARD_JSON_START, SCORECARD_JSON_END));
    report = stripCodeFence(extractMarkedSection(response, SCORECARD_REPORT_START, SCORECARD_REPORT_END));
  } catch (error) {
    throw new ScorecardResponseValidationError([error instanceof Error ? error.message : String(error)]);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(rawJson);
  } catch (error) {
    throw new ScorecardResponseValidationError([
      `JSON is invalid: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
  const parsed = scorecardResearchResultSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new ScorecardResponseValidationError(parsed.error.issues.map((issue) =>
      `${issue.path.join(".") || "(root)"}: ${issue.message}`));
  }

  const errors: string[] = [];
  const exactFields: Array<[string, unknown, unknown]> = [
    ["asOfDate", parsed.data.asOfDate, context.asOfDate],
    ["taskIndex", parsed.data.taskIndex, context.taskIndex],
    ["taskId", parsed.data.taskId, context.taskId],
    ["companyId", parsed.data.companyId, context.companyId],
    ["requestedCompany", parsed.data.requestedCompany, context.canonicalName],
    ["companySnapshotHash", parsed.data.companySnapshotHash, context.companySnapshotHash],
    ["sourceDatabaseSnapshotHash", parsed.data.sourceDatabaseSnapshotHash, context.sourceDatabaseSnapshotHash],
  ];
  exactFields.forEach(([field, actual, wanted]) => {
    if (actual !== wanted) errors.push(`${field} must echo the task context exactly`);
  });
  if (JSON.stringify(parsed.data.executionAttestation) !== JSON.stringify(context.executionAttestation)) {
    errors.push("executionAttestation must echo the externally verified task context exactly");
  }
  if (report.length < 100) errors.push("Markdown report is too short");
  if (!report.toLocaleLowerCase("en-US").includes(context.canonicalName.toLocaleLowerCase("en-US"))) {
    errors.push("Markdown report must name the requested company");
  }
  if (errors.length > 0) throw new ScorecardResponseValidationError(errors);
  return { result: parsed.data, report };
}
