#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

function options(argv: string[]): Map<string, string> {
  const values = new Map<string, string>();
  for (const argument of argv) {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    values.set(argument.slice(2, separator), argument.slice(separator + 1));
  }
  return values;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

function sha256(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function repositoryPath(path: string): string {
  const result = relative(process.cwd(), resolve(path)).replaceAll("\\", "/");
  if (!result || result.startsWith("../")) throw new Error(`Artifact is outside the repository: ${path}`);
  return result;
}

function object(input: unknown, label: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`${label} must be an object`);
  }
  return input as Record<string, unknown>;
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const sourcePath = resolve(required(values, "source-decision"));
  const responsePath = resolve(required(values, "accepted-response"));
  const verificationPath = resolve(required(values, "source-verification"));
  const outputPath = resolve(required(values, "output"));
  const generatedAt = required(values, "generated-at");
  if (Number.isNaN(new Date(generatedAt).valueOf())) throw new Error("--generated-at must be an ISO timestamp");

  const [sourceBytes, responseBytes, verificationBytes] = await Promise.all([
    readFile(sourcePath),
    readFile(responsePath),
    readFile(verificationPath),
  ]);
  const source = object(JSON.parse(sourceBytes.toString("utf8")), "Source research decision");
  const response = responseBytes.toString("utf8");
  const match = response.match(/BEGIN_JSON\s*([\s\S]*?)\s*END_JSON/);
  if (!match) throw new Error("Accepted response has no BEGIN_JSON/END_JSON payload");
  const result = object(JSON.parse(match[1]), "Accepted research result");
  const verification = object(JSON.parse(verificationBytes.toString("utf8")), "Source verification");

  for (const field of ["taskId", "taskIndex", "companyName"] as const) {
    if ((typeof source[field] !== "string" && field !== "taskIndex")
      || (field === "taskIndex" && typeof source[field] !== "number")) {
      throw new Error(`Source research decision ${field} is malformed`);
    }
  }
  if (typeof result.decision !== "string" || typeof result.rationale !== "string"
    || !Array.isArray(result.evidence)) {
    throw new Error("Accepted research result lacks decision, rationale or evidence");
  }
  if (result.decision !== source.decision || result.confidence !== source.confidence) {
    throw new Error("Accepted research decision or confidence disagrees with the staged summary");
  }
  if (result.evidence.some((row) => {
    const evidence = object(row, "Research evidence row");
    return typeof evidence.url !== "string" || !evidence.url.startsWith("https://")
      || typeof evidence.purpose !== "string";
  })) {
    throw new Error("Accepted research evidence requires direct HTTPS URLs and purposes");
  }

  const normalized = {
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_APPLICATION_RESEARCH_DECISION",
    taskId: source.taskId,
    taskIndex: source.taskIndex,
    companyName: source.companyName,
    asOfDate: source.asOfDate,
    decision: source.decision,
    confidence: source.confidence,
    researchOnly: true,
    generatedAt: new Date(generatedAt).toISOString(),
    result,
    lineage: {
      sourceDecision: { path: repositoryPath(sourcePath), sha256: sha256(sourceBytes) },
      acceptedResponse: { path: repositoryPath(responsePath), sha256: sha256(responseBytes) },
      sourceVerification: { path: repositoryPath(verificationPath), sha256: sha256(verificationBytes) },
      acceptedResponseSha256: source.responseSha256,
      sourceVerificationArtifactType: verification.artifactType ?? null,
    },
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  console.log(JSON.stringify({
    output: repositoryPath(outputPath),
    taskId: normalized.taskId,
    decision: normalized.decision,
    normalizedSha256: sha256(JSON.stringify(normalized)),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
