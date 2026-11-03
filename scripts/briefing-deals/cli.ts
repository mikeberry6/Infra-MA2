import { config } from "dotenv";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { digest, loadIssues } from "./archive";
import { buildProposal, candidateIds, proposalSchema } from "./domain";
import { renderReviewReport, type ReviewReport } from "./report";
import { validateApplyTarget } from "./target";
import { validateApprovedProposal } from "./domain";
import { applyProposal, snapshot } from "./store";

const args = process.argv.slice(2);
const command = args[0];
function option(name: string) { const index = args.indexOf(`--${name}`); return index < 0 ? undefined : args[index + 1]; }
function save(path: string, data: unknown) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`); }
async function main() {
  config({ path: option("env") || ".env", quiet: true });
  const output = option("output") || (command === "inventory" ? "audits/briefing-deals/archive.json" : "tmp/briefing-deals/review.json");
  const issues = loadIssues(process.cwd(), option("edition"));
  if (!issues.length) throw new Error("No published issues found");
  if (command === "inventory") {
    save(output, { issues, issueCount: issues.length, cardCount: issues.reduce((n, i) => n + i.cards.length, 0) });
    console.log(`Inventory written: ${output}`); return;
  }
  if (command === "validate") {
    const path = option("manifest");
    if (!path) throw new Error("--manifest is required");
    const proposal = validateApprovedProposal(JSON.parse(readFileSync(path, "utf8")));
    for (const issue of proposal.issues) if (digest(loadIssues(process.cwd(), issue.edition)[0]) !== digest(issue)) throw new Error(`Archive changed: ${issue.edition}`);
    console.log(JSON.stringify({ manifestHash: digest(proposal), target: proposal.target, cards: proposal.decisions.length })); return;
  }
  if (!["preview", "apply"].includes(command)) throw new Error("Usage: cli.ts inventory|preview|apply [--edition DATE] [--env FILE] [--output FILE] [--manifest FILE --expected-hash SHA256 --target local|production]");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for a real database snapshot");
  neonConfig.fetchFunction = (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(30000) });
  const target = new URL(process.env.DATABASE_URL);
  const client = new PrismaClient({ adapter: (command === "preview" && option("transport") === "http" ? new PrismaNeonHttp(process.env.DATABASE_URL, { arrayMode: false, fullResults: true }) : new PrismaPg({ connectionString: process.env.DATABASE_URL })) });
  try {
    if (command === "preview") {
      const state = option("transport") === "http" ? await snapshot(client) : await client.$transaction(tx => snapshot(tx), { isolationLevel: "RepeatableRead", maxWait: 30000, timeout: 60000 });
      const proposal = buildProposal(issues, state.records, state.hash, { host: target.hostname, database: target.pathname.slice(1) });
      save(output, proposal);
      const report: ReviewReport = { target: proposal.target, snapshotHash: state.hash, databaseDealCount: state.records.length,
        issues: issues.map(i => {
          const previous = state.issues.find(p => p.edition === i.edition)?.deals ?? [];
          return { edition: i.edition, cards: i.cards.length, previousCards: previous.length,
            existingMemberships: previous.map(p => ({ cardKey: p.cardKey, canonicalId: state.records.find(d => d.id === p.dealId)?.legacyId ?? p.dealId, position: p.position })),
            removedCardKeys: previous.filter(p => !i.cards.some(c => c.key === p.cardKey)).map(p => p.cardKey),
          };
        }),
        rows: issues.flatMap(i => i.cards.map(c => ({ edition: i.edition, ...c, candidates: candidateIds(c, state.records), candidateRecords: state.records.filter(d => candidateIds(c, state.records).includes(d.legacyId)),
          reviewNeeded: [!c.announcementDate && "Verify announcement date", !c.sourceUrl && "Recover source URL", "Confirm parties, classification and status", "Approve canonical match or complete CREATE data"].filter(Boolean) }))),
      };
      save(output.replace(/\.json$/, "") + "-report.json", report);
      writeFileSync(output.replace(/\.json$/, "") + "-report.html", renderReviewReport(report, proposal));
      console.log(`Review proposal and per-card report written: ${output}`); return;
    }
    validateApplyTarget(process.env.DATABASE_URL, option("target"), process.env, option("confirmation"));
    const production = option("target") === "production";
    if (production && !process.env.FUND_REFRESH_REVALIDATE_TOKEN) throw new Error("Production cache revalidation token is required");
    const manifestFile = option("manifest"); const expectedHash = option("expected-hash");
    if (!manifestFile || !expectedHash) throw new Error("--manifest and --expected-hash are required");
    const proposal = proposalSchema.parse(JSON.parse(readFileSync(resolve(manifestFile), "utf8")));
    if (proposal.target.host !== target.hostname || proposal.target.database !== target.pathname.slice(1)) throw new Error("Manifest is bound to a different database target");
    const actualIssues = loadIssues(process.cwd());
    for (const issue of proposal.issues) if (digest(actualIssues.find(i => i.edition === issue.edition)) !== digest(issue)) throw new Error(`Archive changed since review: ${issue.edition}`);
    const revalidateUrl = "https://infra-ma-2.vercel.app/Infra-MA2/api/internal/fund-refresh/revalidate";
    const headers = { authorization: `Bearer ${process.env.FUND_REFRESH_REVALIDATE_TOKEN}` };
    if (production && !(await fetch(revalidateUrl, { headers })).ok) throw new Error("Cache revalidation preflight failed");
    const receipt = await applyProposal(client, proposal, expectedHash);
    save(output, receipt);
    if (production && !(await fetch(revalidateUrl, { method: "POST", headers })).ok) throw new Error("Import committed but cache invalidation failed; repeat the identical apply to retry invalidation");
    console.log(`Import complete: ${output}`);
  } finally { await client.$disconnect(); }
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Briefing import failed"); process.exitCode = 1; });
