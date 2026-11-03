// @vitest-environment node
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
  await db.exec(readFileSync("prisma/migrations/20261103160000_briefing_deal_membership/migration.sql", "utf8"));
  server = new PGLiteSocketServer({ db, port: 0, host: "127.0.0.1" });
  await server.start();
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`, max: 1 }) });
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
  it("rejects changed approval hashes", async () => {
    const input = await proposal("SYNTHETIC-4");
    await expect(applyProposal(client, input, "wrong")).rejects.toThrow("hash");
  });
});
