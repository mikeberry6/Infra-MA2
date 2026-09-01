import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function fixture(canonicalKey = "altan-redes") {
  const directory = await mkdtemp(join(process.cwd(), ".normalize-staged-test-"));
  temporaryDirectories.push(directory);
  const paths = {
    source: join(directory, "source.json"),
    response: join(directory, "response.md"),
    verification: join(directory, "verification.json"),
    prompt: join(directory, "prompt.txt"),
    manifest: join(directory, "manifest.json"),
    output: join(directory, "output.json"),
  };
  const staleTaskId = "ledger:0343:altan-redes:stale001";
  const correctedTaskId = "ledger:0343:altan-redes:correct1";
  await Promise.all([
    writeFile(paths.source, JSON.stringify({
      taskId: staleTaskId,
      taskIndex: 343,
      companyName: "Altán Redes",
      asOfDate: "2026-09-01",
      modelDecision: "PROPOSED_CORRECTION",
      confidence: "HIGH_WITH_DISCLOSURE_GAPS",
      responseSha256: "a".repeat(64),
      repoReconciliation: { canonicalKey },
    })),
    writeFile(paths.response, [
      "BEGIN_JSON",
      JSON.stringify({
        decision: "PROPOSED_CORRECTION",
        rationale: "Correct the evidenced ownership record.",
        confidence: { overall: "HIGH" },
        evidence: [{ url: "https://example.com/source", purpose: "Ownership" }],
      }),
      "END_JSON",
    ].join("\n")),
    writeFile(paths.verification, JSON.stringify({ artifactType: "PORTCO_RECONCILIATION_SOURCE_VERIFICATION" })),
    writeFile(paths.prompt, `TASK: ${staleTaskId}\nREQUESTED COMPANY: Altán Redes\n`),
    writeFile(paths.manifest, JSON.stringify({
      tasks: [{ taskId: correctedTaskId, sequence: 343, subject: "Altán Redes", canonicalKey: "altan-redes" }],
    })),
  ]);
  return { paths, staleTaskId, correctedTaskId };
}

async function run(input: Awaited<ReturnType<typeof fixture>>) {
  return execFileAsync("npx", [
    "tsx",
    "scripts/portco-reconciliation/normalize-staged-research-decision-cli.ts",
    `--source-decision=${input.paths.source}`,
    `--accepted-response=${input.paths.response}`,
    `--source-verification=${input.paths.verification}`,
    `--research-prompt=${input.paths.prompt}`,
    `--identity-manifest=${input.paths.manifest}`,
    `--expected-task-id=${input.correctedTaskId}`,
    "--generated-at=2026-09-01T15:00:00.000Z",
    `--output=${input.paths.output}`,
  ], { cwd: process.cwd() });
}

describe("staged research identity normalization", () => {
  it("accepts modelDecision and proves a stale task suffix from immutable identity fields", async () => {
    const input = await fixture();
    await expect(run(input)).resolves.toMatchObject({ stderr: "" });
    const normalized = JSON.parse(await readFile(input.paths.output, "utf8"));
    expect(normalized).toMatchObject({
      taskId: input.correctedTaskId,
      decision: "PROPOSED_CORRECTION",
      lineage: {
        identityCorrection: {
          originalTaskId: input.staleTaskId,
          correctedTaskId: input.correctedTaskId,
          identityManifest: { path: expect.stringContaining("manifest.json") },
        },
        confidenceNormalization: {
          acceptedValue: "HIGH",
          stagedSummaryValue: "HIGH_WITH_DISCLOSURE_GAPS",
        },
      },
    });
  });

  it("accepts a staged confidence band followed by a semicolon disclosure qualifier", async () => {
    const input = await fixture();
    const source = JSON.parse(await readFile(input.paths.source, "utf8"));
    source.confidence = "HIGH; MEDIUM on an exact stake";
    await writeFile(input.paths.source, JSON.stringify(source));
    await expect(run(input)).resolves.toMatchObject({ stderr: "" });
    const normalized = JSON.parse(await readFile(input.paths.output, "utf8"));
    expect(normalized.lineage.confidenceNormalization).toMatchObject({
      acceptedValue: "HIGH",
      stagedSummaryValue: "HIGH; MEDIUM on an exact stake",
    });
  });

  it("rejects an identity manifest whose canonical key does not match the staged research", async () => {
    const input = await fixture("different-company");
    await expect(run(input)).rejects.toMatchObject({
      stderr: expect.stringContaining("does not prove the staged task sequence, company and canonical key"),
    });
  });
});
