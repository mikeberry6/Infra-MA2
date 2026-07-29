import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  COMPANY_CLEANUP_SCHEMA_VERSION,
  COMPANY_CLEANUP_SCOPE,
  COMPANY_CLEANUP_SNAPSHOT_SELECT,
  assertApprovalMatchesAllDetectedClusters,
  assertUniqueCompanyOutcomes,
  cleanupCandidateFromSnapshot,
  detectCompanyCleanupClusters,
  type CompanyCleanupApproval,
  type CompanyCleanupDecision,
} from "../src/modules/companies/canonical-cleanup";
import {
  assertKeepSeparateRelationDeletes,
  planCompanyMerge,
} from "../src/modules/companies/merge-integrity";
import {
  REVIEWED_COMPANY_DECISION_SPECS,
} from "./company-canonical-decisions";

const REVIEW_TIMESTAMP = "2026-07-29T03:30:00.000Z";

function option(name: string): string | undefined {
  return process.argv
    .slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const companies = await prisma.company.findMany({
      select: COMPANY_CLEANUP_SNAPSHOT_SELECT,
    });
    const byId = new Map(companies.map((company) => [company.id, company]));
    const decisions: CompanyCleanupDecision[] =
      REVIEWED_COMPANY_DECISION_SPECS.map((spec) => {
        const candidates = spec.candidateIds.map((id) => {
          const company = byId.get(id);
          if (!company) {
            throw new Error(
              `Reviewed candidate ${id} (${spec.reviewKey}) does not exist`,
            );
          }
          return cleanupCandidateFromSnapshot(company);
        });
        const clusterCompanies = spec.candidateIds.map((id) => byId.get(id)!);
        if (spec.kind === "MERGE") {
          planCompanyMerge(
            clusterCompanies,
            spec.canonicalId,
            spec.explicitRelationDeleteIds,
          );
          return {
            kind: spec.kind,
            reviewKey: spec.reviewKey,
            candidates,
            canonicalId: spec.canonicalId,
            retiredIds: spec.retiredIds,
            canonicalUpdates: spec.canonicalUpdates,
            explicitRelationDeleteIds: spec.explicitRelationDeleteIds,
            rationale: spec.rationale,
            sources: spec.sources,
          };
        }
        assertKeepSeparateRelationDeletes(
          clusterCompanies,
          spec.explicitRelationDeleteIds,
        );
        return {
          kind: spec.kind,
          reviewKey: spec.reviewKey,
          candidates,
          companyUpdates: spec.companyUpdates,
          explicitRelationDeleteIds: spec.explicitRelationDeleteIds,
          rationale: spec.rationale,
          sources: spec.sources,
        };
      });

    const approval: CompanyCleanupApproval = {
      schemaVersion: COMPANY_CLEANUP_SCHEMA_VERSION,
      scope: COMPANY_CLEANUP_SCOPE,
      generatedAt: REVIEW_TIMESTAMP,
      reviewedAt: REVIEW_TIMESTAMP,
      reviewedBy: "User-authorized Codex research review",
      instructions: [
        "This single hash-bound artifact records all 21 reviewed duplicate clusters.",
        "MERGE retires only the listed IDs; KEEP_SEPARATE preserves every candidate and applies only the listed normalization.",
        "Explicit relation deletions are evidence-reviewed exceptions. All other automatic deletions must be materially exact duplicates.",
        "Any candidate, relation, or snapshot change invalidates this approval before the first write.",
      ],
      decisions,
    };

    assertApprovalMatchesAllDetectedClusters(
      approval,
      detectCompanyCleanupClusters(companies),
    );
    assertUniqueCompanyOutcomes(companies, decisions);
    const serialized = `${JSON.stringify(approval, null, 2)}\n`;
    const output = option("output");
    if (output) {
      const outputPath = resolve(output);
      await writeFile(outputPath, serialized, { encoding: "utf8", flag: "wx" });
      console.log(outputPath);
    } else {
      process.stdout.write(serialized);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
