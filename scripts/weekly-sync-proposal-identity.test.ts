import { describe, expect, it } from "vitest";
import { deals } from "../prisma/seed-data/deals";
import { weeklyBriefingDeals } from "../prisma/seed-data/weekly-briefing-deals";
import {
  resolveWeeklyProposalIdentity,
  resolveWeeklyProposalMatch,
  weeklyDealIdentitiesMatch,
} from "../src/modules/operations/weekly-deal-identity";

const EXPECTED_PROPOSAL_IDS = new Map([
  ["WB-2026-07-03-004", "WB-2026-07-03-H51d8779aff30cbe26ae12c54"],
  ["WB-2026-07-03-014", "WB-2026-07-03-H77dfa5d1f31ce4d2c7cd1f6c"],
  ["WB-2026-07-03-019", "WB-2026-07-03-H28d24dd65b37593e9094af84"],
  ["WB-2026-07-03-021", "WB-2026-07-03-Hcd440cdb9811de846f6bbcad"],
  ["WB-2026-07-03-024", "WB-2026-07-03-Hbea094e0e7cb1d0d5da2ceaa"],
]);

const PERSISTED_ORDINAL_COLLISIONS = [
  {
    legacyId: "WB-2026-07-03-004",
    target: "Kallista Energy",
    date: "2026-07-03T12:00:00.000Z",
    sourceUrls: ["https://example.test/kallista"],
    status: "PUBLISHED",
  },
  {
    legacyId: "WB-2026-07-03-014",
    target: "I-2SEA subsea cable",
    date: "2026-07-03T12:00:00.000Z",
    sourceUrls: ["https://example.test/i-2sea"],
    status: "PUBLISHED",
  },
  {
    legacyId: "WB-2026-07-03-019",
    target: "InstaVolt",
    date: "2026-07-03T12:00:00.000Z",
    sourceUrls: ["https://example.test/instavolt"],
    status: "PUBLISHED",
  },
  {
    legacyId: "WB-2026-07-03-021",
    target: "Cardinal Midstream",
    date: "2026-07-03T12:00:00.000Z",
    sourceUrls: ["https://example.test/cardinal"],
    status: "PUBLISHED",
  },
] as const;

describe("weekly sync proposal identities for the July 3 review queue", () => {
  it("resolves all five missing cards without reusing an ordinal", () => {
    const missingCards = weeklyBriefingDeals.filter((deal) =>
      EXPECTED_PROPOSAL_IDS.has(deal.id));
    expect(missingCards).toHaveLength(5);

    const resolved = missingCards.map((weeklyDeal) => ({
      weeklyCardId: weeklyDeal.id,
      proposalId: resolveWeeklyProposalIdentity(
        weeklyDeal,
        PERSISTED_ORDINAL_COLLISIONS,
        deals,
      ).legacyId,
    }));

    expect(resolved).toEqual(
      missingCards.map((weeklyDeal) => ({
        weeklyCardId: weeklyDeal.id,
        proposalId: EXPECTED_PROPOSAL_IDS.get(weeklyDeal.id),
      })),
    );
    expect(new Set(resolved.map(({ proposalId }) => proposalId))).toHaveLength(5);
    expect(resolved.every(({ weeklyCardId, proposalId }) =>
      weeklyCardId !== proposalId)).toBe(true);
  });

  it.each([
    ["Sierra Railroad Company", "Central Valley Ag Transport (CVAT)"],
    ["Cyntox Biohazard Solutions", "AdvoWaste Medical Services"],
  ])("keeps shared-announcement cards distinct: %s / %s", (firstTarget, secondTarget) => {
    const first = weeklyBriefingDeals.find((deal) => deal.target === firstTarget);
    const second = weeklyBriefingDeals.find((deal) => deal.target === secondTarget);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.sourceUrl).toBe(second?.sourceUrl);
    expect(weeklyDealIdentitiesMatch(first!, second!)).toBe(false);
    expect(resolveWeeklyProposalMatch(first!, [first!, second!])).toBe(first);
    expect(resolveWeeklyProposalMatch(second!, [first!, second!])).toBe(second);
  });

  it("covers the retained Sedna LinkedIn citation despite share-slug punctuation drift", () => {
    const weekly = weeklyBriefingDeals.find((deal) =>
      deal.id === "WB-2026-06-13-007");
    expect(weekly).toBeDefined();
    expect(weeklyDealIdentitiesMatch(weekly!, {
      target: "Groupe Santé Sedna",
      date: weekly!.date,
      sourceUrl: `${weekly!.sourceUrl}_`,
    })).toBe(true);
  });
});
