/** Read-only post-edit / post-deploy verification for the scoped seed repair. */
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { PRISMA_COMPANY_IMAGE_INCLUDE, prismaCompanyRowToImage } from "./prisma-company-image";
import { verifyPublicCompanyPayload } from "./public-api-verifier";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const directory = "audits/portco-reconciliation/2026-09-06/seed-alias-persistence";
async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const option = (name: string) => process.argv.find((value) => value.startsWith(`--${name}=`))?.split("=")[1];
  const phase = option("phase");
  const expectedSha = option("expected-sha");
  if (!phase || !["pre-release", "production-release"].includes(phase) || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit phase and full expected SHA required");
  const plan = JSON.parse(await readFile(`${directory}/repair-plan.json`, "utf8"));
  if (hashWithoutField(plan, "repairSha256") !== plan.repairSha256) throw new Error("Repair plan hash changed");
  if (sha256Canonical(companies) !== plan.resultingSeedSha256) throw new Error("Evaluated seed differs from exact scoped plan");
  for (const dependency of plan.dependencies) {
    if (["prisma/seed-data/companies.ts", "prisma/seed-data/ownership-attributions.manifest.json"].includes(dependency.path)) continue;
    if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error(`Unexpected dependency change: ${dependency.path}`);
  }
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", maxBuffer: 8000000, stdio: ["ignore", "pipe", "pipe"] }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production"
      || deployment.gitSource?.type !== "github" || deployment.gitSource?.ref !== "main" || deployment.gitSource?.sha !== expectedSha
      || deployment.meta?.githubCommitSha !== expectedSha || !deployment.alias?.includes("infra-ma-2.vercel.app")) throw new Error("Canonical Git production does not serve the required SHA");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const ids = plan.members.map((member: { canonicalCompanyId: string }) => member.canonicalCompanyId);
  const names = plan.members.flatMap((member: { retiredSeed: { name: string }; canonicalName: string }) => [member.retiredSeed.name, member.canonicalName]);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { OR: [{ id: { in: ids } }, { name: { in: names } }] }, include: PRISMA_COMPANY_IMAGE_INCLUDE, orderBy: { id: "asc" } }),
        publishedCount: await tx.company.count({ where: { status: "PUBLISHED" } }), redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const stateSha256 = sha256Canonical(JSON.parse(JSON.stringify(production)));
  if (stateSha256 !== plan.productionSnapshotSha256) throw new Error("Production before-image or redirect state changed; do not claim seed-only parity");
  const results = [];
  for (const company of production.companies.filter((company) => company.status === "PUBLISHED")) {
    const retired = production.redirects.filter((redirect) => redirect.companyId === company.id).map((redirect) => redirect.retiredId);
    for (const id of [company.id, ...retired]) {
      const url = `https://infra-ma-2.vercel.app/Infra-MA2/api/portfolio/${encodeURIComponent(id)}`;
      const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(20000) });
      const bytes = await response.text();
      if (response.status !== 200) throw new Error(`Public company API ${id}: HTTP ${response.status}`);
      verifyPublicCompanyPayload({ payload: JSON.parse(bytes), companyId: company.id, afterImage: prismaCompanyRowToImage(company), retiredCompanyIds: retired });
      results.push({ id, canonicalCompanyId: company.id, url, httpStatus: response.status, bodySha256: sha256Text(bytes), passed: true });
    }
  }
  const report = { schemaVersion: 1, artifactType: "PORTCO_SEED_ALIAS_PERSISTENCE_VERIFICATION", phase, checkedAt: new Date().toISOString(), repairSha256: plan.repairSha256,
    expectedSha, canonicalDeployment: { id: deployment.id, url: deployment.url, readyState: deployment.readyState, target: deployment.target, aliases: deployment.alias, gitSource: deployment.gitSource },
    target, productionSnapshotSha256: stateSha256, productionUnchanged: true, publishedCount: production.publishedCount, redirects: production.redirects.length,
    resultingSeedSha256: plan.resultingSeedSha256, resultingSeedCompanies: companies.length, canonicalApiChecks: results, databaseWrites: 0, sourceTransitions: 0, passed: true };
  await writeFile(`${directory}/${phase}-verification.json`, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ phase, passed: true, canonicalSha: expectedSha, productionUnchanged: true, apiChecks: results.length, seedCompanies: companies.length }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Verification failed"); process.exitCode = 1; });
