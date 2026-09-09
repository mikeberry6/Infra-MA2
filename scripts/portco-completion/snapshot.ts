/** One target-pinned repeatable-read transaction; no write mode. */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../../src/generated/prisma/client";
import { loadPrismaCompanyImage } from "../portco-reconciliation/prisma-company-image";
import { databaseTargetIdentity } from "../portco-reconciliation/snapshot";
import { PRODUCTION_FINGERPRINT, seal, verifySnapshot } from "./batch";

export { PRODUCTION_FINGERPRINT } from "./batch";
export async function observePublishedFundNames(tx: Prisma.TransactionClient) {
  return (await tx.fund.findMany({ where: { status: "PUBLISHED" }, select: { fundName: true },
    orderBy: { fundName: "asc" } })).map(f => f.fundName);
}
export async function observeCompanies(tx: Prisma.TransactionClient, companyIds: string[], fundNames: string[]) {
  const companies = await Promise.all(companyIds.map(async id => {
    const image = await loadPrismaCompanyImage(tx, id);
    if (!image) throw Error(`Selected company missing: ${id}`);
    const rows = await tx.ownershipPeriod.findMany({ where: { companyId: id }, orderBy: { id: "asc" },
      select: { id: true, companyId: true, fundId: true, organizationId: true, fundAttribution: true,
        attributedFundName: true, attributionConfidence: true, attributionRationale: true, fund: { select: { fundName: true } } } });
    const owners = rows.map(({ fund, fundAttribution, attributedFundName, attributionConfidence, attributionRationale, ...identity }) => ({
      ...identity, state: { fundAttribution, attributedFundName, attributionConfidence, attributionRationale, linkedFundName: fund?.fundName ?? null } }));
    const redirects = await tx.companyRedirect.findMany({ where: { OR: [{ companyId: id }, { retiredId: id }] }, orderBy: { retiredId: "asc" } });
    return { image, owners, redirects };
  }));
  const currentFundIds = companies.flatMap(c => c.owners.flatMap(o => o.fundId ? [o.fundId] : []));
  const rows = await tx.fund.findMany({ where: { OR: [{ id: { in: currentFundIds } }, { fundName: { in: fundNames } }] },
    select: { id: true, fundName: true, manager: { select: { name: true } } }, orderBy: { id: "asc" } });
  return JSON.parse(JSON.stringify({ companies, funds: rows.map(({ manager, ...fund }) => ({ ...fund, managerName: manager.name })) }));
}
export async function capture(companyIds: string[], fundNames: string[], baseCommit: string) {
  if (!companyIds.length || companyIds.length > 10 || new Set(companyIds).size !== companyIds.length) throw Error("One to ten unique companies required");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw Error("Read-only production environment required");
  const target = databaseTargetIdentity({ connectionString,
    expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  if (target.fingerprint !== PRODUCTION_FINGERPRINT) throw Error("Production target differs");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const data = await db.$transaction(async tx => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const selected = await observeCompanies(tx, companyIds, fundNames);
      const publishedFundNames = await observePublishedFundNames(tx);
      return { ...selected, publishedFundNames };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
    return verifySnapshot(seal(JSON.parse(JSON.stringify({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_SNAPSHOT", baseCommit,
      capturedAt: new Date().toISOString(), targetFingerprint: target.fingerprint, ...data })), "snapshotSha256"));
  } finally { await db.$disconnect(); }
}
