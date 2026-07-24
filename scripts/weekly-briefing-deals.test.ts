import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { deals, type Deal } from "../prisma/seed-data/deals";
import { weeklyBriefingDeals } from "../prisma/seed-data/weekly-briefing-deals";
import { WEEKLY_DEAL_SEED_LINEAGE } from "../prisma/seed-data/weekly-deal-lineage";
import {
  findWeeklySeedDeal,
  weeklyDealIsCoveredByPersisted,
  weeklyDealSourcesMatch,
} from "../src/modules/operations/weekly-deal-identity";

const EMAIL_DIR = join(process.cwd(), "public", "email-format");
const WEEKLY_ISSUE_PATTERN = /^2026-\d{2}-\d{2}\.html$/;
const PERSISTED_DEAL_IDENTITIES = deals.map((deal) => ({
  legacyId: deal.id,
  target: deal.target,
  date: deal.date,
  sourceUrl: deal.sourceUrl,
}));

function isWeeklyDealCovered(weeklyDeal: Deal): boolean {
  return weeklyDealIsCoveredByPersisted(
    weeklyDeal,
    PERSISTED_DEAL_IDENTITIES,
    deals,
    WEEKLY_DEAL_SEED_LINEAGE,
  );
}

describe("weekly briefing deal coverage", () => {
  it("parses at least one deal from every dated weekly briefing issue", () => {
    const weeklyIssueIds = readdirSync(EMAIL_DIR)
      .filter((fileName) => WEEKLY_ISSUE_PATTERN.test(fileName))
      .map((fileName) => fileName.replace(".html", ""));
    const parsedIssueIds = new Set(weeklyBriefingDeals.map((deal) => deal.id.slice(3, 13)));

    expect(weeklyIssueIds.filter((issueId) => !parsedIssueIds.has(issueId))).toEqual([]);
  });

  it("keeps every weekly briefing deal represented in the deal database", () => {
    const missing = weeklyBriefingDeals
      .filter((deal) => !isWeeklyDealCovered(deal))
      .map((deal) => `${deal.id}: ${deal.target}`);

    expect(missing).toEqual([]);
  });

  it("binds every explicit lineage exception to one matching canonical seed", () => {
    const weeklyById = new Map(weeklyBriefingDeals.map((deal) => [deal.id, deal]));
    const seedById = new Map(deals.map((deal) => [deal.id, deal]));
    const lineageEntries = Object.entries(WEEKLY_DEAL_SEED_LINEAGE);
    expect(lineageEntries).toHaveLength(25);
    expect(new Set(lineageEntries.map(([, seedId]) => seedId))).toHaveLength(25);

    for (const [weeklyId, seedId] of lineageEntries) {
      const weekly = weeklyById.get(weeklyId);
      const seed = seedById.get(seedId);
      expect(weekly, weeklyId).toBeDefined();
      expect(seed, seedId).toBeDefined();
      expect(weeklyDealSourcesMatch(weekly!, seed!)).toBe(false);
      expect(findWeeklySeedDeal(weekly!, deals)).toBeNull();
      expect(findWeeklySeedDeal(
        weekly!,
        deals,
        WEEKLY_DEAL_SEED_LINEAGE,
      )).toBe(seed);
    }
  });
});
