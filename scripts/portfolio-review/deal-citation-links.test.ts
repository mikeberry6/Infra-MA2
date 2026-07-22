import { describe, expect, it } from "vitest";
import {
  buildStrictDealCitationLinkPlan,
  dealCitationLinkUpdateSetSha256,
  findDealCitationLinkUniquenessConflicts,
  type DealCitationLinkCitation,
  type DealCitationLinkSource,
  type DealCitationLinkUpdate,
} from "./deal-citation-links";
import type {
  CoverageCompany,
  CoverageDeal,
  CoverageParticipant,
} from "./deal-coverage";

const source = (
  overrides: Partial<DealCitationLinkSource> = {},
): DealCitationLinkSource => ({
  id: "source-1",
  label: "Transaction announcement",
  url: "https://example.com/transaction",
  ...overrides,
});

const deal = (overrides: Partial<CoverageDeal> = {}): CoverageDeal => ({
  id: "deal-1",
  legacyId: "INF-2026-001",
  title: "Fund acquires Target Co",
  target: "Target Co",
  description: "Fund acquired Target Co.",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-07-01T12:00:00.000Z",
  dealStatus: "ANNOUNCED",
  closingDate: null,
  region: "NORTH_AMERICA",
  country: "United States",
  updatedAt: "2026-07-01T12:00:00.000Z",
  ...overrides,
});

const company = (
  overrides: Partial<CoverageCompany> = {},
): CoverageCompany => ({
  id: "company-1",
  name: "Target Co",
  country: "United States",
  region: "NORTH_AMERICA",
  ...overrides,
});

const citation = (
  overrides: Partial<DealCitationLinkCitation> = {},
): DealCitationLinkCitation => ({
  id: "deal-citation",
  sourceId: "source-1",
  sourceLabel: "Transaction announcement",
  sourceUrl: "https://example.com/transaction",
  purpose: "SUPPORTING_CONTEXT",
  evidenceLabel: "Deal source",
  dealId: "deal-1",
  companyId: null,
  isPrimary: true,
  ...overrides,
});

function plan(
  overrides: {
    deals?: CoverageDeal[];
    companies?: CoverageCompany[];
    participants?: CoverageParticipant[];
    citations?: DealCitationLinkCitation[];
    sources?: DealCitationLinkSource[];
  } = {},
) {
  return buildStrictDealCitationLinkPlan({
    deals: overrides.deals ?? [deal()],
    companies: overrides.companies ?? [company()],
    participants: overrides.participants ?? [],
    citations: overrides.citations ?? [
      citation(),
      citation({
        id: "company-citation",
        dealId: null,
        companyId: "company-1",
        purpose: "OWNERSHIP_INVESTMENT",
        evidenceLabel: "Ownership evidence",
        isPrimary: false,
      }),
    ],
    sources: overrides.sources ?? [source()],
  });
}

describe("strict deterministic-target deal citation links", () => {
  it("plans one evidence-preserving link from an exact shared Source ID and URL", () => {
    const result = plan();

    expect(result.updates).toHaveLength(1);
    expect(result.updates[0]).toMatchObject({
      citationId: "company-citation",
      companyId: "company-1",
      dealId: "deal-1",
      sourceId: "source-1",
      currentDealId: null,
      proposedDealId: "deal-1",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Ownership evidence",
    });
    expect(result.updates[0].dealCitationIds).toEqual(["deal-citation"]);
    expect(result.quarantinedDeals).toEqual([]);
    expect(result.uniquenessConflicts).toEqual([]);
  });

  it("does not reuse a citation already linked to another deal", () => {
    const result = plan({
      citations: [
        citation(),
        citation({
          id: "company-citation",
          dealId: "deal-other",
          companyId: "company-1",
        }),
      ],
    });

    expect(result.updates).toEqual([]);
    expect(result.quarantinedDeals[0].reasonCodes).toContain(
      "NO_EXACT_UNLINKED_SHARED_SOURCE_CITATION",
    );
  });

  it("requires both the shared Source ID and its exact URL", () => {
    expect(() =>
      plan({
        citations: [
          citation(),
          citation({
            id: "company-citation",
            dealId: null,
            companyId: "company-1",
            sourceUrl: "https://example.com/drifted",
          }),
        ],
      }),
    ).toThrow(/exact Source ID\/URL\/label snapshot/);
  });

  it("quarantines every row in a target cluster when one sibling lacks the shared source", () => {
    const result = plan({
      deals: [deal({ target: "Northview Energy" })],
      companies: [
        company({ id: "northview-a", name: "Northview Energy" }),
        company({ id: "northview-b", name: "Northview Energy, LLC" }),
      ],
      citations: [
        citation(),
        citation({
          id: "northview-citation",
          dealId: null,
          companyId: "northview-a",
        }),
      ],
    });

    expect(result.updates).toEqual([]);
    expect(result.quarantinedDeals).toHaveLength(1);
    expect(result.quarantinedDeals[0].companyDecisions).toHaveLength(2);
    expect(
      result.quarantinedDeals[0].companyDecisions.every((decision) =>
        decision.reasonCodes.includes("CLUSTER_SHARED_SOURCE_INCOMPLETE"),
      ),
    ).toBe(true);
  });

  it("fails closed on multiple eligible company citations", () => {
    const result = plan({
      citations: [
        citation(),
        citation({
          id: "company-citation-a",
          dealId: null,
          companyId: "company-1",
          purpose: "OWNERSHIP_INVESTMENT",
        }),
        citation({
          id: "company-citation-b",
          dealId: null,
          companyId: "company-1",
          purpose: "MILESTONE_EVENT",
        }),
      ],
    });

    expect(result.updates).toEqual([]);
    expect(result.quarantinedDeals[0].reasonCodes).toContain(
      "MULTIPLE_EXACT_UNLINKED_SHARED_SOURCE_CITATIONS",
    );
  });

  it("prefers the one citation with an editorial evidence label over a null-label import", () => {
    const result = plan({
      citations: [
        citation(),
        citation({
          id: "generic-import",
          dealId: null,
          companyId: "company-1",
          evidenceLabel: null,
        }),
        citation({
          id: "enriched-evidence",
          dealId: null,
          companyId: "company-1",
          purpose: "OWNERSHIP_INVESTMENT",
          evidenceLabel: "Sponsor transaction announcement",
        }),
      ],
    });

    expect(result.updates.map((update) => update.citationId)).toEqual([
      "enriched-evidence",
    ]);
    expect(result.quarantinedDeals).toEqual([]);
  });

  it("quarantines three candidates even when only one has an evidence label", () => {
    const result = plan({
      citations: [
        citation(),
        citation({
          id: "generic-a",
          dealId: null,
          companyId: "company-1",
          evidenceLabel: null,
        }),
        citation({
          id: "generic-b",
          dealId: null,
          companyId: "company-1",
          evidenceLabel: null,
        }),
        citation({
          id: "enriched-evidence",
          dealId: null,
          companyId: "company-1",
          evidenceLabel: "Sponsor transaction announcement",
        }),
      ],
    });

    expect(result.updates).toEqual([]);
    expect(result.quarantinedDeals[0].reasonCodes).toContain(
      "MULTIPLE_EXACT_UNLINKED_SHARED_SOURCE_CITATIONS",
    );
  });

  it("detects a unique company/source/purpose/evidence/deal identity collision", () => {
    const update = plan().updates[0];
    const conflicts = findDealCitationLinkUniquenessConflicts(
      [update],
      [
        citation({
          id: "existing-direct",
          dealId: update.dealId,
          companyId: update.companyId,
          purpose: update.purpose,
          evidenceLabel: update.evidenceLabel,
        }),
      ],
    );

    expect(conflicts).toEqual([
      expect.objectContaining({
        citationId: update.citationId,
        conflictingCitationIds: ["existing-direct"],
      }),
    ]);
  });

  it("reports a proposed unique-identity collision", () => {
    const result = plan({
      citations: [
        citation(),
        citation({
          id: "company-citation",
          dealId: null,
          companyId: "company-1",
          purpose: "OWNERSHIP_INVESTMENT",
          evidenceLabel: null,
        }),
        citation({
          id: "conflicting-citation",
          dealId: "deal-1",
          companyId: "company-1",
          purpose: "OWNERSHIP_INVESTMENT",
          evidenceLabel: null,
        }),
      ],
    });

    // The direct citation takes classification precedence, so the planner
    // cannot produce a target-only update in this state.
    expect(result.updates).toEqual([]);
    expect(result.coverageRows[0].classification).toBe(
      "DIRECT_DEAL_COMPANY_CITATION",
    );
  });

  it("hashes only the reviewed four-key update material in citation-ID order", () => {
    const base = plan().updates[0];
    const second: DealCitationLinkUpdate = {
      ...base,
      citationId: "a-citation",
      companyId: "company-2",
      companyName: "Changed display metadata",
      dealId: "deal-2",
      proposedDealId: "deal-2",
      sourceId: "source-2",
      sourceLabel: "Changed label",
      sourceUrl: "https://example.com/changed",
    };
    const forward = dealCitationLinkUpdateSetSha256([base, second]);
    const reversed = dealCitationLinkUpdateSetSha256([second, base]);
    const metadataChanged = dealCitationLinkUpdateSetSha256([
      { ...base, companyName: "Other presentation name" },
      second,
    ]);

    expect(reversed).toBe(forward);
    expect(metadataChanged).toBe(forward);
  });
});
