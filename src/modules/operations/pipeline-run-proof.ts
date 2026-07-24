import { createHash } from "node:crypto";

const PIPELINE_RUN_ID = /^[A-Za-z0-9_-]{1,128}$/;
const PROOF_NAMESPACE = "infrasight:pipeline-run-proof:v1\u0000";

/**
 * Produce a stable, non-reversible public proof for a persisted PipelineRun.
 * The raw database identifier never needs to leave the server boundary.
 */
export function pipelineRunProof(id: string): string {
  if (!PIPELINE_RUN_ID.test(id)) {
    throw new Error("Pipeline run ID is invalid.");
  }
  return createHash("sha256")
    .update(PROOF_NAMESPACE, "utf8")
    .update(id, "utf8")
    .digest("hex");
}
