import { describe, expect, it } from "vitest";
import {
  E2E_DEAL_FIXTURE_BUYER,
  E2E_DEAL_FIXTURE_SOURCE_LABEL,
  E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES,
  E2E_DEAL_FIXTURES,
  validateDealFixtureCandidate,
  validateDealFixtureSourceCandidate,
  type DealFixtureCandidate,
  type DealFixtureSourceCandidate,
} from "../tests/e2e/deal-fixture-contract";

function fixture(
  overrides: Partial<DealFixtureCandidate> = {},
): DealFixtureCandidate {
  const runId = "1784776444132-xqts42";
  const target = `InfraSight E2E Deal ${runId}`;
  return {
    legacyId: "INF-2026-9999",
    target,
    title: `${target} acquisition`,
    description: "Isolated end-to-end publication workflow verification record.",
    buyerNames: [E2E_DEAL_FIXTURE_BUYER],
    newsMentionCount: 0,
    ...overrides,
  };
}

function sourceFixture(
  overrides: Partial<DealFixtureSourceCandidate> = {},
): DealFixtureSourceCandidate {
  return {
    label: E2E_DEAL_FIXTURE_SOURCE_LABEL,
    url: `${E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES[0]}1784776444132-xqts42`,
    citations: [],
    ...overrides,
  };
}

describe("authenticated write E2E deal fixture contract", () => {
  it.each([
    [
      E2E_DEAL_FIXTURES.publishedJourney,
      "INF-2026-9999",
    ],
    [
      E2E_DEAL_FIXTURES.csvPreview,
      "E2E-IMPORT-1784776444132-xqts42",
    ],
    [
      E2E_DEAL_FIXTURES.draftDelete,
      "INF-2026-9998",
    ],
  ])("accepts the complete $targetPrefix signature", (spec, legacyId) => {
    const target = `${spec.targetPrefix}1784776444132-xqts42`;
    expect(validateDealFixtureCandidate(fixture({
      legacyId,
      target,
      title: `${target} acquisition`,
      description: spec.description,
    }))).toEqual({
      valid: true,
      reasons: [],
    });
  });

  it.each([
    ["run ID", { target: "InfraSight E2E Deal hand-authored" }],
    ["title", { title: "A legitimate research deal" }],
    ["description", { description: "Editorial research record." }],
    ["buyer", { buyerNames: ["Legitimate Infrastructure Manager"] }],
    ["news dependency", { newsMentionCount: 1 }],
  ])("rejects a prefix match with a mismatched %s", (_label, overrides) => {
    const result = validateDealFixtureCandidate(fixture(overrides));
    expect(result.valid).toBe(false);
    expect(result.reasons).not.toHaveLength(0);
  });

  it("requires CSV fixture legacy IDs to contain the same generated run ID", () => {
    const runId = "1784776444132-xqts42";
    const target = `InfraSight E2E CSV Preview ${runId}`;
    const result = validateDealFixtureCandidate(fixture({
      legacyId: "E2E-IMPORT-a-different-run",
      target,
      title: `${target} acquisition`,
      description: "Isolated preview-before-commit browser verification record.",
    }));

    expect(result).toEqual({
      valid: false,
      reasons: ["CSV fixture legacy ID does not match its generated run ID"],
    });
  });
});

describe("authenticated write E2E source fixture contract", () => {
  it.each(E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES)(
    "accepts a citation-free exact generated source at %s",
    (urlPrefix) => {
      expect(validateDealFixtureSourceCandidate(sourceFixture({
        url: `${urlPrefix}1784776444132-xqts42`,
      }), [])).toEqual({
        valid: true,
        reasons: [],
      });
    },
  );

  it("allows a source linked only to a deal being removed in the same transaction", () => {
    expect(validateDealFixtureSourceCandidate(sourceFixture({
      citations: [{ dealId: "fixture-deal", companyId: null }],
    }), ["fixture-deal"])).toEqual({
      valid: true,
      reasons: [],
    });
  });

  it.each([
    [
      "malformed URL",
      sourceFixture({ url: "https://example.com/infrasight-e2e-deal-source-hand-authored" }),
      [],
    ],
    [
      "mismatched label",
      sourceFixture({ label: "Editorial research source" }),
      [],
    ],
    [
      "non-fixture deal link",
      sourceFixture({ citations: [{ dealId: "research-deal", companyId: null }] }),
      ["fixture-deal"],
    ],
    [
      "company link",
      sourceFixture({ citations: [{ dealId: null, companyId: "research-company" }] }),
      [],
    ],
  ])("rejects a source with a %s", (_label, candidate, fixtureDealIds) => {
    const result = validateDealFixtureSourceCandidate(candidate, fixtureDealIds);
    expect(result.valid).toBe(false);
    expect(result.reasons).not.toHaveLength(0);
  });
});
