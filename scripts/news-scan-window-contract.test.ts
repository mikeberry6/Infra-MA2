import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const scanner = readFileSync(path.join(root, "scripts/news-scan.ts"), "utf8");
const workflow = readFileSync(path.join(root, ".github/workflows/data-pipelines.yml"), "utf8");

describe("scheduled news scan window contract", () => {
  it("pins the nightly job to the reviewed bounded target and page budgets", () => {
    expect(workflow).toMatch(
      /news:scan -- --max-targets=200 --max-pages=750/,
    );
    expect(scanner).toContain("DEFAULT_NEWS_SCAN_MAX_TARGETS");
    expect(scanner).toContain("NEWS_SCAN_MAX_TARGETS");
    expect(scanner).toContain("selectNewsScanWindow(targetFilteredEntities");
    expect(workflow).toContain("NEWS_SCAN_AS_OF: ${{ steps.news_clock.outputs.scan_as_of }}");
    expect(workflow).toContain("NEWS_SCAN_ROTATION_DATE: ${{ steps.news_clock.outputs.rotation_date }}");
    expect(workflow).toContain("date -u -d '6 hours ago'");
    expect(scanner).toContain("effectiveNewsScanLookbackDays(");
    expect(scanner).toContain("filterCandidatesByDateWindow(mergedCandidates, effectiveOptions, scanAsOf)");
  });

  it("prioritizes required and official seeds before historical sources", () => {
    expect(scanner).toContain('add(url, entity, kind, url === requiredUrl ? 0 : 1');
    expect(scanner).toContain('add(url, entity, "source", url === requiredUrl ? 0 : 2');
    expect(scanner).toContain("INITIAL_SEED_BUDGET_RATIO = 0.7");
    expect(scanner).toContain("requiredInitialSeedsDeferred");
  });

  it("persists rotation and intentional-deferral evidence separately from incomplete coverage", () => {
    expect(scanner).toContain("selection: summary.selection");
    expect(scanner.match(/refreshWindow: options\.rotationDateUtc/g)).toHaveLength(3);
    expect(scanner).toContain("configuredBudgetExhausted: summary.crawl.configuredBudgetExhausted");
    expect(scanner).toContain("intentionalDeferral: summary.crawl.intentionallyDeferred");
    expect(scanner).toContain("cappedByMaxPages: summary.crawl.cappedByMaxPages");
  });

  it("routes database-controlled crawl and robots requests through the pinned public-network boundary", () => {
    expect(scanner).toContain('import { fetchPublicText } from "../src/lib/server/public-network-fetch"');
    expect(scanner.match(/fetchPublicText\(/g)).toHaveLength(3);
    expect(scanner).not.toContain('redirect: "follow"');
    expect(scanner).toContain("extractLinks(response.body, response.finalUrl)");
    expect(scanner).toContain("url: normalizeUrl(response.finalUrl) ?? response.finalUrl");
  });
});
