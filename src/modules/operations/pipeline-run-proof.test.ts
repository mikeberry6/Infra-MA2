import { describe, expect, it } from "vitest";
import { pipelineRunProof } from "@/modules/operations/pipeline-run-proof";

describe("pipelineRunProof", () => {
  it("creates a stable namespaced proof without exposing the run ID", () => {
    const proof = pipelineRunProof("cm123_example-run");

    expect(proof).toMatch(/^[0-9a-f]{64}$/);
    expect(proof).toBe(pipelineRunProof("cm123_example-run"));
    expect(proof).not.toContain("cm123_example-run");
    expect(proof).not.toBe(pipelineRunProof("cm124_example-run"));
  });

  it.each([
    "",
    " leading",
    "trailing ",
    "../run",
    "run.with.dot",
    "x".repeat(129),
  ])("rejects an unsafe run ID %j", (id) => {
    expect(() => pipelineRunProof(id)).toThrow("Pipeline run ID is invalid.");
  });
});
