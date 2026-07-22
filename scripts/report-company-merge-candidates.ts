/**
 * Read-only canonical-company merge review report.
 *
 * This script deliberately cannot apply merges. It produces the review input
 * that must be approved before `merge-duplicate-companies.ts --apply` is run.
 * Its snapshot select intentionally matches guarded apply mode and therefore
 * runs only after the additive trust migrations have been staged.
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { companyDedupKeys, groupByDedupKeys } from "../src/lib/company-key";
import {
  COMPANY_MERGE_APPROVAL_SCHEMA_VERSION,
  COMPANY_MERGE_APPROVAL_SCOPE,
  COMPANY_MERGE_SNAPSHOT_SELECT,
  mergeApprovalCandidateFromSnapshot,
  type CompanyMergeSnapshot,
} from "../src/modules/companies/merge-approval";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the read-only duplicate report.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type CompanyCandidate = CompanyMergeSnapshot;

const PUBLISHED_ONLY = process.argv.includes("--published-only");
const REQUIRE_CLEAN = process.argv.includes("--require-clean");
const APPROVAL_OUTPUT = process.argv
  .find((argument) => argument.startsWith("--approval-output="))
  ?.slice("--approval-output=".length);

function loadCompanies(publishedOnly = PUBLISHED_ONLY) {
  return prisma.company.findMany({
    where: publishedOnly ? { status: "PUBLISHED" } : undefined,
    select: COMPANY_MERGE_SNAPSHOT_SELECT,
    orderBy: [{ name: "asc" }, { country: "asc" }],
  });
}

function compareCanonical(a: CompanyCandidate, b: CompanyCandidate): number {
  if (b.milestones.length !== a.milestones.length) {
    return b.milestones.length - a.milestones.length;
  }
  if (b.citations.length !== a.citations.length) {
    return b.citations.length - a.citations.length;
  }
  if (b.description.length !== a.description.length) {
    return b.description.length - a.description.length;
  }
  if (b.ownershipPeriods.length !== a.ownershipPeriods.length) {
    return b.ownershipPeriods.length - a.ownershipPeriods.length;
  }
  return a.name.length - b.name.length || a.id.localeCompare(b.id);
}

function duplicateClusters(companies: CompanyCandidate[]): CompanyCandidate[][] {
  return groupByDedupKeys(companies, (company) => companyDedupKeys(company.name))
    .filter((cluster) => cluster.length > 1)
    .map((cluster) => [...cluster].sort(compareCanonical))
    .sort((a, b) => a[0].name.localeCompare(b[0].name));
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function main() {
  const companies = await loadCompanies();
  const clusters = duplicateClusters(companies);

  const rowCount = clusters.reduce((total, cluster) => total + cluster.length, 0);
  const generatedAt = new Date().toISOString();

  if (APPROVAL_OUTPUT) {
    // Apply mode intentionally detects duplicates across every editorial
    // status. The approval artifact must bind that same scope even when the
    // accompanying human-readable gate report is published-only.
    const approvalCompanies = PUBLISHED_ONLY ? await loadCompanies(false) : companies;
    const approvalClusters = PUBLISHED_ONLY ? duplicateClusters(approvalCompanies) : clusters;
    const approvalTemplate = {
      schemaVersion: COMPANY_MERGE_APPROVAL_SCHEMA_VERSION,
      scope: COMPANY_MERGE_APPROVAL_SCOPE,
      generatedAt,
      reviewedBy: null,
      reviewedAt: null,
      instructions: [
        "Review every cluster independently; the proposed survivor is a heuristic, not an approval.",
        "For every approved cluster, set canonicalId to one candidate ID and retiredIds to every other candidate ID.",
        "Remove any cluster that Research rejects or defers, then compute SHA-256 from the exact reviewed file bytes.",
      ],
      clusters: approvalClusters.map((cluster, index) => ({
        reviewKey: `${index + 1}:${companyDedupKeys(cluster[0].name).values().next().value ?? cluster[0].name}`,
        proposedCanonicalId: cluster[0].id,
        canonicalId: null,
        retiredIds: [],
        candidates: cluster.map(mergeApprovalCandidateFromSnapshot),
      })),
    };
    const outputPath = path.resolve(APPROVAL_OUTPUT);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(approvalTemplate, null, 2)}\n`, { flag: "wx" });
    console.error(`Wrote reviewer-neutral merge approval template to ${outputPath}`);
  }

  console.log("# Canonical Company Merge Review");
  console.log();
  console.log(`Generated: ${generatedAt}`);
  console.log(`Scope: ${PUBLISHED_ONLY ? "published public records" : "all record statuses"}`);
  console.log(`Database rows reviewed: ${companies.length}`);
  console.log(`Proposed clusters: ${clusters.length} (${rowCount} rows)`);
  console.log();
  console.log("No database writes were performed. Each cluster requires an explicit APPROVE, REJECT, or REVISE decision before merge execution.");

  clusters.forEach((cluster, index) => {
    const canonical = cluster[0];
    const countryConflict = new Set(cluster.map((company) => company.country)).size > 1;
    console.log();
    console.log(`## ${index + 1}. ${escapeCell(canonical.name)}`);
    console.log();
    console.log("- Decision: **PENDING REVIEW**");
    console.log(`- Proposed survivor: \`${canonical.id}\` — ${escapeCell(canonical.name)}`);
    console.log(`- Country strings differ: ${countryConflict ? "YES — verify entity scope" : "No"}`);
    console.log("- Reviewer: _unassigned_");
    console.log("- Review notes: _pending_");
    console.log();
    console.log("| Proposed action | Company | Country | Record | Owners | Milestones | Management | Sources | ID |");
    console.log("|---|---|---|---:|---:|---:|---:|---:|---|");
    cluster.forEach((company, companyIndex) => {
      console.log(
        `| ${companyIndex === 0 ? "KEEP" : "MERGE + REDIRECT"} | ${escapeCell(company.name)} | ${escapeCell(company.country)} | ${company.status} | ${company.ownershipPeriods.length} | ${company.milestones.length} | ${company.managementRoles.length} | ${company.citations.length} | \`${company.id}\` |`,
      );
    });
  });

  if (REQUIRE_CLEAN && clusters.length > 0) {
    console.error(`Canonical-company gate failed: ${clusters.length} duplicate cluster(s) remain in scope.`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Duplicate report failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
