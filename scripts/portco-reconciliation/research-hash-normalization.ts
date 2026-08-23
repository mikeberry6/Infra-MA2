#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { z } from "zod";
import { sha256Canonical } from "./hash";

const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const taskSchema = z.strictObject({
  sequence: z.number().int().positive(),
  taskId: z.string().min(1),
  subject: z.string().min(1),
  promptPath: z.string().min(1),
  promptSha256: sha256Value,
  responseSha256: sha256Value,
  artifacts: z.record(z.string(), z.string()),
}).passthrough();

const stagingManifestSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_RESEARCH_STAGING_MANIFEST"),
  tasks: z.array(taskSchema),
});

interface Options {
  repositoryRoot: string;
  manifestPath: string;
  closeoutPath: string;
  outputPath: string;
  generatedAt: string;
}

function sha256Bytes(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function acceptedResponsePath(promptPath: string): string {
  return resolve(dirname(promptPath), "chatgpt-accepted-response.txt");
}

export async function buildResearchHashNormalization(input: Options) {
  const root = resolve(input.repositoryRoot);
  const manifestPath = resolve(root, input.manifestPath);
  const closeoutPath = resolve(root, input.closeoutPath);
  const manifest = stagingManifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const closeout = z.object({
    legacyPromptHashDifferenceSequences: z.array(z.number().int().positive()),
    legacyResponseHashDifferenceSequences: z.array(z.number().int().positive()),
  }).parse(JSON.parse(await readFile(closeoutPath, "utf8")));
  const declaredPromptDifferences = new Set(closeout.legacyPromptHashDifferenceSequences);
  const declaredResponseDifferences = new Set(closeout.legacyResponseHashDifferenceSequences);
  const records = await Promise.all(manifest.tasks.map(async (task) => {
    const promptAbsolute = resolve(root, task.promptPath);
    const responseAbsolute = resolve(
      root,
      task.artifacts.acceptedResponse
        ?? task.artifacts.response
        ?? relative(root, acceptedResponsePath(promptAbsolute)),
    );
    const [promptBytes, responseBytes] = await Promise.all([
      readFile(promptAbsolute),
      readFile(responseAbsolute),
    ]);
    const promptArtifactSha256 = sha256Bytes(promptBytes);
    const responseArtifactSha256 = sha256Bytes(responseBytes);
    return {
      sequence: task.sequence,
      taskId: task.taskId,
      subject: task.subject,
      prompt: {
        artifactPath: relative(root, promptAbsolute),
        legacyTransportSha256: task.promptSha256,
        artifactByteSha256: promptArtifactSha256,
        differsFromLegacyTransportHash: promptArtifactSha256 !== task.promptSha256,
        declaredByResearchCloseout: declaredPromptDifferences.has(task.sequence),
      },
      response: {
        artifactPath: relative(root, responseAbsolute),
        legacyTransportSha256: task.responseSha256,
        artifactByteSha256: responseArtifactSha256,
        differsFromLegacyTransportHash: responseArtifactSha256 !== task.responseSha256,
        declaredByResearchCloseout: declaredResponseDifferences.has(task.sequence),
      },
    };
  }));
  const withoutHash = {
    schemaVersion: 1 as const,
    artifactType: "PORTCO_RESEARCH_ARTIFACT_HASH_NORMALIZATION" as const,
    generatedAt: input.generatedAt,
    sourceManifest: relative(root, manifestPath),
    sourceManifestByteSha256: sha256Bytes(await readFile(manifestPath)),
    sourceCloseout: relative(root, closeoutPath),
    sourceCloseoutByteSha256: sha256Bytes(await readFile(closeoutPath)),
    policy: "Legacy transport hashes are retained for lineage; proposal generation must bind artifactByteSha256.",
    summary: {
      tasks: records.length,
      closeoutDeclaredPromptDifferences: declaredPromptDifferences.size,
      closeoutDeclaredResponseDifferences: declaredResponseDifferences.size,
      fullByteAuditPromptDifferences: records.filter((record) => record.prompt.differsFromLegacyTransportHash).length,
      fullByteAuditResponseDifferences: records.filter((record) => record.response.differsFromLegacyTransportHash).length,
      newlyDetectedPromptDifferenceSequences: records
        .filter((record) => record.prompt.differsFromLegacyTransportHash && !record.prompt.declaredByResearchCloseout)
        .map((record) => record.sequence),
      newlyDetectedResponseDifferenceSequences: records
        .filter((record) => record.response.differsFromLegacyTransportHash && !record.response.declaredByResearchCloseout)
        .map((record) => record.sequence),
      closeoutPromptDifferencesNotReproduced: records
        .filter((record) => !record.prompt.differsFromLegacyTransportHash && record.prompt.declaredByResearchCloseout)
        .map((record) => record.sequence),
      closeoutResponseDifferencesNotReproduced: records
        .filter((record) => !record.response.differsFromLegacyTransportHash && record.response.declaredByResearchCloseout)
        .map((record) => record.sequence),
    },
    records,
  };
  return {
    ...withoutHash,
    normalizationSha256: sha256Canonical(withoutHash),
  };
}

function options(argv: string[]): Map<string, string> {
  return new Map(argv.map((argument) => {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    const separator = argument.indexOf("=");
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const repositoryRoot = resolve(values.get("repository-root") ?? resolve(import.meta.dirname, "../.."));
  const manifestPath = values.get("manifest")
    ?? "audits/portco-reconciliation/2026-08-19/research-staging/manifest.json";
  const closeoutPath = values.get("closeout")
    ?? "audits/portco-reconciliation/2026-08-19/research-staging/closeout.json";
  const outputPath = values.get("output")
    ?? "audits/portco-reconciliation/2026-08-19/research-staging/artifact-hash-normalization.json";
  const generatedAt = values.get("generated-at") ?? new Date().toISOString();
  const artifact = await buildResearchHashNormalization({
    repositoryRoot,
    manifestPath,
    closeoutPath,
    outputPath,
    generatedAt,
  });
  await writeFile(resolve(repositoryRoot, outputPath), `${JSON.stringify(artifact, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ outputPath, summary: artifact.summary, normalizationSha256: artifact.normalizationSha256 }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
