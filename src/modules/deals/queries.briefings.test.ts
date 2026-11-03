// @vitest-environment node
import { beforeEach, it, expect, vi } from "vitest";
const db = vi.hoisted(() => ({
  auditEvent: { findMany: vi.fn() },
  deal: { findMany: vi.fn() }, $queryRaw: vi.fn(),
  briefingDeal: { findMany: vi.fn() }, briefingIssue: { findMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
import { getAllDeals, getBriefingIssues } from "./queries";
beforeEach(() => { vi.clearAllMocks(); db.auditEvent.findMany.mockResolvedValue([]); });
it("serves existing deals before the additive briefing schema is staged", async () => {
  db.$queryRaw.mockResolvedValue([{ ready: false }]);
  db.deal.findMany.mockResolvedValue([{ id: "db", legacyId: "one", participants: [], citations: [], date: new Date(), categories: [], keyHighlights: [], closingDate: null }]);
  expect((await getAllDeals())[0].briefings).toEqual([]);
  expect(await getBriefingIssues()).toEqual([]);
  expect(db.briefingDeal.findMany).not.toHaveBeenCalled();
  expect(db.briefingIssue.findMany).not.toHaveBeenCalled();
});
it("returns one reference per issue when a deal has multiple cards", async () => {
  db.$queryRaw.mockResolvedValue([{ ready: true }]);
  db.deal.findMany.mockResolvedValue([{ id: "db", legacyId: "one", participants: [], citations: [], date: new Date(), categories: [], keyHighlights: [], closingDate: null }]);
  db.auditEvent.findMany.mockResolvedValue([{ entityId: "old-id", metadata: { canonicalLegacyId: "one" } }]);
  const issue = { edition: "2026-10-30", archivePath: "/email-format/2026-10-30.html" };
  db.briefingDeal.findMany.mockResolvedValue([{ dealId: "db", issue }, { dealId: "db", issue }]);
  const deal = (await getAllDeals())[0];
  expect(deal.briefings).toEqual([issue]);
  expect(deal.legacyIdAliases).toEqual(["old-id"]);
});
