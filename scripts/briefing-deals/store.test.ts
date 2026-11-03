// @vitest-environment node
import { createHash } from "node:crypto";
import { stageBriefingSchema } from "./stage-schema-store";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { digest, loadIssues } from "./archive";
import { buildProposal, type Proposal } from "./domain";
import { snapshot, applyProposal } from "./store";

let db: PGlite; let server: PGLiteSocketServer; let client: PrismaClient;
const issue = { ...loadIssues(process.cwd(), "2026-10-30")[0], cards: [loadIssues(process.cwd(), "2026-10-30")[0].cards[0]] };
async function proposal(id: string): Promise<Proposal> {
  const state = await snapshot(client);
  const result = buildProposal([issue], state.records, state.hash);
  result.decisions[0] = { ...result.decisions[0], canonicalId: id, action: "CREATE", verifiedAnnouncementDate: "2026-10-29", verificationSourceUrl: "https://example.test/transaction", approved: true, reviewer: "Synthetic integration test", evidence: "Synthetic fixture only", data: {
    target: issue.cards[0].target, title: issue.cards[0].title, buyer: "Synthetic Fund", seller: "N/A", sector: "Power & ET", subsector: "Power", region: "North America", category: ["Joint Venture"], date: "2026-10-29", description: "Synthetic test transaction", targetDescription: "Synthetic platform", country: "United States", status: "Announced", sourceUrl: "https://example.test/transaction", sourceName: "Fixture",
  } };
  return result;
}
beforeAll(async () => {
  db = await PGlite.create();
  const schemaSql = execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "diff", "--from-empty", "--to-schema", "prisma/schema.prisma", "--script"], { encoding: "utf8" });
  await db.exec(schemaSql);
  // Exercise the additive migration against an existing schema without its new tables.
  await db.exec('DROP TABLE "BriefingDeal"; DROP TABLE "BriefingIssue";');
  await db.exec(`CREATE TABLE "_prisma_migrations" (id TEXT PRIMARY KEY, checksum TEXT NOT NULL, finished_at TIMESTAMPTZ, migration_name TEXT NOT NULL, started_at TIMESTAMPTZ, rolled_back_at TIMESTAMPTZ, applied_steps_count INTEGER);`);
  server = new PGLiteSocketServer({ db, port: 0, host: "127.0.0.1" });
  await server.start();
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`, max: 1 }) });
  const sql = readFileSync("prisma/migrations/20261103160000_briefing_deal_membership/migration.sql", "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  await stageBriefingSchema(client, sql, checksum);
  await stageBriefingSchema(client, sql, checksum);
  expect((await db.query('SELECT * FROM "_prisma_migrations"')).rows).toHaveLength(1);
  await expect(stageBriefingSchema(client, sql, "wrong")).rejects.toThrow("conflicts");
  await client.auditEvent.deleteMany(); // schema approval receipt is separate from import receipt assertions
}, 60000);
afterAll(async () => { await client?.$disconnect(); await server?.stop(); await db?.close(); });
describe("reviewed transactional import on isolated Postgres", () => {
  it("applies an additive migration and preserves one canonical deal on repeat apply", async () => {
    const input = await proposal("SYNTHETIC-1");
    const hash = digest(input);
    expect((await applyProposal(client, input, hash)).alreadyApplied).toBe(false);
    expect((await applyProposal(client, input, hash)).alreadyApplied).toBe(true);
    expect(await client.deal.count()).toBe(1);
    expect(await client.briefingDeal.count()).toBe(1);
    expect(await client.auditEvent.count()).toBe(1);
  });
  it("rejects a stale snapshot without partial writes", async () => {
    const input = await proposal("SYNTHETIC-2");
    await client.deal.update({ where: { legacyId: "SYNTHETIC-1" }, data: { description: "Richer updated record" } });
    await expect(applyProposal(client, input, digest(input))).rejects.toThrow("stale");
    expect(await client.deal.count()).toBe(1);
  });
  it("blocks a match whose existing date or source disagrees with verified evidence", async () => {
    const input = await proposal("SYNTHETIC-1");
    input.decisions[0].action = "MATCH";
    input.decisions[0].verifiedAnnouncementDate = "2026-10-28";
    await expect(applyProposal(client, input, digest(input))).rejects.toThrow("conflicts with verified evidence");
    input.decisions[0].verifiedAnnouncementDate = "2026-10-29";
    input.decisions[0].verificationSourceUrl = "https://example.test/other";
    await expect(applyProposal(client, input, digest(input))).rejects.toThrow("conflicts with verified evidence");
    expect(await client.deal.count()).toBe(1);
  });
  it("rolls back creates when a later membership write fails", async () => {
    const input = await proposal("SYNTHETIC-3");
    await db.exec(`CREATE FUNCTION reject_briefing_membership() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic membership failure'; END $$; CREATE TRIGGER reject_briefing_membership BEFORE INSERT ON "BriefingDeal" FOR EACH ROW EXECUTE FUNCTION reject_briefing_membership();`);
    await expect(applyProposal(client, input, digest(input))).rejects.toThrow();
    expect(await client.deal.count()).toBe(1);
    expect(await client.briefingDeal.count()).toBe(1);
    expect(await client.auditEvent.count()).toBe(1);
    await db.exec('DROP TRIGGER reject_briefing_membership ON "BriefingDeal";');
  });
  it("links a second issue appearance without overwriting richer deal data", async () => {
    const state = await snapshot(client);
    const secondIssue = { ...issue, edition: "2026-11-06" };
    const input = buildProposal([secondIssue], state.records, state.hash);
    input.decisions[0] = { ...input.decisions[0], action: "MATCH", verifiedAnnouncementDate: "2026-10-29", verificationSourceUrl: "https://example.test/transaction", approved: true, canonicalId: "SYNTHETIC-1", reviewer: "Synthetic test", evidence: "Same transaction" };
    await applyProposal(client, input, digest(input));
    expect(await client.deal.count()).toBe(1);
    expect(await client.briefingDeal.count()).toBe(2);
    expect((await client.deal.findUniqueOrThrow({ where: { legacyId: "SYNTHETIC-1" } })).description).toBe("Richer updated record");
  });
  it("keeps buyer/seller roles and closed status while normalizing fund aliases", async () => {
    const state = await snapshot(client);
    const thirdIssue = { ...issue, edition: "2026-11-13" };
    const input = buildProposal([thirdIssue], state.records, state.hash);
    const fixture = await proposal("SYNTHETIC-CLOSED");
    input.decisions[0] = { ...fixture.decisions[0], edition: thirdIssue.edition, data: { ...fixture.decisions[0].data!, buyer: "GSAM (via Platform)", seller: "CVC (CVC DIF)", status: "Closed" } };
    await applyProposal(client, input, digest(input));
    const deal = await client.deal.findUniqueOrThrow({ where: { legacyId: "SYNTHETIC-CLOSED" }, include: { participants: true } });
    expect(deal.dealStatus).toBe("CLOSED");
    expect(deal.participants.find(p => p.role === "BUYER")?.displayName).toBe("Goldman Sachs Asset Management (via Platform)");
    expect(deal.participants.find(p => p.role === "SELLER")?.displayName).toBe("CVC DIF");
  });
  it("appends an explicitly approved citation without replacing existing sources", async () => {
    const state = await snapshot(client);
    const input = buildProposal([{ ...issue, edition: "2026-11-20" }], state.records, state.hash);
    input.decisions[0] = { ...input.decisions[0], canonicalId: "SYNTHETIC-1", action: "MATCH", approved: true, reviewer: "Synthetic owner", evidence: "Approved additional primary source", verifiedAnnouncementDate: "2026-10-29", verificationSourceUrl: "https://example.test/additional", data: { addCitation: true } };
    await applyProposal(client, input, digest(input));
    expect(await client.citation.count({ where: { deal: { legacyId: "SYNTHETIC-1" } } })).toBe(2);
  });
  it("archives a reviewed duplicate while preserving the canonical deal and old identity", async () => {
    const original = await client.deal.findUniqueOrThrow({ where: { legacyId: "SYNTHETIC-1" } });
    const { id: _id, legacyId: _legacyId, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = original;
    await client.deal.create({ data: { ...data, legacyId: "DUPLICATE-1" } });
    const state = await snapshot(client);
    const input = buildProposal([{ ...issue, edition: "2026-11-27" }], state.records, state.hash);
    input.decisions[0] = { ...input.decisions[0], action: "MATCH", canonicalId: "SYNTHETIC-1", approved: true, reviewer: "Synthetic owner", evidence: "Same announcement", verifiedAnnouncementDate: "2026-10-29", verificationSourceUrl: "https://example.test/transaction", data: null };
    input.duplicates = [{ duplicateId: "DUPLICATE-1", canonicalId: "SYNTHETIC-1", evidence: "Same acquisition, later closing update", sourceUrl: "https://example.test/transaction" }];
    await applyProposal(client, input, digest(input));
    expect((await client.deal.findUniqueOrThrow({ where: { legacyId: "DUPLICATE-1" } })).status).toBe("ARCHIVED");
    expect((await client.deal.findUniqueOrThrow({ where: { legacyId: "SYNTHETIC-1" } })).description).toBe("Richer updated record");
    expect((await client.auditEvent.findFirstOrThrow({ where: { entityId: "DUPLICATE-1", action: "MERGE" } })).metadata).toMatchObject({ canonicalLegacyId: "SYNTHETIC-1" });
  });
  it("publishes an explicitly approved existing draft without creating another record", async () => {
    const original = await client.deal.findUniqueOrThrow({ where: { legacyId: "SYNTHETIC-1" } });
    const { id: _id, legacyId: _legacyId, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = original;
    await client.deal.create({ data: { ...data, legacyId: "EXISTING-DRAFT", status: "DRAFT" } });
    const state = await snapshot(client);
    const input = buildProposal([{ ...issue, edition: "2026-12-04" }], state.records, state.hash);
    input.decisions[0] = { ...input.decisions[0], action: "MATCH", canonicalId: "EXISTING-DRAFT", approved: true, reviewer: "Synthetic owner", evidence: "Approved published card; restore source and publish existing draft", verifiedAnnouncementDate: "2026-10-29", verificationSourceUrl: "https://example.test/draft-source", data: { addCitation: true, publishExisting: true } };
    await applyProposal(client, input, digest(input));
    expect((await client.deal.findUniqueOrThrow({ where: { legacyId: "EXISTING-DRAFT" } })).status).toBe("PUBLISHED");
    expect(await client.deal.count({ where: { legacyId: "EXISTING-DRAFT" } })).toBe(1);
  });
  it("rejects changed approval hashes", async () => {
    const input = await proposal("SYNTHETIC-4");
    await expect(applyProposal(client, input, "wrong")).rejects.toThrow("hash");
  });
});
