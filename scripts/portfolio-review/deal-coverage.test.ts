import { describe, expect, it } from "vitest";
import {
  buildDealCoverageRows,
  type CoverageCitation,
  type CoverageCompany,
  type CoverageDeal,
  type CoverageParticipant,
} from "./deal-coverage";

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

const company = (overrides: Partial<CoverageCompany> = {}): CoverageCompany => ({
  id: "company-1",
  name: "Target Co",
  country: "United States",
  region: "NORTH_AMERICA",
  ...overrides,
});

const citation = (overrides: Partial<CoverageCitation> = {}): CoverageCitation => ({
  id: "citation-1",
  sourceId: "source-1",
  sourceLabel: "Transaction announcement",
  sourceUrl: "https://example.com/transaction",
  purpose: "MILESTONE_EVENT",
  evidenceLabel: null,
  dealId: "deal-1",
  companyId: null,
  ...overrides,
});

const participant = (overrides: Partial<CoverageParticipant> = {}): CoverageParticipant => ({
  id: "participant-1",
  dealId: "deal-1",
  role: "BUYER",
  organizationName: "Infrastructure Fund",
  displayName: "Infrastructure Fund",
  ...overrides,
});

function classify(input: {
  deals?: CoverageDeal[];
  companies?: CoverageCompany[];
  participants?: CoverageParticipant[];
  citations?: CoverageCitation[];
}) {
  return buildDealCoverageRows({
    deals: input.deals ?? [deal()],
    companies: input.companies ?? [company()],
    participants: input.participants ?? [],
    citations: input.citations ?? [],
  });
}

describe("published deal coverage classification", () => {
  it("gives an explicit deal/company citation precedence over target and shared-source signals", () => {
    const rows = classify({
      citations: [citation({ companyId: "company-1" })],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].classification).toBe("DIRECT_DEAL_COMPANY_CITATION");
    expect(rows[0].directCitationMatches).toHaveLength(1);
    expect(rows[0].directCitationMatches[0].evidenceTypes).toContain("DIRECT_DEAL_COMPANY_CITATION");
    expect(rows[0].supportingSourceUrls).toEqual(["https://example.com/transaction"]);
  });

  it("returns every underlying row in a deterministically matched identity cluster", () => {
    const rows = classify({
      deals: [deal({ target: "Northview Energy" })],
      companies: [
        company({ id: "northview-1", name: "Northview Energy" }),
        company({ id: "northview-2", name: "Northview Energy, LLC" }),
      ],
    });

    expect(rows[0].classification).toBe("DETERMINISTIC_TARGET_MATCH");
    expect(rows[0].deterministicTargetMatches.map((match) => match.companyId)).toEqual([
      "northview-1",
      "northview-2",
    ]);
    expect(new Set(rows[0].deterministicTargetMatches.map((match) => match.identityClusterId)).size).toBe(1);
  });

  it("recognizes an explicit via-company as a platform milestone without treating the fund as a company", () => {
    const rows = classify({
      deals: [deal({
        target: "Solar Asset Portfolio",
        title: "Fund acquires assets via Altus Power",
        description: "Fund, through its portfolio company Altus Power, acquired a solar portfolio.",
        categories: ["ACQUISITION_BOLT_ON"],
      })],
      companies: [company({ id: "altus", name: "Altus Power" })],
      participants: [participant({ displayName: "Infrastructure Fund (via Altus Power)" })],
    });

    expect(rows[0].classification).toBe("PLATFORM_BOLT_ON_MILESTONE");
    expect(rows[0].confidence).toBe("MEDIUM");
    expect(rows[0].platformMatches[0]).toMatchObject({
      companyId: "altus",
      role: "ACQUIRING_PLATFORM",
      confidence: "HIGH",
    });
    expect(rows[0].platformMatches[0].evidenceTypes).toContain("VIA_PARTICIPANT");
  });

  it("keeps the actual target classification when a bolt-on target already exists", () => {
    const rows = classify({
      deals: [deal({ target: "BoltOn Co", categories: ["ACQUISITION_BOLT_ON"] })],
      companies: [
        company({ id: "target", name: "BoltOn Co" }),
        company({ id: "platform", name: "Acquirer Network" }),
      ],
      participants: [participant({ displayName: "Infrastructure Fund (via Acquirer Network)" })],
    });

    expect(rows[0].classification).toBe("DETERMINISTIC_TARGET_MATCH");
    expect(rows[0].deterministicTargetMatches.map((match) => match.companyId)).toEqual(["target"]);
    expect(rows[0].platformMatches.map((match) => match.companyId)).toEqual(["platform"]);
  });

  it("keeps a shared URL as review evidence when no target or platform relationship is proven", () => {
    const rows = classify({
      deals: [deal({ target: "Unrelated Asset" })],
      companies: [company({ id: "operator", name: "Known Operator" })],
      citations: [
        citation(),
        citation({ id: "citation-2", dealId: null, companyId: "operator" }),
      ],
    });

    expect(rows[0].classification).toBe("SOURCE_LINKED_REVIEW_CANDIDATE");
    expect(rows[0].sourceLinkedCandidates[0]).toMatchObject({
      companyId: "operator",
      role: "REVIEW_CANDIDATE",
    });
  });

  it("uses a shared source plus explicit deal-description wording to identify an operating platform", () => {
    const rows = classify({
      deals: [deal({
        target: "48 MW Solar Portfolio",
        title: "Fund acquires a solar portfolio",
        description: "Standard Solar, a portfolio company of Brookfield, acquired the assets.",
        categories: ["ACQUISITION_BOLT_ON"],
      })],
      companies: [company({ id: "standard-solar", name: "Standard Solar" })],
      participants: [participant({ displayName: "Standard Solar / Brookfield" })],
      citations: [
        citation(),
        citation({ id: "citation-2", dealId: null, companyId: "standard-solar" }),
      ],
    });

    expect(rows[0].classification).toBe("PLATFORM_BOLT_ON_MILESTONE");
    expect(rows[0].platformMatches[0].evidenceTypes).toEqual([
      "NARRATIVE_PLATFORM_NAME",
      "SHARED_SOURCE_URL",
    ]);
  });

  it("does not fan a participant fund name out to a same-named company without relationship evidence", () => {
    const rows = classify({
      deals: [deal({ target: "Unrelated Asset" })],
      companies: [company({ id: "fund-name-company", name: "Mega Infrastructure Fund" })],
      participants: [participant({
        organizationName: "Mega Infrastructure Fund",
        displayName: "Mega Infrastructure Fund",
      })],
    });

    expect(rows[0].classification).toBe("NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP");
    expect(rows[0].allSupportedCompanies).toEqual([]);
  });

  it("routes a generic exact-name collision to identity review", () => {
    const rows = classify({
      deals: [deal({ target: "Platform" })],
      companies: [company({ name: "Platform" })],
    });

    expect(rows[0].classification).toBe("UNRESOLVED_AMBIGUITY");
    expect(rows[0].ambiguityReasons[0]).toContain("Rejected generic");
  });

  it("sorts and accounts for every unique deal exactly once", () => {
    const rows = classify({
      deals: [
        deal({ id: "deal-b", legacyId: "INF-2026-002", date: "2026-07-02T12:00:00.000Z", target: "Unknown B" }),
        deal({ id: "deal-a", legacyId: "INF-2026-001", date: "2026-07-01T12:00:00.000Z", target: "Unknown A" }),
      ],
      companies: [],
    });

    expect(rows.map((row) => row.dealId)).toEqual(["deal-a", "deal-b"]);
    expect(new Set(rows.map((row) => row.dealId)).size).toBe(2);
  });

  it("produces identical rows when evidence inputs arrive in a different order", () => {
    const input = {
      deals: [
        deal({ id: "deal-b", legacyId: "INF-2026-002", date: "2026-07-02T12:00:00.000Z", target: "Unknown B" }),
        deal({ id: "deal-a", legacyId: "INF-2026-001", date: "2026-07-01T12:00:00.000Z" }),
      ],
      companies: [company(), company({ id: "company-2", name: "Known Operator" })],
      participants: [participant()],
      citations: [citation({ companyId: "company-1" }), citation({ id: "citation-2", dealId: null, companyId: "company-2" })],
    };

    const forward = buildDealCoverageRows(input);
    const reversed = buildDealCoverageRows({
      deals: [...input.deals].reverse(),
      companies: [...input.companies].reverse(),
      participants: [...input.participants].reverse(),
      citations: [...input.citations].reverse(),
    });

    expect(reversed).toEqual(forward);
  });
});
