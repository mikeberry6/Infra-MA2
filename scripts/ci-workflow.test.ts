import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const ciPath = resolve(root, ".github/workflows/deploy.yml");
const retiredPromotionPath = resolve(
  root,
  ".github/workflows/release-code-only.yml",
);
const workflow = readFileSync(ciPath, "utf8");
const triggers = workflow.slice(
  workflow.indexOf("\non:"),
  workflow.indexOf("\njobs:"),
);

describe("routine release CI contract", () => {
  it("runs for main pull requests and exact-main provenance only", () => {
    expect(triggers).toContain('push:\n    branches: ["main"]');
    expect(triggers).toContain('pull_request:\n    branches: ["main"]');
    expect(triggers).toContain("workflow_dispatch:");
    expect(triggers).not.toContain("codex/**");
    expect(triggers).not.toContain("claude/**");
    expect(triggers).not.toContain("master");
  });

  it("cancels superseded pull-request runs without cancelling main builds", () => {
    expect(triggers).toContain(
      "group: ci-${{ github.event.pull_request.number || github.run_id }}",
    );
    expect(triggers).toContain(
      "cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
    );
  });

  it("retains the complete required build gate", () => {
    for (const command of [
      "npm ci",
      "npm run db:seed:validate",
      "npx tsc --noEmit",
      "npm test",
      "npm run build",
    ]) {
      expect(workflow).toContain(command);
    }
  });

  it("fetches complete history for deterministic data-release tests", () => {
    expect(workflow).toContain("fetch-depth: 0");
  });

  it("keeps routine deployment free of a manual promotion workflow", () => {
    expect(existsSync(retiredPromotionPath)).toBe(false);
    expect(workflow).not.toContain("PROMOTE-CODE-ONLY");
  });
});
