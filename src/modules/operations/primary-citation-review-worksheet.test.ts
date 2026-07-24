import { describe, expect, it } from "vitest";
import {
  PRIMARY_CITATION_REVIEW_WORKSHEET_SCOPE,
  buildPrimaryCitationReviewWorksheet,
  compilePrimaryCitationReviewWorksheet,
  type PrimaryCitationReviewWorksheet,
} from "@/modules/operations/primary-citation-review-worksheet";
import {
  PRIMARY_CITATION_APPROVAL_SCOPE,
  buildPrimaryCitationApprovalTemplate,
  parseReviewedPrimaryCitationApproval,
  sha256Hex,
  type PrimaryCitationApprovalTemplate,
  type PrimaryCitationCandidate,
} from "@/modules/operations/primary-citation-remediation";

const generatedAt = new Date("2026-07-22T12:00:00.000Z");
const reviewedAt = "2026-07-22T13:00:00.000Z";
const now = new Date("2026-07-22T14:00:00.000Z");

function candidate(
  citationId: string,
  overrides: Partial<PrimaryCitationCandidate> = {},
): PrimaryCitationCandidate {
  return {
    citationId,
    sourceId: "source-1",
    sourceLabel: "Issuer release",
    sourceUrl: "https://example.test/release",
    sourceType: "PRESS_RELEASE",
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    currentlyPrimary: false,
    ...overrides,
  };
}

function template(input: {
  includeZeroCandidate?: boolean;
  reverseItems?: boolean;
  reverseCandidates?: boolean;
} = {}): PrimaryCitationApprovalTemplate {
  const duplicateCandidates = [
    candidate("citation-z"),
    candidate("citation-a"),
    candidate("citation-purpose", { purpose: "OWNERSHIP_INVESTMENT" }),
    candidate("citation-evidence", { evidenceLabel: "Transaction announcement" }),
    candidate("citation-type", { sourceType: "ARTICLE" }),
    candidate("citation-source", { sourceId: "source-2" }),
    candidate("citation-label", { sourceLabel: "Alternate issuer label" }),
  ];
  if (input.reverseCandidates) duplicateCandidates.reverse();
  const built = buildPrimaryCitationApprovalTemplate({
    generatedAt,
    deals: [{
      id: "deal-1",
      legacyId: "DEAL-001",
      target: "Example Grid",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: duplicateCandidates.map((item) => ({
        id: item.citationId,
        sourceId: item.sourceId,
        purpose: item.purpose,
        evidenceLabel: item.evidenceLabel,
        isPrimary: false,
        source: {
          label: item.sourceLabel,
          url: item.sourceUrl,
          type: item.sourceType,
        },
      })),
    }],
    companies: input.includeZeroCandidate
      ? [{
          id: "company-zero",
          name: "No Evidence Company",
          country: "United States",
          status: "PUBLISHED",
          updatedAt: generatedAt,
          citations: [],
        }]
      : [{
          id: "company-1",
          name: "Example Networks",
          country: "United States",
          status: "PUBLISHED",
          updatedAt: generatedAt,
          citations: [{
            id: "citation-company",
            sourceId: "source-company",
            purpose: "COMPANY_PROFILE",
            evidenceLabel: "Company profile",
            isPrimary: false,
            source: {
              label: "Company website",
              url: "https://company.example.test/",
              type: "WEBSITE",
            },
          }],
        }],
  });
  return input.reverseItems
    ? { ...built, items: [...built.items].reverse() }
    : built;
}

function exactBytes(value: PrimaryCitationApprovalTemplate): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function worksheetBytes(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function build(
  neutralTemplate = template(),
  includeExactUrlIndex = false,
): PrimaryCitationReviewWorksheet {
  return buildPrimaryCitationReviewWorksheet({
    neutralTemplate,
    exactTemplateBytes: exactBytes(neutralTemplate),
    includeExactUrlIndex,
  });
}

function reviewEveryGroup(
  worksheet: PrimaryCitationReviewWorksheet,
): PrimaryCitationReviewWorksheet {
  return {
    ...worksheet,
    reviewedBy: "Research Reviewer",
    reviewedAt,
    items: worksheet.items.map((item) => ({
      ...item,
      selectedGroupKey: item.groups[0]?.groupKey ?? null,
    })),
  };
}

describe("primary-citation semantic review worksheet", () => {
  it("groups only exact semantic duplicates and retains sorted, complete, disjoint member IDs", () => {
    const neutralTemplate = template();
    const worksheet = build(neutralTemplate);
    const deal = worksheet.items.find((item) => item.entityType === "Deal");

    expect(deal?.groups).toHaveLength(6);
    const duplicateGroup = deal?.groups.find((group) =>
      group.memberCitationIds.includes("citation-z"));
    expect(duplicateGroup?.memberCitationIds).toEqual([
      "citation-a",
      "citation-z",
    ]);
    expect(duplicateGroup?.groupKey).toMatch(/^[a-f0-9]{64}$/);
    expect(duplicateGroup?.groupKey).not.toContain("source-1");

    const flattened = deal?.groups.flatMap((group) => group.memberCitationIds);
    expect(flattened?.sort()).toEqual(
      neutralTemplate.items
        .find((item) => item.entityType === "Deal")
        ?.candidates.map((item) => item.citationId)
        .sort(),
    );
    expect(new Set(flattened).size).toBe(flattened?.length);
    expect(new Set(deal?.groups.map((group) => group.groupKey)).size)
      .toBe(deal?.groups.length);
    expect(deal?.groups.map((group) => group.purpose)).toContain(
      "OWNERSHIP_INVESTMENT",
    );
    expect(deal?.groups.map((group) => group.evidenceLabel)).toContain(
      "Transaction announcement",
    );
    expect(deal?.groups.map((group) => group.sourceType)).toContain("ARTICLE");
    expect(deal?.groups.map((group) => group.sourceId)).toContain("source-2");
    expect(deal?.groups.map((group) => group.sourceLabel)).toContain(
      "Alternate issuer label",
    );
  });

  it("is deterministic across candidate and item permutations apart from the exact-template digest", () => {
    const firstTemplate = template();
    const permutedTemplate = template({
      reverseItems: true,
      reverseCandidates: true,
    });
    const first = build(firstTemplate);
    const permuted = build(permutedTemplate);

    expect(first.sourceTemplateSha256).not.toBe(permuted.sourceTemplateSha256);
    expect(first.items).toEqual(permuted.items);
    expect(first.exactUrlIndex).toEqual(permuted.exactUrlIndex);
  });

  it("orders international labels by Unicode code point independent of host locale", () => {
    const neutralTemplate = template();
    const company = neutralTemplate.items.find(
      (item) => item.entityType === "Company",
    );
    if (!company) throw new Error("Expected the Company fixture");
    neutralTemplate.items = ["Ørsted", "Zeta", "Énergir"].map(
      (entityLabel, index) => ({
        ...company,
        entityId: `company-${index}`,
        entityLabel,
        candidates: company.candidates.map((item) => ({
          ...item,
          citationId: `${item.citationId}-${index}`,
        })),
      }),
    );

    expect(build(neutralTemplate).items.map((item) => item.entityLabel)).toEqual([
      "Zeta",
      "Énergir",
      "Ørsted",
    ]);
  });

  it("preserves zero-candidate items and never preselects a group", () => {
    const worksheet = build(template({ includeZeroCandidate: true }));
    const zeroCandidate = worksheet.items.find(
      (item) => item.entityId === "company-zero",
    );

    expect(zeroCandidate).toMatchObject({
      groups: [],
      selectedGroupKey: null,
    });
    expect(worksheet.reviewedBy).toBeNull();
    expect(worksheet.reviewedAt).toBeNull();
    expect(worksheet.items.every((item) => item.selectedGroupKey === null))
      .toBe(true);
  });

  it("builds a global exact-URL index without collapsing semantic references", () => {
    expect(build().exactUrlIndex).toBeUndefined();

    const worksheet = build(template(), true);
    const release = worksheet.exactUrlIndex?.find(
      (entry) => entry.sourceUrl === "https://example.test/release",
    );

    expect(release?.references).toHaveLength(6);
    expect(release?.references.flatMap((reference) => reference.memberCitationIds))
      .toHaveLength(7);
    expect(new Set(release?.references.map((reference) => reference.groupKey)).size)
      .toBe(6);
    expect(release).toMatchObject({
      hostname: "example.test",
      diagnostic: null,
    });
  });

  it("retains malformed and non-HTTP exact URLs with an explicit local diagnostic", () => {
    const malformedTemplate = template();
    const deal = malformedTemplate.items.find((item) => item.entityType === "Deal");
    if (!deal) throw new Error("Expected the Deal fixture");
    deal.candidates = [
      candidate("malformed", { sourceUrl: "not a URL" }),
      candidate("non-http", { sourceUrl: "mailto:research@example.test" }),
    ];
    const worksheet = build(malformedTemplate, true);

    expect(worksheet.exactUrlIndex?.find(
      (entry) => entry.sourceUrl === "mailto:research@example.test",
    )).toEqual(
      expect.objectContaining({
        sourceUrl: "mailto:research@example.test",
        hostname: null,
        diagnostic: "INVALID_OR_NON_HTTP_URL",
      }),
    );
    expect(worksheet.exactUrlIndex?.find(
      (entry) => entry.sourceUrl === "not a URL",
    )).toEqual(
      expect.objectContaining({
        sourceUrl: "not a URL",
        hostname: null,
        diagnostic: "INVALID_OR_NON_HTTP_URL",
      }),
    );
    expect(worksheet.exactUrlIndex?.filter(
      (entry) => entry.diagnostic === "INVALID_OR_NON_HTTP_URL",
    ).flatMap((entry) => entry.references)).toHaveLength(2);
  });

  it("binds the worksheet to exact template bytes and rejects byte/object mismatch", () => {
    const neutralTemplate = template();
    const bytes = exactBytes(neutralTemplate);
    const worksheet = buildPrimaryCitationReviewWorksheet({
      neutralTemplate,
      exactTemplateBytes: bytes,
    });
    expect(worksheet.sourceTemplateSha256).toBe(sha256Hex(bytes));

    const changedTemplate = {
      ...neutralTemplate,
      generatedAt: "2026-07-22T12:01:00.000Z",
    };
    expect(() => buildPrimaryCitationReviewWorksheet({
      neutralTemplate: changedTemplate,
      exactTemplateBytes: bytes,
    })).toThrow("do not match the supplied neutral template");

    const scopeLine = `  "scope": "${neutralTemplate.scope}",`;
    const duplicateScopeBytes = bytes.replace(
      scopeLine,
      `${scopeLine}\n${scopeLine}`,
    );
    expect(() => buildPrimaryCitationReviewWorksheet({
      neutralTemplate,
      exactTemplateBytes: duplicateScopeBytes,
    })).toThrow("without duplicate object keys");
  });

  it("fails closed with clear errors for malformed runtime JSON", () => {
    const malformedEntity = JSON.parse(exactBytes(template())) as {
      items: Array<Record<string, unknown>>;
    };
    malformedEntity.items[0].entityId = 7;
    const malformedEntityBytes = `${JSON.stringify(malformedEntity, null, 2)}\n`;
    expect(() => buildPrimaryCitationReviewWorksheet({
      neutralTemplate: malformedEntity as unknown as PrimaryCitationApprovalTemplate,
      exactTemplateBytes: malformedEntityBytes,
    })).toThrow("entityId must be a non-empty string");

    const malformedCandidate = JSON.parse(exactBytes(template())) as {
      items: Array<{ candidates: unknown[] }>;
    };
    malformedCandidate.items[0].candidates[0] = null;
    const malformedCandidateBytes = `${JSON.stringify(malformedCandidate, null, 2)}\n`;
    expect(() => buildPrimaryCitationReviewWorksheet({
      neutralTemplate: malformedCandidate as unknown as PrimaryCitationApprovalTemplate,
      exactTemplateBytes: malformedCandidateBytes,
    })).toThrow("candidates[0] must be an object");
  });

  it("compiles a human group selection to the smallest equivalent opaque ID while preserving the approval", () => {
    const neutralTemplate = template();
    const worksheet = build(neutralTemplate, true);
    const reviewed = reviewEveryGroup(worksheet);
    const dealWorksheet = reviewed.items.find((item) => item.entityType === "Deal");
    const duplicateGroup = dealWorksheet?.groups.find(
      (group) => group.memberCitationIds.length === 2,
    );
    if (!dealWorksheet || !duplicateGroup) {
      throw new Error("Expected a duplicate semantic group fixture");
    }
    dealWorksheet.selectedGroupKey = duplicateGroup.groupKey;

    const compiled = compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: exactBytes(neutralTemplate),
      reviewedWorksheetBytes: worksheetBytes(reviewed),
      includeExactUrlIndex: true,
      now,
    });

    expect(compiled.scope).toBe(PRIMARY_CITATION_APPROVAL_SCOPE);
    expect(compiled.reviewedBy).toBe("Research Reviewer");
    expect(
      compiled.items.find((item) => item.entityType === "Deal")
        ?.selectedCitationId,
    ).toBe("citation-a");
    expect(compiled.items.map((item) => ({
      ...item,
      selectedCitationId: null,
    }))).toEqual(neutralTemplate.items);

    const compiledWithoutIndex = compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: exactBytes(neutralTemplate),
      reviewedWorksheetBytes: worksheetBytes(
        reviewEveryGroup(build(neutralTemplate)),
      ),
      now,
    });
    expect(compiledWithoutIndex.items).toHaveLength(neutralTemplate.items.length);
  });

  it("rejects worksheet tampering, stale template bytes, missing selections, and zero-candidate compilation", () => {
    const neutralTemplate = template();
    const bytes = exactBytes(neutralTemplate);
    const worksheet = build(neutralTemplate);
    const reviewed = reviewEveryGroup(worksheet);

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes({
        ...reviewed,
        sourceTemplateSha256: "a".repeat(64),
      }),
      now,
    })).toThrow("does not match the freshly derived");

    const indexedReviewed = reviewEveryGroup(build(neutralTemplate, true));
    const indexedUrlIndex = indexedReviewed.exactUrlIndex;
    if (!indexedUrlIndex) {
      throw new Error("Expected the optional exact-URL index fixture");
    }
    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes({
        ...indexedReviewed,
        exactUrlIndex: indexedUrlIndex.map((entry, index) =>
          index === 0
            ? { ...entry, sourceUrl: `${entry.sourceUrl}?tampered=1` }
            : entry),
      }),
      includeExactUrlIndex: true,
      now,
    })).toThrow("does not match the freshly derived");

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: {
        ...neutralTemplate,
        generatedAt: "2026-07-22T12:01:00.000Z",
      },
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes(reviewed),
      now,
    })).toThrow("do not match the supplied neutral template");

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes({
        ...reviewed,
        items: reviewed.items.map((item, index) => ({
          ...item,
          selectedGroupKey: index === 0 ? null : item.selectedGroupKey,
        })),
      }),
      now,
    })).toThrow("selectedGroupKey must be a non-empty string");

    const zeroTemplate = template({ includeZeroCandidate: true });
    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: zeroTemplate,
      exactTemplateBytes: exactBytes(zeroTemplate),
      reviewedWorksheetBytes: worksheetBytes(
        reviewEveryGroup(build(zeroTemplate)),
      ),
      now,
    })).toThrow("has no semantic citation group");
  });

  it("binds the optional exact-URL index variant independently of reviewed bytes", () => {
    const neutralTemplate = template();
    const bytes = exactBytes(neutralTemplate);
    const plainReviewed = reviewEveryGroup(build(neutralTemplate));
    const indexedReviewed = reviewEveryGroup(build(neutralTemplate, true));

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes({
        ...indexedReviewed,
        exactUrlIndex: undefined,
      }),
      includeExactUrlIndex: true,
      now,
    })).toThrow("does not match the freshly derived");

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: bytes,
      reviewedWorksheetBytes: worksheetBytes({
        ...plainReviewed,
        exactUrlIndex: indexedReviewed.exactUrlIndex,
      }),
      now,
    })).toThrow("does not match the freshly derived");
  });

  it("rejects noncanonical template candidate strings before review generation", () => {
    const neutralTemplate = template();
    neutralTemplate.items[0].candidates[0].sourceUrl =
      ` ${neutralTemplate.items[0].candidates[0].sourceUrl}`;

    expect(() => buildPrimaryCitationReviewWorksheet({
      neutralTemplate,
      exactTemplateBytes: exactBytes(neutralTemplate),
    })).toThrow("without surrounding whitespace");
  });

  it("rejects duplicate worksheet decision keys before compiling either value", () => {
    const neutralTemplate = template();
    const reviewed = reviewEveryGroup(build(neutralTemplate));
    const deal = reviewed.items.find((item) => item.entityType === "Deal");
    const alternateGroupKey = deal?.groups.find(
      (group) => group.groupKey !== deal.selectedGroupKey,
    )?.groupKey;
    if (!deal?.selectedGroupKey || !alternateGroupKey) {
      throw new Error("Expected two selectable Deal groups");
    }
    const selectedLine = `"selectedGroupKey": "${deal.selectedGroupKey}"`;
    const duplicateDecisionBytes = worksheetBytes(reviewed).replace(
      selectedLine,
      `${selectedLine},\n      "selectedGroupKey": "${alternateGroupKey}"`,
    );

    expect(() => compilePrimaryCitationReviewWorksheet({
      freshNeutralTemplate: neutralTemplate,
      exactTemplateBytes: exactBytes(neutralTemplate),
      reviewedWorksheetBytes: duplicateDecisionBytes,
      now,
    })).toThrow("without duplicate object keys");
  });

  it("uses a distinct non-apply schema that the existing approval parser rejects", () => {
    const worksheet = reviewEveryGroup(build());
    expect(worksheet.scope).toBe(PRIMARY_CITATION_REVIEW_WORKSHEET_SCOPE);
    expect(worksheet.scope).not.toBe(PRIMARY_CITATION_APPROVAL_SCOPE);
    expect(() => parseReviewedPrimaryCitationApproval(
      worksheet,
      now,
    )).toThrow("Approval scope");
  });
});
