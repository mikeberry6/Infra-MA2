import { appendFileSync, readFileSync } from "node:fs";

type NewsScanSummary = {
  dryRun?: boolean;
  options?: {
    reviewOnly?: boolean;
  };
  tracked?: {
    companies?: number;
    fundManagers?: number;
    funds?: number;
  };
  selection?: {
    totalEntities?: number;
    eligibleEntities?: number;
    selectedEntities?: number;
    shardCount?: number;
    shardIndex?: number;
    cappedByMaxTargets?: boolean;
  };
  crawl?: {
    pagesFetched?: number;
    failedFetches?: number;
    cappedByMaxPages?: boolean;
  };
  search?: {
    enabled?: boolean;
    queriesRun?: number;
    failedQueries?: number;
  };
  results?: {
    candidateNewsItems?: number;
    created?: number;
    updated?: number;
  };
};

function option(name: string, fallback?: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function booleanOption(name: string): boolean | undefined {
  const raw = option(name);
  if (raw === undefined) return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`--${name} must be true or false.`);
}

const summaryPath = option("summary", "tmp/news-scan-summary.json")!;
const expectedDryRun = booleanOption("expect-dry-run");
const requireReviewOnly = process.argv.includes("--require-review-only");

let summary: NewsScanSummary;
try {
  summary = JSON.parse(readFileSync(summaryPath, "utf8")) as NewsScanSummary;
} catch (error) {
  throw new Error(
    `News scan summary is missing or invalid at ${summaryPath}: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

const tracked =
  count(summary.tracked?.companies)
  + count(summary.tracked?.fundManagers)
  + count(summary.tracked?.funds);
const selectedEntities = count(summary.selection?.selectedEntities);
const pagesFetched = count(summary.crawl?.pagesFetched);
const failedFetches = count(summary.crawl?.failedFetches);
const queriesRun = count(summary.search?.queriesRun);
const failedQueries = count(summary.search?.failedQueries);
const successfulQueries = Math.max(0, queriesRun - failedQueries);
const failures: string[] = [];

if (expectedDryRun !== undefined && summary.dryRun !== expectedDryRun) {
  failures.push(`summary dryRun=${String(summary.dryRun)}; expected ${expectedDryRun}`);
}
if (requireReviewOnly && summary.options?.reviewOnly !== true) {
  failures.push("review-only mode was not recorded");
}
if (tracked === 0) {
  failures.push("no published companies, fund managers, or funds were available to scan");
}
if (selectedEntities === 0) {
  failures.push("the selected nightly shard contained no entities");
}
if (summary.selection?.cappedByMaxTargets === true) {
  failures.push(
    `nightly target cap omitted ${
      count(summary.selection?.eligibleEntities) - selectedEntities
    } eligible entities; increase the cap or shard count`,
  );
}
if (pagesFetched === 0 && successfulQueries === 0) {
  failures.push("neither source crawling nor public-news search completed a successful request");
}
if (summary.search?.enabled === true && queriesRun === 0) {
  failures.push("public-news search was enabled but issued no queries");
}

const report = [
  "### News pipeline result",
  "",
  `- Mode: \`${summary.dryRun ? "dry-run" : "live"}\``,
  `- Review-only writes: \`${summary.options?.reviewOnly === true}\``,
  `- Published entity universe: \`${tracked}\``,
  `- Scanned shard: \`${count(summary.selection?.shardIndex) + 1}/${count(summary.selection?.shardCount)}\``,
  `- Entities scanned: \`${selectedEntities}/${count(summary.selection?.eligibleEntities)}\` eligible`,
  `- Source pages: \`${pagesFetched}\` fetched, \`${failedFetches}\` failed`,
  `- Search queries: \`${queriesRun}\` issued, \`${failedQueries}\` failed`,
  `- Candidates: \`${count(summary.results?.candidateNewsItems)}\``,
  `- Planned/applied creates: \`${count(summary.results?.created)}\``,
  `- Planned/applied updates: \`${count(summary.results?.updated)}\``,
  `- Crawl budget reached: \`${summary.crawl?.cappedByMaxPages === true}\``,
];

if (failures.length > 0) {
  report.push("", "#### Reliability gate failures", "", ...failures.map((failure) => `- ${failure}`));
}

const markdown = `${report.join("\n")}\n`;
process.stdout.write(markdown);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown, "utf8");
}

if (failures.length > 0) {
  throw new Error(`News scan reliability gate failed: ${failures.join("; ")}`);
}
