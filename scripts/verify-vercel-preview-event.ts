#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  verifyVercelPreviewEvent,
  type VercelPreviewEventExpectations,
} from "../src/lib/vercel-preview-event.ts";
import { withServerTask } from "../src/lib/server-log.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function requiredOption(name: string): string {
  const value = option(name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

async function main(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !path.isAbsolute(eventPath)) {
    throw new Error("GITHUB_EVENT_PATH must be an absolute GitHub-owned event path.");
  }

  const expected: VercelPreviewEventExpectations = {
    projectId: requiredOption("expected-project-id"),
    projectName: requiredOption("expected-project-name"),
    repository: requiredOption("expected-repository"),
    repositoryId: requiredOption("expected-repository-id"),
    scope: requiredOption("expected-scope"),
    senderId: requiredOption("expected-sender-id"),
    senderLogin: requiredOption("expected-sender-login"),
  };
  const verified = verifyVercelPreviewEvent(
    JSON.parse(await readFile(eventPath, "utf8")) as unknown,
    expected,
  );

  const output = option("output") ?? "tmp/preview-smoke/deployment.json";
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify({
    verifiedAt: new Date().toISOString(),
    ...verified,
  }, null, 2)}\n`);
  console.log(`Verified immutable Vercel Preview ${verified.deploymentId} for ${verified.gitSha}.`);
}

withServerTask(
  { task: "vercel_preview_event", operation: "verify_preview_dispatch" },
  main,
).catch(() => {
  process.exitCode = 1;
});
