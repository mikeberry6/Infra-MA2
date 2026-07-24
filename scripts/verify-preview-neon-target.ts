#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output.ts";
import {
  NeonRecoveryClient,
  normalizeNeonHost,
  type NeonBranchDetail,
  type NeonEndpoint,
  type NeonProject,
} from "./neon-recovery-control.ts";

const RESOURCE_ID = /^[a-z0-9-]{1,60}$/;

export type PreviewNeonTargetEvidence = {
  schemaVersion: 1;
  target: "preview";
  result: "passed";
  projectId: string;
  productionProjectDistinct: true;
  branchId: string;
  branchState: string;
  endpointId: string;
  endpointState: string;
  endpointType: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is required.`);
  return value;
}

function requiredResourceId(value: string, name: string): string {
  if (!RESOURCE_ID.test(value)) fail(`${name} is invalid.`);
  return value;
}

export function assertPreviewNeonTarget(input: {
  project: NeonProject;
  branchDetail: NeonBranchDetail;
  endpoints: NeonEndpoint[];
  expectedProjectId: string;
  expectedProductionProjectId: string;
  expectedBranchId: string;
  expectedEndpointId: string;
  expectedDirectHost: string;
}): NeonEndpoint {
  const previewProjectId = requiredResourceId(
    input.expectedProjectId,
    "PREVIEW_NEON_PROJECT_ID",
  );
  const productionProjectId = requiredResourceId(
    input.expectedProductionProjectId,
    "NEON_PRODUCTION_PROJECT_ID",
  );
  const branchId = requiredResourceId(
    input.expectedBranchId,
    "PREVIEW_NEON_BRANCH_ID",
  );
  const endpointId = requiredResourceId(
    input.expectedEndpointId,
    "PREVIEW_NEON_ENDPOINT_ID",
  );
  if (previewProjectId === productionProjectId) {
    fail("Preview and production Neon project IDs must be independently distinct.");
  }
  if (input.project.id !== previewProjectId) {
    fail("Neon API project identity does not match PREVIEW_NEON_PROJECT_ID.");
  }
  const branch = input.branchDetail.branch;
  if (
    branch.id !== branchId
    || branch.project_id !== previewProjectId
    || branch.current_state !== "ready"
    || branch.default
  ) {
    fail("Neon API branch identity does not match the approved non-default Preview branch.");
  }
  const directHost = normalizeNeonHost(
    input.expectedDirectHost,
    "PREVIEW_MIGRATION_DATABASE_HOST",
  );
  const matching = input.endpoints.filter((endpoint) =>
    endpoint.id === endpointId
    && endpoint.project_id === previewProjectId
    && endpoint.branch_id === branchId
    && endpoint.host === directHost
    && endpoint.type === "read_write"
    && (endpoint.current_state === "active" || endpoint.current_state === "idle")
  );
  if (matching.length !== 1) {
    fail("Neon API endpoint identity does not match the approved Preview endpoint.");
  }
  return matching[0];
}

function outputPath(): string {
  const argument = process.argv.slice(2).find((value) => value.startsWith("--output="));
  return argument?.slice("--output=".length)
    ?? "tmp/preview-dashboard-bootstrap/neon-control-plane.json";
}

export async function writePreviewNeonTargetEvidence(input: {
  evidence: PreviewNeonTargetEvidence;
  output: string;
  repositoryRoot: string;
}): Promise<string> {
  const destination = await prepareProtectedTemporaryJsonOutput({
    repositoryRoot: input.repositoryRoot,
    output: input.output,
  });
  await destination.write(`${JSON.stringify(input.evidence, null, 2)}\n`);
  return destination.outputPath;
}

async function main(): Promise<void> {
  const expectedProjectId = requiredEnvironment("PREVIEW_NEON_PROJECT_ID");
  const expectedProductionProjectId = requiredEnvironment(
    "NEON_PRODUCTION_PROJECT_ID",
  );
  const expectedBranchId = requiredEnvironment("PREVIEW_NEON_BRANCH_ID");
  const expectedEndpointId = requiredEnvironment("PREVIEW_NEON_ENDPOINT_ID");
  const client = new NeonRecoveryClient({
    apiKey: requiredEnvironment("PREVIEW_NEON_API_KEY"),
  });
  const [project, branchDetail, endpoints] = await Promise.all([
    client.getProject(expectedProjectId),
    client.getBranch(expectedProjectId, expectedBranchId),
    client.listEndpoints(expectedProjectId, expectedBranchId),
  ]);
  if (!branchDetail) fail("The approved Preview Neon branch does not exist.");
  const endpoint = assertPreviewNeonTarget({
    project,
    branchDetail,
    endpoints,
    expectedProjectId,
    expectedProductionProjectId,
    expectedBranchId,
    expectedEndpointId,
    expectedDirectHost: requiredEnvironment("PREVIEW_MIGRATION_DATABASE_HOST"),
  });
  await writePreviewNeonTargetEvidence({
    repositoryRoot: process.cwd(),
    output: outputPath(),
    evidence: {
      schemaVersion: 1,
      target: "preview",
      result: "passed",
      projectId: project.id,
      productionProjectDistinct: true,
      branchId: branchDetail.branch.id,
      branchState: branchDetail.branch.current_state,
      endpointId: endpoint.id,
      endpointState: endpoint.current_state,
      endpointType: endpoint.type,
    },
  });
  console.log("Preview Neon project, branch, and endpoint identity verified.");
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Preview Neon target verification failed.");
    process.exitCode = 1;
  });
}
