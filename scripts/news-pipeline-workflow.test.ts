import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/news-pipeline.yml", "utf8");
const scanner = readFileSync("scripts/news-scan.ts", "utf8");

describe("nightly news pipeline workflow", () => {
  it("keeps nightly and manual runs serialized and bounded", () => {
    expect(workflow).toContain('cron: "30 2 * * *"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("- dry-run");
    expect(workflow).toContain("- live");
    expect(workflow).toContain("group: news-pipeline-production");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain("timeout-minutes: 45");
    expect(workflow).toContain("--max-targets=750");
    expect(workflow).toContain("--max-pages=500");
    expect(workflow).toContain("--max-pages-per-site=4");
    expect(workflow).toContain("--search-max-results-per-entity=3");
  });

  it("guards live writes and retains an optional editorial-review mode", () => {
    expect(workflow).toContain("steps.mode.outputs.mode == 'live'");
    expect(workflow).toContain("scripts/assert-database-target.ts");
    expect(workflow).not.toContain("--review-only");
    expect(workflow).toContain("scripts/run-with-retry.mjs");
    expect(workflow).toContain("scripts/verify-news-scan-summary.ts");
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("actions/upload-artifact");

    expect(scanner).toContain('reviewOnly: booleanOption("--review-only"');
    expect(scanner).toContain('status: options.reviewOnly ? "DRAFT" : "PUBLISHED"');
    expect(scanner).not.toContain('status: "PUBLISHED" as const');
  });
});
