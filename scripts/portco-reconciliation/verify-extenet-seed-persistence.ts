/** Exact post-edit/post-deploy proof. Never writes to production or replays a seed. */
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { PRISMA_COMPANY_IMAGE_INCLUDE, prismaCompanyRowToImage } from "./prisma-company-image";
import { verifyPublicCompanyPayload } from "./public-api-verifier";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { EXTENET_ID, EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME } from "./extenet-seed-persistence";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const directory = "audits/portco-reconciliation/2026-09-06/extenet-seed-persistence";
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const option = (name: string) => process.argv.find((value) => value.startsWith(`--${name}=`))?.split("=")[1];
  const phase = option("phase");
  const expectedSha = option("expected-sha");
  if (!phase || !["pre-release", "production-release"].includes(phase) || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit phase and full expected SHA required");
  const plan = await json(`${directory}/repair-plan.json`);
  if (hashWithoutField(plan, "repairSha256") !== plan.repairSha256 || sha256Canonical(companies) !== plan.resultingSeedSha256) throw new Error("Repair or evaluated seed hash changed");
  const attribution = verifySeedManifest(await json("prisma/seed-data/ownership-attributions.manifest.json"));
  if (sha256Canonical(attribution) !== sha256Canonical(verifySeedManifest(await json(`${directory}/resulting-attribution-manifest.json`)))) throw new Error("Unexpected attribution changes");
  for (const dependency of plan.dependencies) {
    if (["prisma/seed-data/companies.ts", "prisma/seed-data/ownership-attributions.manifest.json"].includes(dependency.path)) continue;
    if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error(`Unexpected dependency change: ${dependency.path}`);
  }
  for (const ref of plan.references) if (sha256Text(await readFile(ref.location.split("#")[0], "utf8")) !== ref.fileSha256) throw new Error("Source evidence changed");
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", maxBuffer: 8000000, stdio: ["ignore", "pipe", "pipe"] }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production"
    || deployment.gitSource?.type !== "github" || deployment.gitSource?.ref !== "main" || deployment.gitSource?.sha !== expectedSha
    || deployment.meta?.githubCommitSha !== expectedSha || !deployment.alias?.includes("infra-ma-2.vercel.app")) throw new Error("Canonical production does not serve required Git SHA");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { OR: [{ id: EXTENET_ID }, { name: { in: [EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME] } }] }, include: PRISMA_COMPANY_IMAGE_INCLUDE, orderBy: { id: "asc" } }),
        publishedIdentities: await tx.company.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, country: true }, orderBy: { id: "asc" } }),
        redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const stateSha256 = sha256Canonical(JSON.parse(JSON.stringify(production)));
  if (stateSha256 !== plan.productionSnapshotSha256) throw new Error("Production graph, published identities or redirects changed");
  const key = (company: { name: string; country: string }) => `${company.name.toLowerCase()}\0${company.country.toLowerCase()}`;
  if (sha256Canonical(companies.map(key).sort()) !== sha256Canonical(production.publishedIdentities.map(key).sort())) throw new Error("Whole published identity parity failed");
  const company = production.companies[0];
  const retired = production.redirects.filter((redirect) => redirect.companyId === company.id).map((redirect) => redirect.retiredId);
  const results = [];
  for (const id of [company.id, ...retired]) {
    const url = `https://infra-ma-2.vercel.app/Infra-MA2/api/portfolio/${encodeURIComponent(id)}`;
    const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(20000) });
    const bytes = await response.text();
    if (response.status !== 200) throw new Error(`Public company API ${id}: HTTP ${response.status}`);
    verifyPublicCompanyPayload({ payload: JSON.parse(bytes), companyId: company.id, afterImage: prismaCompanyRowToImage(company), retiredCompanyIds: retired });
    results.push({ id, url, httpStatus: response.status, bodySha256: sha256Text(bytes), passed: true });
  }
  const report = { schemaVersion: 1, artifactType: "PORTCO_EXTENET_SEED_PERSISTENCE_VERIFICATION", phase, checkedAt: new Date().toISOString(), repairSha256: plan.repairSha256,
    expectedSha, canonicalDeployment: { id: deployment.id, url: deployment.url, readyState: deployment.readyState, target: deployment.target, aliases: deployment.alias, gitSource: deployment.gitSource },
    target, productionSnapshotSha256: stateSha256, productionUnchanged: true, publishedCount: production.publishedIdentities.length, redirects: production.redirects.length,
    wholePublishedIdentityParity: true, resultingSeedSha256: plan.resultingSeedSha256, resultingSeedCompanies: companies.length,
    resultingAttributionManifestSha256: attribution.manifestSha256, canonicalApiChecks: results, freshExceptionSha256: plan.freshExceptionSha256, databaseWrites: 0, sourceTransitions: 0, passed: true };
  await writeFile(`${directory}/${phase}-verification.json`, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ phase, passed: true, canonicalSha: expectedSha, productionUnchanged: true, apiChecks: results.length, seedCompanies: companies.length, wholePublishedIdentityParity: true }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Verification failed"); process.exitCode = 1; });
