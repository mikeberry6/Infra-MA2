import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import txnmFiling from "../../../.github/staging/txnm-8k-20250519.json";
import { extractionSchema, matchingSchema, screeningSchema, type ExtractedEntity, type StoryExtraction } from "./contracts";
import { classifyStory, groundExtraction, validateScreening } from "./domain";
import newsletterDeliveries from "./fixtures/newsletter-deliveries.json";
import { exactCandidate, resolveEntityMatch, retrieveCandidates } from "./matching";

const sections = (delivery = 0) => newsletterDeliveries[delivery].sections.map((text, index) => ({ index, text }));
const evidence = (section: number, quote: string) => ({ section, quote });
const disclosure = evidence(1, "On January 9, 2026, Cedar Intertie first made public a definitive agreement signed January 8, 2026 with Northline Infrastructure, the buyer.");
const event = disclosure.quote;
const strategy = evidence(1, "Cedar Intertie operates electric transmission infrastructure in the United States.");

const signing: StoryExtraction = {
  headline: "Northline Infrastructure signs to acquire Cedar Intertie",
  summary: "Cedar Intertie disclosed a binding agreement to sell its transmission network to Northline Infrastructure.",
  category: "TRANSACTION_ACTIVITY",
  eventKind: "SIGNING",
  occurredOn: "2026-01-08",
  firstDisclosedOn: "2026-01-09",
  novelty: "FIRST_FORMAL_DISCLOSURE",
  transactionForm: "ACQUISITION",
  relevance: "RELEVANT",
  qualification: { kind: "DIRECT_TRADITIONAL_ASSET", reason: "Electric transmission is a traditional infrastructure vertical.", evidence: strategy },
  fundDisclosure: "UNDISCLOSED",
  claims: [
    { key: "event", kind: "EVENT", value: event, amount: null, currency: null, attribution: "DISCLOSED", attributedTo: "Cedar Intertie", evidence: disclosure },
    { key: "signed", kind: "OCCURRENCE_DATE", value: "2026-01-08", amount: null, currency: null, attribution: "DISCLOSED", attributedTo: "Cedar Intertie", evidence: disclosure },
    { key: "announcement", kind: "FIRST_DISCLOSURE_DATE", value: "2026-01-09", amount: null, currency: null, attribution: "DISCLOSED", attributedTo: "Cedar Intertie", evidence: disclosure },
    { key: "ev", kind: "ENTERPRISE_VALUE", value: "US$1.2 billion", amount: "1200000000", currency: "USD", attribution: "REPORTED", attributedTo: "Infrastructure Ledger", evidence: evidence(2, "The reported enterprise value was US$1.2 billion.") },
    { key: "financing", kind: "FINANCING_AMOUNT", value: "US$300 million", amount: "300000000", currency: "USD", attribution: "DISCLOSED", attributedTo: "Cedar Intertie", evidence: evidence(2, "A separate US$300 million credit facility will fund construction.") },
  ],
  entities: [
    { key: "target", kind: "COMPANY", label: "Cedar Intertie", role: "TARGET", evidence: disclosure },
    { key: "buyer", kind: "FUND_MANAGER", label: "Northline Infrastructure", role: "BUYER", evidence: disclosure },
    { key: "adviser", kind: "ADVISER", label: "Hawthorne Advisory", role: "FINANCIAL_ADVISER_BUYER", evidence: evidence(2, "Hawthorne Advisory advised Northline Infrastructure on the acquisition.") },
  ],
};

describe("evidence extraction contracts", () => {
  it("exports strict Zod and JSON Schema contracts with all model output keys required", () => {
    for (const schema of [screeningSchema, extractionSchema, matchingSchema]) {
      const json = z.toJSONSchema(schema);
      expect(json.additionalProperties).toBe(false);
      expect(json.required).toEqual(Object.keys(json.properties ?? {}));
    }
    expect(extractionSchema.safeParse({ ...signing, approved: true }).success).toBe(false);
  });

  it("segments a newsletter in stable document order and rejects crossed or unretained ranges", () => {
    const firstStory = { startSection: 1, endSection: 2, relevance: "RELEVANT", reason: "A signing." } as const;
    const secondStory = { startSection: 3, endSection: 3, relevance: "RELEVANT", reason: "A new fiber link." } as const;
    expect(validateScreening({ stories: [secondStory, firstStory] }, sections()).stories).toEqual([firstStory, secondStory]);
    expect(() => validateScreening({ stories: [firstStory, { ...secondStory, startSection: 2 }] }, sections())).toThrow(/disjoint/);
    expect(() => validateScreening({ stories: [firstStory, { ...secondStory, endSection: 99 }] }, sections())).toThrow(/retained/);
  });

  it("grounds typed monetary claims and separately allows a documented undisclosed fund", () => {
    const result = groundExtraction(signing, sections().slice(1, 3), "version-1", { officialDisclosure: true });
    expect(result.claims[3]).toMatchObject({
      kind: "ENTERPRISE_VALUE",
      amount: "1200000000",
      attribution: "REPORTED",
      evidence: { sourceVersionId: "version-1", section: 2, start: 0 },
    });
    expect(result.claims[4]).toMatchObject({ kind: "FINANCING_AMOUNT", amount: "300000000", attribution: "DISCLOSED" });
    expect(classifyStory(result.extraction, true)).toMatchObject({
      evidenceStatus: "DISCLOSED", dealEligibility: "ELIGIBLE", publicationEligibility: "READY_FOR_REVIEW",
    });
    expect(result.extraction.fundDisclosure).toBe("UNDISCLOSED");
    expect(result.extraction.entities).not.toContainEqual(expect.objectContaining({ kind: "FUND" }));
    expect(classifyStory(result.extraction, false)).toMatchObject({
      dealEligibility: "ELIGIBLE", publicationEligibility: "BLOCKED",
    });
  });

  it("labels newsletter-source claims as reports and keeps news separate from the deal decision", () => {
    const result = groundExtraction(signing, sections().slice(1, 3), "version-1");
    expect(result.claims.every(({ attribution }) => attribution === "REPORTED")).toBe(true);
    expect(classifyStory(result.extraction, true)).toMatchObject({
      evidenceStatus: "REPORTED", dealEligibility: "UNRESOLVED", publicationEligibility: "READY_FOR_REVIEW",
    });
  });

  it("rejects stale corrections, cross-story evidence, invented amounts, and category substitutions", () => {
    expect(() => groundExtraction(signing, sections(2).slice(1, 3), "version-2")).toThrow(/verbatim/);
    const wrongStory = { ...signing.claims[0], evidence: evidence(3, "This is an operating development."), value: "This is an operating development." };
    expect(() => groundExtraction({ ...signing, claims: [wrongStory, ...signing.claims.slice(1)] }, sections().slice(1, 3), "version-1")).toThrow(/verbatim/);
    const wrongAmount = { ...signing.claims[3], amount: "1200000" };
    expect(() => groundExtraction({ ...signing, claims: [...signing.claims, { ...wrongAmount, key: "wrong" }] }, sections(), "version-1")).toThrow(/normalized amount/);
    const wrongBasis = { ...signing.claims[4], kind: "ENTERPRISE_VALUE" as const };
    expect(() => groundExtraction({ ...signing, claims: [...signing.claims, { ...wrongBasis, key: "wrong" }] }, sections(), "version-1")).toThrow(/monetary value and its basis/);
    const mixedEvidence = {
      ...wrongBasis, key: "wrong",
      evidence: evidence(2, "The reported enterprise value was US$1.2 billion. A separate US$300 million credit facility will fund construction."),
    };
    expect(() => groundExtraction({ ...signing, claims: [...signing.claims, mixedEvidence] }, sections(), "version-1")).toThrow(/pairs the amount/);
  });

  it("grounds the TXNM merger and stock purchase amounts without interchanging their bases", () => {
    const filingSections = txnmFiling.sections.map((text, index) => ({ index, text }));
    const stockPurchase = evidence(19, "for a purchase price of $50.00 per Purchased Share (for an aggregate amount of $400 million).");
    const treasuryTerms: StoryExtraction["claims"] = [
      {
        ...signing.claims[3], key: "merger-per-share", kind: "PER_SHARE_CONSIDERATION",
        value: "$61.25", amount: "61.25", currency: null, attributedTo: "TXNM Energy",
        evidence: evidence(3, "right to receive $61.25 in cash, without interest (the “Per Share Merger Consideration”)"),
      },
      {
        ...signing.claims[3], key: "purchase-per-share", kind: "PER_SHARE_CONSIDERATION",
        value: "$50.00", amount: "50", currency: null, attributedTo: "TXNM Energy", evidence: stockPurchase,
      },
      {
        ...signing.claims[3], key: "stock-purchase", kind: "STAKE_CONSIDERATION",
        value: "$400 million", amount: "400000000", currency: null, attributedTo: "TXNM Energy", evidence: stockPurchase,
      },
      {
        ...signing.claims[3], key: "termination-fee", kind: "OTHER",
        value: "a termination fee of $210 million", amount: null, currency: null, attributedTo: "TXNM Energy",
        evidence: evidence(8, "TXNM will be required to pay Parent a termination fee of $210 million plus costs and expenses"),
      },
    ];
    function ground(claims: StoryExtraction["claims"]) {
      return groundExtraction({
        ...signing, occurredOn: null, firstDisclosedOn: null, claims, entities: [],
        qualification: { kind: "UNRESOLVED", reason: "Terms-only fixture.", evidence: null },
      }, filingSections, "official-filing", { officialDisclosure: true });
    }

    expect(ground(treasuryTerms).claims.map(({ kind, amount }) => [kind, amount])).toEqual([
      ["PER_SHARE_CONSIDERATION", "61.25"],
      ["PER_SHARE_CONSIDERATION", "50"],
      ["STAKE_CONSIDERATION", "400000000"],
      ["OTHER", null],
    ]);
    expect(() => ground([{ ...treasuryTerms[2], kind: "PER_SHARE_CONSIDERATION" }])).toThrow(/monetary value and its basis/);
    expect(() => ground([{ ...treasuryTerms[1], kind: "STAKE_CONSIDERATION" }])).toThrow(/pairs the amount/);
    expect(() => ground([{ ...treasuryTerms[2], kind: "ENTERPRISE_VALUE" }])).toThrow(/monetary value and its basis/);
    expect(() => ground([{ ...treasuryTerms[3], kind: "CAPITAL_COMMITMENT" }])).toThrow(/monetary value and its basis/);
  });

  it("rejects a source-incompatible date and drops a fund name inferred from the strategy", () => {
    expect(() => groundExtraction({ ...signing, firstDisclosedOn: "2026-01-10" }, sections(), "version-1")).toThrow(/corresponding sourced claim/);
    const inventedFund = { key: "fund", kind: "FUND", label: "Northline Infrastructure", role: "FUND", evidence: disclosure } as const;
    const result = groundExtraction({ ...signing, entities: [...signing.entities, inventedFund] }, sections(), "version-1");
    expect(result.extraction.fundDisclosure).toBe("UNDISCLOSED");
    expect(result.extraction.entities).toEqual(signing.entities);
  });

  it("retains the TXNM affiliate and commitment evidence without asserting a named fund", () => {
    const affiliate = evidence(2, "Parent and Merger Sub are affiliates of Blackstone Infrastructure Partners L.P. (“BIP”).");
    const commitment = evidence(9, "BIP committed to provide Parent, at the consummation of the Merger, with an equity contribution in the amount set forth therein.");
    const filingSections = txnmFiling.sections.map((text, index) => ({ index, text }));
    const extraction: StoryExtraction = {
      ...signing,
      occurredOn: null,
      firstDisclosedOn: null,
      qualification: { kind: "DIRECT_EXPLICIT_STRATEGY", reason: "Infrastructure strategy affiliation.", evidence: affiliate },
      fundDisclosure: "NAMED",
      claims: [
        { ...signing.claims[0], key: "affiliate", kind: "FUND_VEHICLE", value: "Blackstone Infrastructure Partners L.P.", evidence: affiliate },
        { ...signing.claims[0], key: "commitment", kind: "FUND_VEHICLE", value: "BIP", evidence: commitment },
      ],
      entities: [
        { key: "claimed-fund", kind: "FUND", label: "Blackstone Infrastructure Partners L.P.", role: "FUND", evidence: affiliate },
        { key: "fund-abbreviation", kind: "FUND", label: "BIP", role: "INVESTOR", evidence: commitment },
        { key: "parent", kind: "COMPANY", label: "Parent", role: "BUYER", evidence: affiliate },
      ],
    };

    const result = groundExtraction(extraction, filingSections, "official-filing", { officialDisclosure: true });
    expect(result.extraction.fundDisclosure).toBe("UNDISCLOSED");
    expect(result.extraction.qualification.kind).toBe("DIRECT_EXPLICIT_STRATEGY");
    expect(result.extraction.entities).toEqual([extraction.entities[2]]);
    expect(result.claims).toMatchObject([
      { kind: "ENTITY_ROLE", attribution: "DISCLOSED", evidence: { ...affiliate, sourceVersionId: "official-filing" } },
      { kind: "ENTITY_ROLE", attribution: "DISCLOSED", evidence: { ...commitment, sourceVersionId: "official-filing" } },
    ]);
    expect(groundExtraction(result.extraction, filingSections, "official-filing", { officialDisclosure: true })).toEqual(result);
  });

  it("keeps an explicitly named investing fund, while an affiliate of a fund remains unresolved", () => {
    const explicitlyNamed = ["Northline Infrastructure Fund III", "Northline Transmission Partners L.P."];
    const goodQuotes = [
      "Northline Infrastructure Fund III has agreed to acquire Cedar Intertie.",
      "Northline Transmission Partners L.P., an infrastructure fund managed by Northline, acquired Cedar Intertie.",
    ];
    const affiliate = "Cedar Holdings L.P., an affiliate of the infrastructure fund, acquired Cedar Intertie.";
    for (const [index, quote] of [...goodQuotes, affiliate].entries()) {
      const label = explicitlyNamed[index] ?? "Cedar Holdings L.P.";
      const extraction: StoryExtraction = {
        ...signing, occurredOn: null, firstDisclosedOn: null, fundDisclosure: "NAMED",
        qualification: { kind: "UNRESOLVED", reason: "Fund attribution fixture.", evidence: null },
        claims: [
          { ...signing.claims[0], kind: "FUND_VEHICLE", value: label, evidence: evidence(0, quote) },
        ],
        entities: [{ key: "fund", kind: "FUND", label, role: "BUYER", evidence: evidence(0, quote) }],
      };
      const result = groundExtraction(extraction, [{ index: 0, text: quote }], "test-version", { officialDisclosure: true });
      const supported = index < goodQuotes.length;
      expect(result.extraction.fundDisclosure).toBe(supported ? "NAMED" : "UNDISCLOSED");
      expect(result.extraction.entities).toEqual(supported ? extraction.entities : []);
      expect(result.claims[0].kind).toBe(supported ? "FUND_VEHICLE" : "ENTITY_ROLE");
    }
  });

  it("keeps later closing, regulatory and correction developments from counting again", () => {
    for (const eventKind of ["SALE_PROCESS", "REGULATORY", "CLOSING", "CORRECTION"] as const) {
      expect(classifyStory({ ...signing, eventKind, novelty: "FOLLOW_UP" }, true)).toMatchObject({
        dealEligibility: "INELIGIBLE", publicationEligibility: "READY_FOR_REVIEW",
      });
    }
    expect(classifyStory({ ...signing, eventKind: "CLOSING" }, true).dealEligibility).toBe("ELIGIBLE");
    expect(classifyStory({ ...signing, novelty: "RECAP" }, true)).toMatchObject({
      dealEligibility: "INELIGIBLE", publicationEligibility: "BLOCKED",
    });
  });
});

describe("bounded entity resolution", () => {
  const sameName = "Meridian Grid";
  const ambiguousRows = [
    { id: "canadian-company", name: sameName, aliases: [], country: "Canada", headquarters: null, website: null },
    { id: "american-company", name: sameName, aliases: [], country: "United States", headquarters: null, website: null },
  ];
  const sourceSection = sections(3)[1];
  const entity: ExtractedEntity = {
    key: "target", kind: "COMPANY", label: sameName, role: "TARGET",
    evidence: evidence(sourceSection.index, "Meridian Grid has begun considering strategic options, according to people familiar with the matter."),
  };
  const makeClient = () => {
    const findMany = vi.fn(async ({ where }: { where: { id?: string } }) => where.id
      ? ambiguousRows.filter(({ id }) => id === where.id)
      : ambiguousRows,
    );
    return {
      client: { company: { findMany } } as unknown as Parameters<typeof retrieveCandidates>[0],
      findMany,
    };
  };

  it("bounds candidates and requires a distinguishing source attribute", async () => {
    const { client, findMany } = makeClient();
    const candidates = await retrieveCandidates(client, entity);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 6, where: expect.objectContaining({ status: "PUBLISHED" }) }));
    expect(exactCandidate(entity, candidates)).toBeNull();
    const result = await resolveEntityMatch({
      client, entity, candidates, sections: [sourceSection], sourceVersionId: "version-4",
      decision: { candidateId: "canadian-company", evidence: entity.evidence, reason: "The names are identical." },
    });
    expect(result).toMatchObject({ status: "UNRESOLVED", candidateId: null, candidates });
  });

  it("revalidates the chosen database identity and declines IDs outside the supplied list", async () => {
    const { client, findMany } = makeClient();
    const candidates = await retrieveCandidates(client, entity);
    const disambiguation = "Meridian Grid operates an electricity network in Canada.";
    const source = [{ index: 1, text: disambiguation }];
    const decision = { candidateId: "canadian-company", evidence: evidence(1, disambiguation), reason: "The source names the company's country." };
    const input = { client, entity, candidates, sections: source, sourceVersionId: "version-5" };
    expect(await resolveEntityMatch({ ...input, decision })).toMatchObject({
      status: "MATCHED", candidateId: "canadian-company",
      evidence: { sourceVersionId: "version-5", quote: disambiguation },
    });
    expect(await resolveEntityMatch({ ...input, decision: { ...decision, candidateId: "foreign-id" } })).toMatchObject({ status: "UNRESOLVED" });
    findMany.mockResolvedValueOnce([]);
    expect(await resolveEntityMatch({ ...input, decision })).toMatchObject({ status: "UNRESOLVED" });
  });
});
